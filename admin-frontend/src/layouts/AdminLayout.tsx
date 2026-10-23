import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Route as RouteIcon,
  Bus,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  Search,
  LogOut,
  ShieldCheck,
  Activity,
  Menu,
  X,
  Clock,
  Layers,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';
import { systemApi } from '../api/endpoints';
import { GlobalSearchModal } from '../features/GlobalSearchModal';

export const AdminLayout: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Ethiopian Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Africa/Addis_Ababa',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ping backend status
  useEffect(() => {
    const checkServer = async () => {
      const health = await systemApi.checkHealth();
      setBackendStatus(health?.status === 'healthy' ? 'online' : 'offline');
    };
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Cities & Terminals', path: '/cities', icon: Building2 },
    { label: 'Intercity Routes', path: '/routes', icon: RouteIcon },
    { label: 'Bus Operators', path: '/operators', icon: Building2 },
    { label: 'Fleet & Buses', path: '/vehicles', icon: Bus },
    { label: 'Users & Access', path: '/users', icon: Users },
    { label: 'Trips & Schedules', path: '/trips', icon: Calendar },
    { label: 'Bookings Ledger', path: '/bookings', icon: Layers },
    { label: 'Financials & Payments', path: '/payments', icon: CreditCard },
    { label: 'Audit Trail', path: '/audit', icon: FileText },
    { label: 'Platform Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside
        className={`bg-brand-slate text-slate-300 flex flex-col transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-deep to-brand-emerald flex items-center justify-center text-white font-black shadow-md flex-shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="leading-tight">
                <span className="font-black text-white text-base tracking-tight flex items-center gap-1.5">
                  EthioTransit
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 font-bold">
                    Admin
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Operations Console
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-emerald text-white shadow-sm shadow-brand-emerald/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Port & Switcher Badge Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40">
          {sidebarOpen ? (
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Console Port</span>
                <span className="font-mono font-bold text-brand-emerald">:{BRAND.ports.adminFrontend}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-1">
                <span>Public App</span>
                <a
                  href={`http://localhost:${BRAND.ports.publicFrontend}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-slate-300 hover:text-brand-emerald flex items-center gap-1"
                >
                  :{BRAND.ports.publicFrontend}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center font-mono text-[10px] text-brand-emerald font-bold">
              :{BRAND.ports.adminFrontend}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200/80 px-3 sm:px-6 flex items-center justify-between z-20 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Search Bar */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-input bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-400 transition-colors w-72"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span>Quick Search Bookings, Tickets...</span>
              <kbd className="ml-auto font-mono text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Addis Ababa Time */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-mono font-medium text-gray-600">
              <Clock className="w-3.5 h-3.5 text-brand-emerald" />
              <span>{currentTime} EAT (Addis Ababa)</span>
            </div>

            {/* Backend Connectivity Status */}
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'offline'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] text-gray-600 font-medium hidden sm:inline">
                {backendStatus === 'online' ? 'API Online' : backendStatus === 'offline' ? 'API Offline' : 'Connecting...'}
              </span>
            </div>

            {/* Admin User Profile Chip */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-brand-dark truncate max-w-[120px]">
                  {user ? `${user.firstName} ${user.lastName}` : 'Administrator'}
                </div>
                <div className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </div>
              </div>

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs border border-slate-700 shrink-0">
                {user?.firstName?.[0] || 'A'}
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out of Console"
                className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 max-w-[80vw] h-full bg-brand-slate text-slate-300 p-4 flex flex-col safe-area-pb shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Console Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 space-y-1 overflow-y-auto touch-scroll">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-emerald text-white font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-btn text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors mt-auto pt-3 border-t border-slate-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
};
