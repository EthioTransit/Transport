import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Ticket, Luggage, User } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { useTranslation } from 'react-i18next';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const navItems = [
    { to: '/', icon: Home, label: isAmharic ? 'መነሻ' : 'Home' },
    { to: '/search', icon: Search, label: isAmharic ? 'ፍለጋ' : 'Search' },
    { to: '/my-tickets', icon: Ticket, label: isAmharic ? 'ቲኬቶች' : 'Tickets' },
    { to: '/my-trips', icon: Luggage, label: isAmharic ? 'ጉዞዎች' : 'Bookings' },
    { to: '/profile', icon: User, label: isAmharic ? 'ፕሮፋይል' : 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-pb">
      <div className="flex items-stretch h-16">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          // For auth-required pages, show login instead
          const href =
            (to === '/my-tickets' || to === '/my-trips' || to === '/profile') && !isAuthenticated
              ? '/login'
              : to;

          return (
            <Link
              key={to}
              to={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative ${
                active ? 'text-brand-emerald' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {active && (
                <span className="absolute top-0 inset-x-2 h-0.5 bg-brand-emerald rounded-full" />
              )}
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] font-bold ${active ? 'text-brand-emerald' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
