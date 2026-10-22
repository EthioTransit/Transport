import React from 'react';
import { User, Phone, CreditCard, Shield } from 'lucide-react';
import { PassengerInfo } from '../../types';

interface PassengerFormProps {
  seats: string[];
  passengers: PassengerInfo[];
  onChange: (index: number, field: keyof PassengerInfo, value: string) => void;
  errors: Record<string, string>;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  seats,
  passengers,
  onChange,
  errors,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {seats.map((seatNumber, index) => {
        const passenger = passengers[index] || {
          name: '',
          phone: '',
          seatNumber,
          ageGroup: 'ADULT',
          idNumber: '',
        };

        const nameError = errors[`passenger_${index}_name`];
        const phoneError = errors[`passenger_${index}_phone`];

        return (
          <div
            key={seatNumber}
            className="bg-white rounded-card p-4 sm:p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-brand-emerald flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <h4 className="font-extrabold text-base text-brand-textMain">
                  Passenger for Seat {seatNumber}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-brand-emerald">
                Seat {seatNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">
                  Full Name (as on ID) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    id={`passenger-${index}-name`}
                    placeholder="e.g. Almaz Ayana"
                    value={passenger.name}
                    onChange={(e) => onChange(index, 'name', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-input text-sm border focus:outline-none ${
                      nameError
                        ? 'border-status-error bg-red-50/20'
                        : 'border-gray-200 focus:border-brand-emerald'
                    }`}
                  />
                </div>
                {nameError && <p className="mt-1 text-xs text-status-error">{nameError}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">
                  Phone Number (Ethiopian format) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    id={`passenger-${index}-phone`}
                    placeholder="0911234567 or +251911234567"
                    value={passenger.phone}
                    onChange={(e) => onChange(index, 'phone', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-input text-sm border focus:outline-none ${
                      phoneError
                        ? 'border-status-error bg-red-50/20'
                        : 'border-gray-200 focus:border-brand-emerald'
                    }`}
                  />
                </div>
                {phoneError && <p className="mt-1 text-xs text-status-error">{phoneError}</p>}
              </div>

              {/* Age Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">
                  Age Category
                </label>
                <select
                  value={passenger.ageGroup}
                  onChange={(e) => onChange(index, 'ageGroup', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-input text-sm border border-gray-200 bg-white focus:outline-none focus:border-brand-emerald"
                >
                  <option value="ADULT">Adult (12+ years)</option>
                  <option value="CHILD">Child (under 12 years)</option>
                </select>
              </div>

              {/* National ID / Passport */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted mb-1.5">
                  National ID / Kebele / Passport (Optional)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. FAYDA-8921"
                    value={passenger.idNumber || ''}
                    onChange={(e) => onChange(index, 'idNumber', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-input text-sm border border-gray-200 focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
