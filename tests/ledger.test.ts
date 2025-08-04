import { LedgerService } from '../src/services/LedgerService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client for testing
jest.mock('@prisma/client');

describe('LedgerService', () => {
  let ledgerService: LedgerService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    ledgerService = new LedgerService();
    (ledgerService as any).prisma = mockPrisma;
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const accountData = {
        code: '1000',
        name: 'Cash',
        type: 'ASSET' as any,
        description: 'Cash account',
      };

      const expectedAccount = {
        id: 'test-id',
        ...accountData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.account.create = jest.fn().mockResolvedValue(expectedAccount);

      const result = await ledgerService.createAccount(accountData);

      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: accountData,
      });
      expect(result).toEqual(expectedAccount);
    });
  });

  describe('createTransaction', () => {
    it('should reject unbalanced transactions', async () => {
      const transactionData = {
        reference: 'TEST-001',
        description: 'Test transaction',
        date: new Date(),
        entries: [
          {
            debitAccountCode: '1000',
            amount: 100,
          },
          {
            creditAccountCode: '4000',
            amount: 200, // Unbalanced!
          },
        ],
      };

      await expect(ledgerService.createTransaction(transactionData))
        .rejects
        .toThrow('Transaction does not balance: debits must equal credits');
    });

    it('should create balanced transaction successfully', async () => {
      const transactionData = {
        reference: 'TEST-001',
        description: 'Test transaction',
        date: new Date(),
        entries: [
          {
            debitAccountCode: '1000',
            amount: 100,
          },
          {
            creditAccountCode: '4000',
            amount: 100,
          },
        ],
      };

      const mockAccount = {
        id: 'account-id',
        code: '1000',
        name: 'Cash',
        type: 'ASSET',
      };

      const expectedTransaction = {
        id: 'transaction-id',
        reference: 'TEST-001',
        description: 'Test transaction',
        date: transactionData.date,
        amount: 100,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the $transaction method
      mockPrisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockResolvedValue(expectedTransaction),
          },
          account: {
            findUnique: jest.fn().mockResolvedValue(mockAccount),
          },
          journalEntry: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const result = await ledgerService.createTransaction(transactionData);

      expect(result).toEqual(expectedTransaction);
    });
  });
});
