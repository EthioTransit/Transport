import React from 'react';
import { Calendar } from 'lucide-react';

interface QuickDateCardsProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  operatingDays?: string[];
}

export const QuickDateCards: React.FC<QuickDateCardsProps> = ({
  selectedDate,
  onSelectDate,
  operatingDays,
}) => {
  // Dynamically calculate the next 7 days starting from today
  const today = new Date();
  const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const days = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(today);
    d.setDate(d.getDate() + index);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const isoString = `${year}-${month}-${day}`;

    const monthShort = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const weekdayName = dayOfWeekNames[d.getDay()];
    const dayName =
      index === 0
        ? 'Today'
        : index === 1
        ? 'Tomorrow'
        : d.toLocaleString('en-US', { weekday: 'short' });

    const isOperating =
      !operatingDays ||
      operatingDays.length === 0 ||
      operatingDays.length === 7 ||
      operatingDays.includes('Daily') ||
      operatingDays.includes(weekdayName);

    return {
      iso: isoString,
      dayNum: day,
      month: monthShort,
      label: dayName,
      weekday: weekdayName,
      isOperating,
    };
  });

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {days.map((item) => {
        const isSelected = selectedDate === item.iso;
        return (
          <button
            key={item.iso}
            type="button"
            id={`quick-date-${item.iso}`}
            onClick={() => onSelectDate(item.iso)}
            className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[82px] py-2 px-3 rounded-btn border text-center transition-all duration-150 relative ${
              isSelected
                ? 'bg-brand-emerald text-white border-brand-emerald shadow-md shadow-brand-emerald/20 font-bold scale-[1.02]'
                : item.isOperating
                ? 'bg-white text-brand-textMain border-gray-200 hover:border-brand-emerald/50 hover:bg-emerald-50/40'
                : 'bg-gray-50/70 text-gray-400 border-dashed border-gray-200 opacity-60 hover:opacity-100'
            }`}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                isSelected ? 'text-emerald-100' : 'text-brand-textMuted'
              }`}
            >
              {item.label}
            </span>
            <span className="text-base font-extrabold leading-tight">{item.dayNum}</span>
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] font-medium tracking-wider ${
                  isSelected ? 'text-white/80' : 'text-brand-textLight'
                }`}
              >
                {item.month}
              </span>
              {operatingDays && operatingDays.length > 0 && operatingDays.length < 7 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.isOperating
                      ? isSelected
                        ? 'bg-white'
                        : 'bg-brand-emerald'
                      : 'bg-gray-300'
                  }`}
                  title={item.isOperating ? 'Bus service active' : 'No service today'}
                />
              )}
            </div>
            {operatingDays && operatingDays.length > 0 && operatingDays.length < 7 && !item.isOperating && (
              <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Off day</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
