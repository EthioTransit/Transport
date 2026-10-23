import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Search, RefreshCw, CheckCircle2, AlertCircle, Building } from 'lucide-react';
import { bookingsApi } from '../api/endpoints';
import { MetricsCard } from '../components/MetricsCard';
import { StatusBadge } from '../components/StatusBadge';
import { BRAND } from '../config/brand';

export const PaymentsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await bookingsApi.getAll();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalCollected = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.total || 0), 0);

  const totalPlatformFees = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.serviceFee || 15), 0);

  const totalOperatorSettlement = totalCollected - totalPlatformFees;

  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.bookingReference?.toLowerCase().includes(q) ||
      b.passengers?.[0]?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Treasury & Settlement</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Financial Ledger & Payment Reconciliation
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Real-time settlement breakdown across Telebirr, CBE Birr, Chapa, and banking gateways.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricsCard
          label="Total Collected Gross"
          value={`${totalCollected.toLocaleString()} ${BRAND.currency}`}
          subvalue="Gross passenger payments"
          icon={DollarSign}
          colorScheme="emerald"
        />

        <MetricsCard
          label="Operator Net Settlements"
          value={`${totalOperatorSettlement.toLocaleString()} ${BRAND.currency}`}
          subvalue="Official line fares payable"
          icon={Building}
          colorScheme="blue"
        />

        <MetricsCard
          label="Platform Revenue Share"
          value={`${totalPlatformFees.toLocaleString()} ${BRAND.currency}`}
          subvalue="15 ETB service fees retained"
          icon={CreditCard}
          colorScheme="gold"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by transaction reference or passenger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-textMuted uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Transaction / Ref</th>
                <th className="py-3 px-4 whitespace-nowrap">Payer / Passenger</th>
                <th className="py-3 px-4 whitespace-nowrap">Provider</th>
                <th className="py-3 px-4 whitespace-nowrap">Base Fare</th>
                <th className="py-3 px-4 whitespace-nowrap">Platform Fee</th>
                <th className="py-3 px-4 whitespace-nowrap">Gross Total</th>
                <th className="py-3 px-4 whitespace-nowrap">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-dark whitespace-nowrap">
                    {b.bookingReference}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-brand-textMain whitespace-nowrap">
                    {b.passengers?.[0]?.name || b.user?.firstName || 'Guest'}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      Telebirr / Mock
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-600 whitespace-nowrap">
                    {b.fare} {BRAND.currency}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-brand-emerald font-bold whitespace-nowrap">
                    +{b.serviceFee || 15} {BRAND.currency}
                  </td>
                  <td className="py-3.5 px-4 font-black text-brand-dark whitespace-nowrap">
                    {b.total} {BRAND.currency}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && !loading && (
          <div className="py-12 text-center text-xs text-gray-400">
            No transaction records found.
          </div>
        )}
      </div>
    </div>
  );
};
