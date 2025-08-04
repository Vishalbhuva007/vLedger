import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { accountsApi, transactionsApi, reportsApi } from '../services/api';
import { Account, Transaction, TrialBalanceEntry } from '../types';

interface DashboardStats {
  totalAccounts: number;
  totalTransactions: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAccounts: 0,
    totalTransactions: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load accounts and transactions
      const [accounts, transactions, trialBalance] = await Promise.all([
        accountsApi.getAll(),
        transactionsApi.getAll(),
        reportsApi.getTrialBalance(),
      ]);

      // Calculate stats
      const assetAccounts = accounts.filter(acc => acc.type === 'ASSET');
      const liabilityAccounts = accounts.filter(acc => acc.type === 'LIABILITY');
      const equityAccounts = accounts.filter(acc => acc.type === 'EQUITY');

      const totalAssets = trialBalance
        .filter(entry => entry.account.type === 'ASSET')
        .reduce((sum, entry) => sum + entry.debit, 0);

      const totalLiabilities = trialBalance
        .filter(entry => entry.account.type === 'LIABILITY')
        .reduce((sum, entry) => sum + entry.credit, 0);

      const totalEquity = trialBalance
        .filter(entry => entry.account.type === 'EQUITY')
        .reduce((sum, entry) => sum + entry.credit, 0);

      setStats({
        totalAccounts: accounts.length,
        totalTransactions: transactions.length,
        totalAssets,
        totalLiabilities,
        totalEquity,
      });

      // Get recent transactions (last 5)
      const recent = transactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentTransactions(recent);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your ledger system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Accounts
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalAccounts}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Transactions
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalTransactions}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Assets
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(stats.totalAssets)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Liabilities
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(stats.totalLiabilities)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
        </div>
        
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions found</p>
        ) : (
          <div className="overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="font-medium text-gray-900">
                      {transaction.reference}
                    </td>
                    <td>{transaction.description}</td>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'POSTED'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Assets</h3>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.totalAssets)}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Liabilities</h3>
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(stats.totalLiabilities)}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Equity</h3>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(stats.totalEquity)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
