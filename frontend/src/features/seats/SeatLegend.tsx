import React from 'react';
import { Lock } from 'lucide-react';

export const SeatLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4 bg-gray-50/80 rounded-card border border-gray-100 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white" />
        <span className="font-semibold text-brand-textMain">Available</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-brand-emerald text-white flex items-center justify-center text-[10px] font-bold shadow-xs" />
        <span className="font-semibold text-brand-textMain">Your Selection</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center text-[10px] font-bold relative">
          <Lock className="w-2.5 h-2.5" />
        </div>
        <span className="font-semibold text-amber-800">Reserved (Locked)</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-gray-100 border border-gray-300 text-gray-500 flex items-center justify-center text-[10px] font-bold relative">
          <Lock className="w-2.5 h-2.5" />
        </div>
        <span className="font-semibold text-gray-500">Booked (Unclickable)</span>
      </div>
    </div>
  );
};
