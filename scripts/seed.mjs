#!/usr/bin/env node

import { LedgerService, AccountType } from '../src/services/LedgerService.js';

const ledgerService = new LedgerService();

async function seedDatabase() {
  try {
    await ledgerService.connect();
    console.log('Connected to database. Seeding sample data...');

    // Create sample accounts
    const accounts = [
      { code: '1000', name: 'Cash', type: AccountType.ASSET, description: 'Cash on hand' },
      { code: '1100', name: 'Accounts Receivable', type: AccountType.ASSET, description: 'Money owed by customers' },
      { code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY, description: 'Money owed to suppliers' },
      { code: '3000', name: 'Owner Equity', type: AccountType.EQUITY, description: 'Owner investment' },
      { code: '4000', name: 'Sales Revenue', type: AccountType.REVENUE, description: 'Revenue from sales' },
      { code: '5000', name: 'Office Expenses', type: AccountType.EXPENSE, description: 'General office expenses' },
    ];

    for (const accountData of accounts) {
      try {
        const account = await ledgerService.createAccount(accountData);
        console.log(`Created account: ${account.code} - ${account.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Account ${accountData.code} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // Create sample transactions
    const transactions = [
      {
        reference: 'TXN-001',
        description: 'Initial capital investment',
        date: new Date('2024-01-01'),
        entries: [
          { debitAccountCode: '1000', amount: 10000, description: 'Cash investment' },
          { creditAccountCode: '3000', amount: 10000, description: 'Owner equity' },
        ],
      },
      {
        reference: 'TXN-002',
        description: 'Office supplies purchase',
        date: new Date('2024-01-02'),
        entries: [
          { debitAccountCode: '5000', amount: 500, description: 'Office supplies' },
          { creditAccountCode: '1000', amount: 500, description: 'Cash payment' },
        ],
      },
      {
        reference: 'TXN-003',
        description: 'Sales to customer',
        date: new Date('2024-01-03'),
        entries: [
          { debitAccountCode: '1100', amount: 1500, description: 'Sale on credit' },
          { creditAccountCode: '4000', amount: 1500, description: 'Sales revenue' },
        ],
      },
    ];

    for (const txnData of transactions) {
      try {
        const transaction = await ledgerService.createTransaction(txnData);
        await ledgerService.postTransaction(transaction.id);
        console.log(`Created and posted transaction: ${transaction.reference}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`Transaction ${txnData.reference} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('\\nSample data seeded successfully!');
    console.log('\\nAPI Server: http://localhost:3000');
    console.log('Admin Panel: http://localhost:5173');
    console.log('\\nYou can now:');
    console.log('1. Visit the admin panel to view accounts and transactions');
    console.log('2. Test the API endpoints directly');
    console.log('3. Generate reports like trial balance');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await ledgerService.disconnect();
  }
}

seedDatabase();
