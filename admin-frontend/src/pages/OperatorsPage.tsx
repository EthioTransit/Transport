import React, { useState, useEffect } from 'react';
import { Bus, Search, Star, Phone, Mail, MapPin, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import { operatorsApi } from '../api/endpoints';
import { StatusBadge } from '../components/StatusBadge';
import { Operator } from '../types';

export const OperatorsPage: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const data = await operatorsApi.getAll();
      setOperators(data || []);
    } catch (err) {
      console.error('Failed to load operators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleToggleStatus = async (operator: Operator) => {
    const nextStatus = operator.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Set status of ${operator.name} to ${nextStatus}?`)) return;

    setUpdatingId(operator._id);
    try {
      await operatorsApi.updateStatus(operator._id, nextStatus as any);
      await fetchOperators();
    } catch (err: any) {
      alert(err.message || 'Failed to update operator status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOperators = operators.filter((op) => {
    const q = search.toLowerCase();
    return (
      op.name.toLowerCase().includes(q) ||
      op.licenseNumber.toLowerCase().includes(q) ||
      op.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Commercial Partners</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Transport Operators ({operators.length})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Registered Ethiopian bus companies, fleet operations, licensing, and compliance governance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOperators}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search operators by name, license number, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
          />
        </div>
      </div>

      {/* Operators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOperators.map((op) => (
          <div
            key={op._id}
            className="bg-white rounded-card p-6 border border-gray-100 shadow-card hover:shadow-cardHover transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-brand-emerald flex items-center justify-center font-black text-xs shadow-xs">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-brand-dark">{op.name}</h3>
                    <p className="text-[11px] text-gray-400">{op.legalName}</p>
                  </div>
                </div>
              </div>
              <StatusBadge status={op.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px]">License</span>
                <div className="font-mono font-bold text-brand-dark mt-0.5">{op.licenseNumber}</div>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px]">Quality Rating</span>
                <div className="font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{op.rating?.toFixed(1) || '4.8'} / 5.0</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px]">Total Trips</span>
                <div className="font-bold text-brand-emerald mt-0.5">{op.totalTripsCount || '30+'}</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-brand-textMuted">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{op.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{op.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{op.address}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Registered on {new Date(op.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleToggleStatus(op)}
                disabled={updatingId === op._id}
                className={`px-3 py-1.5 rounded-btn text-xs font-bold transition-colors ${
                  op.status === 'ACTIVE'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {updatingId === op._id
                  ? 'Updating...'
                  : op.status === 'ACTIVE'
                  ? 'Suspend Operator'
                  : 'Activate Operator'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOperators.length === 0 && !loading && (
        <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-card border border-dashed border-gray-200">
          No operators found matching your criteria.
        </div>
      )}
    </div>
  );
};
