import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase();

  let style = 'bg-gray-100 text-gray-700 border-gray-200';

  if (['ACTIVE', 'CONFIRMED', 'COMPLETED', 'USED', 'ISSUED', 'VALID_TICKET'].includes(normalized)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['PENDING', 'SCHEDULED', 'BOARDING'].includes(normalized)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (['IN_TRANSIT'].includes(normalized)) {
    style = 'bg-blue-50 text-blue-700 border-blue-200/80';
  } else if (['CANCELLED', 'SUSPENDED', 'FAILED', 'EXPIRED', 'INACTIVE'].includes(normalized)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200/80';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border ${sizeClasses} ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
