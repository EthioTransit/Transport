import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  RefreshCw,
  Pencil,
  CheckCircle2,
  PowerOff,
  AlertCircle,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { citiesApi } from '../api/endpoints';
import { CityModal } from '../features/CityModal';
import { StatusBadge } from '../components/StatusBadge';
import { City } from '../types';

export const CitiesPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const fetchCities = async () => {
    setLoading(true);
    try {
      // Pass true to ensure admin receives both active and inactive cities
      const data = await citiesApi.getAll(search, true);
      setCities(data || []);
    } catch (err: any) {
      console.error('Failed to load cities:', err);
      setActionAlert({
        text: err.message || 'Failed to load cities from server.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [search]);

  // Counts for overview
  const totalCount = cities.length;
  const activeCount = cities.filter((c) => c.status === 'ACTIVE').length;
  const inactiveCount = cities.filter((c) => c.status === 'INACTIVE').length;

  const regions = ['ALL', ...Array.from(new Set(cities.map((c) => c.region)))];

  const filteredCities = cities.filter((c) => {
    const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const query = search.toLowerCase().trim();
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      (c.amharicName && c.amharicName.includes(query)) ||
      (c.terminalName && c.terminalName.toLowerCase().includes(query));
    return matchesRegion && matchesStatus && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingCity(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (city: City) => {
    setEditingCity(city);
    setModalOpen(true);
  };

  const handleToggleStatus = async (city: City) => {
    const newStatus = city.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setTogglingId(city._id);
    setActionAlert(null);

    try {
      await citiesApi.toggleStatus(city._id, newStatus);
      setCities((prev) =>
        prev.map((c) => (c._id === city._id ? { ...c, status: newStatus } : c))
      );
      setActionAlert({
        text:
          newStatus === 'ACTIVE'
            ? `City "${city.name}" (${city.code}) has been ACTIVATED and is now available for passenger routes and bookings.`
            : `City "${city.name}" (${city.code}) has been DEACTIVATED and hidden from public search.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Failed to toggle city status:', err);
      setActionAlert({
        text: err.message || `Failed to update status for ${city.name}`,
        type: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Terminal Infrastructure</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Ethiopian Cities Database ({totalCount})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Dynamic nationwide transit hubs and terminal stations used across intercity routes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCities}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-xs transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add City</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-card border flex items-center justify-between gap-3 text-xs transition-all ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? (
              <Check className="w-4 h-4 text-brand-emerald shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{actionAlert.text}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-card border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-brand-emerald/5 border-brand-emerald ring-1 ring-brand-emerald shadow-xs'
              : 'bg-white border-gray-100 shadow-card hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-textMuted uppercase tracking-wider">
              Total Transit Hubs
            </span>
            <Building2 className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="text-2xl font-black text-brand-dark mt-2">{totalCount}</div>
          <p className="text-[11px] text-brand-textMuted mt-1">All registered network stations</p>
        </button>

        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-4 rounded-card border text-left transition-all ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
              : 'bg-white border-gray-100 shadow-card hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Active Hubs
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{activeCount}</div>
          <p className="text-[11px] text-emerald-600/90 mt-1">Operational for passenger booking</p>
        </button>

        <button
          onClick={() => setStatusFilter('INACTIVE')}
          className={`p-4 rounded-card border text-left transition-all ${
            statusFilter === 'INACTIVE'
              ? 'bg-rose-50 border-rose-400 ring-1 ring-rose-400 shadow-xs'
              : 'bg-white border-gray-100 shadow-card hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Inactive Hubs
            </span>
            <PowerOff className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">{inactiveCount}</div>
          <p className="text-[11px] text-rose-600/90 mt-1">
            Suspended / Click to view and activate
          </p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by city name, code, or Amharic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
            />
          </div>

          {/* Status Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-btn w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-btn text-xs font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-brand-dark shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-btn text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Active ({activeCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-btn text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === 'INACTIVE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Inactive ({inactiveCount})</span>
            </button>
          </div>
        </div>

        {/* Region filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Region:
          </span>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedRegion === reg
                  ? 'bg-brand-dark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Cities Table */}
      <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-textMuted uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Code</th>
                <th className="py-3 px-4 whitespace-nowrap">City Destination</th>
                <th className="py-3 px-4 whitespace-nowrap">Region</th>
                <th className="py-3 px-4 whitespace-nowrap">Primary Terminal</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCities.map((c) => {
                const isInactive = c.status === 'INACTIVE';
                const isToggling = togglingId === c._id;

                return (
                  <tr
                    key={c._id}
                    className={`transition-colors ${
                      isInactive
                        ? 'bg-rose-50/20 border-l-4 border-l-rose-400'
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald text-xs whitespace-nowrap">
                      {c.code}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => handleOpenEdit(c)}
                          className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer group shadow-2xs"
                          title="Click to view or change city photo"
                        >
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-brand-emerald">
                              <Building2 className="w-4 h-4 opacity-75" />
                              <span className="text-[9px] font-black">{c.code}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-dark text-xs">{c.name}</span>
                            {isInactive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-brand-textMuted font-ethiopic font-medium">
                            {c.amharicName || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-textMuted font-medium whitespace-nowrap">{c.region}</td>
                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{c.terminalName || 'Main Station'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {isInactive ? (
                          <button
                            onClick={() => handleToggleStatus(c)}
                            disabled={isToggling}
                            className="px-2.5 py-1.5 rounded-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors disabled:opacity-50"
                            title="Activate City"
                          >
                            {isToggling ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Activate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(c)}
                            disabled={isToggling}
                            className="px-2 py-1.5 rounded-btn bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-600 text-xs font-semibold inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                            title="Deactivate City"
                          >
                            {isToggling ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <PowerOff className="w-3 h-3" />
                            )}
                            <span>Deactivate</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="px-2 py-1.5 rounded-btn bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          title="Edit City Details"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCities.length === 0 && !loading && (
          <div className="py-12 text-center text-xs text-gray-400">
            {statusFilter === 'INACTIVE'
              ? 'No inactive cities found. All registered cities are currently active!'
              : 'No cities found matching your criteria.'}
          </div>
        )}
      </div>

      <CityModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCity(null);
        }}
        onSuccess={fetchCities}
        cityToEdit={editingCity}
      />
    </div>
  );
};
