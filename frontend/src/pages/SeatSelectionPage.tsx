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

  const handleToggleSeat = async (seatNumber: string) => {
    if (!tripId) return;

    setError(null);
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

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Page Header */}
      <div className="bg-[#031d12] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/50">
        <div className="max-w-6xl mx-auto">
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reservation Timer */}
        {lockExpiresAt && (
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
            Select {passengersCount} seat{passengersCount > 1 ? 's' : ''}. Your selection is held for 10 minutes.
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
            />
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
              disabled={selectedSeatNumbers.length !== passengersCount || locking}
              onClick={handleProceedToCheckout}
              className="w-full px-6 py-4 rounded-btn bg-brand-emerald hover:bg-brand-deep disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-brand-emerald/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Continue to Checkout</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {selectedSeatNumbers.length !== passengersCount && (
              <p className="text-center text-xs text-brand-textMuted">
                {selectedSeatNumbers.length} of {passengersCount} seat{passengersCount > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 safe-area-pb">
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
              disabled={selectedSeatNumbers.length !== passengersCount || locking}
              onClick={handleProceedToCheckout}
              className="px-6 py-3 rounded-btn bg-brand-emerald hover:bg-brand-deep disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Extra bottom space for mobile sticky bar */}
        <div className="lg:hidden h-24" />
      </div>
    </div>
  );
};
