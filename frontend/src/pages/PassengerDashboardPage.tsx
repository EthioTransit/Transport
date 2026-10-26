import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Bus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode,
  TrendingUp,
  ChevronRight,
  Luggage,
  Star,
  Printer,
  Download,
} from 'lucide-react';
import { ticketsApi, bookingsApi } from '../api/endpoints';
import { useAuth } from '../features/auth/useAuth';
import { Ticket, Booking, BookingStatus } from '../types';
import { SearchCard } from '../features/search/SearchCard';
import { BRAND } from '../config/brand';
import { useTranslation } from 'react-i18next';

type TabType = 'upcoming' | 'completed' | 'cancelled';

const getHourGreeting = (isAmharic: boolean) => {
  const hour = new Date().getHours();
  if (hour < 12) return isAmharic ? 'እንደምን አደሩ' : 'Good morning';
  if (hour < 17) return isAmharic ? 'እንደምን ዋሉ' : 'Good afternoon';
  return isAmharic ? 'እንደምን አመሹ' : 'Good evening';
};

const StatusBadge: React.FC<{ status: string; isAmharic?: boolean }> = ({ status, isAmharic }) => {
  const map: Record<string, { label: string; amharicLabel: string; cls: string }> = {
    CONFIRMED: { label: 'Confirmed', amharicLabel: 'የተረጋገጠ', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    PENDING: { label: 'Pending', amharicLabel: 'በመጠባበቅ ላይ', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    CANCELLED: { label: 'Cancelled', amharicLabel: 'የተሰረዘ', cls: 'bg-red-50 text-red-600 border border-red-200' },
    COMPLETED: { label: 'Completed', amharicLabel: 'የተጠናቀቀ', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    REFUNDED: { label: 'Refunded', amharicLabel: 'ተመላሽ የተደረገ', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
    ISSUED: { label: 'Active', amharicLabel: 'ንቁ', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    USED: { label: 'Boarded', amharicLabel: 'የተሳፈሩበት', cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  };
  const style = map[status] || { label: status, amharicLabel: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${style.cls}`}>
      {isAmharic ? style.amharicLabel : style.label}
    </span>
  );
};

export const PassengerDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';
  const currencyLabel = isAmharic ? 'ብር' : BRAND.currency;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Guest Ticket Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResults, setLookupResults] = useState<Ticket[] | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = lookupQuery.trim();
    if (!q) return;

    setLookupLoading(true);
    setLookupError(null);
    try {
      const results = await ticketsApi.lookup(q);
      setLookupResults(results);
      if (results.length === 0) {
        setLookupError(
          isAmharic
            ? 'በተሰጠው መለያ ምንም ቲኬት አልተገኘም። እባክዎ የቲኬት ቁጥርዎን፣ የማስያዣ መለያዎን ወይም የስልክ ቁጥርዎን ያረጋግጡ።'
            : 'No tickets found matching this query. Please check your Ticket Number (TK-...), Booking Ref (BK-...), or Phone Number.'
        );
      }
    } catch (err: any) {
      setLookupError(err.message || (isAmharic ? 'ቲኬቶችን መፈለግ አልተቻለም።' : 'Failed to search for tickets.'));
      setLookupResults([]);
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
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
  const nextTrip = upcomingBookings[0];

  const tabBookings = {
    upcoming: upcomingBookings,
    completed: completedBookings,
    cancelled: cancelledBookings,
  }[activeTab];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-brand-textMuted">
            {isAmharic ? 'ዳሽቦርድዎን በመጫን ላይ...' : 'Loading your dashboard...'}
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated Guest View: Dedicated Find, Print & Download Ticket portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] pb-16">
        {/* Guest Hero */}
        <div className="bg-gradient-to-br from-[#031d12] via-[#052d1a] to-[#0a4729] text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-400/30">
              <TicketIcon className="w-3.5 h-3.5" />
              {isAmharic ? 'የመሳፈሪያ ዲጂታል ቲኬት ፖርታል' : 'Boarding Pass & Ticket Portal'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {isAmharic ? 'ቲኬትዎን ፈልገው ያትሙ / ያውርዱ' : 'Find, Print & Download Your Ticket'}
            </h1>
            <p className="text-emerald-200/80 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
              {isAmharic
                ? 'የቲኬት ቁጥርዎን (ለምሳሌ፡ TK-...)፣ የማስያዣ መለያዎን (ለምሳሌ፡ BK-...) ወይም ስልክ ቁጥርዎን በማስገባት የመሳፈሪያ ፈቃድዎን በቀላሉ ይመልከቱ፣ ያትሙ ወይም እንደ PDF ያውርዱ።'
                : 'Enter your Ticket Number (e.g. TK-...), Booking Reference (e.g. BK-...), or Passenger Phone Number to view, print, or download your official boarding pass.'}
            </p>
          </div>
        </div>

        {/* Search Card */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder={
                    isAmharic
                      ? 'የቲኬት ቁጥር (TK-...)፣ የማስያዣ መለያ (BK-...)፣ ወይም ስልክ ቁጥር...'
                      : 'Ticket Number (TK-...), Booking Ref (BK-...), or Phone (09...)...'
                  }
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20 text-sm font-semibold text-brand-dark outline-none transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading || !lookupQuery.trim()}
                className="px-6 py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-deep text-white font-black text-sm shadow-md shadow-brand-emerald/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              >
                {lookupLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{isAmharic ? 'ቲኬት ፈልግ' : 'Find Ticket'}</span>
              </button>
            </form>

            {lookupError && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm font-medium">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{isAmharic ? 'ምንም ቲኬት አልተገኘም' : 'Ticket Lookup'}</p>
                  <p className="mt-0.5 text-red-700">{lookupError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results List */}
          {lookupResults && lookupResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-brand-dark flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-emerald" />
                  {isAmharic
                    ? `የተገኙ ቲኬቶች (${lookupResults.length})`
                    : `Matching Tickets (${lookupResults.length})`}
                </h2>
                <button
                  onClick={() => {
                    setLookupResults(null);
                    setLookupQuery('');
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  {isAmharic ? 'ፍለጋውን አጽዳ' : 'Clear search'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {lookupResults.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand-emerald flex items-center justify-center shrink-0">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-brand-dark text-base">{ticket.routeTitle}</h3>
                          <StatusBadge status={ticket.status} isAmharic={isAmharic} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-brand-textMuted font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {ticket.departureDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {ticket.departureTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <TicketIcon className="w-3.5 h-3.5" />
                            {isAmharic ? 'ወንበር: ' : 'Seat: '}
                            <strong className="text-brand-emerald">{ticket.seatNumber}</strong>
                          </span>
                          <span>•</span>
                          <span className="font-bold text-brand-dark">{ticket.passengerName}</span>
                        </div>
                        <p className="font-mono text-xs text-brand-emerald font-bold mt-1.5">
                          {ticket.ticketNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-deep text-white text-xs font-black shadow-md shadow-brand-emerald/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <Download className="w-3.5 h-3.5" />
                        <span>{isAmharic ? 'አትም / PDF አውርድ' : 'Print / Download PDF'}</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* PDF Tip */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-xs text-emerald-800 font-semibold flex items-center justify-center gap-1.5">
                  <Download className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span>
                    {isAmharic
                      ? 'ቲኬቱን በስልክዎ ወይም በኮምፒውተርዎ ለማስቀመጥ "አትም / PDF አውርድ" የሚለውን ይጫኑና በማተሚያው ምርጫ ላይ "Save as PDF" ይምረጡ።'
                      : 'To save your ticket to your device, click "Print / Download PDF" and select "Save as PDF" in printer options.'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Account Login CTA */}
          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-brand-dark text-sm sm:text-base">
                {isAmharic ? 'የኢትዮ-ትራንዚት አካውንት አለዎት?' : 'Have an EthioTransit Account?'}
              </h3>
              <p className="text-xs text-brand-textMuted mt-0.5">
                {isAmharic
                  ? 'ሁሉንም የተጓዟቸውን እና የሚመጡ ጉዞዎችዎን በአንድ ቦታ ለማየት ወደ አካውንትዎ ይግቡ።'
                  : 'Sign in to see all your upcoming journeys, active tickets, and travel history in one place.'}
              </p>
            </div>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-brand-dark text-xs font-bold transition-colors text-center shrink-0"
            >
              {isAmharic ? 'ወደ አካውንት ይግቡ →' : 'Sign In →'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      {/* Hero Greeting Banner */}
      <div className="bg-gradient-to-br from-[#031d12] via-[#052d1a] to-[#0a4729] text-white pt-10 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 800 200" className="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
            <circle cx="700" cy="100" r="200" fill="#10b981" />
            <circle cx="100" cy="50" r="120" fill="#D9A441" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-emerald-300 text-sm font-semibold mb-1">
                {getHourGreeting(isAmharic)} 👋
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {user ? `${user.firstName} ${user.lastName}` : (isAmharic ? 'ተጓዥ' : 'Traveler')}
              </h1>
              <p className="text-emerald-200/70 text-sm mt-1">
                {isAmharic ? 'ዛሬ የት መጓዝ ይፈልጋሉ?' : 'Where would you like to travel today?'}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* SEARCH CARD OVERLAY */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-8">
        <SearchCard />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: isAmharic ? 'ቀጣይ' : 'Upcoming', value: upcomingBookings.length, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: isAmharic ? 'የተጠናቀቁ' : 'Completed', value: completedBookings.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: isAmharic ? 'የተሰረዙ' : 'Cancelled', value: cancelledBookings.length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`rounded-2xl p-5 border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow ${bg} ${border}`}>
              <div className={`p-3.5 rounded-xl bg-white shadow-sm flex-shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Next Trip Highlight */}
        {nextTrip && (
          <div className="relative bg-gradient-to-r from-brand-emerald to-[#087443] rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none">
              <Bus className="w-full h-full text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
                  {isAmharic ? 'የሚቀጥለው ጉዞ' : 'Next Journey'}
                </span>
                <h2 className="text-xl font-black mt-3">
                  {isAmharic && nextTrip.trip?.route?.origin?.amharicName
                    ? nextTrip.trip.route.origin.amharicName
                    : nextTrip.trip?.route?.origin?.name} →{' '}
                  {isAmharic && nextTrip.trip?.route?.destination?.amharicName
                    ? nextTrip.trip.route.destination.amharicName
                    : nextTrip.trip?.route?.destination?.name}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-emerald-100 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(nextTrip.createdAt).toLocaleDateString(isAmharic ? 'am-ET' : 'en-ET', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bus className="w-4 h-4" />
                    {nextTrip.trip?.operator?.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TicketIcon className="w-4 h-4" />
                    {isAmharic ? 'ወንበር: ' : 'Seats: '}{nextTrip.seats?.join(', ')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {nextTrip.tickets && nextTrip.tickets.length > 0 ? (
                  <Link
                    to={`/tickets/${(nextTrip.tickets as any)[0]._id || (nextTrip.tickets as any)[0]}`}
                    className="px-5 py-2.5 bg-white text-brand-emerald font-black rounded-btn text-sm shadow hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
                  >
                    {isAmharic ? 'ቲኬት ይመልከቱ →' : 'View Ticket →'}
                  </Link>
                ) : (
                  <Link
                    to="/my-tickets"
                    className="px-5 py-2.5 bg-white text-brand-emerald font-black rounded-btn text-sm shadow hover:bg-gray-50 transition-colors text-center"
                  >
                    {isAmharic ? 'የእኔ ቲኬቶች →' : 'My Tickets →'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ticket Wallet */}
        {activeTickets.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-brand-dark flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-emerald" />
                {isAmharic ? 'ንቁ ቲኬቶች' : 'Active Tickets'}
              </h2>
              <Link to="/my-tickets" className="text-xs font-bold text-brand-emerald hover:underline">
                {isAmharic ? 'ሁሉንም አሳይ →' : 'View all →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTickets.slice(0, 3).map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                >
                  {/* Ticket top stripe */}
                  <div className="h-1.5 bg-gradient-to-r from-brand-emerald to-[#087443]" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-brand-emerald">
                        {ticket.ticketNumber}
                      </span>
                      <StatusBadge status={ticket.status} isAmharic={isAmharic} />
                    </div>
                    <h3 className="font-black text-base text-brand-dark leading-tight">{ticket.routeTitle}</h3>
                    <p className="text-xs text-brand-textMuted mt-1">
                      {ticket.departureDate} • {ticket.departureTime}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="text-xs">
                        <span className="text-brand-textLight">{isAmharic ? 'ወንበር ' : 'Seat '}</span>
                        <span className="font-black text-brand-emerald">{ticket.seatNumber}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-emerald group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isAmharic ? 'ይመልከቱ / ያትሙ' : 'View & Print'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* My Trips — Tabbed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
            <h2 className="text-base sm:text-lg font-black text-brand-dark mb-4 sm:mb-5 flex items-center gap-2">
              <Luggage className="w-5 h-5 text-brand-emerald" />
              {isAmharic ? 'የእኔ ጉዞዎች' : 'My Trips'}
            </h2>
            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-100 overflow-x-auto touch-scroll no-scrollbar whitespace-nowrap">
              {(
                [
                  { key: 'upcoming', label: isAmharic ? 'ቀጣይ' : 'Upcoming', count: upcomingBookings.length },
                  { key: 'completed', label: isAmharic ? 'የተጠናቀቁ' : 'Completed', count: completedBookings.length },
                  { key: 'cancelled', label: isAmharic ? 'የተሰረዙ' : 'Cancelled', count: cancelledBookings.length },
                ] as { key: TabType; label: string; count: number }[]
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-t-lg transition-all relative -mb-px shrink-0 ${
                    activeTab === key
                      ? 'text-brand-emerald border-b-2 border-brand-emerald'
                      : 'text-brand-textMuted hover:text-brand-dark'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span
                      className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        activeTab === key ? 'bg-emerald-100 text-brand-emerald' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {tabBookings.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center gap-3">
                {activeTab === 'upcoming' ? (
                  <Bus className="w-10 h-10 text-gray-200" />
                ) : activeTab === 'completed' ? (
                  <CheckCircle2 className="w-10 h-10 text-gray-200" />
                ) : (
                  <XCircle className="w-10 h-10 text-gray-200" />
                )}
                <p className="text-sm font-bold text-brand-textMuted">
                  {isAmharic
                    ? activeTab === 'upcoming'
                      ? 'ምንም የሚመጡ ጉዞዎች የሉም'
                      : activeTab === 'completed'
                      ? 'ምንም የተጠናቀቁ ጉዞዎች የሉም'
                      : 'ምንም የተሰረዙ ጉዞዎች የሉም'
                    : `No ${activeTab} trips`}
                </p>
                {activeTab === 'upcoming' && (
                  <Link
                    to="/search"
                    className="mt-1 text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1"
                  >
                    {isAmharic ? 'ጉዞዎችን ፈልግ' : 'Search for trips'} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                {tabBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between group first:pt-0 last:pb-0 hover:bg-gray-50/50 rounded-xl px-2 -mx-2 transition-colors duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Bus className="w-5 h-5 text-brand-emerald" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-brand-dark text-sm">
                            {isAmharic && booking.trip?.route?.origin?.amharicName
                              ? booking.trip.route.origin.amharicName
                              : booking.trip?.route?.origin?.name || '—'} →{' '}
                            {isAmharic && booking.trip?.route?.destination?.amharicName
                              ? booking.trip.route.destination.amharicName
                              : booking.trip?.route?.destination?.name || '—'}
                          </h3>
                          <StatusBadge status={booking.status} isAmharic={isAmharic} />
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-brand-textMuted font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(booking.createdAt).toLocaleDateString(isAmharic ? 'am-ET' : 'en-ET')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bus className="w-3.5 h-3.5" />
                            {booking.trip?.operator?.name || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <TicketIcon className="w-3.5 h-3.5" />
                            {isAmharic ? 'ወንበር: ' : 'Seats: '}{booking.seats?.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:flex-shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span className="text-sm font-black text-brand-dark">
                        {booking.total} {currencyLabel}
                      </span>
                      {booking.tickets && (booking.tickets as any[]).length > 0 && (
                        (booking.tickets as any[]).length === 1 ? (
                          <Link
                            to={`/tickets/${(booking.tickets as any[])[0]._id || (booking.tickets as any[])[0]}`}
                            className="px-3 py-1.5 rounded-btn bg-emerald-50 text-brand-emerald text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isAmharic ? 'ቲኬት አትም' : 'Print Ticket'}</span>
                          </Link>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {(booking.tickets as any[]).map((t: any, tidx: number) => (
                              <Link
                                key={t._id || tidx}
                                to={`/tickets/${t._id || t}`}
                                className="px-2.5 py-1 rounded-btn bg-emerald-50 text-brand-emerald text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                title={isAmharic ? `ወንበር ${t.seatNumber || tidx + 1} ቲኬት ያትሙ` : `Print Ticket (Seat ${t.seatNumber || tidx + 1})`}
                              >
                                <Printer className="w-3 h-3" />
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

        {/* Empty state when no data at all */}
        {bookings.length === 0 && tickets.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Bus className="w-8 h-8 text-brand-emerald" />
            </div>
            <h3 className="text-lg font-black text-brand-dark">
              {isAmharic ? 'እስካሁን ምንም ጉዞ የለም' : 'No journeys yet'}
            </h3>
            <p className="text-sm text-brand-textMuted mt-1 max-w-xs mx-auto">
              {isAmharic
                ? 'ኢትዮጵያን ማሰስ ይጀምሩ! የመጀመሪያውን የከተማ አቋራጭ የአውቶቡስ ወንበርዎን በሰከንዶች ውስጥ ያስይዙ።'
                : 'Start exploring Ethiopia! Book your first intercity bus seat in seconds.'}
            </p>
            <Link
              to="/search"
              className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-brand-emerald text-white font-bold rounded-btn shadow-md hover:bg-brand-deep transition-colors text-sm"
            >
              <Search className="w-4 h-4" />
              {isAmharic ? 'ጉዞዎችን ፈልግ' : 'Search Trips'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
