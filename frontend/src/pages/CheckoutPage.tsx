import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
  Building2,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { tripsApi, bookingsApi, paymentsApi } from '../api/endpoints';
import { PassengerForm } from '../features/booking/PassengerForm';
import { PriceBreakdown } from '../features/booking/PriceBreakdown';
import { useAuth } from '../features/auth/useAuth';
import { Trip, PassengerInfo } from '../types';
import { BRAND } from '../config/brand';

const PAYMENT_PROVIDERS = [
  {
    id: 'mock' as const,
    title: 'Instant Dev Gateway',
    subtitle: 'Sandbox instant approval',
    badge: 'Dev',
    badgeColor: 'bg-gray-100 text-gray-600',
    icon: Zap,
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-500',
    border: 'border-gray-200',
    activeBorder: 'border-gray-400',
    activeBg: 'bg-gray-50/50',
  },
  {
    id: 'telebirr' as const,
    title: 'Telebirr SuperApp',
    subtitle: 'Ethio Telecom Mobile Money',
    badge: 'Popular',
    badgeColor: 'bg-blue-50 text-blue-600',
    icon: Smartphone,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'border-gray-200',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-50/30',
  },
  {
    id: 'cbe_birr' as const,
    title: 'CBE Birr',
    subtitle: 'Commercial Bank of Ethiopia',
    badge: 'Bank',
    badgeColor: 'bg-emerald-50 text-emerald-600',
    icon: Building2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    border: 'border-gray-200',
    activeBorder: 'border-brand-emerald',
    activeBg: 'bg-emerald-50/30',
  },
  {
    id: 'chapa' as const,
    title: 'Chapa Pay',
    subtitle: 'Debit card & digital wallet',
    badge: 'Card',
    badgeColor: 'bg-purple-50 text-purple-600',
    icon: CreditCard,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'border-gray-200',
    activeBorder: 'border-purple-500',
    activeBg: 'bg-purple-50/30',
  },
];

export const CheckoutPage: React.FC = () => {
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

  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    selectedSeats.map((seatNumber, i) => ({
      name: i === 0 && user ? `${user.firstName} ${user.lastName}` : '',
      phone: i === 0 && user ? user.phone : '',
      seatNumber,
      ageGroup: 'ADULT',
      idNumber: '',
    }))
  );

  const [paymentProvider, setPaymentProvider] = useState<'mock' | 'telebirr' | 'chapa' | 'cbe_birr'>('telebirr');
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
              `Seat ${unavailable.map((s) => s.seatNumber).join(', ')} has already been booked and paid for. Please choose an available seat.`
            );
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load trip details.');
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
        errors[`passenger_${idx}_name`] = 'Full name is required (at least 2 letters)';
      }
      const cleanPhone = p.phone.trim();
      const phoneRegex = /^(\+251|0)[79]\d{8}$/;
      if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        errors[`passenger_${idx}_phone`] = 'Valid Ethiopian phone required (e.g. 0911234567)';
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBookingAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !trip) return;

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
        provider: paymentProvider,
        paymentMethod:
          paymentProvider === 'telebirr'
            ? 'Telebirr SuperApp'
            : paymentProvider === 'cbe_birr'
            ? 'CBE Birr Mobile'
            : paymentProvider === 'chapa'
            ? 'Chapa Gateway'
            : 'Mock Instant Birr Gateway',
      });

      if (paymentIntent.checkoutUrl && paymentProvider === 'chapa') {
        window.location.href = paymentIntent.checkoutUrl;
        return;
      }

      navigate(`/verify-payment?ref=${paymentIntent.transactionReference}&bookingId=${booking._id}`);
    } catch (err: any) {
      console.error('[Booking/Payment Error]:', err.message, err);
      if (err.message && err.message.includes('Authentication required')) {
        setError('Please sign in or create an account to finalize your booking ticket.');
      } else {
        setError(err.message || 'Failed to initiate booking payment.');
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
            <p className="text-sm font-black text-brand-textMain">Loading checkout...</p>
            <p className="text-xs text-brand-textMuted mt-1">Preparing your booking details</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

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
            <span>Change Selected Seats</span>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Checkout
              </h1>
              <p className="text-emerald-200/70 text-sm mt-1 flex flex-wrap items-center gap-2">
                <span>{trip.route?.origin?.name} → {trip.route?.destination?.name}</span>
                <span>·</span>
                <Clock className="w-3 h-3 inline" /> {trip.departureDate} at {trip.departureTime}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Targa / Plate:</span>
                  <span className="text-xs font-mono font-black bg-white/20 text-white px-2 py-0.5 rounded border border-white/20">
                    {trip.vehicle?.plateNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Chair / Seat:</span>
                  <div className="flex gap-1">
                    {selectedSeats.map((s) => (
                      <span key={s} className="text-xs font-black bg-brand-emerald/40 text-white px-2 py-0.5 rounded border border-emerald-400/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Bus:</span>
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
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Scenic Route</span>
                    <span className="text-xs font-black text-white">{trip.route?.distanceKm} km</span>
                  </div>
                </div>
              )}

              {/* Security badge */}
              <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 flex-shrink-0">
                <Lock className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="text-xs font-black text-white">Secure Checkout</p>
                  <p className="text-[10px] text-emerald-300/70">256-bit encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  Sign In Now
                </Link>
              )}
              {(error.includes('booked') || error.includes('reserved') || error.includes('available')) && (
                <Link
                  to={`/trips/${tripId}/seats`}
                  className="px-3 py-1.5 rounded-btn bg-brand-emerald text-white text-xs font-bold shadow-xs hover:bg-brand-deep"
                >
                  Choose Available Seat
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
            <PassengerForm
              seats={selectedSeats}
              passengers={passengers}
              onChange={handlePassengerChange}
              errors={fieldErrors}
            />

            {/* Payment Method Selector */}
            <div className="bg-white rounded-card p-6 border border-gray-100 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-brand-dark">Payment Method</h3>
                  <p className="text-xs text-brand-textMuted mt-0.5">Choose your preferred payment provider</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-emerald bg-emerald-50 px-3 py-1.5 rounded-btn">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_PROVIDERS.map((prov) => {
                  const Icon = prov.icon;
                  const isSelected = paymentProvider === prov.id;
                  return (
                    <label
                      key={prov.id}
                      className={`relative p-4 rounded-card border-2 cursor-pointer flex flex-col gap-3 transition-all duration-150 ${
                        isSelected
                          ? `${prov.activeBorder} ${prov.activeBg} shadow-sm`
                          : `${prov.border} bg-white hover:border-gray-300`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl ${prov.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${prov.iconColor}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${prov.badgeColor}`}>
                            {prov.badge}
                          </span>
                          <input
                            type="radio"
                            name="paymentProvider"
                            value={prov.id}
                            checked={isSelected}
                            onChange={() => setPaymentProvider(prov.id)}
                            className="text-brand-emerald focus:ring-brand-emerald"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-brand-textMain block">{prov.title}</span>
                        <span className="text-xs text-brand-textMuted block mt-0.5">{prov.subtitle}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              {paymentProvider === 'chapa' && (
                <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5 animate-in fade-in duration-150">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block text-purple-950">Chapa Official Payment Gateway</span>
                    <span className="text-[11px] text-purple-700 block mt-0.5 leading-relaxed">
                      You will be securely routed to Chapa checkout to pay via Visa, Mastercard, Telebirr, or local commercial banking. Your seat will be confirmed immediately.
                    </span>
                  </div>
                </div>
              )}

              {/* Seat reservation reminder */}
              <div className="flex items-center gap-2 p-3 rounded-btn bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
                <Clock className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>Your seat reservation expires in 10 minutes. Complete payment to secure your seat.</span>
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
              disabled={submitting}
              className="w-full py-4 rounded-btn bg-brand-emerald hover:bg-brand-deep disabled:opacity-50 text-white font-extrabold text-base shadow-lg shadow-brand-emerald/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Lock className="w-5 h-5" />
              <span>{submitting ? 'Processing Payment...' : 'Confirm & Pay'}</span>
            </button>

            {/* Trust indicators */}
            <div className="flex flex-col gap-2 p-4 rounded-btn bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>Official government-regulated fare. No hidden fees.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>Digital QR ticket issued instantly after payment.</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
