import { PrismaClient } from '@prisma/client';

// Define constants for account types and transaction status
export const AccountType = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSE',
} as const;

export const TransactionStatus = {
  PENDING: 'PENDING',
  POSTED: 'POSTED',
  CANCELLED: 'CANCELLED',
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

export class LedgerService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // Account Management
  async createAccount(data: {
    code: string;
    name: string;
    type: AccountType;
    description?: string;
  }) {
    return await this.prisma.account.create({
      data,
    });
  }

  async getAccount(id: string) {
    return await this.prisma.account.findUnique({
      where: { id },
      include: {
        debitEntries: true,
        creditEntries: true,
      },
    });
  }

  async getAccountByCode(code: string) {
    return await this.prisma.account.findUnique({
      where: { code },
    });
  }

  async getAllAccounts() {
    return await this.prisma.account.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async updateAccount(id: string, data: Partial<{
    name: string;
    description: string;
    isActive: boolean;
  }>) {
    return await this.prisma.account.update({
      where: { id },
      data,
    });
  }

  // Transaction Management
  async createTransaction(data: {
    reference: string;
    description: string;
    date: Date;
    entries: Array<{
      debitAccountCode?: string;
      creditAccountCode?: string;
      amount: number;
      description?: string;
    }>;
  }) {
    // Validate that entries balance
    const totalDebits = data.entries
      .filter(entry => entry.debitAccountCode)
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalCredits = data.entries
      .filter(entry => entry.creditAccountCode)
      .reduce((sum, entry) => sum + entry.amount, 0);

    if (totalDebits !== totalCredits) {
      throw new Error('Transaction does not balance: debits must equal credits');
    }

    const totalAmount = totalDebits;

    return await this.prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          reference: data.reference,
          description: data.description,
          date: data.date,
          amount: totalAmount,
        },
      });

      // Create journal entries
      for (const entry of data.entries) {
        let debitAccount = null;
        let creditAccount = null;

        if (entry.debitAccountCode) {
          debitAccount = await tx.account.findUnique({
            where: { code: entry.debitAccountCode },
          });
          if (!debitAccount) {
            throw new Error(`Debit account with code ${entry.debitAccountCode} not found`);
          }
        }

        if (entry.creditAccountCode) {
          creditAccount = await tx.account.findUnique({
            where: { code: entry.creditAccountCode },
          });
          if (!creditAccount) {
            throw new Error(`Credit account with code ${entry.creditAccountCode} not found`);
          }
        }

        await tx.journalEntry.create({
          data: {
            transactionId: transaction.id,
            debitAccountId: debitAccount?.id,
            creditAccountId: creditAccount?.id,
            amount: entry.amount,
            description: entry.description,
          },
        });
      }

      return transaction;
    });
  }

  async getTransaction(id: string) {
    return await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        journalEntries: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
      },
    });
  }

  async getAllTransactions() {
    return await this.prisma.transaction.findMany({
      include: {
        journalEntries: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async postTransaction(id: string) {
    return await this.prisma.transaction.update({
      where: { id },
      data: { status: TransactionStatus.POSTED },
    });
  }

  async cancelTransaction(id: string) {
    return await this.prisma.transaction.update({
      where: { id },
      data: { status: TransactionStatus.CANCELLED },
    });
  }

  // Reporting
  async getAccountBalance(accountCode: string): Promise<number> {
    const account = await this.prisma.account.findUnique({
      where: { code: accountCode },
      include: {
        debitEntries: {
          include: {
            transaction: true,
          },
        },
        creditEntries: {
          include: {
            transaction: true,
          },
        },
      },
    });

    if (!account) {
      throw new Error(`Account with code ${accountCode} not found`);
    }

    // Calculate balance based on account type
    let balance = 0;

    // Sum debits
    const totalDebits = account.debitEntries
      .filter((entry: any) => entry.transaction.status === TransactionStatus.POSTED)
      .reduce((sum: number, entry: any) => sum + entry.amount, 0);

    // Sum credits
    const totalCredits = account.creditEntries
      .filter((entry: any) => entry.transaction.status === TransactionStatus.POSTED)
      .reduce((sum: number, entry: any) => sum + entry.amount, 0);

    // Calculate balance based on account type
    switch (account.type) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        balance = totalDebits - totalCredits;
        break;
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
      case AccountType.REVENUE:
        balance = totalCredits - totalDebits;
        break;
    }

    return balance;
  }

  async getTrialBalance() {
    const accounts = await this.getAllAccounts();
    const trialBalance = [];

    for (const account of accounts) {
      const balance = await this.getAccountBalance(account.code);
      trialBalance.push({
        account,
        balance,
        debit: balance > 0 && (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) ? balance : 0,
        credit: balance > 0 && (account.type === AccountType.LIABILITY || account.type === AccountType.EQUITY || account.type === AccountType.REVENUE) ? balance : 0,
      });
    }

    return trialBalance;
  }

  async getGeneralLedger(accountCode?: string) {
    const whereClause = accountCode ? {
      OR: [
        { debitAccount: { code: accountCode } },
        { creditAccount: { code: accountCode } },
      ],
    } : {};

    return await this.prisma.journalEntry.findMany({
      where: whereClause,
      include: {
        transaction: true,
        debitAccount: true,
        creditAccount: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
