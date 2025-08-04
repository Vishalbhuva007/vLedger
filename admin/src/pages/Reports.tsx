import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter } from 'lucide-react';
import { reportsApi, accountsApi } from '../services/api';
import { TrialBalanceEntry, LedgerEntry, Account } from '../types';

const Reports = () => {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceEntry[]>([]);
  const [generalLedger, setGeneralLedger] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trial-balance' | 'general-ledger' | 'charts'>('trial-balance');

  useEffect(() => {
    loadReportsData();
  }, []);

  useEffect(() => {
    if (activeTab === 'general-ledger') {
      loadGeneralLedger();
    }
  }, [selectedAccountCode, activeTab]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [trialBalanceData, accountsData] = await Promise.all([
        reportsApi.getTrialBalance(),
        accountsApi.getAll(),
      ]);
      setTrialBalance(trialBalanceData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGeneralLedger = async () => {
    try {
      const data = await reportsApi.getGeneralLedger(selectedAccountCode || undefined);
      setGeneralLedger(data);
    } catch (error) {
      console.error('Failed to load general ledger:', error);
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

  const getAccountTypeData = () => {
    const typeData = accounts.reduce((acc, account) => {
      const balance = trialBalance.find(tb => tb.account.code === account.code);
      const amount = balance ? (balance.debit || balance.credit) : 0;
      
      if (acc[account.type]) {
        acc[account.type] += amount;
      } else {
        acc[account.type] = amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeData).map(([type, amount]) => ({
      type,
      amount,
    }));
  };

  const getChartColors = () => [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'
  ];

  const getTotalDebits = () => {
    return trialBalance.reduce((sum, entry) => sum + entry.debit, 0);
  };

  const getTotalCredits = () => {
    return trialBalance.reduce((sum, entry) => sum + entry.credit, 0);
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
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Financial reports and analytics
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'trial-balance', label: 'Trial Balance' },
            { key: 'general-ledger', label: 'General Ledger' },
            { key: 'charts', label: 'Charts & Analytics' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Trial Balance Tab */}
      {activeTab === 'trial-balance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Trial Balance</h2>
            <button className="btn-secondary flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>

          <div className="card">
            <div className="overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th className="text-right">Debit</th>
                    <th className="text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trialBalance.map((entry) => (
                    <tr key={entry.account.code}>
                      <td className="font-mono font-medium text-gray-900">
                        {entry.account.code}
                      </td>
                      <td>{entry.account.name}</td>
                      <td>
                        <span className="text-sm text-gray-500">{entry.account.type}</span>
                      </td>
                      <td className="text-right font-mono">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="text-right font-mono">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={3} className="text-right">Total:</td>
                    <td className="text-right font-mono">{formatCurrency(getTotalDebits())}</td>
                    <td className="text-right font-mono">{formatCurrency(getTotalCredits())}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Balance Check:</span>
                <span className={`text-sm font-semibold ${
                  getTotalDebits() === getTotalCredits() 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {getTotalDebits() === getTotalCredits() ? 'BALANCED ✓' : 'NOT BALANCED ✗'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Ledger Tab */}
      {activeTab === 'general-ledger' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">General Ledger</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <select
                  className="input"
                  value={selectedAccountCode}
                  onChange={(e) => setSelectedAccountCode(e.target.value)}
                >
                  <option value="">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-secondary flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="card">
            <div className="overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th>Debit Account</th>
                    <th>Credit Account</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {generalLedger.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td className="font-mono font-medium text-gray-900">
                        {entry.reference}
                      </td>
                      <td>{entry.description}</td>
                      <td>
                        {entry.debitAccount && (
                          <span className="text-sm">
                            {entry.debitAccount.code} - {entry.debitAccount.name}
                          </span>
                        )}
                      </td>
                      <td>
                        {entry.creditAccount && (
                          <span className="text-sm">
                            {entry.creditAccount.code} - {entry.creditAccount.name}
                          </span>
                        )}
                      </td>
                      <td className="text-right font-mono">{formatCurrency(entry.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {generalLedger.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No entries found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Charts & Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Types Bar Chart */}
            <div className="card">
              <h3 className="text-md font-medium text-gray-900 mb-4">Account Types Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getAccountTypeData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Account Types Pie Chart */}
            <div className="card">
              <h3 className="text-md font-medium text-gray-900 mb-4">Account Types Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getAccountTypeData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ type, value }) => `${type}: ${formatCurrency(value)}`}
                  >
                    {getAccountTypeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getChartColors()[index % getChartColors().length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Balance Summary Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card text-center">
                  <h4 className="text-sm font-medium text-gray-500">Total Assets</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      trialBalance
                        .filter(entry => entry.account.type === 'ASSET')
                        .reduce((sum, entry) => sum + entry.debit, 0)
                    )}
                  </p>
                </div>
                
                <div className="card text-center">
                  <h4 className="text-sm font-medium text-gray-500">Total Liabilities</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      trialBalance
                        .filter(entry => entry.account.type === 'LIABILITY')
                        .reduce((sum, entry) => sum + entry.credit, 0)
                    )}
                  </p>
                </div>
                
                <div className="card text-center">
                  <h4 className="text-sm font-medium text-gray-500">Total Equity</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      trialBalance
                        .filter(entry => entry.account.type === 'EQUITY')
                        .reduce((sum, entry) => sum + entry.credit, 0)
                    )}
                  </p>
                </div>
                
                <div className="card text-center">
                  <h4 className="text-sm font-medium text-gray-500">Net Income</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      trialBalance
                        .filter(entry => entry.account.type === 'REVENUE')
                        .reduce((sum, entry) => sum + entry.credit, 0) -
                      trialBalance
                        .filter(entry => entry.account.type === 'EXPENSE')
                        .reduce((sum, entry) => sum + entry.debit, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
