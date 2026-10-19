import React, { useState, useEffect } from 'react';
import {
  Bus,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Wrench,
  Pencil,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { vehiclesApi, operatorsApi } from '../api/endpoints';
import { VehicleModal } from '../features/VehicleModal';
import { StatusBadge } from '../components/StatusBadge';
import { Vehicle, Operator } from '../types';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'>('ALL');
  const [operatorFilter, setOperatorFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vData, opData] = await Promise.all([
        vehiclesApi.getAll(),
        operatorsApi.getAll(),
      ]);
      setVehicles(vData || []);
      setOperators(opData || []);
    } catch (err: any) {
      console.error('Failed to load fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Status mutation: Activate, Deactivate, Maintenance
  const handleUpdateStatus = async (
    vehicle: Vehicle,
    newStatus: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
  ) => {
    if (vehicle.status === newStatus) return;

    setUpdatingId(vehicle._id);
    try {
      await vehiclesApi.updateStatus(vehicle._id, newStatus);
      showNotification(
        `Bus ${vehicle.plateNumber} is now marked as ${newStatus}.`,
        'success'
      );
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update vehicle status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenCreate = () => {
    setVehicleToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setVehicleToEdit(v);
    setIsModalOpen(true);
  };

  // Metric counts
  const totalFleet = vehicles.length;
  const activeCount = vehicles.filter((v) => v.status === 'ACTIVE').length;
  const inactiveCount = vehicles.filter((v) => v.status === 'INACTIVE').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'MAINTENANCE').length;

  // Filtered vehicles list
  const filteredVehicles = vehicles.filter((v) => {
    const q = search.toLowerCase().trim();
    const opName = typeof v.operator === 'object' ? (v.operator as any)?.name || '' : '';
    const matchesSearch =
      !q ||
      v.plateNumber.toLowerCase().includes(q) ||
      v.vehicleModel.toLowerCase().includes(q) ||
      opName.toLowerCase().includes(q) ||
      (v.features && v.features.some((f) => f.toLowerCase().includes(q)));

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    const opId = typeof v.operator === 'object' ? (v.operator as any)?._id : v.operator;
    const matchesOperator = operatorFilter === 'ALL' || opId === operatorFilter;

    const matchesCategory = categoryFilter === 'ALL' || v.vehicleType === categoryFilter;

    return matchesSearch && matchesStatus && matchesOperator && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-card flex items-center justify-between gap-3 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-black font-extrabold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Fleet Inventory & Availability</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Fleet & Bus Management ({totalFleet})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Register transport buses, manage seating specifications, and toggle operational availability for scheduled departures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-btn border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh Fleet Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-btn bg-brand-emerald hover:bg-brand-emeraldDark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Bus</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Fleet</span>
            <div className="text-2xl font-black text-brand-dark mt-0.5">{totalFleet}</div>
            <span className="text-[10px] text-gray-500 font-medium">All registered vehicles</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <Bus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-card p-4 border border-emerald-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active & Ready</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{activeCount}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Available for trips</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-card p-4 border border-rose-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Deactivated</span>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{inactiveCount}</div>
            <span className="text-[10px] text-rose-600 font-medium">Grounded / unavailable</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-card p-4 border border-amber-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">In Maintenance</span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{maintenanceCount}</div>
            <span className="text-[10px] text-amber-600 font-medium">Garage inspection</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by plate number (e.g. ET-3-10294), model, operator, or feature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>

          {/* Operator Filter */}
          <div className="flex items-center gap-2">
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              <option value="ALL">All Operators</option>
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              <option value="ALL">All Vehicle Types</option>
              <option value="Bus">Intercity Bus</option>
              <option value="Coach">Luxury Coach</option>
              <option value="Minibus">Minibus</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const).map((st) => {
            const count =
              st === 'ALL'
                ? totalFleet
                : st === 'ACTIVE'
                ? activeCount
                : st === 'INACTIVE'
                ? inactiveCount
                : maintenanceCount;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-brand-emerald text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{st === 'ALL' ? 'All Buses' : st === 'ACTIVE' ? 'Active Ready' : st === 'INACTIVE' ? 'Deactivated' : 'Maintenance'}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === st ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => {
          const op = typeof v.operator === 'object' ? (v.operator as Operator) : null;
          const isUpdating = updatingId === v._id;

          return (
            <div
              key={v._id}
              className={`bg-white rounded-card overflow-hidden border transition-all duration-200 shadow-card hover:shadow-cardHover flex flex-col justify-between ${
                v.status === 'ACTIVE'
                  ? 'border-gray-200 hover:border-emerald-300'
                  : v.status === 'INACTIVE'
                  ? 'border-rose-100 bg-rose-50/20'
                  : 'border-amber-100 bg-amber-50/20'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Plate and Status Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {/* Ethiopian License Plate Badge */}
                    <div className="inline-flex items-center rounded-lg border-2 border-slate-800 bg-slate-900 text-white font-mono shadow-xs overflow-hidden">
                      <div className="bg-emerald-600 text-white px-1.5 py-1 text-[10px] font-black uppercase tracking-wider flex items-center justify-center">
                        ET
                      </div>
                      <div className="px-2.5 py-1 text-sm font-black tracking-widest text-amber-300">
                        {v.plateNumber}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-brand-dark">
                      <span className="truncate max-w-[180px]">{op?.name || 'Assigned Operator'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-gray-500 font-medium">{v.year}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={v.status} />
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="p-1 rounded-md text-gray-400 hover:text-brand-emerald hover:bg-emerald-50 transition-colors"
                      title="Edit Vehicle Details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Model & Specs */}
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Model:</span>
                    <span className="font-bold text-brand-dark">{v.vehicleModel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Category:</span>
                    <span className="font-bold text-brand-emerald">{v.vehicleType}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Passenger Capacity:</span>
                    <span className="font-extrabold text-brand-dark">
                      {v.seatCapacity} Seats ({v.seatLayout?.layoutType || '2x2'})
                    </span>
                  </div>
                </div>

                {/* Amenities / Feature Tags */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Onboard Features
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {v.features && v.features.length > 0 ? (
                      v.features.map((feat) => (
                        <span
                          key={feat}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {feat}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Standard configuration</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Action Controls */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-500">
                  {v.status === 'ACTIVE'
                    ? '🟢 Ready for Trips'
                    : v.status === 'INACTIVE'
                    ? '🔴 Grounded / Inactive'
                    : '🟡 In Maintenance'}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Activate Button */}
                  {v.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleUpdateStatus(v, 'ACTIVE')}
                      disabled={isUpdating}
                      className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                      title="Activate this bus so it can be scheduled for passenger trips"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Activate Bus</span>
                    </button>
                  )}

                  {/* Deactivate Button */}
                  {v.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleUpdateStatus(v, 'INACTIVE')}
                      disabled={isUpdating}
                      className="px-2.5 py-1 rounded text-xs font-bold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1 transition-colors disabled:opacity-50"
                      title="Deactivate this bus to prevent it from being assigned to departures"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Deactivate</span>
                    </button>
                  )}

                  {/* Maintenance Button */}
                  {v.status !== 'MAINTENANCE' && (
                    <button
                      onClick={() => handleUpdateStatus(v, 'MAINTENANCE')}
                      disabled={isUpdating}
                      className="px-2 py-1 rounded text-xs font-bold bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 transition-colors disabled:opacity-50"
                      title="Mark as under garage maintenance"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Service</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && !loading && (
        <div className="py-12 text-center bg-white rounded-card border border-dashed border-gray-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-brand-emerald mx-auto flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-brand-dark">No fleet vehicles match your criteria</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query, status filters, or register a new bus to your fleet database.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-btn bg-brand-emerald text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Bus</span>
          </button>
        </div>
      )}

      {/* Vehicle Registration & Edit Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          showNotification(
            vehicleToEdit ? 'Vehicle updated successfully!' : 'New bus registered successfully into fleet!',
            'success'
          );
          fetchData();
        }}
        operators={operators}
        vehicleToEdit={vehicleToEdit}
      />
    </div>
  );
};
