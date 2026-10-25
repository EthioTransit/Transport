import React from 'react';
import { Users, Minus, Plus } from 'lucide-react';

import { useTranslation } from 'react-i18next';

interface PassengerSelectorProps {
  passengers: number;
  onChange: (count: number) => void;
}

export const PassengerSelector: React.FC<PassengerSelectorProps> = ({ passengers, onChange }) => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (passengers > 1) {
      onChange(passengers - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (passengers < 10) {
      onChange(passengers + 1);
    }
  };

  return (
    <div className="flex-1">
      <label className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">
        {isAmharic ? 'ተጓዦች' : 'Passengers'}
      </label>
      <div className="h-13 px-3 rounded-input bg-gray-50/80 border border-gray-200 flex items-center justify-between hover:bg-white transition-colors">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-brand-emerald" />
          <span className="text-sm font-bold text-brand-textMain">
            {passengers} {isAmharic ? 'ተጓዥ' : passengers === 1 ? 'Passenger' : 'Passengers'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="passenger-decrement-btn"
            onClick={handleDecrement}
            disabled={passengers <= 1}
            aria-label="Decrease passenger count"
            className="w-8 h-8 rounded-btn flex items-center justify-center bg-white border border-gray-200 text-brand-textMain hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-extrabold text-brand-textMain">
            {passengers}
          </span>
          <button
            type="button"
            id="passenger-increment-btn"
            onClick={handleIncrement}
            disabled={passengers >= 10}
            aria-label="Increase passenger count"
            className="w-8 h-8 rounded-btn flex items-center justify-center bg-white border border-gray-200 text-brand-textMain hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
