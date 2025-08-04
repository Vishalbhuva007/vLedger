# Quick Start Guide

## Prerequisites

1. **PostgreSQL**: Make sure you have PostgreSQL installed and running
2. **Node.js**: Version 18 or higher

## Setup Steps

1. **Clone dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection details
   ```

3. **Initialize database**:
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run database migrations
   npm run migrate
   
   # Seed with sample chart of accounts
   npm run seed
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

5. **Test the API**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/accounts
   ```

## Example Usage

Run the example script to see the ledger in action:
```bash
npm run example
```

This will:
- Create sample transactions
- Show account balances
- Generate a trial balance
- Demonstrate double-entry bookkeeping

## API Testing

Use the following curl commands to test the API:

### Create an account:
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "code": "6000",
    "name": "Office Supplies",
    "type": "EXPENSE",
    "description": "Office supplies and materials"
  }'
```

### Record a transaction:
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "SALE-002",
    "description": "Sale to customer XYZ",
    "date": "2025-08-04T14:30:00Z",
    "entries": [
      {
        "debitAccountCode": "1000",
        "amount": 500,
        "description": "Cash received"
      },
      {
        "creditAccountCode": "4000",
        "amount": 500,
        "description": "Sales revenue"
      }
    ]
  }'
```

### Get trial balance:
```bash
curl http://localhost:3000/reports/trial-balance
```
