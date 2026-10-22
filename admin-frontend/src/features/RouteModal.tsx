import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Plus, Trash2, Calendar, Clock, DollarSign, Bus, Check, Sparkles } from 'lucide-react';
import { Modal } from '../components/Modal';
import { routesApi, operatorsApi } from '../api/endpoints';
import { City, Route, Operator } from '../types';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cities: City[];
  operators?: Operator[];
  routeToEdit?: Route | null;
}

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

const COMMON_TIME_PRESETS = [
  '05:30 AM',
  '06:00 AM',
  '07:30 AM',
  '08:30 AM',
  '11:30 AM',
  '01:30 PM',
  '03:00 PM',
  '05:00 PM',
];

export const RouteModal: React.FC<RouteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cities,
  operators: initialOperators = [],
  routeToEdit,
}) => {
  const [originId, setOriginId] = useState(cities[0]?._id || '');
  const [destId, setDestId] = useState(cities[1]?._id || '');
  const [distanceKm, setDistanceKm] = useState<number>(200);
  const [estimatedDurationHours, setEstimatedDurationHours] = useState<number>(3.5);
  const [popularityScore, setPopularityScore] = useState<number>(85);
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropoffPoint, setDropoffPoint] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Schedule & Fare State
  const [operatingDays, setOperatingDays] = useState<string[]>(ALL_DAYS);
  const [departureTimes, setDepartureTimes] = useState<string[]>(['06:00 AM', '08:30 AM', '01:30 PM']);
  const [customTime, setCustomTime] = useState('');
  const [baseFare, setBaseFare] = useState<number>(440);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [autoScheduleTrips, setAutoScheduleTrips] = useState<boolean>(true);

  const [operators, setOperators] = useState<Operator[]>(initialOperators);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch operators if not supplied
  useEffect(() => {
    if (initialOperators.length > 0) {
      setOperators(initialOperators);
    } else if (isOpen) {
      operatorsApi.getAll()
        .then((ops) => setOperators(ops || []))
        .catch(() => setOperators([]));
    }
  }, [initialOperators, isOpen]);

  // Update base fare automatically when distance changes (if user hasn't overridden dramatically)
  useEffect(() => {
    if (!routeToEdit) {
      const calculated = Math.max(120, Math.round(distanceKm * 2.2));
      setBaseFare(calculated);
    }
  }, [distanceKm, routeToEdit]);

  useEffect(() => {
    if (routeToEdit) {
      setOriginId(routeToEdit.origin?._id || cities[0]?._id || '');
      setDestId(routeToEdit.destination?._id || cities[1]?._id || '');
      setDistanceKm(routeToEdit.distanceKm || 200);
      setEstimatedDurationHours(routeToEdit.estimatedDurationHours || 3.5);
      setPopularityScore(routeToEdit.popularityScore || 85);
      setPickupPoint(routeToEdit.pickupPoints?.[0]?.name || '');
      setDropoffPoint(routeToEdit.dropOffPoints?.[0]?.name || '');
      setStatus(routeToEdit.status || 'ACTIVE');

      setOperatingDays(
        routeToEdit.operatingDays && routeToEdit.operatingDays.length > 0
          ? routeToEdit.operatingDays
          : ALL_DAYS
      );
      setDepartureTimes(
        routeToEdit.departureTimes && routeToEdit.departureTimes.length > 0
          ? routeToEdit.departureTimes
          : ['06:00 AM', '08:30 AM', '01:30 PM']
      );
      setBaseFare(
        routeToEdit.baseFare && routeToEdit.baseFare > 0
          ? routeToEdit.baseFare
          : Math.max(120, Math.round((routeToEdit.distanceKm || 200) * 2.2))
      );
      setSelectedOperatorId(
        typeof routeToEdit.operator === 'object' && routeToEdit.operator?._id
          ? routeToEdit.operator._id
          : typeof routeToEdit.operator === 'string'
          ? routeToEdit.operator
          : ''
      );
      setAutoScheduleTrips(true);
    } else {
      setOriginId(cities[0]?._id || '');
      setDestId(cities[1]?._id || '');
      setDistanceKm(200);
      setEstimatedDurationHours(3.5);
      setPopularityScore(85);
      setPickupPoint('');
      setDropoffPoint('');
      setStatus('ACTIVE');
      setOperatingDays(ALL_DAYS);
      setDepartureTimes(['06:00 AM', '08:30 AM', '01:30 PM']);
      setBaseFare(440);
      setSelectedOperatorId('');
      setAutoScheduleTrips(true);
    }
    setError('');
  }, [routeToEdit, isOpen, cities]);

  // Operating days handlers
  const toggleDay = (day: string) => {
    if (operatingDays.includes(day)) {
      if (operatingDays.length === 1) return; // keep at least 1 day
      setOperatingDays(operatingDays.filter((d) => d !== day));
    } else {
      setOperatingDays([...operatingDays, day]);
    }
  };

  const setDaysPreset = (preset: 'daily' | 'weekdays' | 'weekends') => {
    if (preset === 'daily') setOperatingDays(ALL_DAYS);
    if (preset === 'weekdays') setOperatingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    if (preset === 'weekends') setOperatingDays(['Saturday', 'Sunday']);
  };

  // Departure times handlers
  const addDepartureTime = (time: string) => {
    const trimmed = time.trim();
    if (!trimmed) return;
    if (!departureTimes.includes(trimmed)) {
      setDepartureTimes([...departureTimes, trimmed]);
    }
    setCustomTime('');
  };

  const removeDepartureTime = (time: string) => {
    if (departureTimes.length === 1) return; // keep at least 1 departure
    setDepartureTimes(departureTimes.filter((t) => t !== time));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originId || !destId) {
      setError('Please select both Origin and Destination cities.');
      return;
    }
    if (originId === destId) {
      setError('Origin and Destination cities must be different.');
      return;
    }
    if (operatingDays.length === 0) {
      setError('Please select at least one operating day for this route.');
      return;
    }
    if (departureTimes.length === 0) {
      setError('Please configure at least one departure time.');
      return;
    }

    setLoading(true);
    setError('');

    const originCity = cities.find((c) => c._id === originId);
    const destCity = cities.find((c) => c._id === destId);

    try {
      const payload: any = {
        origin: originId,
        destination: destId,
        distanceKm: Number(distanceKm),
        estimatedDurationHours: Number(estimatedDurationHours),
        popularityScore: Number(popularityScore),
        pickupPoints: [
          {
            name: pickupPoint.trim() || originCity?.terminalName || `${originCity?.name} Main Station`,
            timeOffsetMinutes: 0,
          },
        ],
        dropOffPoints: [
          {
            name: dropoffPoint.trim() || destCity?.terminalName || `${destCity?.name} Terminal`,
          },
        ],
        status,
        operatingDays,
        departureTimes,
        baseFare: Number(baseFare),
        operator: selectedOperatorId || undefined,
        autoScheduleTrips,
      };

      if (routeToEdit) {
        await routesApi.update(routeToEdit._id, payload);
      } else {
        await routesApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || (routeToEdit ? 'Failed to update route.' : 'Failed to create route.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        routeToEdit
          ? `Edit Route • ${routeToEdit.origin?.name} → ${routeToEdit.destination?.name}`
          : 'Create Intercity Bus Route & Schedule'
      }
      subtitle={
        routeToEdit
          ? 'Update distance, duration, terminals, weekly schedule, and departures.'
          : 'Establish a new travel corridor with operating days, departure times, and fares.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 rounded-btn bg-red-50 border border-red-200 text-status-error text-xs">
            {error}
          </div>
        )}

        {/* Cities Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Origin City *
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              {cities.map((c) => (
                <option key={c._id} value={c._id} disabled={c._id === destId}>
                  {c.name} ({c.code}) - {c.region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Destination City *
            </label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              {cities.map((c) => (
                <option key={c._id} value={c._id} disabled={c._id === originId}>
                  {c.name} ({c.code}) - {c.region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Distance, Duration, Popularity */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Distance (km) *
            </label>
            <input
              type="number"
              min={1}
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Duration (Hours) *
            </label>
            <input
              type="number"
              step="0.5"
              min={0.5}
              value={estimatedDurationHours}
              onChange={(e) => setEstimatedDurationHours(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Popularity (0-100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={popularityScore}
              onChange={(e) => setPopularityScore(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>
        </div>

        {/* Terminals */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Origin Pickup Terminal
            </label>
            <input
              type="text"
              placeholder="e.g. Autobus Tera / Lam Beret"
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Destination Drop-off Terminal
            </label>
            <input
              type="text"
              placeholder="e.g. Bahir Dar Bus Station"
              value={dropoffPoint}
              onChange={(e) => setDropoffPoint(e.target.value)}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
            />
          </div>
        </div>

        {/* SCHEDULE SECTION (Operating Days & Departure Times) */}
        <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-brand-dark flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Operating Schedule & Days *</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDaysPreset('daily')}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white hover:bg-emerald-100 text-brand-emerald border border-emerald-200 transition-colors"
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setDaysPreset('weekdays')}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white hover:bg-emerald-100 text-brand-emerald border border-emerald-200 transition-colors"
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => setDaysPreset('weekends')}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white hover:bg-emerald-100 text-brand-emerald border border-emerald-200 transition-colors"
              >
                Weekends
              </button>
            </div>
          </div>

          {/* Day chips */}
          <div className="grid grid-cols-7 gap-1.5">
            {ALL_DAYS.map((day) => {
              const active = operatingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center justify-center border ${
                    active
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

          <div className="text-[11px] text-brand-textMuted flex items-center gap-1">
            <span>Runs:</span>
            <strong className="text-brand-dark font-bold">
              {operatingDays.length === 7
                ? 'Every day (Monday through Sunday)'
                : operatingDays.join(', ')}
            </strong>
          </div>
        </div>

        {/* DEPARTURE TIMES SECTION */}
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-brand-dark flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Daily Departure Times ({departureTimes.length}) *</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold">
              Select or type times
            </span>
          </div>

          {/* Current selected times */}
          <div className="flex flex-wrap gap-2">
            {departureTimes.map((time) => (
              <span
                key={time}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-brand-dark font-extrabold text-xs border border-gray-200 shadow-xs"
              >
                <Clock className="w-3 h-3 text-brand-emerald" />
                <span>{time}</span>
                <button
                  type="button"
                  onClick={() => removeDepartureTime(time)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                  title="Remove time"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Quick presets & custom input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex flex-wrap items-center gap-1 text-[10px]">
              <span className="text-gray-400 font-bold">Presets:</span>
              {COMMON_TIME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addDepartureTime(preset)}
                  disabled={departureTimes.includes(preset)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    departureTimes.includes(preset)
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white hover:bg-emerald-50 text-brand-emerald border-emerald-200 font-semibold'
                  }`}
                >
                  + {preset}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="e.g. 09:45 AM or 04:30 PM"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDepartureTime(customTime);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald"
              />
              <button
                type="button"
                onClick={() => addDepartureTime(customTime)}
                className="px-3 py-1.5 rounded-btn bg-brand-emerald text-white text-xs font-bold hover:bg-brand-deep transition-colors"
              >
                Add Time
              </button>
            </div>
          </div>
        </div>

        {/* FARE & ASSIGNED OPERATOR */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1 flex items-center justify-between">
              <span>Official Base Ticket Fare (ETB) *</span>
              <span className="text-[10px] text-brand-emerald font-semibold">
                ~{Math.round(distanceKm * 2.2)} ETB suggested
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">ETB</span>
              <input
                type="number"
                min={50}
                value={baseFare}
                onChange={(e) => setBaseFare(Number(e.target.value))}
                required
                className="w-full pl-12 pr-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Primary Operating Bus Line
            </label>
            <select
              value={selectedOperatorId}
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              <option value="">All Certified Operators (Rotating Fleet)</option>
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.name} ({op.rating} ★)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Operational Status & Auto-Schedule */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Route Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-semibold"
            >
              <option value="ACTIVE">ACTIVE (Open for scheduling & bookings)</option>
              <option value="INACTIVE">INACTIVE (Temporarily closed)</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScheduleTrips}
                onChange={(e) => setAutoScheduleTrips(e.target.checked)}
                className="w-4 h-4 text-brand-emerald rounded border-gray-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-brand-dark flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto-schedule next 14 days</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-[11px] text-brand-textMuted">
            {operatingDays.length} day(s)/wk • {departureTimes.length} daily departure(s)
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-btn text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-btn bg-brand-emerald text-white text-xs font-bold hover:bg-brand-deep transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Publishing...' : routeToEdit ? 'Update Route & Schedule' : 'Create Route & Schedule'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
