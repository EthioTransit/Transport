import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MapPin, RefreshCw, Pencil } from 'lucide-react';
import { citiesApi } from '../api/endpoints';
import { CityModal } from '../features/CityModal';
import { StatusBadge } from '../components/StatusBadge';
import { City } from '../types';

export const CitiesPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const data = await citiesApi.getAll(search);
      setCities(data || []);
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [search]);

  const regions = ['ALL', ...Array.from(new Set(cities.map((c) => c.region)))];

  const filteredCities = cities.filter((c) => {
    const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
    const matchesQuery =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.amharicName && c.amharicName.includes(search));
    return matchesRegion && matchesQuery;
  });

  const handleOpenAdd = () => {
    setEditingCity(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (city: City) => {
    setEditingCity(city);
    setModalOpen(true);
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
            Ethiopian Cities Database ({cities.length})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Dynamic nationwide transit hubs and terminal stations used across intercity routes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCities}
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
            <span>Add City</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
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

        {/* Region filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedRegion === reg
                  ? 'bg-brand-emerald text-white'
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
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">City Name</th>
                <th className="py-3 px-4">Amharic (ስም)</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Primary Terminal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCities.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-emerald text-xs">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-brand-dark">{c.name}</td>
                  <td className="py-3.5 px-4 font-ethiopic text-brand-textMuted font-medium">
                    {c.amharicName || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-brand-textMuted font-medium">{c.region}</td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.terminalName || 'Main Station'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="px-2.5 py-1.5 rounded-btn bg-emerald-50 hover:bg-emerald-100 text-brand-emerald text-xs font-bold inline-flex items-center gap-1 transition-colors"
                      title="Edit City"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCities.length === 0 && !loading && (
          <div className="py-12 text-center text-xs text-gray-400">
            No cities found matching your criteria.
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
