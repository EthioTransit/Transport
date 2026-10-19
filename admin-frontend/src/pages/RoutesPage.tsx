import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Search, Plus, RefreshCw, Clock, ArrowRight, MapPin, Pencil, Image as ImageIcon } from 'lucide-react';
import { routesApi, citiesApi } from '../api/endpoints';
import { RouteModal } from '../features/RouteModal';
import { StatusBadge } from '../components/StatusBadge';
import { Route, City } from '../types';

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const fetchRoutesAndCities = async () => {
    setLoading(true);
    try {
      const [rData, cData] = await Promise.all([
        routesApi.getAll().catch(() => []),
        citiesApi.getAll().catch(() => []),
      ]);
      setRoutes(rData || []);
      setCities(cData || []);
    } catch (err) {
      console.error('Failed to load routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutesAndCities();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setRouteModalOpen(true);
  };

  const handleOpenEdit = (route: Route) => {
    setEditingRoute(route);
    setRouteModalOpen(true);
  };

  const filteredRoutes = routes.filter((r) => {
    const originName = r.origin?.name || '';
    const destName = r.destination?.name || '';
    const q = search.toLowerCase();
    return originName.toLowerCase().includes(q) || destName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Intercity Network</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Intercity Bus Routes ({routes.length})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Nationwide highway corridors with calculated distances, travel times, and designated boarding terminals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRoutesAndCities}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Route</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search routes by origin or destination city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
          />
        </div>
      </div>

      {/* Routes Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map((r) => (
          <div
            key={r._id}
            className="bg-white rounded-card overflow-hidden border border-gray-100 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between group"
          >
            {/* Scenic Route Corridor Image */}
            <div
              className="relative h-32 w-full bg-gray-900 overflow-hidden cursor-pointer"
              onClick={() => handleOpenEdit(r)}
              title="Click to view or edit route details and photo"
            >
              {r.image ? (
                <img
                  src={r.image}
                  alt={`${r.origin?.name} to ${r.destination?.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#031d12] to-[#063B2A] flex items-center justify-center text-emerald-400/40">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                <StatusBadge status={r.status} />
              </div>
              <div className="absolute bottom-2 left-3 right-3 z-10 flex items-center justify-between text-white">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  {r.origin?.code} ➔ {r.destination?.code}
                </span>
                <span className="text-[10px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-white font-bold">
                  {r.image ? 'Corridor Photo' : 'No Photo'}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-dark">
                    <span className="text-sm font-black">{r.origin?.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-emerald" />
                    <span className="text-sm font-black">{r.destination?.name}</span>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 rounded-btn bg-emerald-50 hover:bg-emerald-100 text-brand-emerald text-xs font-bold inline-flex items-center transition-colors"
                    title="Edit Route & Photo"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-gray-100 text-xs mt-3">
                  <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Distance</span>
                  <div className="font-extrabold text-brand-emerald text-sm mt-0.5">
                    {r.distanceKm} km
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Est. Travel Time</span>
                  <div className="font-semibold text-brand-dark text-xs mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>~{r.estimatedDurationHours} hours</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-brand-textMuted space-y-1 mt-3">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-emerald flex-shrink-0 mt-0.5" />
                  <span className="truncate">
                    Pickup: {r.pickupPoints?.[0]?.name || `${r.origin?.name} Central Terminal`}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="truncate">
                    Drop-off: {r.dropOffPoints?.[0]?.name || `${r.destination?.name} Terminal`}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
              <span>Popularity: <strong className="text-brand-dark">{r.popularityScore || 80}/100</strong></span>
              <button
                onClick={() => handleOpenEdit(r)}
                className="text-brand-emerald hover:text-brand-deep font-bold flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Corridor</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

      {filteredRoutes.length === 0 && !loading && (
        <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-card border border-dashed border-gray-200">
          No intercity routes found matching your criteria.
        </div>
      )}

      <RouteModal
        isOpen={modalOpen}
        onClose={() => {
          setRouteModalOpen(false);
          setEditingRoute(null);
        }}
        onSuccess={fetchRoutesAndCities}
        cities={cities}
        routeToEdit={editingRoute}
      />
    </div>
  );
};

