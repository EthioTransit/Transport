import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, Search } from 'lucide-react';
import { CitySelector } from './CitySelector';
import { QuickDateCards } from './QuickDateCards';
import { PassengerSelector } from './PassengerSelector';
import { City } from '../../types';
import { useTranslation } from 'react-i18next';

interface SearchCardProps {
  initialFrom?: City | null;
  initialTo?: City | null;
  initialDate?: string;
  initialPassengers?: number;
  compact?: boolean;
}

export const SearchCard: React.FC<SearchCardProps> = ({
  initialFrom = null,
  initialTo = null,
  initialDate = new Date().toISOString().split('T')[0],
  initialPassengers = 1,
  compact = false,
}) => {
  const navigate = useNavigate();

  const [fromCity, setFromCity] = useState<City | null>(initialFrom);
  const [toCity, setToCity] = useState<City | null>(initialTo);
  const [travelDate, setTravelDate] = useState<string>(initialDate);
  const [passengers, setPassengers] = useState<number>(initialPassengers);
  const [errors, setErrors] = useState<{ from?: string; to?: string; date?: string }>({});
  const [isSwapping, setIsSwapping] = useState(false);
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  // Swap animation and state
  const handleSwapCities = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const temp = fromCity;
      setFromCity(toCity);
      setToCity(temp);
      setIsSwapping(false);
    }, 150);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { from?: string; to?: string; date?: string } = {};

    if (!fromCity) {
      newErrors.from = isAmharic ? 'እባክዎ መነሻ ከተማ ይምረጡ።' : 'Please select your departure city.';
    }
    if (!toCity) {
      newErrors.to = isAmharic ? 'እባክዎ መድረሻ ከተማ ይምረጡ።' : 'Please select your arrival city.';
    }
    if (fromCity && toCity && fromCity._id === toCity._id) {
      newErrors.to = isAmharic
        ? 'መነሻ እና መድረሻ ከተሞች አንድ አይነት መሆን አይችሉም።'
        : 'Departure and arrival cities cannot be the same.';
    }
    if (!travelDate) {
      newErrors.date = isAmharic ? 'እባክዎ የጉዞ ቀን ይምረጡ።' : 'Please select a travel date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const params = new URLSearchParams({
      from: fromCity!.code,
      to: toCity!.code,
      date: travelDate,
      passengers: passengers.toString(),
    });

    navigate(`/search?${params.toString()}`);
  };

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-cardLg shadow-2xl border border-gray-100 p-3.5 sm:p-6 md:p-8 transition-all ${
        compact ? 'shadow-md border-gray-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3.5 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-brand-dark tracking-tight">
            {isAmharic ? 'በኢትዮጵያ ውስጥ ምርጥ መስመሮችን ያግኙ' : 'Find the best routes across Ethiopia'}
          </h2>
          <p className="text-xs md:text-sm text-brand-textMuted mt-0.5">
            {isAmharic 
              ? 'በመንግስት ታሪፍ የተረጋገጡ ወንበሮችን እና ዲጂታል ኪውአር ቲኬቶችን ያስይዙ።' 
              : 'Book verified seats with transparent government-aligned fares and digital QR tickets.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3.5 sm:gap-5">
        {/* Main Grid: From | Swap | To | Date | Passengers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-start">
          {/* From City */}
          <div className="md:col-span-3">
            <CitySelector
              idPrefix="from-city"
              label={isAmharic ? 'መነሻ' : 'From'}
              placeholder={isAmharic ? 'መነሻ ከተማ' : 'Departure city'}
              selectedCity={fromCity}
              onSelectCity={(city) => {
                setFromCity(city);
                setErrors((prev) => ({ ...prev, from: undefined }));
              }}
              disabledCityCode={toCity?.code}
              error={errors.from}
            />
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-center justify-center -my-1.5 md:my-0 pt-0 md:pt-6">
            <button
              type="button"
              id="swap-cities-btn"
              onClick={handleSwapCities}
              title="Swap departure and arrival cities"
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-gray-200 bg-white hover:bg-emerald-50 hover:border-brand-emerald text-brand-emerald flex items-center justify-center shadow-xs transition-all duration-200 z-10 ${
                isSwapping ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 rotate-90 md:rotate-0 transition-transform" />
            </button>
          </div>

          {/* To City */}
          <div className="md:col-span-3">
            <CitySelector
              idPrefix="to-city"
              label={isAmharic ? 'መድረሻ' : 'To'}
              placeholder={isAmharic ? 'መድረሻ ከተማ' : 'Arrival city'}
              selectedCity={toCity}
              onSelectCity={(city) => {
                setToCity(city);
                setErrors((prev) => ({ ...prev, to: undefined }));
              }}
              disabledCityCode={fromCity?.code}
              error={errors.to}
            />
          </div>

          {/* Travel Date */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">
              {isAmharic ? 'ቀን' : 'Date'}
            </label>
            <div className="relative">
              <input
                type="date"
                id="travel-date-input"
                min={todayIso}
                value={travelDate}
                onChange={(e) => {
                  setTravelDate(e.target.value);
                  setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={`w-full h-12 sm:h-13 px-3.5 rounded-input bg-gray-50/80 border text-sm font-semibold text-brand-textMain focus:bg-white focus:outline-none transition-colors ${
                  errors.date ? 'border-status-error' : 'border-gray-200 focus:border-brand-emerald'
                }`}
              />
            </div>
            {errors.date && <p className="mt-1 text-xs text-status-error">{errors.date}</p>}
          </div>

          {/* Passenger Selector */}
          <div className="md:col-span-3">
            <PassengerSelector passengers={passengers} onChange={setPassengers} />
          </div>
        </div>

        {/* Quick Date Shortcuts (Requirement 21) */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-brand-textLight mb-1.5 sm:mb-2">
              {isAmharic ? 'ቀን በፍጥነት ይምረጡ:' : 'Select Quick Date:'}
            </span>
            <QuickDateCards selectedDate={travelDate} onSelectDate={setTravelDate} />
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0 pt-1 sm:pt-4">
            <button
              type="submit"
              id="search-trips-submit-btn"
              className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-emerald/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Search className="w-5 h-5" />
              <span>{isAmharic ? 'ጉዞዎችን ፈልግ' : 'Search Trips'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
