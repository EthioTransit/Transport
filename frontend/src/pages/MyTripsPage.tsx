import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Calendar,
  Bus,
  QrCode,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Wallet,
  ChevronRight,
  Printer,
  Download,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ticketsApi, bookingsApi } from '../api/endpoints';
import { useAuth } from '../features/auth/useAuth';
import { Ticket, Booking, BookingStatus } from '../types';
import { BRAND } from '../config/brand';

type TabType = 'upcoming' | 'completed' | 'cancelled';
type WalletTabType = 'active' | 'past' | 'cancelled';

const StatusBadge: React.FC<{ status: string; isAmharic?: boolean }> = ({ status, isAmharic }) => {
  const map: Record<string, { label: string; amharicLabel: string; cls: string }> = {
    CONFIRMED: { label: 'Confirmed', amharicLabel: 'የተረጋገጠ', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    PENDING: { label: 'Pending', amharicLabel: 'በመጠባበቅ ላይ', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    CANCELLED: { label: 'Cancelled', amharicLabel: 'የተሰረዘ', cls: 'bg-red-50 text-red-600 border border-red-200' },
    COMPLETED: { label: 'Completed', amharicLabel: 'የተጠናቀቀ', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    REFUNDED: { label: 'Refunded', amharicLabel: 'ተመላሽ የተደረገ', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
    ISSUED: { label: '✓ Active', amharicLabel: '✓ ንቁ', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    USED: { label: 'Boarded', amharicLabel: 'የተሳፈሩበት', cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  };
  const style = map[status] || { label: status, amharicLabel: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${style.cls}`}>
      {isAmharic ? style.amharicLabel : style.label}
    </span>
  );
};

export const MyTripsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';
  const currencyLabel = isAmharic ? 'ብር' : BRAND.currency;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<'trips' | 'wallet'>('trips');
  const [tripTab, setTripTab] = useState<TabType>('upcoming');
  const [walletTab, setWalletTab] = useState<WalletTabType>('active');


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/my-tickets');
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [t, b] = await Promise.all([
          ticketsApi.getMyTickets().catch(() => []),
          bookingsApi.getMyBookings().catch(() => []),
        ]);
        setTickets(t);
        setBookings(b);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const upcomingBookings = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING
  );
  const completedBookings = bookings.filter((b) => b.status === BookingStatus.COMPLETED);
  const cancelledBookings = bookings.filter(
    (b) => b.status === BookingStatus.CANCELLED || b.status === BookingStatus.REFUNDED
  );

  const activeTickets = tickets.filter((t) => t.status === 'ISSUED');
  const pastTickets = tickets.filter((t) => t.status === 'USED');
  const cancelledTickets = tickets.filter((t) => t.status === 'CANCELLED');

  const tabBookings: Record<TabType, Booking[]> = {
    upcoming: upcomingBookings,
    completed: completedBookings,
    cancelled: cancelledBookings,
  };

  const walletTickets: Record<WalletTabType, Ticket[]> = {
    active: activeTickets,
    past: pastTickets,
    cancelled: cancelledTickets,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-brand-textMuted">
            {isAmharic ? 'ጉዞዎችን በመጫን ላይ...' : 'Loading trips...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#031d12] to-[#063B2A] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black">
            {isAmharic ? 'የእኔ ጉዞዎች እና ቲኬቶች' : 'My Trips & Tickets'}
          </h1>
          <p className="text-emerald-200/70 text-sm mt-1">
            {isAmharic
              ? 'ቦታ ማስያዣዎችዎን ያስተዳድሩ፣ ቲኬቶችን ይመልከቱ እና የጉዞ ታሪክዎን ይከታተሉ።'
              : 'Manage your bookings, view tickets, and track journey history.'}
          </p>

          {/* Section Switcher */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setSection('trips')}
              className={`flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-bold transition-all ${
                section === 'trips'
                  ? 'bg-white text-brand-emerald shadow'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Bus className="w-4 h-4" />
              {isAmharic ? 'የእኔ ጉዞዎች' : 'My Trips'}
            </button>
            <button
              onClick={() => setSection('wallet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-bold transition-all ${
                section === 'wallet'
                  ? 'bg-white text-brand-emerald shadow'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {isAmharic ? 'የቲኬት ቦርሳ' : 'Ticket Wallet'}
              {activeTickets.length > 0 && (
                <span className="bg-amber-400 text-amber-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {activeTickets.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TRIPS SECTION */}
        {section === 'trips' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Trip Tabs */}
            <div className="flex border-b border-gray-100 px-3 sm:px-4 pt-3 sm:pt-4 overflow-x-auto touch-scroll no-scrollbar whitespace-nowrap gap-1">
              {(
                [
                  { key: 'upcoming', label: isAmharic ? 'የሚመጡ' : 'Upcoming', count: upcomingBookings.length, icon: Calendar },
                  { key: 'completed', label: isAmharic ? 'የተጠናቀቁ' : 'Completed', count: completedBookings.length, icon: CheckCircle2 },
                  { key: 'cancelled', label: isAmharic ? 'የተሰረዙ' : 'Cancelled', count: cancelledBookings.length, icon: XCircle },
                ] as { key: TabType; label: string; count: number; icon: any }[]
              ).map(({ key, label, count, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTripTab(key)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-t-lg transition-all relative -mb-px shrink-0 ${
                    tripTab === key
                      ? 'text-brand-emerald border-b-2 border-brand-emerald'
                      : 'text-brand-textMuted hover:text-brand-dark'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        tripTab === key
                          ? 'bg-emerald-100 text-brand-emerald'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {tabBookings[tripTab].length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                    {tripTab === 'upcoming' ? (
                      <Bus className="w-7 h-7 text-gray-300" />
                    ) : tripTab === 'completed' ? (
                      <CheckCircle2 className="w-7 h-7 text-gray-300" />
                    ) : (
                      <XCircle className="w-7 h-7 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-brand-textMain">
                      {isAmharic
                        ? tripTab === 'upcoming'
                          ? 'ምንም የሚመጡ ጉዞዎች የሉም'
                          : tripTab === 'completed'
                          ? 'ምንም የተጠናቀቁ ጉዞዎች የሉም'
                          : 'ምንም የተሰረዙ ጉዞዎች የሉም'
                        : `No ${tripTab} trips`}
                    </p>
                    <p className="text-xs text-brand-textMuted mt-1">
                      {tripTab === 'upcoming'
                        ? isAmharic
                          ? 'እስካሁን ምንም አይነት ጉዞ አላስያዙም።'
                          : "You haven't booked any upcoming trips yet."
                        : isAmharic
                        ? 'ምንም መረጃ አልተገኘም።'
                        : `No ${tripTab} bookings found.`}
                    </p>
                  </div>
                  {tripTab === 'upcoming' && (
                    <Link
                      to="/search"
                      className="flex items-center gap-2 px-4 py-2 bg-brand-emerald text-white text-sm font-bold rounded-btn shadow-sm hover:bg-brand-deep transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      {isAmharic ? 'ጉዞ ይፈልጉ' : 'Find a Trip'}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {tabBookings[tripTab].map((booking) => (
                    <div
                      key={booking._id}
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 justify-between p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Bus className="w-6 h-6 text-brand-emerald" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-black text-brand-dark text-base">
                              {isAmharic && booking.trip?.route?.origin?.amharicName
                                ? booking.trip.route.origin.amharicName
                                : booking.trip?.route?.origin?.name || '—'}
                            </h3>
                            <ArrowRight className="w-4 h-4 text-brand-textLight" />
                            <h3 className="font-black text-brand-dark text-base">
                              {isAmharic && booking.trip?.route?.destination?.amharicName
                                ? booking.trip.route.destination.amharicName
                                : booking.trip?.route?.destination?.name || '—'}
                            </h3>
                            <div className="ml-1">
                              <StatusBadge status={booking.status} isAmharic={isAmharic} />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-brand-textMuted font-medium">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(booking.createdAt).toLocaleDateString(isAmharic ? 'am-ET' : 'en-ET', {
                                weekday: 'short', month: 'short', day: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                              <Clock className="w-3.5 h-3.5" />
                              {booking.trip?.departureTime || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                              <Bus className="w-3.5 h-3.5" />
                              {booking.trip?.operator?.name || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                              <TicketIcon className="w-3.5 h-3.5" />
                              {isAmharic ? 'ወንበር: ' : 'Seat: '}
                              {booking.seats?.join(', ')}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-xs text-brand-textLight font-semibold">
                              {isAmharic ? 'የማስያዣ መለያ:' : 'Booking Ref:'}
                            </span>
                            <span className="font-mono text-xs font-bold text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              {booking.bookingReference}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-[10px] font-bold text-brand-textLight uppercase tracking-widest mb-0.5">
                            {isAmharic ? 'የተከፈለው ጠቅላላ' : 'Total Paid'}
                          </span>
                          <span className="text-lg font-black text-brand-dark tabular-nums leading-none">
                            {booking.total.toLocaleString()} {currencyLabel}
                          </span>
                        </div>
                        {booking.tickets && (booking.tickets as any[]).length > 0 && (
                          (booking.tickets as any[]).length === 1 ? (
                            <Link
                              to={`/tickets/${(booking.tickets as any[])[0]._id || (booking.tickets as any[])[0]}`}
                              className="flex items-center gap-1.5 px-4 py-2 bg-brand-emerald hover:bg-brand-deep text-white text-xs font-bold rounded-btn transition-colors shadow-sm"
                            >
                              <Printer className="w-4 h-4" />
                              <span>{isAmharic ? 'ቲኬት አትም' : 'Print Ticket'}</span>
                            </Link>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {(booking.tickets as any[]).map((t: any, tidx: number) => (
                                <Link
                                  key={t._id || tidx}
                                  to={`/tickets/${t._id || t}`}
                                  className="px-3 py-1.5 rounded-btn bg-emerald-50 text-brand-emerald text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                  title={isAmharic ? `ወንበር ${t.seatNumber || tidx + 1} ቲኬት ያትሙ` : `Print Ticket (Seat ${t.seatNumber || tidx + 1})`}
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>{isAmharic ? `ወንበር ${t.seatNumber || tidx + 1}` : `Seat ${t.seatNumber || tidx + 1}`}</span>
                                </Link>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TICKET WALLET SECTION */}
        {section === 'wallet' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Wallet Tabs */}
            <div className="flex border-b border-gray-100 px-3 sm:px-4 pt-3 sm:pt-4 overflow-x-auto touch-scroll no-scrollbar whitespace-nowrap gap-1">
              {(
                [
                  { key: 'active', label: isAmharic ? 'ንቁ ቲኬቶች' : 'Active Tickets', count: activeTickets.length },
                  { key: 'past', label: isAmharic ? 'ያለፉ ቲኬቶች' : 'Past Tickets', count: pastTickets.length },
                  { key: 'cancelled', label: isAmharic ? 'የተሰረዙ' : 'Cancelled', count: cancelledTickets.length },
                ] as { key: WalletTabType; label: string; count: number }[]
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setWalletTab(key)}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-t-lg transition-all relative -mb-px shrink-0 ${
                    walletTab === key
                      ? 'text-brand-emerald border-b-2 border-brand-emerald'
                      : 'text-brand-textMuted hover:text-brand-dark'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        walletTab === key ? 'bg-emerald-100 text-brand-emerald' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {walletTickets[walletTab].length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <TicketIcon className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="font-bold text-brand-textMain">
                    {isAmharic
                      ? walletTab === 'active'
                        ? 'ምንም ንቁ ቲኬቶች የሉም'
                        : walletTab === 'past'
                        ? 'ምንም ያለፉ ቲኬቶች የሉም'
                        : 'ምንም የተሰረዙ ቲኬቶች የሉም'
                      : `No ${walletTab} tickets`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {walletTickets[walletTab].map((ticket) => (
                    <Link
                      key={ticket._id}
                      to={`/tickets/${ticket._id}`}
                      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all overflow-hidden"
                    >
                      {/* Top stripe */}
                      <div
                        className={`h-1.5 ${
                          ticket.status === 'ISSUED'
                            ? 'bg-gradient-to-r from-brand-emerald to-[#087443]'
                            : ticket.status === 'USED'
                            ? 'bg-gray-300'
                            : 'bg-red-300'
                        }`}
                      />
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-mono text-xs font-bold text-brand-emerald">{ticket.ticketNumber}</span>
                          <StatusBadge status={ticket.status} isAmharic={isAmharic} />
                        </div>

                        {/* Route */}
                        <h3 className="font-black text-brand-dark text-base leading-tight">{ticket.routeTitle}</h3>
                        <p className="text-xs text-brand-textMuted mt-1">
                          {ticket.departureDate} • {ticket.departureTime}
                        </p>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                          <div>
                            <span className="text-brand-textLight block">
                              {isAmharic ? 'ኦፕሬተር' : 'Operator'}
                            </span>
                            <span className="font-bold text-brand-textMain">{ticket.operatorName}</span>
                          </div>
                          <div>
                            <span className="text-brand-textLight block">
                              {isAmharic ? 'ወንበር' : 'Seat'}
                            </span>
                            <span className="font-black text-brand-emerald">{ticket.seatNumber}</span>
                          </div>
                          <div>
                            <span className="text-brand-textLight block">
                              {isAmharic ? 'ተሳፋሪ' : 'Passenger'}
                            </span>
                            <span className="font-bold text-brand-textMain truncate">{ticket.passengerName}</span>
                          </div>
                          <div>
                            <span className="text-brand-textLight block">
                              {isAmharic ? 'ክፍያ' : 'Paid'}
                            </span>
                            <span className="font-black text-brand-dark">{ticket.amountPaid} {currencyLabel}</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-emerald group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                            <Printer className="w-3.5 h-3.5" />
                            <span>
                              {ticket.status === 'ISSUED'
                                ? isAmharic ? 'ይመልከቱ / ያትሙ' : 'View & Print'
                                : isAmharic ? 'ዝርዝር ይመልከቱ' : 'View Details'}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                          {ticket.status === 'ISSUED' && (
                            <QrCode className="w-4 h-4 text-brand-emerald opacity-60" />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

