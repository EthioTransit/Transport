import React, { useState, useEffect, useRef } from 'react';
import { Building2, Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Sparkles, AlertCircle } from 'lucide-react';
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
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Preset Ethiopian city hero photos available locally or via verified travel CDNs
  const PRESET_PHOTOS = [
    { label: 'Addis Ababa', url: '/ethiopia-hero.jpg' },
    { label: 'Bahir Dar', url: '/dest-bahirdar.jpg' },
    { label: 'Hawassa', url: '/dest-hawassa.jpg' },
    { label: 'Debre Berhan', url: '/dest-debreberhan.jpg' },
    { label: 'Adama', url: '/dest-adama.jpg' },
    { label: 'Gondar / Lalibela', url: '/cities-collage.jpg' },
  ];

  useEffect(() => {
    if (cityToEdit) {
      setName(cityToEdit.name || '');
      setAmharicName(cityToEdit.amharicName || '');
      setRegion(cityToEdit.region || 'Addis Ababa');
      setCode(cityToEdit.code || '');
      setTerminalName(cityToEdit.terminalName || '');
      setImage(cityToEdit.image || '');
      setStatus(cityToEdit.status || 'ACTIVE');
    } else {
      setName('');
      setAmharicName('');
      setRegion('Addis Ababa');
      setCode('');
      setTerminalName('');
      setImage('');
      setStatus('ACTIVE');
    }
    setError('');
    setImageError(false);
  }, [cityToEdit, isOpen]);

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
        image: image.trim() || undefined,
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
          ? 'Modify terminal information, destination cover photo, or operational status.'
          : 'Register a new destination in the nationwide intercity transit network.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-btn bg-red-50 border border-red-200 text-status-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Names */}
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

        {/* Code & Region */}
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

        {/* Terminal & Status */}
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
              <option value="INACTIVE">INACTIVE (Hidden from passengers)</option>
            </select>
          </div>
        </div>

        {/* City Destination Photo Section */}
        <div className="p-3.5 rounded-card border border-gray-200 bg-gray-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
              <ImageIcon className="w-4 h-4 text-brand-emerald" />
              <span>City Destination Cover Photo</span>
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
                <span>Remove Image</span>
              </button>
            )}
          </div>

          {/* Image Preview Box */}
          {image ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black/5 aspect-video max-h-40 w-full flex items-center justify-center">
              <img
                src={image}
                alt="City preview"
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
                Preview
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center bg-white flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-brand-emerald flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Upload a photo from your computer or paste an image URL.
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
                id="city-image-file-input"
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
                  placeholder="https://images.unsplash.com/... or /path.jpg"
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
                <span>Quick Preset Photos:</span>
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

        {/* Modal Actions */}
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
