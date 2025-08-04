import express from 'express';
import cors from 'cors';
import { LedgerService, AccountType } from './services/LedgerService';
import { CreateAccountRequest, CreateTransactionRequest } from './types';

const app = express();
const ledgerService = new LedgerService();

// Enable CORS for admin panel
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Account endpoints
app.post('/accounts', async (req, res) => {
  try {
    const accountData: CreateAccountRequest = req.body;
    const account = await ledgerService.createAccount({
      ...accountData,
      type: accountData.type as AccountType,
    });
    res.status(201).json(account);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/accounts', async (req, res) => {
  try {
    const accounts = await ledgerService.getAllAccounts();
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/accounts/:id', async (req, res) => {
  try {
    const account = await ledgerService.getAccount(req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/accounts/code/:code', async (req, res) => {
  try {
    const account = await ledgerService.getAccountByCode(req.params.code);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/accounts/code/:code/balance', async (req, res) => {
  try {
    const balance = await ledgerService.getAccountBalance(req.params.code);
    res.json({ 
      accountCode: req.params.code, 
      balance: balance 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Transaction endpoints
app.post('/transactions', async (req, res) => {
  try {
    const transactionData: CreateTransactionRequest = req.body;
    const transaction = await ledgerService.createTransaction({
      ...transactionData,
      date: new Date(transactionData.date),
    });
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const transactions = await ledgerService.getAllTransactions();
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await ledgerService.getTransaction(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/transactions/:id/post', async (req, res) => {
  try {
    const transaction = await ledgerService.postTransaction(req.params.id);
    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/transactions/:id/cancel', async (req, res) => {
  try {
    const transaction = await ledgerService.cancelTransaction(req.params.id);
    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reporting endpoints
app.get('/reports/trial-balance', async (req, res) => {
  try {
    const trialBalance = await ledgerService.getTrialBalance();
    const formattedTrialBalance = trialBalance.map(entry => ({
      account: {
        code: entry.account.code,
        name: entry.account.name,
        type: entry.account.type,
      },
      debit: entry.debit,
      credit: entry.credit,
    }));
    res.json(formattedTrialBalance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/reports/general-ledger', async (req, res) => {
  try {
    const accountCode = req.query.accountCode as string;
    const ledgerEntries = await ledgerService.getGeneralLedger(accountCode);
    const formattedEntries = ledgerEntries.map(entry => ({
      id: entry.id,
      date: entry.transaction.date,
      reference: entry.transaction.reference,
      description: entry.description || entry.transaction.description,
      debitAccount: entry.debitAccount ? {
        code: entry.debitAccount.code,
        name: entry.debitAccount.name,
      } : undefined,
      creditAccount: entry.creditAccount ? {
        code: entry.creditAccount.code,
        name: entry.creditAccount.name,
      } : undefined,
      amount: entry.amount,
    }));
    res.json(formattedEntries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await ledgerService.connect();
    console.log('Connected to database');

    app.listen(PORT, () => {
      console.log(`vLedger server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await ledgerService.disconnect();
  process.exit(0);
});

startServer();
