import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Bus, ShieldCheck, Sparkles, AlertCircle, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Modal } from '../components/Modal';
import { tripsApi } from '../api/endpoints';
import { Route, Operator, Vehicle } from '../types';
import { BRAND } from '../config/brand';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  routes: Route[];
  operators: Operator[];
  vehicles: Vehicle[];
}

const COMMON_AMENITIES = ['AC', 'Wi-Fi', 'Bottled Water', 'Reclining Seats', 'USB Charging', 'Luggage Storage'];

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  routes,
  operators,
  vehicles,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [routeId, setRouteId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [departureDate, setDepartureDate] = useState(defaultDate);
  const [departureTime, setDepartureTime] = useState('06:00 AM');
  const [estimatedArrival, setEstimatedArrival] = useState('11:30 AM');
  const [fare, setFare] = useState<number>(650);
  const [serviceFee, setServiceFee] = useState<number>(15);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropOffLocation, setDropOffLocation] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['AC', 'Bottled Water', 'Reclining Seats']);
  const [boardingNotes, setBoardingNotes] = useState('Arrive 30 minutes prior to departure with valid ID/Passport.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedRoute = routes.find((r) => r._id === routeId);

  // Initial populate when opening
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (routes.length > 0 && !routeId) {
        handleRouteChange(routes[0]._id);
      }
      if (operators.length > 0 && !operatorId) {
        handleOperatorChange(operators[0]._id);
      }
    }
  }, [isOpen, routes, operators]);

  // Handle route selection and auto-populate pickup/dropoff/arrival
  const handleRouteChange = (rId: string) => {
    setRouteId(rId);
    const selRoute = routes.find((r) => r._id === rId);
    if (selRoute) {
      if (selRoute.pickupPoints && selRoute.pickupPoints.length > 0) {
        setPickupLocation(selRoute.pickupPoints[0].name);
      } else {
        setPickupLocation(`${selRoute.origin?.name || 'Origin'} Central Terminal`);
      }

      if (selRoute.dropOffPoints && selRoute.dropOffPoints.length > 0) {
        setDropOffLocation(selRoute.dropOffPoints[0].name);
      } else {
        setDropOffLocation(`${selRoute.destination?.name || 'Destination'} Bus Station`);
      }

      // Auto compute approximate arrival
      computeEstimatedArrival(departureTime, selRoute.estimatedDurationHours || 5);
    }
  };

  // Handle operator change and filter vehicles
  const handleOperatorChange = (opId: string) => {
    setOperatorId(opId);
    const opVehicles = vehicles.filter((v) => {
      const vOpId = typeof v.operator === 'object' ? (v.operator as any)?._id : v.operator;
      return vOpId === opId;
    });

    const activeVehicle = opVehicles.find((v) => v.status === 'ACTIVE');
    if (activeVehicle) {
      setVehicleId(activeVehicle._id);
      if (activeVehicle.features && activeVehicle.features.length > 0) {
        setAmenities(activeVehicle.features);
      }
    } else if (opVehicles.length > 0) {
      setVehicleId(opVehicles[0]._id);
      if (opVehicles[0].features && opVehicles[0].features.length > 0) {
        setAmenities(opVehicles[0].features);
      }
    } else {
      setVehicleId('');
    }
  };

  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const selVehicle = vehicles.find((v) => v._id === vId);
    if (selVehicle && selVehicle.features && selVehicle.features.length > 0) {
      setAmenities(selVehicle.features);
    }
  };

  // Helper to approximate arrival time
  const computeEstimatedArrival = (depTimeStr: string, durationHours: number) => {
    try {
      const match = depTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const totalMinutes = hours * 60 + minutes + Math.round(durationHours * 60);
      const arrivalHour24 = Math.floor(totalMinutes / 60) % 24;
      const arrivalMin = totalMinutes % 60;

      const arrivalAmPm = arrivalHour24 >= 12 ? 'PM' : 'AM';
      let arrivalHour12 = arrivalHour24 % 12;
      if (arrivalHour12 === 0) arrivalHour12 = 12;

      const formattedMin = arrivalMin.toString().padStart(2, '0');
      setEstimatedArrival(`${arrivalHour12.toString().padStart(2, '0')}:${formattedMin} ${arrivalAmPm}`);
    } catch {
      // Fallback
    }
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!operatorId) return true;
    const vOpId = typeof v.operator === 'object' ? (v.operator as any)?._id : v.operator;
    return vOpId === operatorId;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!routeId) {
      setError('Please select an active Route.');
      return;
    }
    if (!operatorId) {
      setError('Please select a bus Operator.');
      return;
    }
    if (!vehicleId) {
      setError('Please select an assigned Vehicle for this trip.');
      return;
    }
    const selVehicle = vehicles.find((v) => v._id === vehicleId);
    if (!selVehicle || selVehicle.status !== 'ACTIVE') {
      setError(`The selected vehicle (${selVehicle?.plateNumber || 'Fleet Vehicle'}) is currently ${selVehicle?.status || 'INACTIVE'}. Only ACTIVE vehicles can be scheduled for trips.`);
      return;
    }
    if (!departureDate) {
      setError('Please select a valid Departure Date.');
      return;
    }
    if (!departureTime) {
      setError('Please specify Departure Time.');
      return;
    }
    if (!fare || fare < 50) {
      setError('Fare must be at least 50 ETB.');
      return;
    }

    setLoading(true);

    try {
      await tripsApi.create({
        route: routeId,
        operator: operatorId,
        vehicle: vehicleId,
        departureDate,
        departureTime,
        estimatedArrival,
        fare: Number(fare),
        serviceFee: Number(serviceFee),
        pickupLocation: pickupLocation.trim(),
        dropOffLocation: dropOffLocation.trim(),
        amenities,
        boardingNotes: boardingNotes.trim(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Intercity Trip & Dispatch"
      subtitle="Establish a new bookable departure, assign fleet bus, set official fare, and configure seat layout."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-btn bg-red-50 border border-red-200 text-status-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Route and Operator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Travel Corridor (Route) *
            </label>
            <select
              value={routeId}
              onChange={(e) => handleRouteChange(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              <option value="" disabled>-- Select Route Corridor --</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.origin?.name} ➔ {r.destination?.name} ({r.distanceKm} km • ~{r.estimatedDurationHours}h)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Transport Operator Company *
            </label>
            <select
              value={operatorId}
              onChange={(e) => handleOperatorChange(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              <option value="" disabled>-- Select Operator --</option>
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.name} ({op.legalName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Route Corridor & Photo Preview */}
        {selectedRoute && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 flex flex-col sm:flex-row items-center gap-3.5 shadow-2xs">
            <div className="relative w-full sm:w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-900 border border-emerald-200 shadow-2xs">
              {selectedRoute.image ? (
                <img
                  src={selectedRoute.image}
                  alt={`${selectedRoute.origin?.name} to ${selectedRoute.destination?.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#031d12] to-[#063B2A] text-emerald-300">
                  <ImageIcon className="w-6 h-6 opacity-60" />
                  <span className="text-[9px] font-bold mt-1">No Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-1 left-1 text-[9px] font-black text-white px-1.5 py-0.5 rounded bg-black/60 uppercase tracking-wider">
                {selectedRoute.origin?.code} ➔ {selectedRoute.destination?.code}
              </span>
            </div>

            <div className="flex-1 w-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-dark flex items-center gap-1.5">
                  <span>{selectedRoute.origin?.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>{selectedRoute.destination?.name}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-brand-emerald border border-emerald-200">
                  {selectedRoute.image ? 'Corridor Photo Active' : 'No Photo (Default used)'}
                </span>
              </div>
              <p className="text-[11px] text-brand-textMuted mt-1">
                {selectedRoute.distanceKm} km • ~{selectedRoute.estimatedDurationHours} hours estimated travel time.
                <span className="block text-[10px] text-emerald-800 font-medium mt-0.5">
                  ✨ This route photo will appear on the customer booking card and trip results.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 2. Vehicle Selection */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1">
            Assigned Vehicle / Coach *
          </label>
          <select
            value={vehicleId}
            onChange={(e) => handleVehicleChange(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
          >
            <option value="" disabled>
              {filteredVehicles.length === 0 ? '-- No vehicles available for this operator --' : '-- Select Fleet Vehicle --'}
            </option>
            {filteredVehicles.map((v) => {
              const isActive = v.status === 'ACTIVE';
              return (
                <option key={v._id} value={v._id} disabled={!isActive}>
                  {v.plateNumber} • {v.vehicleModel} ({v.seatCapacity} Seats) - {isActive ? '🟢 Active & Ready' : `🔴 ${v.status} (Unavailable)`}
                </option>
              );
            })}
          </select>
          {filteredVehicles.length === 0 && (
            <p className="text-[11px] text-amber-600 mt-1">
              Tip: Ensure the selected operator has active vehicles registered in the fleet database.
            </p>
          )}
        </div>

        {/* 3. Schedule: Date, Time & Estimated Arrival */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Departure Date *
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Departure Time *
            </label>
            <input
              type="text"
              placeholder="e.g. 06:00 AM"
              value={departureTime}
              onChange={(e) => {
                setDepartureTime(e.target.value);
                const selRoute = routes.find((r) => r._id === routeId);
                if (selRoute) computeEstimatedArrival(e.target.value, selRoute.estimatedDurationHours || 5);
              }}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Estimated Arrival *
            </label>
            <input
              type="text"
              placeholder="e.g. 11:30 AM"
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium font-mono"
            />
          </div>
        </div>

        {/* Quick time helpers */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-brand-textMuted">Quick Times:</span>
          {['05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '01:00 PM', '08:00 PM'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setDepartureTime(t);
                const selRoute = routes.find((r) => r._id === routeId);
                if (selRoute) computeEstimatedArrival(t, selRoute.estimatedDurationHours || 5);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                departureTime === t
                  ? 'bg-brand-emerald text-white border-brand-emerald'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 4. Fare & Service Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Base Passenger Fare ({BRAND.currency}) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={50}
                step={5}
                value={fare}
                onChange={(e) => setFare(Number(e.target.value))}
                required
                className="w-full px-3 py-2 pl-8 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-bold"
              />
              <span className="absolute left-2.5 top-2.5 text-xs font-bold text-gray-400">Br</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Platform Service Fee ({BRAND.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={serviceFee}
                onChange={(e) => setServiceFee(Number(e.target.value))}
                className="w-full px-3 py-2 pl-8 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-bold"
              />
              <span className="absolute left-2.5 top-2.5 text-xs font-bold text-gray-400">Br</span>
            </div>
          </div>
        </div>

        {/* 5. Pickup & Drop-off Stations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Origin Terminal / Pickup Point *
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald absolute left-3 top-3" />
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Addis Ababa Autobis Tera / Meskel Square"
                required
                className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Destination Terminal / Drop-off Point *
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-3" />
              <input
                type="text"
                value={dropOffLocation}
                onChange={(e) => setDropOffLocation(e.target.value)}
                placeholder="e.g. Bahir Dar Central Bus Station"
                required
                className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
              />
            </div>
          </div>
        </div>

        {/* 6. Onboard Amenities */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1.5">
            Included Passenger Amenities
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map((item) => {
              const active = amenities.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAmenity(item)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-emerald-50 border-emerald-300 text-brand-emerald'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Boarding Instructions */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1">
            Boarding Notes & Passenger Instructions
          </label>
          <input
            type="text"
            value={boardingNotes}
            onChange={(e) => setBoardingNotes(e.target.value)}
            placeholder="e.g. Please arrive 30 minutes before departure with Ethiopian National ID or passport."
            className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-btn text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !vehicleId}
            className="px-5 py-2 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {loading ? (
              <span>Scheduling Trip & Layout...</span>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5" />
                <span>Confirm & Dispatch Schedule</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
