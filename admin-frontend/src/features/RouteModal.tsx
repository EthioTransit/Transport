import React, { useState, useEffect, useRef } from 'react';
import { Route as RouteIcon, Plus, Trash2, Upload, Image as ImageIcon, Link as LinkIcon, Sparkles, AlertCircle } from 'lucide-react';
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
  const [image, setImage] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropoffPoint, setDropoffPoint] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset Ethiopian scenic route and highway photos
  const PRESET_PHOTOS = [
    { label: 'Addis Corridor', url: '/ethiopia-hero.jpg' },
    { label: 'Bahir Dar Highway', url: '/dest-bahirdar.jpg' },
    { label: 'Hawassa Expressway', url: '/dest-hawassa.jpg' },
    { label: 'Debre Berhan Pass', url: '/dest-debreberhan.jpg' },
    { label: 'Adama Expressway', url: '/dest-adama.jpg' },
    { label: 'Northern Historic Circuit', url: '/cities-collage.jpg' },
  ];

  useEffect(() => {
    if (routeToEdit) {
      setOriginId(routeToEdit.origin?._id || cities[0]?._id || '');
      setDestId(routeToEdit.destination?._id || cities[1]?._id || '');
      setDistanceKm(routeToEdit.distanceKm || 200);
      setEstimatedDurationHours(routeToEdit.estimatedDurationHours || 3.5);
      setPopularityScore(routeToEdit.popularityScore || 85);
      setImage(routeToEdit.image || '');
      setPickupPoint(routeToEdit.pickupPoints?.[0]?.name || '');
      setDropoffPoint(routeToEdit.dropOffPoints?.[0]?.name || '');
      setStatus(routeToEdit.status || 'ACTIVE');
    } else {
      setOriginId(cities[0]?._id || '');
      setDestId(cities[1]?._id || '');
      setDistanceKm(200);
      setEstimatedDurationHours(3.5);
      setPopularityScore(85);
      setImage('');
      setPickupPoint('');
      setDropoffPoint('');
      setStatus('ACTIVE');
    }
    setError('');
    setImageError(false);
  }, [routeToEdit, isOpen, cities]);

  // Handle local file selection and convert to optimized base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image is too large (maximum size is 5MB).');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setImage(compressed);
          setImageError(false);
        } else {
          setImage(event.target?.result as string);
          setImageError(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
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
        image: image.trim(),
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

        {/* Route Travel Corridor Photo Section */}
        <div className="p-3.5 rounded-card border border-gray-200 bg-gray-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
              <ImageIcon className="w-4 h-4 text-brand-emerald" />
              <span>Route Travel Corridor Photo (Visible on customer trip bookings)</span>
            </div>
            {image && (
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setImageError(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          {/* Image Preview Box */}
          {image ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black/5 aspect-video max-h-40 w-full flex items-center justify-center">
              <img
                src={image}
                alt="Route preview"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
              {imageError && (
                <div className="absolute inset-0 bg-red-900/80 text-white flex flex-col items-center justify-center p-2 text-center text-xs">
                  <AlertCircle className="w-5 h-5 mb-1" />
                  <span>Unable to load image from provided URL</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                Customer View Preview
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-3.5 text-center bg-white flex flex-col items-center justify-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-brand-emerald flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Add a highway or scenic photo for this corridor. Customers will see it when booking trips on this route.
              </p>
            </div>
          )}

          {/* Upload Button & URL input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
                id="route-image-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-input bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-brand-dark flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Upload File</span>
              </button>

              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://... or /dest-bahirdar.jpg"
                  value={image.startsWith('data:') ? 'Image uploaded from device' : image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setImageError(false);
                  }}
                  disabled={image.startsWith('data:')}
                  className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald disabled:bg-gray-100 disabled:text-gray-500 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Ethiopian Preset Suggestions */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick Preset Corridor Photos:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PHOTOS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setImage(preset.url);
                      setImageError(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                      image === preset.url
                        ? 'bg-brand-emerald text-white border-brand-emerald'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-emerald hover:text-brand-emerald'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
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
