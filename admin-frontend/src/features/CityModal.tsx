import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { citiesApi } from '../api/endpoints';
import { City } from '../types';

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cityToEdit?: City | null;
}

export const CityModal: React.FC<CityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cityToEdit,
}) => {
  const [name, setName] = useState('');
  const [amharicName, setAmharicName] = useState('');
  const [region, setRegion] = useState('Addis Ababa');
  const [code, setCode] = useState('');
  const [terminalName, setTerminalName] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const regions = [
    'Addis Ababa',
    'Amhara',
    'Oromia',
    'Sidama',
    'Tigray',
    'Somali',
    'Afar',
    'Dire Dawa',
    'Benishangul-Gumuz',
    'Gambela',
    'Harari',
    'South West Ethiopia',
    'Central Ethiopia',
    'Southern Ethiopia',
  ];

  useEffect(() => {
    if (cityToEdit) {
      setName(cityToEdit.name || '');
      setAmharicName(cityToEdit.amharicName || '');
      setRegion(cityToEdit.region || 'Addis Ababa');
      setCode(cityToEdit.code || '');
      setTerminalName(cityToEdit.terminalName || '');
      setStatus(cityToEdit.status || 'ACTIVE');
    } else {
      setName('');
      setAmharicName('');
      setRegion('Addis Ababa');
      setCode('');
      setTerminalName('');
      setStatus('ACTIVE');
    }
    setError('');
  }, [cityToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !region.trim()) {
      setError('Please provide City Name, 3-letter Code, and Region.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        amharicName: amharicName.trim() || undefined,
        region,
        code: code.trim().toUpperCase(),
        terminalName: terminalName.trim() || `${name.trim()} Central Terminal`,
        status,
      };

      if (cityToEdit) {
        await citiesApi.update(cityToEdit._id, payload);
      } else {
        await citiesApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || (cityToEdit ? 'Failed to update city.' : 'Failed to register city.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cityToEdit ? `Edit City • ${cityToEdit.name}` : 'Add Ethiopian City'}
      subtitle={
        cityToEdit
          ? 'Modify terminal information, Amharic spelling, or active operational status.'
          : 'Register a new destination in the nationwide intercity transit network.'
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
              City Name (English) *
            </label>
            <input
              type="text"
              placeholder="e.g. Dessie"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!cityToEdit && !code && e.target.value.length >= 3) {
                  setCode(e.target.value.substring(0, 3).toUpperCase());
                }
              }}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Amharic Name (የከተማው ስም)
            </label>
            <input
              type="text"
              placeholder="ምሳሌ፡ ደሴ"
              value={amharicName}
              onChange={(e) => setAmharicName(e.target.value)}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs font-ethiopic focus:outline-none focus:border-brand-emerald"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              3-Letter Code *
            </label>
            <input
              type="text"
              placeholder="DSS"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs font-mono uppercase focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Region *
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Primary Bus Terminal / Station
            </label>
            <input
              type="text"
              placeholder="e.g. Dessie Menafesha Central Terminal"
              value={terminalName}
              onChange={(e) => setTerminalName(e.target.value)}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-semibold"
            >
              <option value="ACTIVE">ACTIVE (Available for booking)</option>
              <option value="INACTIVE">INACTIVE (Hidden)</option>
            </select>
          </div>
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
            {loading ? 'Saving...' : cityToEdit ? 'Update City' : 'Save City'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
