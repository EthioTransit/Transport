import React, { useState, useEffect } from 'react';
import { Layers, Search, RefreshCw, Eye, Calendar, ArrowRight } from 'lucide-react';
import { bookingsApi } from '../api/endpoints';
import { StatusBadge } from '../components/StatusBadge';
import { BookingDetailModal } from '../features/BookingDetailModal';
import { Booking } from '../types';
import { BRAND } from '../config/brand';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsApi.getAll();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(q) ||
      b.passengers?.some((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q)) ||
      b.user?.firstName?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Passenger Reservations</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Bookings Ledger ({bookings.length})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Complete transaction records, seat reservations, and digital ticket issuance across all routes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by reference, passenger name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-brand-emerald text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-textMuted uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Booking Ref</th>
                <th className="py-3 px-4 whitespace-nowrap">Primary Passenger</th>
                <th className="py-3 px-4 whitespace-nowrap">Seats</th>
                <th className="py-3 px-4 whitespace-nowrap">Trip Corridor</th>
                <th className="py-3 px-4 whitespace-nowrap">Official Fare</th>
                <th className="py-3 px-4 whitespace-nowrap">Total Paid</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-dark whitespace-nowrap">
                    {b.bookingReference}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-brand-textMain">
                      {b.passengers?.[0]?.name || b.user?.firstName || 'Guest Passenger'}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {b.passengers?.[0]?.phone || b.user?.phone || '—'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald whitespace-nowrap">
                    {b.seats?.join(', ')}
                  </td>

                  <td className="py-3.5 px-4 text-gray-600 font-medium whitespace-nowrap">
                    {b.trip?.route?.origin?.name ? (
                      <div className="flex items-center gap-1">
                        <span>{b.trip.route.origin.name}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span>{b.trip.route.destination?.name}</span>
                      </div>
                    ) : (
                      <span>Intercity Corridor</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-gray-600 whitespace-nowrap">
                    {b.fare} {BRAND.currency}
                  </td>

                  <td className="py-3.5 px-4 font-black text-brand-dark whitespace-nowrap">
                    {b.total} {BRAND.currency}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={b.status} />
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-brand-emerald transition-colors"
                      title="Inspect Booking"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && !loading && (
          <div className="py-12 text-center text-xs text-gray-400">
            No bookings found matching your search.
          </div>
        )}
      </div>

      <BookingDetailModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onBookingUpdated={fetchBookings}
      />
    </div>
  );
};
