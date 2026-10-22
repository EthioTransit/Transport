import React from 'react';
import { Armchair } from 'lucide-react';
import { SeatItem, SeatStatus } from '../../types';

interface SeatMapProps {
  seats: SeatItem[];
  selectedSeatNumbers: string[];
  onToggleSeat: (seatNumber: string) => void;
  maxSelectable: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatNumbers,
  onToggleSeat,
  maxSelectable,
}) => {
  // Group seats by row
  const rowMap = new Map<number, SeatItem[]>();
  seats.forEach((seat) => {
    const list = rowMap.get(seat.row) || [];
    list.push(seat);
    rowMap.set(seat.row, list);
  });

  const sortedRows = Array.from(rowMap.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="bg-white rounded-cardLg p-3.5 sm:p-6 md:p-8 border border-gray-100 shadow-card max-w-md mx-auto">
      {/* Front Bus Indicator */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-dashed border-gray-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-textMuted">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-ping" />
          <span>FRONT OF BUS</span>
        </div>

        {/* Driver Cabin */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-btn bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
          <div className="w-4 h-4 rounded-full border-2 border-gray-700 flex items-center justify-center text-[10px]">
            D
          </div>
          <span>Driver Cabin</span>
        </div>
      </div>

      {/* Seats Container */}
      <div className="flex flex-col gap-3">
        {sortedRows.map(([rowNum, rowSeats]) => {
          // Sort seats by column
          const cols = rowSeats.sort((a, b) => a.column - b.column);
          const leftSide = cols.filter((s) => s.column <= 2);
          const rightSide = cols.filter((s) => s.column > 2);

          return (
            <div key={rowNum} className="flex items-center justify-between gap-4">
              {/* Left Side (Columns 1 & 2) */}
              <div className="flex items-center gap-2">
                {leftSide.map((seat) => renderSeatButton(seat))}
              </div>

              {/* Aisle */}
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[10px] font-mono text-gray-300 font-bold">
                  {rowNum}
                </span>
              </div>

              {/* Right Side (Columns 3 & 4) */}
              <div className="flex items-center gap-2">
                {rightSide.map((seat) => renderSeatButton(seat))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back Bus Line */}
      <div className="mt-8 pt-4 border-t border-gray-100 text-center">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
          Rear of Vehicle
        </span>
      </div>
    </div>
  );

  function renderSeatButton(seat: SeatItem) {
    const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
    const isAvailable = seat.status === SeatStatus.AVAILABLE;
    const isBooked = seat.status === SeatStatus.BOOKED;
    const isBlocked = seat.status === SeatStatus.BLOCKED;
    const isReserved = seat.status === SeatStatus.RESERVED && !seat.isMine;

    const canSelect = isAvailable || isSelected;

    let style = 'bg-white border-2 border-gray-200 text-brand-textMain hover:border-brand-emerald hover:bg-emerald-50/50 shadow-xs';

    if (isSelected) {
      style = 'bg-brand-emerald border-brand-emerald text-white font-extrabold shadow-md shadow-brand-emerald/30 scale-105';
    } else if (isBooked) {
      style = 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed';
    } else if (isReserved) {
      style = 'bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed';
    } else if (isBlocked) {
      style = 'bg-red-100 border-red-200 text-red-400 cursor-not-allowed';
    }

    return (
      <button
        key={seat.seatNumber}
        type="button"
        id={`seat-btn-${seat.seatNumber}`}
        disabled={!canSelect}
        onClick={() => onToggleSeat(seat.seatNumber)}
        className={`w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-btn flex flex-col items-center justify-center transition-all duration-150 relative shrink-0 ${style}`}
        title={`Seat ${seat.seatNumber} (${seat.seatType}) - ${seat.status}`}
      >
        <span className="text-[10px] sm:text-[11px] font-black">{seat.seatNumber}</span>
      </button>
    );
  }
};
