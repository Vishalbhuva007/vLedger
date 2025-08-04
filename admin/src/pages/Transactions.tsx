import { useState, useEffect } from 'react';
import { Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionsApi, accountsApi } from '../services/api';
import { Transaction, Account, CreateTransactionRequest } from '../types';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, accountsData] = await Promise.all([
        transactionsApi.getAll(),
        accountsApi.getAll(),
      ]);
      setTransactions(transactionsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (data: CreateTransactionRequest) => {
    try {
      await transactionsApi.create(data);
      toast.success('Transaction created successfully');
      setShowCreateModal(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      toast.error(error.response?.data?.error || 'Failed to create transaction');
    }
  };

  const handlePostTransaction = async (id: string) => {
    try {
      await transactionsApi.post(id);
      toast.success('Transaction posted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to post transaction:', error);
      toast.error('Failed to post transaction');
    }
  };

  const handleCancelTransaction = async (id: string) => {
    try {
      await transactionsApi.cancel(id);
      toast.success('Transaction cancelled successfully');
      loadData();
    } catch (error) {
      console.error('Failed to cancel transaction:', error);
      toast.error('Failed to cancel transaction');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your financial transactions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </button>
      </div>

      <div className="card">
        <div className="overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="font-mono font-medium text-gray-900">
                    {transaction.reference}
                  </td>
                  <td>{transaction.description}</td>
                  <td>{formatDate(transaction.date)}</td>
                  <td className="font-mono">{formatCurrency(transaction.amount)}</td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {transaction.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handlePostTransaction(transaction.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Post Transaction"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Transaction"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="text-center py-8">
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new transaction.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <CreateTransactionModal
          accounts={accounts}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTransaction}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

// Create Transaction Modal Component
interface CreateTransactionModalProps {
  accounts: Account[];
  onClose: () => void;
  onSubmit: (data: CreateTransactionRequest) => void;
}

const CreateTransactionModal = ({ accounts, onClose, onSubmit }: CreateTransactionModalProps) => {
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    reference: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    entries: [
      { debitAccountCode: '', amount: 0, description: '' },
      { creditAccountCode: '', amount: 0, description: '' },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that debits equal credits
    const totalDebits = formData.entries
      .filter(entry => entry.debitAccountCode)
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalCredits = formData.entries
      .filter(entry => entry.creditAccountCode)
      .reduce((sum, entry) => sum + entry.amount, 0);

    if (totalDebits !== totalCredits) {
      toast.error('Debits must equal credits');
      return;
    }

    onSubmit(formData);
  };

  const addEntry = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { debitAccountCode: '', creditAccountCode: '', amount: 0, description: '' }],
    });
  };

  const removeEntry = (index: number) => {
    if (formData.entries.length > 2) {
      setFormData({
        ...formData,
        entries: formData.entries.filter((_, i) => i !== index),
      });
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setFormData({ ...formData, entries: updatedEntries });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Create New Transaction
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reference
                  </label>
                  <input
                    type="text"
                    required
                    className="input mt-1"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="e.g., SALE-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="input mt-1"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  className="input mt-1"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Transaction description"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Journal Entries</h4>
                  <button
                    type="button"
                    onClick={addEntry}
                    className="btn-secondary text-sm"
                  >
                    Add Entry
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.entries.map((entry, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Debit Account
                          </label>
                          <select
                            className="input mt-1"
                            value={entry.debitAccountCode || ''}
                            onChange={(e) => updateEntry(index, 'debitAccountCode', e.target.value || undefined)}
                          >
                            <option value="">Select Account</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.code}>
                                {account.code} - {account.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Credit Account
                          </label>
                          <select
                            className="input mt-1"
                            value={entry.creditAccountCode || ''}
                            onChange={(e) => updateEntry(index, 'creditAccountCode', e.target.value || undefined)}
                          >
                            <option value="">Select Account</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.code}>
                                {account.code} - {account.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Amount
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            className="input mt-1"
                            value={entry.amount}
                            onChange={(e) => updateEntry(index, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Entry Description
                          </label>
                          <div className="flex mt-1">
                            <input
                              type="text"
                              className="input flex-1"
                              value={entry.description || ''}
                              onChange={(e) => updateEntry(index, 'description', e.target.value)}
                              placeholder="Optional"
                            />
                            {formData.entries.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeEntry(index)}
                                className="ml-2 text-red-600 hover:text-red-900"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" className="btn-primary">
                Create Transaction
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary mr-3"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Transaction Details Modal Component
interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionDetailsModal = ({ transaction, onClose }: TransactionDetailsModalProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Transaction Details
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Reference</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{transaction.reference}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900">{transaction.status}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">{transaction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(transaction.date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Amount</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                </div>
              </div>

              {transaction.journalEntries && transaction.journalEntries.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-3">Journal Entries</label>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Debit</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Credit</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transaction.journalEntries.map((entry) => (
                          <tr key={entry.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {entry.debitAccount?.code} - {entry.debitAccount?.name}
                              {entry.creditAccount?.code} - {entry.creditAccount?.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                              {entry.debitAccount ? formatCurrency(entry.amount) : '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                              {entry.creditAccount ? formatCurrency(entry.amount) : '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {entry.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
