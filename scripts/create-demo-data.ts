import { LedgerService } from '../src/services/LedgerService';

async function createDemoData() {
  const ledgerService = new LedgerService();
  
  try {
    await ledgerService.connect();
    console.log('Connected to ledger system\n');

    console.log('Creating demo transactions...\n');

    // 1. Initial capital investment
    const capitalTransaction = await ledgerService.createTransaction({
      reference: 'CAPITAL-001',
      description: 'Initial capital investment by owner',
      date: new Date('2025-01-01'),
      entries: [
        {
          debitAccountCode: '1000', // Cash
          amount: 50000,
          description: 'Initial capital investment',
        },
        {
          creditAccountCode: '3000', // Owner's Equity
          amount: 50000,
          description: 'Owner capital contribution',
        },
      ],
    });
    await ledgerService.postTransaction(capitalTransaction.id);
    console.log('✓ Created capital investment transaction');

    // 2. Purchase office equipment
    const equipmentTransaction = await ledgerService.createTransaction({
      reference: 'EQUIP-001',
      description: 'Purchase of office equipment',
      date: new Date('2025-01-05'),
      entries: [
        {
          debitAccountCode: '1500', // Equipment
          amount: 5000,
          description: 'Office equipment purchased',
        },
        {
          creditAccountCode: '1000', // Cash
          amount: 5000,
          description: 'Cash paid for equipment',
        },
      ],
    });
    await ledgerService.postTransaction(equipmentTransaction.id);
    console.log('✓ Created equipment purchase transaction');

    // 3. Purchase inventory on credit
    const inventoryTransaction = await ledgerService.createTransaction({
      reference: 'INV-001',
      description: 'Purchase inventory on credit from supplier',
      date: new Date('2025-01-10'),
      entries: [
        {
          debitAccountCode: '1200', // Inventory
          amount: 8000,
          description: 'Inventory purchased',
        },
        {
          creditAccountCode: '2000', // Accounts Payable
          amount: 8000,
          description: 'Amount owed to supplier',
        },
      ],
    });
    await ledgerService.postTransaction(inventoryTransaction.id);
    console.log('✓ Created inventory purchase transaction');

    // 4. Sale of goods (cash)
    const cashSaleTransaction = await ledgerService.createTransaction({
      reference: 'SALE-001',
      description: 'Cash sale to customer',
      date: new Date('2025-01-15'),
      entries: [
        {
          debitAccountCode: '1000', // Cash
          amount: 3000,
          description: 'Cash received from sale',
        },
        {
          creditAccountCode: '4000', // Sales Revenue
          amount: 3000,
          description: 'Revenue from cash sale',
        },
      ],
    });
    await ledgerService.postTransaction(cashSaleTransaction.id);

    // 5. Cost of goods sold for the sale
    const cogsTransaction = await ledgerService.createTransaction({
      reference: 'COGS-001',
      description: 'Cost of goods sold for SALE-001',
      date: new Date('2025-01-15'),
      entries: [
        {
          debitAccountCode: '5000', // Cost of Goods Sold
          amount: 1800,
          description: 'Cost of inventory sold',
        },
        {
          creditAccountCode: '1200', // Inventory
          amount: 1800,
          description: 'Inventory removed from stock',
        },
      ],
    });
    await ledgerService.postTransaction(cogsTransaction.id);
    console.log('✓ Created cash sale and COGS transactions');

    // 6. Sale on credit
    const creditSaleTransaction = await ledgerService.createTransaction({
      reference: 'SALE-002',
      description: 'Credit sale to customer ABC Corp',
      date: new Date('2025-01-20'),
      entries: [
        {
          debitAccountCode: '1100', // Accounts Receivable
          amount: 4500,
          description: 'Amount receivable from customer',
        },
        {
          creditAccountCode: '4000', // Sales Revenue
          amount: 4500,
          description: 'Revenue from credit sale',
        },
      ],
    });
    await ledgerService.postTransaction(creditSaleTransaction.id);

    // 7. Cost of goods sold for credit sale
    const cogs2Transaction = await ledgerService.createTransaction({
      reference: 'COGS-002',
      description: 'Cost of goods sold for SALE-002',
      date: new Date('2025-01-20'),
      entries: [
        {
          debitAccountCode: '5000', // Cost of Goods Sold
          amount: 2700,
          description: 'Cost of inventory sold',
        },
        {
          creditAccountCode: '1200', // Inventory
          amount: 2700,
          description: 'Inventory removed from stock',
        },
      ],
    });
    await ledgerService.postTransaction(cogs2Transaction.id);
    console.log('✓ Created credit sale and COGS transactions');

    // 8. Payment of salaries
    const salaryTransaction = await ledgerService.createTransaction({
      reference: 'SAL-001',
      description: 'Monthly salary payment to employees',
      date: new Date('2025-01-31'),
      entries: [
        {
          debitAccountCode: '5100', // Salaries Expense
          amount: 6000,
          description: 'Monthly salaries',
        },
        {
          creditAccountCode: '1000', // Cash
          amount: 6000,
          description: 'Cash paid for salaries',
        },
      ],
    });
    await ledgerService.postTransaction(salaryTransaction.id);
    console.log('✓ Created salary payment transaction');

    // 9. Payment of rent
    const rentTransaction = await ledgerService.createTransaction({
      reference: 'RENT-001',
      description: 'Monthly office rent payment',
      date: new Date('2025-01-31'),
      entries: [
        {
          debitAccountCode: '5200', // Rent Expense
          amount: 2000,
          description: 'Monthly office rent',
        },
        {
          creditAccountCode: '1000', // Cash
          amount: 2000,
          description: 'Cash paid for rent',
        },
      ],
    });
    await ledgerService.postTransaction(rentTransaction.id);
    console.log('✓ Created rent payment transaction');

    // 10. Payment to supplier
    const supplierPaymentTransaction = await ledgerService.createTransaction({
      reference: 'PAY-001',
      description: 'Partial payment to supplier',
      date: new Date('2025-02-01'),
      entries: [
        {
          debitAccountCode: '2000', // Accounts Payable
          amount: 3000,
          description: 'Payment to supplier',
        },
        {
          creditAccountCode: '1000', // Cash
          amount: 3000,
          description: 'Cash paid to supplier',
        },
      ],
    });
    await ledgerService.postTransaction(supplierPaymentTransaction.id);
    console.log('✓ Created supplier payment transaction');

    // 11. Collection from customer
    const collectionTransaction = await ledgerService.createTransaction({
      reference: 'COL-001',
      description: 'Collection from customer ABC Corp',
      date: new Date('2025-02-05'),
      entries: [
        {
          debitAccountCode: '1000', // Cash
          amount: 2000,
          description: 'Cash collected from customer',
        },
        {
          creditAccountCode: '1100', // Accounts Receivable
          amount: 2000,
          description: 'Receivable collected',
        },
      ],
    });
    await ledgerService.postTransaction(collectionTransaction.id);
    console.log('✓ Created customer collection transaction');

    // 12. Utilities expense
    const utilitiesTransaction = await ledgerService.createTransaction({
      reference: 'UTIL-001',
      description: 'Monthly utilities bill',
      date: new Date('2025-02-10'),
      entries: [
        {
          debitAccountCode: '5300', // Utilities Expense
          amount: 500,
          description: 'Monthly utilities',
        },
        {
          creditAccountCode: '1000', // Cash
          amount: 500,
          description: 'Cash paid for utilities',
        },
      ],
    });
    await ledgerService.postTransaction(utilitiesTransaction.id);
    console.log('✓ Created utilities payment transaction');

    console.log('\n=== Demo Data Creation Complete ===');
    console.log('12 transactions have been created and posted.');
    console.log('\nYou can now:');
    console.log('1. Start the admin panel: npm run admin:dev');
    console.log('2. View the dashboard at: http://localhost:3001');
    console.log('3. Explore accounts, transactions, and reports');
    console.log('4. Check trial balance to verify books balance');

    // Show summary
    console.log('\n=== Account Balances Summary ===');
    const accountCodes = ['1000', '1100', '1200', '1500', '2000', '3000', '4000', '5000', '5100', '5200', '5300'];
    
    for (const code of accountCodes) {
      try {
        const balance = await ledgerService.getAccountBalance(code);
        const account = await ledgerService.getAccountByCode(code);
        if (account && balance.toNumber() !== 0) {
          console.log(`${code} - ${account.name}: $${balance.toNumber().toLocaleString()}`);
        }
      } catch (error) {
        // Account might not exist, skip
      }
    }

  } catch (error) {
    console.error('Error creating demo data:', error);
  } finally {
    await ledgerService.disconnect();
  }
}

// Run the demo data creation
createDemoData();
