# vLedger - TypeScript Ledger System

A double-entry accounting ledger system built with TypeScript, PostgreSQL, and Prisma.

## Features

- **Double-Entry Accounting**: All transactions follow double-entry bookkeeping principles
- **Chart of Accounts**: Manage accounts with types (Asset, Liability, Equity, Revenue, Expense)
- **Transaction Management**: Create, post, and cancel transactions
- **Reporting**: Generate trial balance and general ledger reports
- **REST API**: Complete REST API for all operations
- **Admin Panel**: Modern React-based web interface for system management
- **Type Safety**: Full TypeScript support with Prisma ORM

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your database**:
   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in `.env` file:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/vledger?schema=public"
     ```

3. **Run database migrations**:
   ```bash
   npm run generate
   npm run migrate
   ```

4. **Seed the database with sample chart of accounts**:
   ```bash
   npx ts-node prisma/seed.ts
   ```

5. **Start the application**:
   ```bash
   npm run dev
   ```

6. **Set up the admin panel** (optional):
   ```bash
   # Install admin panel dependencies
   npm run admin:install
   
   # Start both API server and admin panel
   npm run dev:all
   ```
   
   The API server will run on `http://localhost:3000`
   The admin panel will run on `http://localhost:3001`

## Usage

### Starting the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### API Endpoints

#### Accounts

- `POST /accounts` - Create a new account
- `GET /accounts` - Get all accounts
- `GET /accounts/:id` - Get account by ID
- `GET /accounts/code/:code` - Get account by code
- `GET /accounts/code/:code/balance` - Get account balance

#### Transactions

- `POST /transactions` - Create a new transaction
- `GET /transactions` - Get all transactions
- `GET /transactions/:id` - Get transaction by ID
- `POST /transactions/:id/post` - Post a transaction
- `POST /transactions/:id/cancel` - Cancel a transaction

#### Reports

- `GET /reports/trial-balance` - Get trial balance
- `GET /reports/general-ledger?accountCode=:code` - Get general ledger (optionally filtered by account)

### Example Usage

#### Creating an Account

```bash
curl -X POST http://localhost:3000/accounts \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "1000",
    "name": "Cash",
    "type": "ASSET",
    "description": "Cash and cash equivalents"
  }'
```

#### Recording a Transaction

```bash
curl -X POST http://localhost:3000/transactions \\
  -H "Content-Type: application/json" \\
  -d '{
    "reference": "SALE-001",
    "description": "Sale to customer",
    "date": "2025-08-04T10:00:00Z",
    "entries": [
      {
        "debitAccountCode": "1000",
        "amount": 1000,
        "description": "Cash received"
      },
      {
        "creditAccountCode": "4000", 
        "amount": 1000,
        "description": "Sales revenue"
      }
    ]
  }'
```

### Admin Panel

The system includes a modern React-based admin panel for easy management:

#### Features:
- **Dashboard**: Overview of accounts, transactions, and financial summaries
- **Account Management**: Create and manage chart of accounts
- **Transaction Processing**: Create double-entry transactions with validation
- **Financial Reports**: Trial balance, general ledger, and visual analytics
- **Real-time Updates**: Live data from the API

#### Access:
- Start with: `npm run dev:all`
- Admin Panel: `http://localhost:3001`
- API Server: `http://localhost:3000`

See `admin/README.md` for detailed admin panel documentation.

### Programming Examples

See the `examples/basic-usage.ts` file for programmatic usage examples:

```bash
npx ts-node examples/basic-usage.ts
```

## Database Schema

The system uses the following main entities:

- **Account**: Chart of accounts with codes, names, and types
- **Transaction**: Financial transactions with references and descriptions  
- **JournalEntry**: Individual debit/credit entries within transactions

### Account Types

- `ASSET`: Resources owned by the entity
- `LIABILITY`: Debts owed by the entity
- `EQUITY`: Owner's stake in the entity
- `REVENUE`: Income earned by the entity
- `EXPENSE`: Costs incurred by the entity

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Database Management

- **View data**: `npm run studio` (opens Prisma Studio)
- **Reset database**: `npx prisma migrate reset`
- **Generate client**: `npm run generate`

## Architecture

The system follows these principles:

1. **Double-Entry Bookkeeping**: Every transaction has equal debits and credits
2. **Immutable Transactions**: Posted transactions cannot be modified
3. **Audit Trail**: Complete history of all changes
4. **Balance Validation**: Automatic validation that books balance

## Chart of Accounts Structure

The default chart of accounts follows standard accounting practices:

- **1000-1999**: Assets (Cash, Receivables, Inventory, Equipment)
- **2000-2999**: Liabilities (Payables, Loans, Debt)
- **3000-3999**: Equity (Owner's Equity, Retained Earnings)
- **4000-4999**: Revenue (Sales, Interest Income)
- **5000-5999**: Expenses (COGS, Salaries, Rent, Utilities)

## License

MIT
