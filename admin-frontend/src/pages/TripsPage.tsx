import React, { useState, useEffect } from 'react';
import { Calendar, Search, RefreshCw, Eye, Bus, ArrowRight, Clock, Users, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { tripsApi, routesApi, operatorsApi, vehiclesApi } from '../api/endpoints';
import { ManifestModal } from '../features/ManifestModal';
import { TripModal } from '../features/TripModal';
import { StatusBadge } from '../components/StatusBadge';
import { Trip, Route, Operator, Vehicle } from '../types';
import { BRAND } from '../config/brand';

export const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 6000);
  };

  const fetchTripsData = async () => {
    setLoading(true);
    try {
      const [tripsRes, routesRes, operatorsRes, vehiclesRes] = await Promise.all([
        tripsApi.getAll().catch((err) => {
          console.error('Error fetching trips:', err);
          return { trips: [] };
        }),
        routesApi.getAll().catch(() => []),
        operatorsApi.getAll().catch(() => []),
        vehiclesApi.getAll().catch(() => []),
      ]);

      const loadedTrips = Array.isArray(tripsRes) ? tripsRes : (tripsRes?.trips || []);
      setTrips(loadedTrips);
      setRoutes(routesRes || []);
      setOperators(operatorsRes || []);
      setVehicles(vehiclesRes || []);
    } catch (err) {
      console.error('Failed to load trips data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsData();
  }, []);

  const handleStatusChange = async (tripId: string, newStatus: string) => {
    try {
      await tripsApi.updateStatus(tripId, newStatus);
      showNotification(`Trip status updated to ${newStatus}`);
      await fetchTripsData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update trip status', 'error');
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const q = search.trim().toLowerCase();
    if (!q) return matchesStatus;

    const matchesSearch =
      (t.tripCode && t.tripCode.toLowerCase().includes(q)) ||
      (t.route?.origin?.name && t.route.origin.name.toLowerCase().includes(q)) ||
      (t.route?.destination?.name && t.route.destination.name.toLowerCase().includes(q)) ||
      (t.operator?.name && t.operator.name.toLowerCase().includes(q)) ||
      (t.vehicle?.plateNumber && t.vehicle.plateNumber.toLowerCase().includes(q));

    return matchesStatus && Boolean(matchesSearch);
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="text-xs font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Schedules & Fleet Dispatch</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Intercity Trips & Master Schedule ({trips.length})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Real-time departure status, seat occupancy, official ticket fare tracking, and passenger manifests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTripModalOpen(true)}
            className="px-3.5 py-2 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Trip</span>
          </button>

          <button
            onClick={fetchTripsData}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by trip code, route, or operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'SCHEDULED', 'BOARDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-brand-emerald text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-textMuted uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 w-12 text-center text-gray-400 font-bold">#</th>
                <th className="py-3 px-4">Trip Code</th>
                <th className="py-3 px-4">Corridor</th>
                <th className="py-3 px-4">Operator & Fleet</th>
                <th className="py-3 px-4">Departure Time</th>
                <th className="py-3 px-4">Fare</th>
                <th className="py-3 px-4">Seat Occupancy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTrips.map((t, index) => {
                const totalSeats = t.totalSeatsCount || 44;
                const availableSeats = t.availableSeatsCount ?? totalSeats;
                const bookedCount = Math.max(0, totalSeats - availableSeats);
                const percentage = Math.round((bookedCount / totalSeats) * 100);

                return (
                  <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-200/80 rounded px-1.5 py-0.5 inline-block min-w-[24px]">
                        {index + 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-brand-dark">
                      {t.tripCode}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-brand-textMain">
                      <div className="flex items-center gap-1.5">
                        <span>{t.route?.origin?.name || 'Origin'}</span>
                        <ArrowRight className="w-3 h-3 text-brand-emerald" />
                        <span>{t.route?.destination?.name || 'Destination'}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-normal">
                        {t.pickupLocation || 'Central Terminal'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-dark">{t.operator?.name || 'Operator'}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {t.vehicle?.plateNumber || (t.vehicle as any)?.model || 'Fleet Coach'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-textMain">{t.departureDate}</div>
                      <div className="text-[11px] text-brand-emerald font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{t.departureTime}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-dark">
                        {t.fare} {BRAND.currency}
                      </div>
                      <div className="text-[10px] text-gray-400">+{t.serviceFee || 15} {BRAND.currency} fee</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-28">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-gray-500">{bookedCount}/{totalSeats}</span>
                          <span className="text-brand-emerald">{percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-brand-emerald rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                        className="text-[11px] font-bold rounded-lg border border-gray-200 px-2 py-1 bg-white focus:outline-none focus:border-brand-emerald cursor-pointer"
                      >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="BOARDING">BOARDING</option>
                        <option value="IN_TRANSIT">IN_TRANSIT</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTrip(t)}
                        className="px-3 py-1.5 rounded-btn bg-emerald-50 hover:bg-emerald-100 text-brand-emerald font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Manifest</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTrips.length === 0 && !loading && (
          <div className="py-12 text-center text-xs text-gray-400">
            No scheduled trips found matching your criteria.
          </div>
        )}
      </div>

      <ManifestModal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
      />

      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSuccess={async () => {
          await fetchTripsData();
          showNotification('New intercity departure schedule dispatched successfully! It is now live on both the admin master schedule and customer search page.');
        }}
        routes={routes}
        operators={operators}
        vehicles={vehicles}
      />
    </div>
  );
};
