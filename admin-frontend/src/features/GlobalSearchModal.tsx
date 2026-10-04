import React, { useState } from 'react';
import { Search, Ticket, Calendar, User, ArrowRight, X } from 'lucide-react';
import { analyticsApi } from '../api/endpoints';
import { BRAND } from '../config/brand';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking?: (booking: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectBooking,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await analyticsApi.globalSearch(query.trim());
      setResults(data);
    } catch (err) {
      console.error('Global search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-cardLg shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex items-center px-4 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search booking references, ticket tokens, passenger names, or phone numbers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm font-medium text-brand-dark focus:outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="ml-2 px-3.5 py-1.5 rounded-btn bg-brand-emerald text-white text-xs font-bold hover:bg-brand-deep transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Search Results Area */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {!results && !loading && (
            <div className="py-8 text-center text-xs text-brand-textMuted">
              Type a keyword (e.g. "ET-", "TK-", passenger phone "+251911", or "Addis") and press Search.
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Bookings */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Calendar className="w-4 h-4 text-brand-emerald" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-dark">
                    Bookings ({results.bookings?.length || 0})
                  </span>
                </div>
                {results.bookings?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No matching bookings found.</p>
                ) : (
                  <div className="space-y-2">
                    {results.bookings.map((b: any) => (
                      <div
                        key={b._id}
                        onClick={() => {
                          if (onSelectBooking) onSelectBooking(b);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-gray-100 hover:border-brand-emerald/40 hover:bg-emerald-50/20 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-mono font-bold text-xs text-brand-dark">
                            {b.bookingReference}
                          </div>
                          <div className="text-[11px] text-brand-textMuted mt-0.5">
                            Seats: {b.seats?.join(', ')} • Total: {b.total} {BRAND.currency} • Status: {b.status}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tickets */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Ticket className="w-4 h-4 text-brand-gold" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-dark">
                    Tickets ({results.tickets?.length || 0})
                  </span>
                </div>
                {results.tickets?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No matching tickets found.</p>
                ) : (
                  <div className="space-y-2">
                    {results.tickets.map((t: any) => (
                      <div
                        key={t._id}
                        className="p-3 rounded-xl border border-gray-100 hover:border-amber-400/40 hover:bg-amber-50/20 transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-mono font-bold text-xs text-brand-dark">
                            {t.ticketNumber}
                          </div>
                          <div className="text-[11px] text-brand-textMuted mt-0.5">
                            Passenger: <span className="font-semibold text-brand-textMain">{t.passengerName}</span> (Seat {t.seatNumber}) • {t.status}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {t.routeTitle || 'Intercity Trip'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-dark">
                    Passengers / Users ({results.passengers?.length || 0})
                  </span>
                </div>
                {results.passengers?.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No matching passengers found.</p>
                ) : (
                  <div className="space-y-2">
                    {results.passengers.map((p: any) => (
                      <div
                        key={p._id}
                        className="p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-brand-dark">
                            {p.firstName} {p.lastName}
                          </div>
                          <div className="text-[11px] text-brand-textMuted mt-0.5">
                            Phone: {p.phone} • Email: {p.email} • Role: {p.role}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {p.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
