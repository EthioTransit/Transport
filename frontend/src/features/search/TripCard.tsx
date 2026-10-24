import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ShieldCheck, ArrowRight, Armchair, ChevronRight } from 'lucide-react';
import { Trip } from '../../types';
import { BRAND } from '../../config/brand';
import { hasTripDeparted } from '../../utils/time.utils';

interface TripCardProps {
  trip: Trip;
  travelDate: string;
  passengersCount: number;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, travelDate, passengersCount }) => {
  const originCity = trip.route?.origin?.name || 'Origin';
  const destCity = trip.route?.destination?.name || 'Destination';
  const operatorName = trip.operator?.name || 'Licensed Operator';
  const vehicleName = trip.vehicle?.vehicleModel || trip.vehicle?.vehicleType || 'Intercity Coach';
  const durationHours = trip.route?.estimatedDurationHours || 3;

  const isDeparted = hasTripDeparted(trip.departureDate || travelDate, trip.departureTime);
  const seatsAvailable = trip.availableSeatsCount;
  const seatsLow = seatsAvailable > 0 && seatsAvailable <= 5;
  const routeImage = trip.route?.image || (trip.route?.destination as any)?.image || '/dest-bahirdar.jpg';

  return (
    <div className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardHover hover:border-emerald-200 transition-all duration-200 overflow-hidden group">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-brand-emerald to-brand-deep group-hover:from-brand-deep group-hover:to-brand-emerald transition-all duration-500" />

      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
        {/* Route Corridor Photo Thumbnail */}
        <div className="relative w-full md:w-36 h-28 md:h-32 rounded-xl overflow-hidden shrink-0 bg-gray-900 border border-gray-100 shadow-2xs group-hover:shadow-md transition-shadow">
          <img
            src={routeImage}
            alt={`${originCity} to ${destCity}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white">
              {trip.route?.distanceKm ? `${trip.route.distanceKm} km` : 'Direct'}
            </span>
          </div>
          <div className="absolute bottom-1.5 left-2 right-2 z-10 flex items-center justify-between text-white text-[10px] font-bold">
            <span className="truncate text-emerald-300 uppercase tracking-wider font-black">
              {trip.route?.origin?.code || originCity.slice(0, 3)} ➔ {trip.route?.destination?.code || destCity.slice(0, 3)}
            </span>
          </div>
        </div>

        {/* Left Details */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Operator & Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-brand-emerald border border-emerald-100">
              {operatorName}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-brand-textMuted">
              {vehicleName}
            </span>
            {trip.vehicle?.plateNumber && (
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                {trip.vehicle.plateNumber}
              </span>
            )}
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 ml-auto sm:ml-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          </div>

          {/* Route Timeline */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6">
            {/* Departure */}
            <div className="flex flex-col min-w-0">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark tabular-nums leading-none">
                {trip.departureTime}
              </span>
              <span className="text-xs sm:text-sm font-bold text-brand-textMain mt-0.5 truncate">{originCity}</span>
              {trip.pickupLocation && (
                <span className="text-[11px] sm:text-xs text-brand-textMuted truncate max-w-[100px] sm:max-w-[160px]">
                  {trip.pickupLocation}
                </span>
              )}
            </div>

            {/* Middle: duration + route line */}
            <div className="flex-1 min-w-[50px] max-w-[120px] sm:max-w-[180px] flex flex-col items-center">
              <span className="text-[10px] sm:text-[11px] font-semibold text-brand-textLight flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-emerald" />
                <span>{durationHours}h est.</span>
              </span>
              <div className="w-full flex items-center my-1.5 gap-1">
                <div className="w-2 h-2 rounded-full border-2 border-brand-emerald bg-white flex-shrink-0" />
                <div className="flex-1 h-0.5 bg-gradient-to-r from-brand-emerald via-brand-emerald/60 to-brand-gold" />
                <div className="w-2 h-2 rounded-full bg-brand-gold flex-shrink-0" />
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Direct
              </span>
            </div>

            {/* Arrival */}
            <div className="flex flex-col min-w-0 text-right sm:text-left">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark tabular-nums leading-none">
                {trip.estimatedArrival || '—'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-brand-textMain mt-0.5 truncate">{destCity}</span>
              {trip.dropOffLocation && (
                <span className="text-[11px] sm:text-xs text-brand-textMuted truncate max-w-[100px] sm:max-w-[160px]">
                  {trip.dropOffLocation}
                </span>
              )}
            </div>
          </div>

          {/* Amenities & Seat count */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            {/* Seats remaining */}
            {isDeparted ? (
              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Departed (Booking Closed)
              </span>
            ) : (
              <span
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                  seatsLow
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : seatsAvailable === 0
                    ? 'bg-gray-100 text-gray-500 border border-gray-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}
              >
                <Armchair className="w-3.5 h-3.5" />
                {seatsAvailable === 0
                  ? 'Sold out'
                  : seatsLow
                  ? `${seatsAvailable} seats left`
                  : `${seatsAvailable} seats available`}
              </span>
            )}

            {/* Amenities */}
            {trip.amenities?.slice(0, 3).map((am, i) => (
              <span key={i} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100 font-medium">
                {am}
              </span>
            ))}
            {trip.amenities && trip.amenities.length > 3 && (
              <span className="text-xs text-brand-textLight font-medium">
                +{trip.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Right: Price & CTA */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 gap-3 sm:gap-4 flex-shrink-0">
          <div className="text-left md:text-right">
            <div className="text-[10px] sm:text-[11px] font-bold text-brand-emerald uppercase tracking-wide">Official Fare</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tabular-nums">
                {trip.fare.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-bold text-brand-textMuted">{BRAND.currency}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-brand-textLight">per passenger</span>
          </div>

          {isDeparted ? (
            <div
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-btn bg-slate-100 text-slate-500 font-extrabold text-xs sm:text-sm text-center flex-shrink-0 cursor-not-allowed border border-slate-200 flex items-center gap-1.5 select-none"
              title="This journey has already departed. Seat reservations are closed."
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Departed</span>
            </div>
          ) : trip.availableSeatsCount > 0 ? (
            <Link
              to={`/trips/${trip._id}/seats?date=${travelDate}&passengers=${passengersCount}`}
              id={`select-seat-btn-${trip._id}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white font-extrabold text-xs sm:text-sm shadow-md shadow-brand-emerald/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-center flex-shrink-0 group"
            >
              <span>Select Seat</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <div className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-btn bg-gray-100 text-gray-400 font-extrabold text-xs sm:text-sm text-center flex-shrink-0 cursor-not-allowed">
              Sold Out
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
