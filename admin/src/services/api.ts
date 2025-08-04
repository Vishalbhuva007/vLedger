import axios from 'axios';
import { Account, Transaction, CreateAccountRequest, CreateTransactionRequest, TrialBalanceEntry, LedgerEntry } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Account API
export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const response = await api.get('/accounts');
    return response.data;
  },

  getById: async (id: string): Promise<Account> => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  getByCode: async (code: string): Promise<Account> => {
    const response = await api.get(`/accounts/code/${code}`);
    return response.data;
  },

  getBalance: async (code: string): Promise<{ accountCode: string; balance: number }> => {
    const response = await api.get(`/accounts/code/${code}/balance`);
    return response.data;
  },

  create: async (account: CreateAccountRequest): Promise<Account> => {
    const response = await api.post('/accounts', account);
    return response.data;
  },

  update: async (id: string, updates: Partial<Account>): Promise<Account> => {
    const response = await api.put(`/accounts/${id}`, updates);
    return response.data;
  },
};

// Transaction API
export const transactionsApi = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (transaction: CreateTransactionRequest): Promise<Transaction> => {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  post: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/transactions/${id}/post`);
    return response.data;
  },

  cancel: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/transactions/${id}/cancel`);
    return response.data;
  },
};

// Reports API
export const reportsApi = {
  getTrialBalance: async (): Promise<TrialBalanceEntry[]> => {
    const response = await api.get('/reports/trial-balance');
    return response.data;
  },

  getGeneralLedger: async (accountCode?: string): Promise<LedgerEntry[]> => {
    const url = accountCode 
      ? `/reports/general-ledger?accountCode=${accountCode}`
      : '/reports/general-ledger';
    const response = await api.get(url);
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};
