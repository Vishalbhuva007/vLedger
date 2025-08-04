# Quick Start Guide - Admin Panel

## Prerequisites

1. **PostgreSQL**: Running and accessible
2. **Node.js**: Version 18 or higher
3. **vLedger API**: Set up and running

## Setup Steps

### 1. Backend Setup (if not done already)

```bash
# Install main dependencies
npm install

# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# Seed with sample chart of accounts
npm run seed
```

### 2. Admin Panel Setup

```bash
# Install admin panel dependencies
npm run admin:install
```

### 3. Start Everything

#### Option A: Start both API and Admin Panel together
```bash
npm run dev:all
```

#### Option B: Start separately
```bash
# Terminal 1 - API Server
npm run dev

# Terminal 2 - Admin Panel
npm run admin:dev
```

### 4. Access the System

- **API Server**: http://localhost:3000
- **Admin Panel**: http://localhost:3001

### 5. Create Demo Data (Optional)

```bash
npm run demo
```

This creates realistic sample transactions for testing.

## Using the Admin Panel

### Dashboard
- Overview of accounts and transactions
- Financial summaries (Assets, Liabilities, Equity)
- Recent transaction activity

### Accounts
- View all accounts in your chart of accounts
- Create new accounts with proper account codes
- See real-time account balances
- Account types: Asset, Liability, Equity, Revenue, Expense

### Transactions
- Create new double-entry transactions
- Multiple journal entries per transaction
- Automatic validation (debits must equal credits)
- Post or cancel transactions
- View transaction details

### Reports
- **Trial Balance**: Complete trial balance with totals
- **General Ledger**: Detailed journal entries with filtering
- **Charts & Analytics**: Visual charts showing account distributions

## Quick Demo Workflow

1. **Start the system**: `npm run dev:all`
2. **Create demo data**: `npm run demo` (in another terminal)
3. **Open admin panel**: http://localhost:3001
4. **Explore the dashboard** to see the populated data
5. **Check Reports > Trial Balance** to verify books balance
6. **Try creating a new transaction** in the Transactions page

## Common Tasks

### Create a New Account
1. Go to Accounts page
2. Click "New Account"
3. Fill in account code, name, type, and description
4. Click "Create Account"

### Record a Transaction
1. Go to Transactions page
2. Click "New Transaction"
3. Enter reference, description, and date
4. Add journal entries (at least one debit and one credit)
5. Ensure debits equal credits
6. Click "Create Transaction"
7. Post the transaction to make it permanent

### View Reports
1. Go to Reports page
2. Use tabs to switch between:
   - Trial Balance (shows all account balances)
   - General Ledger (shows all journal entries)
   - Charts & Analytics (visual representations)

## Troubleshooting

### Admin Panel won't start
- Check if Node.js dependencies are installed: `npm run admin:install`
- Verify the API server is running on port 3000

### API connection issues
- Ensure the API server is running: `npm run dev`
- Check database connection in `.env` file
- Verify CORS settings allow localhost:3001

### Database issues
- Run migrations: `npm run migrate`
- Check PostgreSQL connection
- Verify database URL in `.env`

### Port conflicts
- API uses port 3000
- Admin panel uses port 3001
- Change ports in respective config files if needed

## Next Steps

- Set up authentication for production use
- Customize the admin panel styling
- Add more reporting features
- Implement user management
- Add audit logging
