export interface CreateAccountRequest {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  description?: string;
}

export interface CreateTransactionRequest {
  reference: string;
  description: string;
  date: string; // ISO date string
  entries: TransactionEntry[];
}

export interface TransactionEntry {
  debitAccountCode?: string;
  creditAccountCode?: string;
  amount: number;
  description?: string;
}

export interface AccountBalance {
  accountCode: string;
  accountName: string;
  balance: number;
  type: string;
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
  date: Date;
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
