import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bus, Menu, X, User, Ticket, LogOut, LayoutDashboard, Shield, Navigation } from 'lucide-react';
import { BRAND } from '../../config/brand';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../../features/auth/useAuth';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation(['navigation', 'common']);
  const isAmharic = i18n.language === 'am';
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('navigation:home') },
    { to: '/search', label: t('navigation:searchTrips') },
    { to: '/my-trips', label: isAmharic ? 'የእኔ ጉዞዎች' : 'My Bookings' },
    { to: '/my-tickets', label: t('navigation:myTickets') },
    { to: '/help', label: isAmharic ? 'እርዳታ' : 'Help' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) return '/admin';
    if (user.role === UserRole.OPERATOR) return '/operator';
    if (user.role === UserRole.DRIVER) return '/driver';
    return '/passenger';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#031d12]/95 backdrop-blur-md border-b border-emerald-900/50 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform duration-200 border border-emerald-300/30 shrink-0">
              <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-white">
                  Ethio
                </span>
                <span className="font-black text-xl sm:text-2xl tracking-tight text-emerald-400">
                  Transit
                </span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 ml-0.5 animate-pulse"></span>
              </div>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-black text-emerald-300/80 -mt-0.5 sm:-mt-1">
                ETHIOPIAN MOBILITY
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive(link.to)
                    ? 'text-white bg-emerald-900/80 border border-emerald-500/40 shadow-sm'
                    : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/40'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Controls (Language & Auth) */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher isDarkBg={true} />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-900/80 text-white hover:bg-emerald-800 border border-emerald-500/30 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>
                    {user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN
                      ? t('navigation:admin')
                      : user.role === UserRole.OPERATOR
                      ? t('navigation:operator')
                      : user.role === UserRole.DRIVER
                      ? t('navigation:driver')
                      : t('navigation:dashboard')}
                  </span>
                </Link>
                <Link
                  to="/profile"
                  title="My Profile"
                  className="w-9 h-9 rounded-xl bg-brand-emerald/80 hover:bg-brand-emerald border border-emerald-400/30 flex items-center justify-center text-white text-xs font-black transition-colors"
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  title={t('navigation:logout')}
                  className="p-2 rounded-xl text-emerald-200/70 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-emerald-100 hover:text-white transition-colors"
                >
                  {t('navigation:login')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md shadow-emerald-950/50 hover:shadow-lg transition-all"
                >
                  {t('navigation:signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Language & Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher isDarkBg={true} />
            <button
              type="button"
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-emerald-900/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-16 sm:top-20 bg-black/60 backdrop-blur-xs z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bg-white border-b border-gray-200 shadow-2xl p-4 sm:p-6 z-50 animate-in slide-in-from-top-4 duration-200 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 sm:py-3 rounded-btn text-base font-semibold transition-colors ${
                    isActive(link.to)
                      ? 'bg-emerald-50 text-brand-emerald'
                      : 'text-brand-textMain hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

            <div className="my-3 border-t border-gray-100 pt-3">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2">
                  <div className="px-4 py-2 text-xs font-semibold text-brand-textLight uppercase tracking-wider">
                    Logged in as {user.firstName} ({user.role})
                  </div>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-btn bg-emerald-50 text-brand-emerald font-semibold"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-btn text-brand-textMain hover:bg-gray-50 font-medium"
                  >
                    <User className="w-5 h-5 text-brand-textMuted" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-btn text-status-error hover:bg-red-50 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('navigation:logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-btn text-brand-textMain font-semibold border border-gray-200 hover:bg-gray-50"
                  >
                    {t('navigation:login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-btn text-white bg-brand-emerald font-semibold shadow-md"
                  >
                    {t('navigation:signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </header>
  );
};
