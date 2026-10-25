import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { BRAND } from '../../config/brand';
import { useTranslation } from 'react-i18next';

interface PriceBreakdownProps {
  farePerSeat: number;
  serviceFeePerSeat: number;
  seatsCount: number;
  selectedSeats: string[];
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  farePerSeat,
  serviceFeePerSeat,
  seatsCount,
  selectedSeats,
}) => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const totalFare = farePerSeat * seatsCount;
  const totalServiceFee = serviceFeePerSeat * seatsCount;
  const grandTotal = totalFare + totalServiceFee;
  const currencyLabel = isAmharic ? 'ብር' : BRAND.currency;

  return (
    <div className="bg-white rounded-card p-6 border border-gray-100 shadow-card flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-extrabold text-base text-brand-dark">
          {isAmharic ? 'የዋጋ ዝርዝር' : 'Price Breakdown'}
        </h3>
        <span className="text-xs font-bold text-brand-emerald bg-emerald-50 px-2.5 py-1 rounded-full">
          {isAmharic ? 'ግልጽ የዋጋ ስሌት' : 'Transparent Pricing'}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 text-sm">
        {/* Seats Selected */}
        <div className="flex justify-between items-center text-brand-textMuted">
          <span>{isAmharic ? 'የተመረጡ ወንበሮች' : 'Seats Selected'}</span>
          <span className="font-semibold text-brand-textMain">
            {selectedSeats.join(', ') || (isAmharic ? 'ምንም' : 'None')} ({seatsCount})
          </span>
        </div>

        {/* Official Fare */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-brand-textMain font-medium">
            <span>{isAmharic ? 'ትክክለኛ ታሪፍ' : 'Official Fare'}</span>
            <span className="text-xs text-brand-textMuted">
              ({farePerSeat} {currencyLabel} × {seatsCount})
            </span>
          </div>
          <span className="font-bold text-brand-textMain">
            {totalFare} {currencyLabel}
          </span>
        </div>

        {/* Platform Fee */}
        <div className="flex justify-between items-center text-brand-textMuted">
          <div className="flex items-center gap-1.5">
            <span>{isAmharic ? 'የሲስተም አገልግሎት ክፍያ' : 'Platform Service Fee'}</span>
            <span className="text-xs">
              ({serviceFeePerSeat} {currencyLabel} × {seatsCount})
            </span>
          </div>
          <span className="font-semibold">
            {totalServiceFee} {currencyLabel}
          </span>
        </div>

        {/* Grand Total */}
        <div className="pt-3 mt-1 border-t border-gray-100 flex justify-between items-baseline">
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-brand-dark">
              {isAmharic ? 'አጠቃላይ የሚከፈለው መጠን' : 'Total Amount Due'}
            </span>
            <span className="text-[11px] text-brand-textLight">
              {isAmharic ? 'ሁሉንም ህጋዊ ታክስና ክፍያዎች ያካትታል' : 'Includes all regulatory taxes & fees'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-brand-emerald">
              {grandTotal}
            </span>
            <span className="text-sm font-bold text-brand-emerald ml-1">
              {currencyLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Trust banner */}
      <div className="p-3 rounded-btn bg-emerald-50/60 border border-emerald-100 flex items-start gap-2 text-xs text-emerald-900">
        <ShieldCheck className="w-4 h-4 text-brand-emerald flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold text-brand-emerald">
            {isAmharic ? 'ሕጋዊ የታሪፍ ዋስትና:' : 'Official Fare Protection:'}{' '}
          </strong>
          {isAmharic
            ? 'ሹፌሮች ወይም ረዳቶች ተጨማሪ ክፍያ መጠየቅ አይችሉም። ቦታ ማስያዝዎ በትራንስፖርትና ሎጂስቲክስ ሚኒስቴር መመሪያዎች መሰረት ሙሉ በሙሉ የተጠበቀ ነው።'
            : 'Drivers cannot change or solicit extra fees. Your booking is legally protected under Ministry of Transport guidelines.'}
        </p>
      </div>
    </div>
  );
};
