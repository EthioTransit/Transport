import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Clock,
  Sparkles,
  UserCheck,
  User as UserIcon,
} from 'lucide-react';
import { tripsApi, bookingsApi, paymentsApi } from '../api/endpoints';
import { PassengerForm } from '../features/booking/PassengerForm';
import { PriceBreakdown } from '../features/booking/PriceBreakdown';
import { useAuth } from '../features/auth/useAuth';
import { authStore } from '../features/auth/authStore';
import { Trip, PassengerInfo } from '../types';
import { BRAND } from '../config/brand';
import { hasTripDeparted } from '../utils/time.utils';
import { useTranslation } from 'react-i18next';


export const CheckoutPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, guestLockId } = useAuth();

  const tripId = searchParams.get('tripId') || '';
  const seatsParam = searchParams.get('seats') || '';
  const selectedSeats = seatsParam ? seatsParam.split(',') : [];

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDeparted = trip ? hasTripDeparted(trip.departureDate, trip.departureTime) : false;

  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    selectedSeats.map((seatNumber, i) => ({
      name: i === 0 && user ? `${user.firstName} ${user.lastName}` : '',
      phone: i === 0 && user ? user.phone : '',
      seatNumber,
      ageGroup: 'ADULT',
      idNumber: '',
    }))
  );

  const [paymentProvider] = useState<'chapa'>('chapa');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!tripId || selectedSeats.length === 0) {
      navigate('/search');
      return;
    }

    const fetchTrip = async () => {
      setLoading(true);
      try {
        const [tripData, seatMapData] = await Promise.all([
          tripsApi.getById(tripId),
          tripsApi.getSeats(tripId, guestLockId).catch(() => null),
        ]);
        setTrip(tripData);

        if (seatMapData && seatMapData.seats) {
          const unavailable = seatMapData.seats.filter(
            (s) => selectedSeats.includes(s.seatNumber) && s.status === 'BOOKED'
          );
          if (unavailable.length > 0) {
            setError(
              isAmharic
                ? `ወንበር ${unavailable.map((s) => s.seatNumber).join(', ')} አስቀድሞ የተሸጠ ነው። እባክዎ ክፍት ወንበር ይምረጡ።`
                : `Seat ${unavailable.map((s) => s.seatNumber).join(', ')} has already been booked and paid for. Please choose an available seat.`
            );
          }
        }
      } catch (err: any) {
        setError(err.message || (isAmharic ? 'የጉዞ ዝርዝር መረጃዎችን ማምጣት አልተቻለም።' : 'Failed to load trip details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setPassengers(updated);
    setFieldErrors((prev) => ({ ...prev, [`passenger_${index}_${field}`]: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    passengers.forEach((p, idx) => {
      if (!p.name || p.name.trim().length < 2) {
        errors[`passenger_${idx}_name`] = isAmharic
          ? 'ሙሉ ስም ማስገባት ግዴታ ነው (ቢያንስ 2 ፊደላት)'
          : 'Full name is required (at least 2 letters)';
      }
      const cleanPhone = p.phone.trim();
      const phoneRegex = /^(\+251|0)[79]\d{8}$/;
      if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        errors[`passenger_${idx}_phone`] = isAmharic
          ? 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ምሳሌ፡ 0911234567)'
          : 'Valid Ethiopian phone required (e.g. 0911234567)';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBookingAndPay = async (e: React.FormEvent, isRetry = false) => {
    e.preventDefault();
    if (!validateForm() || !trip) return;

    if (isDeparted) {
      setError(
        isAmharic
          ? 'ይህ ጉዞ አስቀድሞ ተነስቷል። ወደ ክፍያ መቀጠል አይቻልም።'
          : 'This journey has already departed. You cannot proceed to payment.'
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const booking = await bookingsApi.create({
        tripId: trip._id,
        seats: selectedSeats,
        passengers,
        guestLockId,
      });

      const paymentIntent = await paymentsApi.create({
        bookingId: booking._id,
        provider: 'chapa',
        paymentMethod: 'Chapa Gateway',
      });

      if (paymentIntent.checkoutUrl) {
        window.location.href = paymentIntent.checkoutUrl;
        return;
      }

      navigate(`/verify-payment?ref=${paymentIntent.transactionReference}&bookingId=${booking._id}`);
    } catch (err: any) {
      console.error('[Booking/Payment Error]:', err.message, err);

      // Auto-retry once as guest if session expired or token was unauthorized
      if (
        !isRetry &&
        (err.status === 401 ||
          err.code === 'INVALID_TOKEN' ||
          err.message?.includes('expired') ||
          err.message?.includes('session') ||
          err.message?.includes('Unauthorized'))
      ) {
        console.warn('[Checkout] Stale or expired session encountered. Resetting auth store and retrying as guest checkout...');
        authStore.logout();
        return handleCreateBookingAndPay(e, true);
      }

      if (err.message && err.message.includes('Authentication required')) {
        setError(
          isAmharic
            ? 'የትኬት ማስያዣዎን ለማጠናቀቅ እባክዎ ይግቡ ወይም የተጓዥ አድራሻ መረጃዎችን ያረጋግጡ።'
            : 'Please sign in or confirm passenger contact details to finalize your booking ticket.'
        );
      } else {
        setError(err.message || (isAmharic ? 'የክፍያ ሂደቱን ማስጀመር አልተቻለም።' : 'Failed to initiate booking payment.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-black text-brand-textMain">
              {isAmharic ? 'የክፍያ ገጽ በመጫን ላይ...' : 'Loading checkout...'}
            </p>
            <p className="text-xs text-brand-textMuted mt-1">
              {isAmharic ? 'የቦታ ማስያዣ ዝርዝሮችን በማዘጋጀት ላይ' : 'Preparing your booking details'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const originName = isAmharic && trip.route?.origin?.amharicName ? trip.route.origin.amharicName : trip.route?.origin?.name;
  const destinationName = isAmharic && trip.route?.destination?.amharicName ? trip.route.destination.amharicName : trip.route?.destination?.name;

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Page Header */}
      <div className="bg-[#031d12] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/50">
        <div className="max-w-6xl mx-auto">
          <Link
            to={`/trips/${tripId}/seats?seats=${seatsParam}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'የተመረጡ ወንበሮችን ቀይር' : 'Change Selected Seats'}</span>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isAmharic ? 'ክፍያ ማጠናቀቂያ' : 'Checkout'}
              </h1>
              <p className="text-emerald-200/70 text-sm mt-1 flex flex-wrap items-center gap-2">
                <span>{originName} → {destinationName}</span>
                <span>·</span>
                <Clock className="w-3 h-3 inline" /> {trip.departureDate} {isAmharic ? 'በ' : 'at'} {trip.departureTime}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    {isAmharic ? 'የሰሌዳ ቁጥር:' : 'Targa / Plate:'}
                  </span>
                  <span className="text-xs font-mono font-black bg-white/20 text-white px-2 py-0.5 rounded border border-white/20">
                    {trip.vehicle?.plateNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    {isAmharic ? 'ወንበር:' : 'Chair / Seat:'}
                  </span>
                  <div className="flex gap-1">
                    {selectedSeats.map((s) => (
                      <span key={s} className="text-xs font-black bg-brand-emerald/40 text-white px-2 py-0.5 rounded border border-emerald-400/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    {isAmharic ? 'አውቶቡስ:' : 'Bus:'}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {trip.operator?.name || 'Operator'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Route Corridor Photo Thumbnail */}
              {(trip.route?.image || (trip.route?.destination as any)?.image) && (
                <div className="hidden sm:flex items-center gap-2.5 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shrink-0">
                  <img
                    src={trip.route?.image || (trip.route?.destination as any)?.image}
                    alt="Corridor"
                    className="w-16 h-12 object-cover rounded-lg shrink-0"
                  />
                  <div className="pr-2 text-left">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                      {isAmharic ? 'የጉዞ ርቀት' : 'Scenic Route'}
                    </span>
                    <span className="text-xs font-black text-white">{trip.route?.distanceKm} km</span>
                  </div>
                </div>
              )}

              {/* Security badge */}
              <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex-shrink-0">
                <Lock className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="text-xs font-black text-white">{isAmharic ? 'ደህንነቱ የተጠበቀ ክፍያ' : 'Secure Checkout'}</p>
                  <p className="text-[10px] text-emerald-300/70">{isAmharic ? 'በ256-ቢት የተመሰጠረ' : '256-bit encrypted'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Departed Alert Banner */}
      {isDeparted && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                <AlertCircle className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">
                  {isAmharic ? 'ይህ ጉዞ አስቀድሞ ተነስቷል' : 'Journey Has Already Departed'}
                </span>
                <span className="text-xs text-amber-800 block mt-0.5">
                  {isAmharic
                    ? `መነሻው በ${trip.departureDate} በ${trip.departureTime} ነበር። ያለፉ ጉዞዎች ላይ ቦታ ማስያዝና ክፍያ ተዘግቷል።`
                    : `Departure was scheduled for ${trip.departureTime} on ${trip.departureDate}. Seat reservations and checkouts are closed for past journeys.`}
                </span>
              </div>
            </div>
            <Link
              to={`/search?from=${trip.route?.origin?.code || 'ADD'}&to=${trip.route?.destination?.code || 'DBR'}`}
              className="px-4 py-2 rounded-btn bg-brand-emerald text-white text-xs font-bold shrink-0 hover:bg-brand-deep transition-colors"
            >
              {isAmharic ? 'ቀጣይ ጉዞዎችን ፈልግ' : 'Search Upcoming Trips'}
            </Link>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 rounded-card bg-red-50 border border-red-200 text-status-error text-sm font-medium flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2">
              {error.includes('sign in') && (
                <Link to="/login" className="px-3 py-1.5 rounded-btn bg-brand-emerald text-white text-xs font-bold shadow-xs hover:bg-brand-deep">
                  {isAmharic ? 'አሁን ይግቡ' : 'Sign In Now'}
                </Link>
              )}
              {(error.includes('booked') || error.includes('reserved') || error.includes('available') || error.includes('የተሸጠ')) && (
                <Link
                  to={`/trips/${tripId}/seats`}
                  className="px-3 py-1.5 rounded-btn bg-brand-emerald text-white text-xs font-bold shadow-xs hover:bg-brand-deep"
                >
                  {isAmharic ? 'ክፍት ወንበር ይምረጡ' : 'Choose Available Seat'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleCreateBookingAndPay} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Passenger Info & Payment Options */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Passenger Session Status Indicator */}
            <div className="bg-white rounded-card p-4 border border-gray-100 shadow-xs flex items-center justify-between gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-brand-emerald flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-textMain">
                        {isAmharic ? `በ${user.firstName} ${user.lastName} ስም ቦታ ማስያዝ` : `Booking as ${user.firstName} ${user.lastName}`}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {isAmharic ? 'ገብተዋል' : 'Signed In'}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-textMuted mt-0.5">
                      {isAmharic ? 'ቲኬቶችዎ በቀጥታ በኢትዮትራንዚት ዳሽቦርድዎ ውስጥ ይቀመጣሉ።' : 'Tickets will automatically link to your EthioTransit dashboard.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-textMain">
                        {isAmharic ? 'ያለ መለያ (እንደ እንግዳ) ክፍያ ማጠናቀቂያ' : 'Guest Passenger Checkout'}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {isAmharic ? 'መግባት አያስፈልግም' : 'No Login Required'}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-textMuted mt-0.5">
                      {isAmharic
                        ? 'የተጓዦችን መረጃ ከታች ያስገቡ። ክፍያው እንደተፈጸመ የQR ቲኬትዎ እና ደረሰኝዎ ወዲያውኑ ይሰጥዎታል።'
                        : 'Enter passenger details below. Your QR ticket and receipt are issued immediately after payment.'}
                    </p>
                  </div>
                </div>
              )}
              {!isAuthenticated && (
                <Link
                  to={`/login?redirect=/checkout?tripId=${tripId}&seats=${seatsParam}`}
                  className="text-xs font-bold text-brand-emerald hover:underline shrink-0"
                >
                  {isAmharic ? 'ይግቡ' : 'Sign In'}
                </Link>
              )}
            </div>

            <PassengerForm
              seats={selectedSeats}
              passengers={passengers}
              onChange={handlePassengerChange}
              errors={fieldErrors}
            />

            {/* Payment Method Selector */}
            <div className="bg-white rounded-card p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col gap-4 sm:gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-brand-dark">
                    {isAmharic ? 'የመክፈያ ዘዴ' : 'Payment Method'}
                  </h3>
                  <p className="text-xs text-brand-textMuted mt-0.5">
                    {isAmharic ? 'ሕጋዊ የኢትዮጵያ ዲጂታል ክፍያ አማራጭ' : 'Official Ethiopian digital payment provider'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-emerald bg-emerald-50 px-3 py-1.5 rounded-btn">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'በ256-ቢት የተመሰጠረ' : '256-bit Encrypted'}</span>
                </div>
              </div>

              {/* Dedicated Chapa Card */}
              <div className="relative p-5 rounded-card border-2 border-purple-500 bg-purple-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600 shadow-xs">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-brand-dark">Chapa</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {isAmharic ? 'ሕጋዊ መክፈያ በር' : 'Official Gateway'}
                      </span>
                    </div>
                    <span className="text-xs text-brand-textMuted block mt-0.5">
                      {isAmharic ? 'በቻፓ (Chapa) አማካኝነት በደህና ይክፈሉ' : 'Pay securely via Chapa'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100/70 px-3 py-1.5 rounded-btn shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>{isAmharic ? 'ተመርጧል' : 'Selected'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5 animate-in fade-in duration-150">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-purple-950">
                    {isAmharic ? 'የቻፓ (Chapa) ሕጋዊ ክፍያ በር' : 'Chapa Official Payment Gateway'}
                  </span>
                  <span className="text-[11px] text-purple-700 block mt-0.5 leading-relaxed">
                    {isAmharic
                      ? 'ክፍያውን በደህና ለማጠናቀቅ ወደ ቻፓ ክፍያ ገጽ ይወሰዳሉ። ወንበርዎ ወዲያውኑ ይረጋገጣል እንዲሁም ዲጂታል የQR ቲኬት ይሰጥዎታል።'
                      : 'You will be securely routed to Chapa checkout to complete payment. Your seat will be confirmed immediately and a digital QR ticket will be issued.'}
                  </span>
                </div>
              </div>

              {/* Seat reservation reminder */}
              <div className="flex items-center gap-2 p-3 rounded-btn bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
                <Clock className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  {isAmharic
                    ? 'ክፍያው እንደተጠናቀቀ የወንበር ማስያዣዎ ለዚህ ጉዞ በቋሚነት የተረጋገጠ ይሆናል።'
                    : 'Your seat reservation is permanently held for this trip upon checkout.'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Price Breakdown & Confirmation */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-28">
            <PriceBreakdown
              farePerSeat={trip.fare}
              serviceFeePerSeat={trip.serviceFee || BRAND.platformFee}
              seatsCount={selectedSeats.length}
              selectedSeats={selectedSeats}
            />

            {/* Confirm & Pay Button */}
            <button
              type="submit"
              id="confirm-pay-btn"
              disabled={submitting || isDeparted}
              className="w-full py-4 rounded-btn bg-brand-emerald hover:bg-brand-deep disabled:opacity-50 text-white font-extrabold text-base shadow-lg shadow-brand-emerald/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Lock className="w-5 h-5" />
              <span>
                {isDeparted
                  ? (isAmharic ? 'ጉዞው ተነስቷል (ክፍያ ተዘግቷል)' : 'Journey Departed (Booking Closed)')
                  : submitting
                  ? (isAmharic ? 'ወደ ቻፓ በመሸጋገር ላይ...' : 'Redirecting to Chapa...')
                  : (isAmharic ? 'በቻፓ ይክፈሉ' : 'Pay with Chapa')}
              </span>
            </button>

            {/* Trust indicators */}
            <div className="flex flex-col gap-2 p-4 rounded-btn bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>
                  {isAmharic
                    ? 'በመንግስት የተወሰነ ትክክለኛ ታሪፍ። ምንም ድብቅ ክፍያ የለም።'
                    : 'Official government-regulated fare. No hidden fees.'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>
                  {isAmharic
                    ? 'ክፍያው እንደተጠናቀቀ ዲጂታል የQR ቲኬት ወዲያውኑ ይሰጣል።'
                    : 'Digital QR ticket issued instantly after payment.'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
