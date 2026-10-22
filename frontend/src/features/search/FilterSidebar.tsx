import React from 'react';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Operator } from '../../types';
import { useTranslation } from 'react-i18next';

interface FilterSidebarProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceMax: number;
  onPriceMaxChange: (price: number) => void;
  selectedOperator: string;
  onOperatorChange: (opId: string) => void;
  selectedVehicleType: string;
  onVehicleTypeChange: (type: string) => void;
  operators: Operator[];
  onReset: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sortBy,
  onSortChange,
  priceMax,
  onPriceMaxChange,
  selectedOperator,
  onOperatorChange,
  selectedVehicleType,
  onVehicleTypeChange,
  operators,
  onReset,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const content = (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-emerald" />
          <h3 className="font-extrabold text-base text-brand-dark">{isAmharic ? 'ማጣሪያዎች እና ማስተካከያዎች' : 'Filters & Sort'}</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-brand-emerald hover:underline"
        >
          {isAmharic ? 'ሁሉንም አጥፋ' : 'Reset All'}
        </button>
      </div>

      {/* Sorting (Requirement 27) */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-brand-textMuted flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{isAmharic ? 'በቅደም ተከተል አደራድር' : 'Sort By'}</span>
        </label>
        <div className="flex flex-col gap-1.5">
          {[
            { id: 'DEPARTURE_EARLIEST', label: isAmharic ? 'በቅድሚያ የሚነሳ' : 'Earliest Departure' },
            { id: 'PRICE_ASC', label: isAmharic ? 'በአነስተኛ ዋጋ' : 'Lowest Official Fare' },
            { id: 'PRICE_DESC', label: isAmharic ? 'በከፍተኛ ዋጋ' : 'Highest Official Fare' },
            { id: 'DEPARTURE_LATEST', label: isAmharic ? 'በመጨረሻ የሚነሳ' : 'Latest Departure' },
            { id: 'SEATS_AVAILABLE', label: isAmharic ? 'ብዙ ክፍት ወንበሮች' : 'Most Available Seats' },
          ].map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                sortBy === opt.id
                  ? 'bg-emerald-50 text-brand-emerald font-bold'
                  : 'text-brand-textMain hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="sortBy"
                checked={sortBy === opt.id}
                onChange={() => onSortChange(opt.id)}
                className="text-brand-emerald focus:ring-brand-emerald"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Maximum Price Filter */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">
            {isAmharic ? 'ከፍተኛ ዋጋ' : 'Max Price'}
          </label>
          <span className="text-sm font-black text-brand-emerald">
            {priceMax > 0 ? `${priceMax} ETB` : (isAmharic ? 'ማንኛውም' : 'Any')}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="3000"
          step="50"
          value={priceMax || 3000}
          onChange={(e) => onPriceMaxChange(parseInt(e.target.value, 10))}
          className="w-full accent-brand-emerald cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-gray-400">
          <span>100 ETB</span>
          <span>3,000 ETB</span>
        </div>
      </div>

      {/* Operator Filter */}
      {operators.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">
            {isAmharic ? 'የአውቶቡስ ድርጅት' : 'Bus Operator'}
          </label>
          <select
            value={selectedOperator}
            onChange={(e) => onOperatorChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-input border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-brand-emerald"
          >
            <option value="">{isAmharic ? 'ሁሉም ድርጅቶች' : 'All Operators'}</option>
            {operators.map((op) => (
              <option key={op._id} value={op._id}>
                {op.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Vehicle Type */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100">
        <label className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">
          {isAmharic ? 'የተሽከርካሪ ዓይነት' : 'Vehicle Type'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: '', label: isAmharic ? 'ሁሉም ዓይነቶች' : 'All Types' },
            { id: 'Coach', label: isAmharic ? 'አውቶቡስ (ኮች)' : 'Coach' },
            { id: 'Bus', label: isAmharic ? 'አውቶቡስ' : 'Bus' },
            { id: 'Minibus', label: isAmharic ? 'ሚኒባስ' : 'Minibus' }
          ].map((vt) => (
            <button
              key={vt.id}
              type="button"
              onClick={() => onVehicleTypeChange(vt.id)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                selectedVehicleType === vt.id
                  ? 'bg-brand-emerald text-white border-brand-emerald shadow-xs'
                  : 'bg-white text-brand-textMain border-gray-200 hover:border-gray-300'
              }`}
            >
              {vt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0 bg-white rounded-card p-6 border border-gray-100 shadow-card h-fit sticky top-28">
        {content}
      </div>

      {/* Mobile Modal/Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-cardLg p-4 sm:p-6 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto touch-scroll animate-in slide-in-from-bottom duration-200 shadow-2xl safe-area-pb">
            <div className="flex justify-end mb-2">
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {content}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={onCloseMobile}
                className="w-full py-3.5 rounded-btn bg-brand-emerald text-white font-bold text-sm shadow-md hover:bg-brand-deep transition-all text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
