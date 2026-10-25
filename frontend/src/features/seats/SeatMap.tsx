import React from 'react';
import { Armchair, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SeatItem, SeatStatus } from '../../types';

interface SeatMapProps {
  seats: SeatItem[];
  selectedSeatNumbers: string[];
  onToggleSeat: (seatNumber: string) => void;
  maxSelectable: number;
  isDeparted?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatNumbers,
  onToggleSeat,
  maxSelectable,
  isDeparted = false,
}) => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

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
          <span>{isAmharic ? 'የአውቶቡስ ፊት' : 'FRONT OF BUS'}</span>
        </div>

        {/* Driver Cabin */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-btn bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
          <div className="w-4 h-4 rounded-full border-2 border-gray-700 flex items-center justify-center text-[10px]">
            D
          </div>
          <span>{isAmharic ? 'የሹፌር ክፍል' : 'Driver Cabin'}</span>
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
          {isAmharic ? 'የአውቶቡስ የኋላ ክፍል' : 'Rear of Vehicle'}
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

    const canSelect = !isDeparted && (isAvailable || isSelected) && !isBooked && !isBlocked && !isReserved;

    let style = 'bg-white border-2 border-gray-200 text-brand-textMain hover:border-brand-emerald hover:bg-emerald-50/50 hover:scale-105 shadow-xs cursor-pointer active:scale-95';

    if (isDeparted) {
      if (isBooked) {
        style = 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed pointer-events-none opacity-80 select-none';
      } else {
        style = 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed pointer-events-none opacity-60 select-none';
      }
    } else if (isSelected) {
      style = 'bg-brand-emerald border-brand-emerald text-white font-extrabold shadow-md shadow-brand-emerald/30 scale-105 cursor-pointer z-10';
    } else if (isBooked) {
      style = 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed pointer-events-none opacity-80 select-none';
    } else if (isReserved) {
      style = 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed pointer-events-none opacity-85 select-none';
    } else if (isBlocked) {
      style = 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed pointer-events-none opacity-70 select-none';
    }

    const isLockedSeat = isBooked || isReserved || isBlocked || isDeparted;

    return (
      <button
        key={seat.seatNumber}
        type="button"
        id={`seat-btn-${seat.seatNumber}`}
        disabled={!canSelect}
        aria-disabled={!canSelect}
        tabIndex={canSelect ? 0 : -1}
        onClick={(e) => {
          if (!canSelect) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onToggleSeat(seat.seatNumber);
        }}
        className={`w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-btn flex flex-col items-center justify-center transition-all duration-150 relative shrink-0 select-none ${style}`}
        title={
          isDeparted
            ? isAmharic
              ? `ወንበር ${seat.seatNumber} - ጉዞው ተነስቷል (ቦታ ማስያዝ ተዘግቷል)`
              : `Seat ${seat.seatNumber} - Journey Departed (Reservations Closed)`
            : isBooked
            ? isAmharic
              ? `ወንበር ${seat.seatNumber} - የተሸጠ ወንበር`
              : `Seat ${seat.seatNumber} - Permanently Booked`
            : isReserved
            ? isAmharic
              ? `ወንበር ${seat.seatNumber} - በሌላ ተጓዥ ተይዟል`
              : `Seat ${seat.seatNumber} - Reserved by another passenger`
            : isBlocked
            ? isAmharic
              ? `ወንበር ${seat.seatNumber} - የታገደ`
              : `Seat ${seat.seatNumber} - Blocked`
            : isAmharic
            ? `ወንበር ${seat.seatNumber} - ክፍት ወንበር`
            : `Seat ${seat.seatNumber} (${seat.seatType}) - Available`
        }
      >
        <span className="text-[10px] sm:text-[11px] font-black">{seat.seatNumber}</span>
        {isLockedSeat && (
          <Lock className="w-2.5 h-2.5 absolute top-1 right-1 opacity-60 text-current" />
        )}
      </button>
    );
  }
};
