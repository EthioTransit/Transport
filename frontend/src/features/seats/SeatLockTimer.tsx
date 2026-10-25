import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SeatLockTimerProps {
  expiresAt: string | Date;
  onExpire: () => void;
}

export const SeatLockTimer: React.FC<SeatLockTimerProps> = ({ expiresAt, onExpire }) => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const calculate = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setSecondsLeft(diff);

      if (diff <= 0) {
        onExpire();
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 180; // under 3 minutes

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-card transition-colors ${
        isUrgent
          ? 'bg-red-50 border border-red-200 text-status-error animate-pulse'
          : 'bg-amber-50 border border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isUrgent ? (
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <Timer className="w-5 h-5 flex-shrink-0 text-brand-gold" />
        )}
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider">
            {isAmharic ? 'የወንበር ማስያዣ ሰዓት ገደብ' : 'Seat Reservation Timeout'}
          </span>
          <span className="text-xs opacity-90">
            {isAmharic
              ? 'ወንበሮቹ ለሌሎች ተጓዦች ክፍት ከመደረጋቸው በፊት ክፍያውን ያጠናቅቁ።'
              : 'Complete checkout before the seats are released back to other travelers.'}
          </span>
        </div>
      </div>

      <div className="font-mono font-black text-lg sm:text-xl pl-4">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};
