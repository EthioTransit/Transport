import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { Ticket } from '../../types';

interface PassengerManifestModalProps {
  tripId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PassengerManifestModal: React.FC<PassengerManifestModalProps> = ({
  tripId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<{
    trip: any;
    totalTickets: number;
    boardedCount: number;
    pendingCount: number;
    manifest: Ticket[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen || !tripId) return;

    const fetchManifest = async () => {
      setLoading(true);
      try {
        const res = await apiRequest<any>(`/drivers/manifest/${tripId}`);
        setData(res);
      } catch (err) {
        console.error('Failed to load passenger manifest:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchManifest();
  }, [isOpen, tripId]);

  if (!isOpen) return null;

  const manifest = data?.manifest || [];
  const filtered = manifest.filter(
    (t) =>
      t.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      t.passengerPhone.includes(search) ||
      t.seatNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white rounded-cardLg shadow-2xl border border-gray-100 p-4 sm:p-6 md:p-8 w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-brand-emerald shrink-0" />
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-brand-dark truncate">Passenger Manifest</h3>
              <p className="text-xs text-brand-textMuted truncate">
                {data?.trip?.tripCode} • {data?.trip?.departureDate} at {data?.trip?.departureTime}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boarding Stat Badges */}
        {data && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 my-3 sm:my-4">
            <div className="p-2 sm:p-3 bg-gray-50 rounded-card text-center border border-gray-100">
              <span className="text-[10px] sm:text-xs text-brand-textMuted font-bold block truncate">Total Booked</span>
              <p className="text-base sm:text-xl font-black text-brand-dark mt-0.5">{data.totalTickets}</p>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-50 rounded-card text-center border border-emerald-100">
              <span className="text-[10px] sm:text-xs text-emerald-800 font-bold block truncate">Boarded</span>
              <p className="text-base sm:text-xl font-black text-brand-emerald mt-0.5">{data.boardedCount}</p>
            </div>
            <div className="p-2 sm:p-3 bg-amber-50 rounded-card text-center border border-amber-100">
              <span className="text-[10px] sm:text-xs text-amber-800 font-bold block truncate">Pending</span>
              <p className="text-base sm:text-xl font-black text-amber-700 mt-0.5">{data.pendingCount}</p>
            </div>
          </div>
        )}

        {/* Filter Input */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search passenger, seat or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-input border border-gray-200 focus:outline-none focus:border-brand-emerald"
          />
        </div>

        {/* Manifest Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto touch-scroll divide-y divide-gray-100 border rounded-card border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Loading manifest...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No passengers found for this trip.</div>
          ) : (
            <table className="w-full min-w-[500px] text-left text-xs">
              <thead className="bg-gray-50 text-brand-textMuted uppercase font-bold sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-4">Seat</th>
                  <th className="py-2.5 px-4">Passenger</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Ticket No</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-brand-emerald text-sm">
                      {ticket.seatNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-textMain">
                      {ticket.passengerName}
                    </td>
                    <td className="py-3 px-4 text-brand-textMuted font-mono">
                      {ticket.passengerPhone}
                    </td>
                    <td className="py-3 px-4 text-brand-textLight font-mono">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-3 px-4">
                      {ticket.status === 'USED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-success bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Boarded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pt-3 sm:pt-4 mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-btn bg-gray-100 hover:bg-gray-200 text-brand-textMain font-semibold text-xs transition-colors text-center"
          >
            Close Manifest
          </button>
        </div>
      </div>
    </div>
  );
};
