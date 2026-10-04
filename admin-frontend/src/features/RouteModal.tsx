import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { routesApi } from '../api/endpoints';
import { City, Route } from '../types';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cities: City[];
  routeToEdit?: Route | null;
}

export const RouteModal: React.FC<RouteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cities,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } else {
      setOriginId(cities[0]?._id || '');
      setDestId(cities[1]?._id || '');
      setDistanceKm(200);
      setEstimatedDurationHours(3.5);
      setPopularityScore(85);
      setPickupPoint('');
      setDropoffPoint('');
      setStatus('ACTIVE');
    }
    setError('');
  }, [routeToEdit, isOpen, cities]);

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

    setLoading(true);
    setError('');

    const originCity = cities.find((c) => c._id === originId);
    const destCity = cities.find((c) => c._id === destId);

    try {
      const payload = {
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
          : 'Create Intercity Bus Route'
      }
      subtitle={
        routeToEdit
          ? 'Update distance, duration, terminal stops, and active availability.'
          : 'Establish a new travel corridor connecting two Ethiopian cities.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-btn bg-red-50 border border-red-200 text-status-error text-xs">
            {error}
          </div>
        )}

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

        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1">
            Origin Pickup Terminal Name
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
            Destination Drop-off Terminal Name
          </label>
          <input
            type="text"
            placeholder="e.g. Bahir Dar Bus Station"
            value={dropoffPoint}
            onChange={(e) => setDropoffPoint(e.target.value)}
            className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
          />
        </div>

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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
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
            className="px-5 py-2 rounded-btn bg-brand-emerald text-white text-xs font-bold hover:bg-brand-deep transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : routeToEdit ? 'Update Route' : 'Create Route'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
