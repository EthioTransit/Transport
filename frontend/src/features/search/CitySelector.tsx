import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { citiesApi } from '../../api/endpoints';
import { City } from '../../types';

interface CitySelectorProps {
  label: string;
  placeholder: string;
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
  disabledCityCode?: string;
  error?: string;
  idPrefix: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  label,
  placeholder,
  selectedCity,
  onSelectCity,
  disabledCityCode,
  error,
  idPrefix,
}) => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    let active = true;
    const fetchCities = async () => {
      setLoading(true);
      try {
        const results = await citiesApi.search(searchQuery);
        if (active) {
          setCities(results);
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchCities, searchQuery ? 250 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">
        {label}
      </label>

      <button
        type="button"
        id={`${idPrefix}-selector-btn`}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-13 px-4 rounded-input bg-gray-50/80 border text-left flex items-center justify-between transition-all duration-150 ${
          error
            ? 'border-status-error ring-1 ring-status-error/30'
            : isOpen
            ? 'border-brand-emerald ring-2 ring-brand-emerald/20 bg-white'
            : 'border-gray-200 hover:border-gray-300 hover:bg-white'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <MapPin className={`w-5 h-5 flex-shrink-0 ${selectedCity ? 'text-brand-emerald' : 'text-gray-400'}`} />
          {selectedCity ? (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-brand-textMain truncate">
                {isAmharic && selectedCity.amharicName ? selectedCity.amharicName : selectedCity.name}
              </span>
              <span className="text-[11px] text-brand-textMuted truncate">
                {selectedCity.region} • {selectedCity.code}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && <p className="mt-1 text-xs text-status-error">{error}</p>}

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-card shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              id={`${idPrefix}-search-input`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAmharic ? 'ከተማ ይፈልጉ (ምሳሌ፡ አዲስ አበባ፣ ባህር ዳር)...' : 'Search departure city...'}
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-sm rounded-input border border-gray-200 focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400">
                {isAmharic ? 'ከተሞችን በመጫን ላይ...' : 'Loading cities...'}
              </div>
            ) : cities.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                {isAmharic ? 'ምንም የሚመሳሰል ከተማ አልተገኘም' : 'No matching cities found'}
              </div>
            ) : (
              cities.map((city) => {
                const isDisabled = Boolean(disabledCityCode && (city.code === disabledCityCode || city._id === disabledCityCode));
                const isSelected = selectedCity?._id === city._id;
                const primaryName = isAmharic && city.amharicName ? city.amharicName : city.name;
                const secondaryName = isAmharic && city.amharicName ? city.name : city.amharicName;

                return (
                  <button
                    key={city._id}
                    id={`${idPrefix}-option-${city.code}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onSelectCity(city);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between rounded-lg transition-colors ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-gray-50'
                        : isSelected
                        ? 'bg-emerald-50 text-brand-emerald'
                        : 'hover:bg-gray-50 text-brand-textMain'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{primaryName}</span>
                        {secondaryName && (
                          <span className="text-xs text-brand-textLight">({secondaryName})</span>
                        )}
                      </div>
                      <span className="text-xs text-brand-textMuted">
                        {city.region} {isAmharic ? 'ክልል' : 'Region'} {city.terminalName ? `• ${city.terminalName}` : ''}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-emerald" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
