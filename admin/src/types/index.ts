export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEntry {
  id: string;
  transactionId: string;
  debitAccountId?: string;
  creditAccountId?: string;
  amount: number;
  description?: string;
  debitAccount?: Account;
  creditAccount?: Account;
}

export interface Transaction {
  id: string;
  reference: string;
  description: string;
  date: string;
  amount: number;
  status: 'PENDING' | 'POSTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  journalEntries?: TransactionEntry[];
}

export interface CreateAccountRequest {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  description?: string;
}

export interface CreateTransactionRequest {
  reference: string;
  description: string;
  date: string;
  entries: {
    debitAccountCode?: string;
    creditAccountCode?: string;
    amount: number;
    description?: string;
  }[];
}

export interface TrialBalanceEntry {
  account: {
    code: string;
    name: string;
    type: string;
  };
  debit: number;
  credit: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  debitAccount?: {
    code: string;
    name: string;
  };
  creditAccount?: {
    code: string;
    name: string;
  };
  amount: number;
}
