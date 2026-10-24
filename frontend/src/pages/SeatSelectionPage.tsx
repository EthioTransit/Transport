import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bus,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { tripsApi } from '../api/endpoints';
import { SeatMap } from '../features/seats/SeatMap';
import { SeatLegend } from '../features/seats/SeatLegend';
import { SeatLockTimer } from '../features/seats/SeatLockTimer';
import { useAuth } from '../features/auth/useAuth';
import { Trip, SeatItem } from '../types';
import { BRAND } from '../config/brand';
import { hasTripDeparted } from '../utils/time.utils';

export const SeatSelectionPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { guestLockId } = useAuth();

  const passengersCount = parseInt(searchParams.get('passengers') || '1', 10);
  const travelDate = searchParams.get('date') || '';

  const [trip, setTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTripAndSeats = async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const [tripData, seatsData] = await Promise.all([
        tripsApi.getById(tripId),
        tripsApi.getSeats(tripId, guestLockId),
      ]);

      setTrip(tripData);
      setSeats(seatsData.seats);

      const myLocked = seatsData.seats.filter((s) => s.isMine).map((s) => s.seatNumber);
      if (myLocked.length > 0) {
        setSelectedSeatNumbers(myLocked);
        const expires = seatsData.seats.find((s) => s.isMine)?.lockExpiresAt;
        if (expires) setLockExpiresAt(expires);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load seat layout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripAndSeats();
  }, [tripId]);

  const getNextDateStr = (currentDateStr: string) => {
    try {
      const d = new Date(currentDateStr + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };
  const nextDateStr = trip?.departureDate ? getNextDateStr(trip.departureDate) : '';
  const isDeparted = trip ? hasTripDeparted(trip.departureDate, trip.departureTime) : false;

  const handleToggleSeat = async (seatNumber: string) => {
    if (!tripId) return;

    if (isDeparted) {
      setError('This journey has already departed. Seat reservations are closed.');
      return;
    }

    setError(null);

    // Guard: new or existing user CANNOT click reserved, booked, or blocked seats
    const targetSeat = seats.find((s) => s.seatNumber === seatNumber);
    if (!targetSeat) return;

    const isBooked = targetSeat.status === 'BOOKED';
    const isBlocked = targetSeat.status === 'BLOCKED';
    const isReservedByOther = targetSeat.status === 'RESERVED' && !targetSeat.isMine;

    if (isBooked || isBlocked || isReservedByOther) {
      return;
    }

    const isCurrentlySelected = selectedSeatNumbers.includes(seatNumber);

    if (isCurrentlySelected) {
      const nextSelected = selectedSeatNumbers.filter((s) => s !== seatNumber);
      setSelectedSeatNumbers(nextSelected);

      try {
        await tripsApi.unlockSeats(tripId, [seatNumber], guestLockId);
        const updated = await tripsApi.getSeats(tripId, guestLockId);
        setSeats(updated.seats);
        if (nextSelected.length === 0) setLockExpiresAt(null);
      } catch (err) {
        console.error('Failed to unlock seat:', err);
      }
    } else {
      if (selectedSeatNumbers.length >= passengersCount) {
        setError(`You searched for ${passengersCount} passenger(s). Deselect a seat before choosing another.`);
        return;
      }

      setLocking(true);
      const nextSelected = [...selectedSeatNumbers, seatNumber];

      try {
        const lockRes = await tripsApi.lockSeats(tripId, [seatNumber], guestLockId);
        setSelectedSeatNumbers(nextSelected);
        setLockExpiresAt(lockRes.lockExpiresAt);

        const updated = await tripsApi.getSeats(tripId, guestLockId);
        setSeats(updated.seats);
      } catch (err: any) {
        setError(err.message || 'Seat could not be locked.');
      } finally {
        setLocking(false);
      }
    }
  };

  const handleTimerExpired = () => {
    setError('Your 10-minute seat reservation has expired. Please select your seats again.');
    setSelectedSeatNumbers([]);
    setLockExpiresAt(null);
    fetchTripAndSeats();
  };

  const handleProceedToCheckout = () => {
    if (isDeparted) {
      setError('This journey has already departed. You cannot proceed to checkout.');
      return;
    }

    if (selectedSeatNumbers.length !== passengersCount) {
      setError(`Please select exactly ${passengersCount} seat(s) before proceeding.`);
      return;
    }

    navigate(
      `/checkout?tripId=${tripId}&seats=${selectedSeatNumbers.join(',')}&date=${travelDate}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-black text-brand-textMain">Loading seat map...</p>
            <p className="text-xs text-brand-textMuted mt-1">Fetching real-time seat availability</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-brand-bg p-8 text-center">
        <p className="text-red-600 font-bold">Trip not found.</p>
        <Link to="/search" className="mt-4 inline-block text-brand-emerald font-semibold">
          Return to Search
        </Link>
      </div>
    );
  }

  const farePerSeat = trip.fare;
  const serviceFeePerSeat = trip.serviceFee || BRAND.platformFee;
  const fareTotal = farePerSeat * selectedSeatNumbers.length;
  const serviceFeeTotal = serviceFeePerSeat * selectedSeatNumbers.length;
  const grandTotal = fareTotal + serviceFeeTotal;
  const routePhoto = trip.route?.image || (trip.route?.destination as any)?.image;

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Page Header */}
      <div className="relative bg-[#031d12] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/50 overflow-hidden">
        {routePhoto && (
          <div className="absolute inset-0 z-0">
            <img
              src={routePhoto}
              alt="Corridor backdrop"
              className="w-full h-full object-cover opacity-20 filter blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#031d12] via-[#031d12]/90 to-[#031d12]/80" />
          </div>
        )}
        <div className="relative z-10 max-w-6xl mx-auto">
          <Link
            to={`/search?from=${trip.route?.origin?.code}&to=${trip.route?.destination?.code}&date=${travelDate}&passengers=${passengersCount}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Trip Results</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                <Bus className="w-3.5 h-3.5" />
                <span>{trip.operator?.name}</span>
                {trip.vehicle?.vehicleModel && (
                  <>
                    <span className="text-emerald-700">•</span>
                    <span>{trip.vehicle.vehicleModel}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {trip.route?.origin?.name}
                <span className="mx-2 text-emerald-400">→</span>
                {trip.route?.destination?.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200/70 mt-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {trip.departureDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {trip.departureTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {trip.pickupLocation}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {routePhoto && (
                <div className="hidden md:flex items-center gap-2.5 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                  <img
                    src={routePhoto}
                    alt="Corridor"
                    className="w-16 h-12 object-cover rounded-lg shrink-0"
                  />
                  <div className="pr-2 text-left">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Corridor</span>
                    <span className="text-xs font-black text-white">{trip.route?.distanceKm} km</span>
                  </div>
                </div>
              )}

              <div className="text-right hidden sm:block">
                <span className="text-xs text-emerald-300/70 font-semibold uppercase">Official Fare</span>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-3xl font-black">{trip.fare}</span>
                  <span className="text-sm font-bold text-emerald-300/70">{BRAND.currency}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold">Per Seat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Departed Alert Banner */}
        {isDeparted && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                <AlertCircle className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <span className="font-extrabold text-sm block text-amber-950">Journey Has Already Departed</span>
                <span className="text-xs text-amber-800 block mt-0.5">
                  This bus was scheduled to depart at {trip.departureTime} on {trip.departureDate}. Seat reservations are strictly closed.
                </span>
              </div>
            </div>
            <Link
              to={`/search?from=${trip.route?.origin?.code || 'ADD'}&to=${trip.route?.destination?.code || 'DBR'}&passengers=${passengersCount}`}
              className="px-4 py-2 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white font-extrabold text-xs shrink-0 transition-colors shadow-xs"
            >
              Find Next Scheduled Departure
            </Link>
          </div>
        )}

        {/* Reservation Timer */}
        {lockExpiresAt && !isDeparted && (
          <div className="mb-6">
            <SeatLockTimer expiresAt={lockExpiresAt} onExpire={handleTimerExpired} />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-card bg-red-50 border border-red-200 text-status-error text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Choose Your Seat heading */}
        <div className="mb-6">
          <h2 className="text-xl font-black text-brand-dark">Choose Your Seat</h2>
          <p className="text-sm text-brand-textMuted mt-1">
            {isDeparted
              ? 'This departure has passed. Seat selection is disabled.'
              : `Select ${passengersCount} seat${passengersCount > 1 ? 's' : ''}. Your selection is held for 10 minutes.`}
          </p>
        </div>

        {/* Two-column layout on desktop */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Seat Map + Legend */}
          <div className="flex-1 flex flex-col gap-6">
            <SeatLegend />
            <SeatMap
              seats={seats}
              selectedSeatNumbers={selectedSeatNumbers}
              onToggleSeat={handleToggleSeat}
              maxSelectable={passengersCount}
              isDeparted={isDeparted}
            />

            {/* Next Day Reservation Quick Banner */}
            {nextDateStr && trip.route?.origin?.code && trip.route?.destination?.code && (
              <div className="bg-white rounded-card p-4 border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-brand-emerald flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-textMain block">Planning for Next Day?</span>
                    <span className="text-[11px] text-brand-textMuted block">
                      Bus seat reservations remain secured across journeys on this fleet vehicle. Check next day departures ({nextDateStr}).
                    </span>
                  </div>
                </div>
                <Link
                  to={`/search?from=${trip.route.origin.code}&to=${trip.route.destination.code}&date=${nextDateStr}&passengers=${passengersCount}`}
                  className="px-3.5 py-2 rounded-btn bg-emerald-50 hover:bg-emerald-100 text-brand-emerald font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors border border-emerald-200"
                >
                  <span>Check Next Day ({nextDateStr})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar: Booking Summary (desktop only) */}
          <div className="hidden lg:flex flex-col gap-4 w-80 flex-shrink-0 sticky top-28">
            {/* Trip Summary Card */}
            <div className="bg-white rounded-cardLg border border-gray-100 shadow-card overflow-hidden">
              {/* Card header */}
              <div className="bg-gradient-to-r from-[#031d12] to-[#063B2A] p-5 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Your Trip</span>
                <p className="font-black text-base mt-1">
                  {trip.route?.origin?.name} → {trip.route?.destination?.name}
                </p>
                <p className="text-xs text-emerald-200/70 mt-0.5">
                  {trip.departureDate} · {trip.departureTime}
                </p>
              </div>

              {/* Seat selection status */}
              <div className="p-5 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">
                  Selected Seats
                </span>
                {selectedSeatNumbers.length === 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from({ length: passengersCount }).map((_, i) => (
                      <div
                        key={i}
                        className="w-11 h-11 rounded-btn border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-300 font-bold"
                      >
                        {i + 1}
                      </div>
                    ))}
                    <p className="w-full text-xs text-brand-textMuted mt-1">
                      Select {passengersCount} seat{passengersCount > 1 ? 's' : ''} from the map
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSeatNumbers.map((sn) => (
                      <div
                        key={sn}
                        className="px-3 py-1.5 bg-brand-emerald rounded-btn text-white text-xs font-black shadow-sm"
                      >
                        {sn}
                      </div>
                    ))}
                    {selectedSeatNumbers.length < passengersCount && (
                      <p className="w-full text-xs text-amber-600 font-semibold mt-1">
                        {passengersCount - selectedSeatNumbers.length} more seat{passengersCount - selectedSeatNumbers.length > 1 ? 's' : ''} needed
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Fare breakdown */}
              <div className="p-5 flex flex-col gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-1">Fare Summary</span>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-textMuted font-medium">
                    Fare ({selectedSeatNumbers.length || passengersCount}× seat)
                  </span>
                  <span className="font-bold text-brand-dark">
                    {fareTotal || (farePerSeat * passengersCount)} {BRAND.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-textMuted font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3 text-brand-emerald" />
                    Platform Fee
                  </span>
                  <span className="font-bold text-brand-dark">
                    {serviceFeeTotal || (serviceFeePerSeat * passengersCount)} {BRAND.currency}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-black text-brand-dark">Total</span>
                  <span className="text-xl font-black text-brand-emerald">
                    {grandTotal || ((farePerSeat + serviceFeePerSeat) * passengersCount)} {BRAND.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Proceed Button */}
            <button
              type="button"
              id="proceed-checkout-btn"
              disabled={selectedSeatNumbers.length !== passengersCount || locking || isDeparted}
              onClick={handleProceedToCheckout}
              className="w-full px-6 py-4 rounded-btn bg-brand-emerald hover:bg-brand-deep disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-brand-emerald/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isDeparted ? 'Journey Departed (Booking Closed)' : 'Continue to Checkout'}</span>
              {!isDeparted && <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>

            {selectedSeatNumbers.length !== passengersCount && !isDeparted && (
              <p className="text-center text-xs text-brand-textMuted">
                {selectedSeatNumbers.length} of {passengersCount} seat{passengersCount > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] px-4 py-3 sm:py-4 safe-area-pb">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-textMuted">Seats:</span>
                <span className="text-sm font-black text-brand-emerald">
                  {selectedSeatNumbers.length > 0 ? selectedSeatNumbers.join(', ') : `0 of ${passengersCount}`}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs text-brand-textMuted">Total:</span>
                <span className="text-base font-black text-brand-dark ml-1">
                  {grandTotal} {BRAND.currency}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="proceed-checkout-btn-mobile"
              disabled={selectedSeatNumbers.length !== passengersCount || locking || isDeparted}
              onClick={handleProceedToCheckout}
              className="px-6 py-3 rounded-btn bg-brand-emerald hover:bg-brand-deep disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <span>{isDeparted ? 'Departed' : 'Continue'}</span>
              {!isDeparted && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Extra bottom space for mobile sticky bar */}
        <div className="lg:hidden h-24" />
      </div>
    </div>
  );
};
