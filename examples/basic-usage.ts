import { LedgerService } from '../src/services/LedgerService';

async function runExample() {
  const ledgerService = new LedgerService();
  
  try {
    await ledgerService.connect();
    console.log('Connected to ledger system\n');

    // Example 1: Create a simple sale transaction
    console.log('=== Example 1: Recording a Sale ===');
    const saleTransaction = await ledgerService.createTransaction({
      reference: 'SALE-001',
      description: 'Sale of products to customer ABC',
      date: new Date(),
      entries: [
        {
          debitAccountCode: '1000', // Cash
          amount: 1000,
          description: 'Cash received from sale',
        },
        {
          creditAccountCode: '4000', // Sales Revenue
          amount: 1000,
          description: 'Revenue from sale',
        },
      ],
    });
    
    await ledgerService.postTransaction(saleTransaction.id);
    console.log('Sale transaction created and posted:', saleTransaction.reference);

    // Example 2: Record purchase of inventory
    console.log('\n=== Example 2: Recording an Inventory Purchase ===');
    const purchaseTransaction = await ledgerService.createTransaction({
      reference: 'PURCH-001',
      description: 'Purchase of inventory from supplier XYZ',
      date: new Date(),
      entries: [
        {
          debitAccountCode: '1200', // Inventory
          amount: 600,
          description: 'Inventory purchased',
        },
        {
          creditAccountCode: '1000', // Cash
          amount: 600,
          description: 'Cash paid for inventory',
        },
      ],
    });
    
    await ledgerService.postTransaction(purchaseTransaction.id);
    console.log('Purchase transaction created and posted:', purchaseTransaction.reference);

    // Example 3: Record salary payment
    console.log('\n=== Example 3: Recording Salary Payment ===');
    const salaryTransaction = await ledgerService.createTransaction({
      reference: 'SAL-001',
      description: 'Monthly salary payment',
      date: new Date(),
      entries: [
        {
          debitAccountCode: '5100', // Salaries Expense
          amount: 3000,
          description: 'Monthly salaries',
        },
        {
          creditAccountCode: '1000', // Cash
          amount: 3000,
          description: 'Cash paid for salaries',
        },
      ],
    });
    
    await ledgerService.postTransaction(salaryTransaction.id);
    console.log('Salary transaction created and posted:', salaryTransaction.reference);

    // Example 4: Get account balances
    console.log('\n=== Account Balances ===');
    const cashBalance = await ledgerService.getAccountBalance('1000');
    const inventoryBalance = await ledgerService.getAccountBalance('1200');
    const salesBalance = await ledgerService.getAccountBalance('4000');
    const salariesBalance = await ledgerService.getAccountBalance('5100');
    
    console.log(`Cash (1000): $${cashBalance.toNumber()}`);
    console.log(`Inventory (1200): $${inventoryBalance.toNumber()}`);
    console.log(`Sales Revenue (4000): $${salesBalance.toNumber()}`);
    console.log(`Salaries Expense (5100): $${salariesBalance.toNumber()}`);

    // Example 5: Generate trial balance
    console.log('\n=== Trial Balance ===');
    const trialBalance = await ledgerService.getTrialBalance();
    let totalDebits = 0;
    let totalCredits = 0;
    
    console.log('Account Name                  | Debit    | Credit');
    console.log('------------------------------------------');
    
    trialBalance.forEach(entry => {
      const debit = entry.debit.toNumber();
      const credit = entry.credit.toNumber();
      
      if (debit > 0 || credit > 0) {
        console.log(
          `${entry.account.name.padEnd(28)} | ${debit.toFixed(2).padStart(8)} | ${credit.toFixed(2).padStart(8)}`
        );
        totalDebits += debit;
        totalCredits += credit;
      }
    });
    
    console.log('------------------------------------------');
    console.log(`Total                        | ${totalDebits.toFixed(2).padStart(8)} | ${totalCredits.toFixed(2).padStart(8)}`);
    console.log(`Balance Check: ${totalDebits === totalCredits ? 'BALANCED ✓' : 'NOT BALANCED ✗'}`);

  } catch (error) {
    console.error('Error running example:', error);
  } finally {
    await ledgerService.disconnect();
  }
}

// Run the example
runExample();
