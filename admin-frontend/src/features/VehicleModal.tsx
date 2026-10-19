import React, { useState, useEffect } from 'react';
import { Bus, ShieldCheck, Sparkles, AlertCircle, Wrench, CheckCircle2, XCircle, Tag, Hash, Calendar, Layers } from 'lucide-react';
import { Modal } from '../components/Modal';
import { vehiclesApi } from '../api/endpoints';
import { Operator, Vehicle } from '../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  operators: Operator[];
  vehicleToEdit?: Vehicle | null;
}

const COMMON_MODELS = [
  { name: 'Scania Marcopolo G7', type: 'Coach', capacity: 49, layout: '2x2' },
  { name: 'Yutong ZK6122H High-Deck', type: 'Coach', capacity: 51, layout: '2x2' },
  { name: 'Higer KLQ6129 Grand Cruiser', type: 'Bus', capacity: 45, layout: '2x2' },
  { name: 'Golden Dragon Navigator VIP', type: 'Coach', capacity: 38, layout: '2x1' },
  { name: 'Toyota Coaster Executive', type: 'Bus', capacity: 30, layout: '2x1' },
  { name: 'Toyota HiAce GL Minibus', type: 'Minibus', capacity: 14, layout: 'minibus' },
];

const AVAILABLE_FEATURES = [
  'Air Conditioning',
  'USB Charging Ports',
  'Reclining Seats',
  'High-Speed WiFi',
  'Audio & TV Entertainment',
  'GPS Real-Time Tracking',
  'Speed Governor Limiter',
  'Onboard Restroom',
  'Overhead Reading Lights',
  'Emergency Exit & First Aid',
];

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  operators,
  vehicleToEdit,
}) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [vehicleType, setVehicleType] = useState('Bus');
  const [vehicleModel, setVehicleModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [seatCapacity, setSeatCapacity] = useState<number>(49);
  const [layoutType, setLayoutType] = useState<'2x2' | '2x1' | '1x2' | 'minibus'>('2x2');
  const [features, setFeatures] = useState<string[]>([
    'Air Conditioning',
    'USB Charging Ports',
    'Reclining Seats',
    'GPS Real-Time Tracking',
  ]);
  const [status, setStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicleToEdit) {
      setPlateNumber(vehicleToEdit.plateNumber || '');
      const opId = typeof vehicleToEdit.operator === 'object' ? (vehicleToEdit.operator as any)?._id : vehicleToEdit.operator;
      setOperatorId(opId || operators[0]?._id || '');
      setVehicleType(vehicleToEdit.vehicleType || 'Bus');
      setVehicleModel(vehicleToEdit.vehicleModel || '');
      setYear(vehicleToEdit.year || 2024);
      setSeatCapacity(vehicleToEdit.seatCapacity || 49);
      setLayoutType((vehicleToEdit.seatLayout?.layoutType as any) || '2x2');
      setFeatures(vehicleToEdit.features && vehicleToEdit.features.length > 0 ? vehicleToEdit.features : ['Air Conditioning', 'USB Charging Ports']);
      setStatus(vehicleToEdit.status || 'ACTIVE');
    } else {
      setPlateNumber('');
      setOperatorId(operators[0]?._id || '');
      setVehicleType('Bus');
      setVehicleModel('Scania Marcopolo G7');
      setYear(new Date().getFullYear());
      setSeatCapacity(49);
      setLayoutType('2x2');
      setFeatures(['Air Conditioning', 'USB Charging Ports', 'Reclining Seats', 'GPS Real-Time Tracking']);
      setStatus('ACTIVE');
    }
    setError('');
  }, [vehicleToEdit, isOpen, operators]);

  const handleApplyPreset = (preset: typeof COMMON_MODELS[0]) => {
    setVehicleModel(preset.name);
    setVehicleType(preset.type);
    setSeatCapacity(preset.capacity);
    setLayoutType(preset.layout as any);
  };

  const toggleFeature = (feat: string) => {
    setFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPlate = plateNumber.trim().toUpperCase();
    if (!cleanPlate) {
      setError('Please provide a valid vehicle license plate number.');
      return;
    }

    if (!operatorId) {
      setError('Please select an operating company.');
      return;
    }

    if (!vehicleModel.trim()) {
      setError('Vehicle model name is required.');
      return;
    }

    if (!seatCapacity || seatCapacity < 10 || seatCapacity > 80) {
      setError('Seat capacity must be between 10 and 80 passenger seats.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        plateNumber: cleanPlate,
        operator: operatorId,
        vehicleType,
        vehicleModel: vehicleModel.trim(),
        year: Number(year),
        seatCapacity: Number(seatCapacity),
        seatLayout: {
          layoutType,
          columns: layoutType === '2x1' || layoutType === '1x2' ? 3 : 4,
          rows: Math.ceil(Number(seatCapacity) / (layoutType === '2x1' || layoutType === '1x2' ? 3 : 4)),
          aislePosition: layoutType === '2x1' ? [2] : layoutType === '1x2' ? [1] : [2],
          blockedSeats: vehicleToEdit?.seatLayout?.blockedSeats || [],
        },
        features,
        status,
      };

      if (vehicleToEdit) {
        await vehiclesApi.update(vehicleToEdit._id, payload);
      } else {
        await vehiclesApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || (vehicleToEdit ? 'Failed to update vehicle details.' : 'Failed to register vehicle.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicleToEdit ? 'Edit Fleet Vehicle' : 'Register New Fleet Bus'}
      subtitle={
        vehicleToEdit
          ? `Update details and availability for plate ${vehicleToEdit.plateNumber}`
          : 'Register an available transport bus with plate number, operator, layout, and operational status'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Plate Number & Operational Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/70">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Vehicle Plate Number *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. ET-3-10294 or 3-84729-AA"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                required
                className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs font-mono font-bold uppercase tracking-wider bg-white focus:outline-none focus:border-brand-emerald shadow-2xs"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Official Ethiopian commercial plate format (e.g. ET-3-12345).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Availability / Operational Status *
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Active</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('INACTIVE')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  status === 'INACTIVE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-300" />
                <span>Deactivated</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('MAINTENANCE')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  status === 'MAINTENANCE'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-200" />
                <span>Maintenance</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {status === 'ACTIVE'
                ? '🟢 Active: Available for dispatch and trip schedules.'
                : status === 'INACTIVE'
                ? '🔴 Deactivated: Bus is grounded and cannot be assigned to trips.'
                : '🟡 Maintenance: Under inspection or garage servicing.'}
            </p>
          </div>
        </div>

        {/* 2. Operator & Vehicle Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Operating Company / Carrier *
            </label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              <option value="" disabled>-- Select Bus Operator --</option>
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.name} ({op.licenseNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Vehicle Category *
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              <option value="Bus">Intercity Coach / Bus</option>
              <option value="Coach">Luxury Tour Coach</option>
              <option value="Minibus">Regional Minibus</option>
              <option value="Other">Special Vehicle / Van</option>
            </select>
          </div>
        </div>

        {/* Quick Model Presets */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Ethiopian Fleet Models (Quick Fill):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_MODELS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                  vehicleModel === preset.name
                    ? 'bg-brand-emerald text-white border-brand-emerald shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-brand-emerald'
                }`}
              >
                {preset.name} ({preset.capacity} seats)
              </button>
            ))}
          </div>
        </div>

        {/* 3. Model & Manufacturing Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Coach / Bus Model Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Scania Marcopolo G7 or Yutong ZK6122H"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Manufacturing Year *
            </label>
            <input
              type="number"
              min={2000}
              max={2030}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>
        </div>

        {/* 4. Seating Capacity & Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Passenger Seat Capacity *
            </label>
            <input
              type="number"
              min={10}
              max={80}
              value={seatCapacity}
              onChange={(e) => setSeatCapacity(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-bold"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block">
              Standard intercity coach is 45-51 seats; minibus is 14 seats.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Interior Seating Layout *
            </label>
            <select
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value as any)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium"
            >
              <option value="2x2">2x2 Standard Corridor (4 seats per row)</option>
              <option value="2x1">2x1 VIP Executive (3 seats per row)</option>
              <option value="1x2">1x2 Left-Aisle Executive (3 seats per row)</option>
              <option value="minibus">Minibus Compact Layout</option>
            </select>
            <span className="text-[10px] text-gray-500 mt-0.5 block">
              Interactive seat chart for customers is generated automatically.
            </span>
          </div>
        </div>

        {/* 5. Features & Amenities Checklist */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1.5">
            Onboard Amenities & Safety Equipment
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AVAILABLE_FEATURES.map((feat) => {
              const isChecked = features.includes(feat);
              return (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleFeature(feat)}
                  className={`px-2.5 py-1.5 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    isChecked
                      ? 'bg-emerald-50 text-brand-emerald border-emerald-300 font-bold'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate pr-1">{feat}</span>
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                    isChecked ? 'bg-brand-emerald text-white' : 'border border-gray-300'
                  }`}>
                    {isChecked ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-btn border border-gray-200 text-xs font-bold text-brand-dark hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-btn bg-brand-emerald hover:bg-brand-emeraldDark text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Bus className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving Vehicle...' : vehicleToEdit ? 'Save Changes' : 'Register Vehicle'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
