import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Bus, ShieldCheck, Sparkles, AlertCircle, Image as ImageIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
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

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const COMMON_DEPARTURE_PRESETS = [
  '05:30 AM',
  '06:00 AM',
  '07:30 AM',
  '08:30 AM',
  '11:30 AM',
  '01:30 PM',
  '03:00 PM',
  '05:00 PM',
];

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

  const [scheduleMode, setScheduleMode] = useState<'SINGLE' | 'RECURRING'>('SINGLE');
  const [routeId, setRouteId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [departureDate, setDepartureDate] = useState(defaultDate);
  const [departureTime, setDepartureTime] = useState('06:00 AM');
  const [estimatedArrival, setEstimatedArrival] = useState('11:30 AM');

  // Recurring & Multi-time schedule state
  const [recurringDays, setRecurringDays] = useState<string[]>(ALL_DAYS);
  const [repeatWeeks, setRepeatWeeks] = useState<number>(2);
  const [batchDepartureTimes, setBatchDepartureTimes] = useState<string[]>(['06:00 AM', '08:30 AM']);
  const [customTimeInput, setCustomTimeInput] = useState('');

  const [fare, setFare] = useState<number>(650);
  const [serviceFee, setServiceFee] = useState<number>(15);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropOffLocation, setDropOffLocation] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['AC', 'Bottled Water', 'Reclining Seats']);
  const [boardingNotes, setBoardingNotes] = useState('Arrive 30 minutes prior to departure with valid ID/Passport.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedRoute = routes.find((r) => r._id === routeId);

  // Helper to extract operator ID from vehicle
  const getVehicleOpId = (v: Vehicle): string => {
    if (!v.operator) return '';
    return typeof v.operator === 'object' ? String((v.operator as any)?._id || '') : String(v.operator);
  };

  // Filter vehicles for currently chosen operator
  const filteredVehicles = vehicles.filter((v) => {
    if (!operatorId) return true;
    return getVehicleOpId(v) === String(operatorId);
  });

  const activeVehiclesForCurrentOp = filteredVehicles.filter((v) => v.status === 'ACTIVE');

  // Handle route selection and auto-populate pickup/dropoff/arrival/schedule
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

      if (selRoute.baseFare && selRoute.baseFare > 0) {
        setFare(selRoute.baseFare);
      }

      if (selRoute.operatingDays && selRoute.operatingDays.length > 0) {
        setRecurringDays(selRoute.operatingDays);
      }

      if (selRoute.departureTimes && selRoute.departureTimes.length > 0) {
        setBatchDepartureTimes(selRoute.departureTimes);
        setDepartureTime(selRoute.departureTimes[0]);
      }

      computeEstimatedArrival(departureTime, selRoute.estimatedDurationHours || 5);
    }
  };

  // Handle operator change and filter vehicles
  const handleOperatorChange = (opId: string) => {
    setOperatorId(opId);
    const opVehicles = vehicles.filter((v) => getVehicleOpId(v) === String(opId));
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

  // Auto-initialize when modal opens or routes/operators/vehicles arrive
  useEffect(() => {
    if (!isOpen) return;
    setError('');

    // 1. Route initialization
    if (routes.length > 0 && (!routeId || !routes.some((r) => r._id === routeId))) {
      handleRouteChange(routes[0]._id);
    }

    // 2. Operator initialization: favor an operator that has active vehicles
    let effectiveOpId = operatorId;
    if (!effectiveOpId || !operators.some((o) => o._id === effectiveOpId)) {
      const opWithActiveFleet = operators.find((op) =>
        vehicles.some((v) => getVehicleOpId(v) === String(op._id) && v.status === 'ACTIVE')
      ) || operators[0];

      if (opWithActiveFleet) {
        effectiveOpId = opWithActiveFleet._id;
        setOperatorId(effectiveOpId);
      }
    }

    // 3. Vehicle initialization: auto-select active vehicle
    if (effectiveOpId) {
      const opVehicles = vehicles.filter((v) => getVehicleOpId(v) === String(effectiveOpId));
      const hasValidVehicle = opVehicles.some((v) => v._id === vehicleId);

      if (!hasValidVehicle) {
        const activeVeh = opVehicles.find((v) => v.status === 'ACTIVE') || opVehicles[0];
        if (activeVeh) {
          setVehicleId(activeVeh._id);
          if (activeVeh.features && activeVeh.features.length > 0) {
            setAmenities(activeVeh.features);
          }
        } else {
          setVehicleId('');
        }
      }
    }
  }, [isOpen, routes, operators, vehicles]);

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

  // Recurring days toggles
  const toggleRecurringDay = (day: string) => {
    if (recurringDays.includes(day)) {
      if (recurringDays.length === 1) return;
      setRecurringDays(recurringDays.filter((d) => d !== day));
    } else {
      setRecurringDays([...recurringDays, day]);
    }
  };

  const setDaysPreset = (preset: 'daily' | 'weekdays' | 'weekends') => {
    if (preset === 'daily') setRecurringDays(ALL_DAYS);
    if (preset === 'weekdays') setRecurringDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    if (preset === 'weekends') setRecurringDays(['Saturday', 'Sunday']);
  };

  const addBatchTime = (time: string) => {
    const trimmed = time.trim();
    if (!trimmed) return;
    if (!batchDepartureTimes.includes(trimmed)) {
      setBatchDepartureTimes([...batchDepartureTimes, trimmed]);
    }
    setCustomTimeInput('');
  };

  const removeBatchTime = (time: string) => {
    if (batchDepartureTimes.length === 1) return;
    setBatchDepartureTimes(batchDepartureTimes.filter((t) => t !== time));
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!routeId) {
      setError('Please select an active travel corridor (Route).');
      return;
    }
    if (!operatorId) {
      setError('Please select a registered transport operator company.');
      return;
    }
    if (!vehicleId) {
      setError('Please select an assigned vehicle from the fleet to dispatch this trip.');
      return;
    }

    const selVehicle = vehicles.find((v) => v._id === vehicleId);
    if (!selVehicle) {
      setError('The selected vehicle could not be found in the fleet database.');
      return;
    }
    if (selVehicle.status !== 'ACTIVE') {
      setError(`The selected vehicle (${selVehicle.plateNumber}) is currently ${selVehicle.status}. Only ACTIVE fleet vehicles can be dispatched.`);
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
      const payload: any = {
        route: routeId,
        operator: operatorId,
        vehicle: vehicleId,
        departureDate,
        departureTime,
        estimatedArrival,
        fare: Number(fare),
        serviceFee: Number(serviceFee || 15),
        pickupLocation: pickupLocation.trim(),
        dropOffLocation: dropOffLocation.trim(),
        amenities,
        boardingNotes: boardingNotes.trim(),
      };

      if (scheduleMode === 'RECURRING') {
        payload.departureDate = departureDate; // Base start date
        payload.recurringDays = recurringDays;
        payload.repeatWeeks = Number(repeatWeeks);
        payload.departureTime = batchDepartureTimes[0];
        payload.departureTimes = batchDepartureTimes;
        payload.estimatedArrival = estimatedArrival || '~3 hrs travel';
      } else {
        payload.departureDate = departureDate;
        payload.departureTime = departureTime;
        payload.estimatedArrival = estimatedArrival;
      }

      await tripsApi.create(payload);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Trip dispatch failed:', err);
      setError(err.message || 'Failed to dispatch and schedule trip.');
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
          <div className="p-3.5 rounded-btn bg-red-50 border border-red-200 text-status-error text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
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
              {operators.map((op) => {
                const opActiveBuses = vehicles.filter((v) => getVehicleOpId(v) === String(op._id) && v.status === 'ACTIVE').length;
                return (
                  <option key={op._id} value={op._id}>
                    {op.name} ({opActiveBuses} {opActiveBuses === 1 ? 'bus ready' : 'buses ready'})
                  </option>
                );
              })}
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
                  {selectedRoute.image ? 'Corridor Photo Active' : 'Default Cover'}
                </span>
              </div>
              <p className="text-[11px] text-brand-textMuted mt-1">
                {selectedRoute.distanceKm} km • ~{selectedRoute.estimatedDurationHours} hours estimated travel duration.
                <span className="block text-[10px] text-emerald-800 font-medium mt-0.5">
                  ✨ Dispatched trip will appear instantly on both the Admin Schedule and Customer Search Portal.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 2. Vehicle Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-brand-dark">
              Assigned Vehicle / Coach *
            </label>
            {activeVehiclesForCurrentOp.length > 0 && (
              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{activeVehiclesForCurrentOp.length} active vehicle(s) ready</span>
              </span>
            )}
          </div>

          <select
            value={vehicleId}
            onChange={(e) => handleVehicleChange(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
          >
            <option value="" disabled>
              {filteredVehicles.length === 0 ? '-- No vehicles found for this operator --' : '-- Select Fleet Vehicle --'}
            </option>
            {filteredVehicles.map((v) => {
              const isActive = v.status === 'ACTIVE';
              return (
                <option key={v._id} value={v._id} disabled={!isActive}>
                  {v.plateNumber} • {v.vehicleModel || (v as any).model || 'Standard Coach'} ({v.seatCapacity} Seats) - {isActive ? '🟢 Active & Ready' : `🔴 ${v.status} (Unavailable)`}
                </option>
              );
            })}
          </select>

          {filteredVehicles.length === 0 && (
            <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                No vehicles are registered for this operator yet. Select another operator above, or register a bus in <strong>Fleet Vehicles</strong>.
              </span>
            </div>
          )}
          {filteredVehicles.length > 0 && activeVehiclesForCurrentOp.length === 0 && (
            <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                All buses for this operator are currently INACTIVE or under MAINTENANCE. Please activate a bus in Fleet Management to dispatch.
              </span>
            </div>
          )}
        </div>

        {/* 3. Schedule Mode & Departure Details */}
        <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
            <div>
              <span className="text-xs font-black text-brand-dark flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Trip Dispatch & Schedule Configuration *</span>
              </span>
              <p className="text-[11px] text-brand-textMuted">
                Schedule a one-time trip or establish automated departures on specific operating days.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setScheduleMode('SINGLE')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${scheduleMode === 'SINGLE'
                    ? 'bg-brand-emerald text-white shadow-xs'
                    : 'text-gray-600 hover:text-brand-dark'
                  }`}
              >
                Single Date
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode('RECURRING')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${scheduleMode === 'RECURRING'
                    ? 'bg-brand-emerald text-white shadow-xs'
                    : 'text-gray-600 hover:text-brand-dark'
                  }`}
              >
                Weekly Recurring
              </button>
            </div>
          </div>

          {scheduleMode === 'RECURRING' ? (
            /* RECURRING SCHEDULE CONTROLS */
            <div className="space-y-3 pt-1">
              {/* Day selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-brand-dark">
                    Select Operating Days ({recurringDays.length} selected) *
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDaysPreset('daily')}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-white hover:bg-emerald-50 text-brand-emerald border border-emerald-200"
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysPreset('weekdays')}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-white hover:bg-emerald-50 text-brand-emerald border border-emerald-200"
                    >
                      Weekdays
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysPreset('weekends')}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-white hover:bg-emerald-50 text-brand-emerald border border-emerald-200"
                    >
                      Weekends
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const active = recurringDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleRecurringDay(day)}
                        className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center border ${active
                            ? 'bg-brand-emerald text-white border-brand-emerald shadow-xs'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300'
                          }`}
                      >
                        <span className="text-[10px] uppercase">{DAY_SHORT[day]}</span>
                        <span className="text-[9px] opacity-75">{active ? '✓' : '—'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Date & Repeat Weeks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    Schedule Starting Date *
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    Repeat For Duration *
                  </label>
                  <select
                    value={repeatWeeks}
                    onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-semibold bg-white"
                  >
                    <option value={1}>1 Week (Next 7 days)</option>
                    <option value={2}>2 Weeks (Next 14 days)</option>
                    <option value={4}>4 Weeks (Next 28 days)</option>
                  </select>
                </div>
              </div>

              {/* Batch Departure Times */}
              <div className="pt-2 border-t border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>Daily Departure Times ({batchDepartureTimes.length}) *</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Add all daily departure slots</span>
                </div>

                {/* Selected times chips */}
                <div className="flex flex-wrap gap-1.5">
                  {batchDepartureTimes.map((time) => (
                    <span
                      key={time}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-brand-dark font-extrabold text-xs border border-gray-200 shadow-2xs"
                    >
                      <Clock className="w-3 h-3 text-brand-emerald" />
                      <span>{time}</span>
                      <button
                        type="button"
                        onClick={() => removeBatchTime(time)}
                        className="text-gray-400 hover:text-red-500 font-bold ml-0.5"
                        title="Remove time"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Presets & Custom Time */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    <span className="text-gray-400 font-bold">Quick Presets:</span>
                    {COMMON_DEPARTURE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addBatchTime(preset)}
                        disabled={batchDepartureTimes.includes(preset)}
                        className={`px-2 py-0.5 rounded border transition-colors ${batchDepartureTimes.includes(preset)
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white hover:bg-emerald-50 text-brand-emerald border-emerald-200 font-semibold'
                          }`}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="text"
                      placeholder="e.g. 09:30 AM or 04:15 PM"
                      value={customTimeInput}
                      onChange={(e) => setCustomTimeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addBatchTime(customTimeInput);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald"
                    />
                    <button
                      type="button"
                      onClick={() => addBatchTime(customTimeInput)}
                      className="px-3 py-1.5 rounded-btn bg-brand-emerald text-white text-xs font-bold hover:bg-brand-deep transition-colors"
                    >
                      Add Time
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SINGLE TRIP SCHEDULE CONTROLS */
            <div className="space-y-3 pt-1">
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
                    className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium bg-white"
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
                    className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium font-mono bg-white"
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
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
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
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${departureTime === t
                        ? 'bg-brand-emerald text-white border-brand-emerald'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
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
              Origin Terminal / Pickup Point
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald absolute left-3 top-3" />
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Autobis Tera / Lam Beret"
                className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Destination Terminal / Drop-off Point
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-3" />
              <input
                type="text"
                value={dropOffLocation}
                onChange={(e) => setDropOffLocation(e.target.value)}
                placeholder="e.g. Central Bus Station"
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${active
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
            placeholder="e.g. Please arrive 30 minutes before departure with valid ID."
            className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-btn text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Scheduling Trip & Layout...</span>
              </span>
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
