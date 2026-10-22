import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  Bus,
  Users,
  Building2,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { MetricsCard } from '../components/MetricsCard';
import { StatusBadge } from '../components/StatusBadge';
import { analyticsApi, citiesApi, routesApi, bookingsApi, tripsApi } from '../api/endpoints';
import { CityModal } from '../features/CityModal';
import { RouteModal } from '../features/RouteModal';
import { ManifestModal } from '../features/ManifestModal';
import { BRAND } from '../config/brand';

export const DashboardOverviewPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [analyticsRes, citiesRes, routesRes, tripsRes, bookingsRes] = await Promise.all([
        analyticsApi.getAdmin().catch(() => null),
        citiesApi.getAll().catch(() => []),
        routesApi.getAll().catch(() => []),
        tripsApi.getAll().catch(() => []),
        bookingsApi.getAll().catch(() => ({ bookings: [] })),
      ]);

      setAnalytics(analyticsRes);
      setCities(citiesRes || []);
      setRoutes(routesRes || []);
      const tripList = Array.isArray(tripsRes) ? tripsRes : ((tripsRes as any)?.trips || []);
      setTrips(tripList);
      setBookings(bookingsRes?.bookings || (Array.isArray(bookingsRes) ? bookingsRes : []));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Executive Overview</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Operations & Fleet Control Center
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 transition-colors shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>

          <button
            onClick={() => setCityModalOpen(true)}
            className="px-3.5 py-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-brand-dark flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Add City</span>
          </button>

          <button
            onClick={() => setRouteModalOpen(true)}
            className="px-4 py-2 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Route</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          label="Total System Revenue"
          value={`${(analytics?.overview?.totalRevenue || 0).toLocaleString()} ${BRAND.currency}`}
          subvalue="Official collected ticket fares"
          icon={DollarSign}
          trend={{ value: '18.4% this month', isPositive: true }}
          colorScheme="emerald"
        />

        <MetricsCard
          label="Confirmed Bookings"
          value={analytics?.overview?.totalBookings || bookings.length}
          subvalue="Digital reservations handled"
          icon={Calendar}
          trend={{ value: '12% this week', isPositive: true }}
          colorScheme="gold"
        />

        <MetricsCard
          label="Active Trips Scheduled"
          value={analytics?.overview?.totalTrips || trips.length}
          subvalue={`${routes.length} Nationwide Corridors`}
          icon={Bus}
          colorScheme="blue"
        />

        <MetricsCard
          label="Connected Cities"
          value={cities.length}
          subvalue="Terminal Hubs Configured"
          icon={Building2}
          colorScheme="purple"
        />
      </div>

      {/* Middle Grid: Revenue Trend & Popular Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Popular Corridors */}
        <div className="lg:col-span-8 bg-white rounded-card p-6 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-brand-dark">
                Nationwide Intercity Corridors
              </h3>
              <p className="text-xs text-brand-textMuted">
                Top performing intercity routes by distance and traveler demand.
              </p>
            </div>
            <a
              href="/routes"
              className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-brand-textMuted uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Route Origin → Destination</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Popularity</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routes.slice(0, 6).map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-3 font-bold text-brand-dark">
                      {r.origin?.name} → {r.destination?.name}
                    </td>
                    <td className="py-3 px-3 font-semibold text-brand-emerald">{r.distanceKm} km</td>
                    <td className="py-3 px-3 text-gray-500">~{r.estimatedDurationHours} hrs</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-brand-emerald rounded-full"
                            style={{ width: `${r.popularityScore || 50}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-gray-600">
                          {r.popularityScore || 50}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Daily Schedules Snapshot */}
        <div className="lg:col-span-4 bg-white rounded-card p-6 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-brand-dark">
              Upcoming Trips
            </h3>
            <a
              href="/trips"
              className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {trips.slice(0, 5).map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTrip(t)}
                className="py-3 hover:bg-gray-50/50 cursor-pointer rounded-lg px-2 -mx-2 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-bold text-brand-dark">{t.tripCode}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {t.route?.origin?.name} → {t.route?.destination?.name}
                  </div>
                  <div className="text-[10px] text-brand-emerald font-semibold mt-0.5">
                    {t.departureDate} at {t.departureTime}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-xs text-brand-dark block">
                    {t.fare} {BRAND.currency}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">
                    {t.availableSeatsCount} seats left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CityModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        onSuccess={fetchDashboard}
      />
      <RouteModal
        isOpen={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        onSuccess={fetchDashboard}
        cities={cities}
      />
      <ManifestModal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
      />
    </div>
  );
};
