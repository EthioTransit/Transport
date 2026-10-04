import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'emerald' | 'gold' | 'blue' | 'purple';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  label,
  value,
  subvalue,
  icon: Icon,
  trend,
  colorScheme = 'emerald',
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-brand-emerald',
      border: 'border-emerald-100',
      glow: 'shadow-emerald-500/5',
    },
    gold: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      glow: 'shadow-amber-500/5',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      glow: 'shadow-blue-500/5',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
      glow: 'shadow-purple-500/5',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      className={`bg-white rounded-card p-5 border ${scheme.border} shadow-card hover:shadow-cardHover transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-textMuted uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-black text-brand-dark tracking-tight">
            {value}
          </div>
          {subvalue && (
            <div className="text-xs text-brand-textLight mt-0.5">{subvalue}</div>
          )}
        </div>

        {trend && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
