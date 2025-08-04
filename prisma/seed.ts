import { PrismaClient, AccountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create basic chart of accounts
  const accounts = [
    // Assets
    { code: '1000', name: 'Cash', type: AccountType.ASSET, description: 'Cash and cash equivalents' },
    { code: '1100', name: 'Accounts Receivable', type: AccountType.ASSET, description: 'Money owed by customers' },
    { code: '1200', name: 'Inventory', type: AccountType.ASSET, description: 'Goods held for sale' },
    { code: '1500', name: 'Equipment', type: AccountType.ASSET, description: 'Office and business equipment' },
    
    // Liabilities
    { code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY, description: 'Money owed to suppliers' },
    { code: '2100', name: 'Short-term Loans', type: AccountType.LIABILITY, description: 'Loans payable within one year' },
    { code: '2500', name: 'Long-term Debt', type: AccountType.LIABILITY, description: 'Long-term loans and mortgages' },
    
    // Equity
    { code: '3000', name: 'Owner\'s Equity', type: AccountType.EQUITY, description: 'Owner\'s investment in the business' },
    { code: '3100', name: 'Retained Earnings', type: AccountType.EQUITY, description: 'Accumulated profits retained in business' },
    
    // Revenue
    { code: '4000', name: 'Sales Revenue', type: AccountType.REVENUE, description: 'Revenue from sales of goods/services' },
    { code: '4100', name: 'Interest Income', type: AccountType.REVENUE, description: 'Income from investments' },
    
    // Expenses
    { code: '5000', name: 'Cost of Goods Sold', type: AccountType.EXPENSE, description: 'Direct costs of producing goods sold' },
    { code: '5100', name: 'Salaries Expense', type: AccountType.EXPENSE, description: 'Employee salaries and wages' },
    { code: '5200', name: 'Rent Expense', type: AccountType.EXPENSE, description: 'Office and facility rent' },
    { code: '5300', name: 'Utilities Expense', type: AccountType.EXPENSE, description: 'Electricity, water, internet costs' },
    { code: '5400', name: 'Marketing Expense', type: AccountType.EXPENSE, description: 'Advertising and promotional costs' },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {},
      create: account,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
