import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, Bus, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { useAuth } from '../features/auth/useAuth';
import { Footer } from '../components/common/Footer';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  // State passed from RegisterPage after successful signup
  const locationState = location.state as { successMessage?: string; prefillEmail?: string } | null;
  const [successMessage] = useState<string | null>(locationState?.successMessage || null);

  const [identifier, setIdentifier] = useState(locationState?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login({ email: identifier, password });
      login(res.user, res.accessToken);

      // Role-based redirection
      if (res.user.role === UserRole.SUPER_ADMIN || res.user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else if (res.user.role === UserRole.OPERATOR) {
        navigate('/operator');
      } else if (res.user.role === UserRole.DRIVER) {
        navigate('/driver');
      } else {
        navigate('/passenger');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#FAF8F5]">
      {/* Split-screen Auth Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN: BRAND CINEMATIC PANEL (Deep Emerald with Constellation Network) */}
        <div className="lg:w-1/2 bg-[#031d12] text-white p-6 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-0 lg:min-h-full">
          
          {/* Background Constellation Lines */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <svg viewBox="0 0 800 800" className="w-full h-full object-cover">
              <circle cx="400" cy="400" r="120" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="400" cy="400" r="240" fill="none" stroke="#D9A441" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="400" y1="400" x2="200" y2="200" stroke="#10b981" strokeWidth="1" />
              <line x1="400" y1="400" x2="650" y2="250" stroke="#D9A441" strokeWidth="1" />
              <line x1="400" y1="400" x2="300" y2="600" stroke="#10b981" strokeWidth="1" />
              <line x1="400" y1="400" x2="600" y2="650" stroke="#10b981" strokeWidth="1" />
              
              {[
                { name: 'GONDAR', x: 200, y: 200 },
                { name: 'BAHIR DAR', x: 220, y: 320 },
                { name: 'ADDIS ABABA', x: 400, y: 400, isCenter: true },
                { name: 'DIRE DAWA', x: 650, y: 250 },
                { name: 'JIMMA', x: 300, y: 600 },
                { name: 'HAWASSA', x: 600, y: 650 },
              ].map((node, i) => (
                <g key={i} transform={`translate(${node.x}, ${node.y})`}>
                  <circle r={node.isCenter ? 6 : 4} fill={node.isCenter ? '#D9A441' : '#10b981'} stroke="#ffffff" strokeWidth="1.5" />
                  <text x="10" y="4" fill="#a7f3d0" fontSize="9" fontWeight="700" letterSpacing="1">
                    {node.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Top Logo & Tag */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 sm:mb-10 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform border border-emerald-300/30">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black text-xl tracking-tight text-white">Ethio</span>
                  <span className="font-black text-xl tracking-tight text-emerald-400">Transit</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5"></span>
                </div>
                <span className="text-[9px] uppercase tracking-widest font-black text-emerald-300/80 -mt-1">
                  ETHIOPIAN MOBILITY
                </span>
              </div>
            </Link>

            {/* Section Step Indicator */}
            <div className="text-[11px] font-mono tracking-widest uppercase text-emerald-300/80 font-bold mb-3 sm:mb-4">
              001 / SIGN IN
            </div>

            {/* Headline matching user image */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.12]">
              <span className="font-serif text-white">Travel Ethiopia, </span>
              <br />
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#F4D58D] via-[#f7e4a8] to-[#D9A441] drop-shadow-md">
                with confidence.
              </span>
            </h1>

            <p className="mt-3 sm:mt-4 text-emerald-100/80 text-xs sm:text-base leading-relaxed max-w-md font-medium">
              Book verified bus tickets with atomic seat reservation locks and official government-aligned fares across Ethiopia.
            </p>
          </div>

          {/* Feature List (Bottom Left) - shown on sm+ */}
          <div className="hidden sm:block relative z-10 space-y-4 pt-10 border-t border-emerald-900/60 mt-8 text-xs font-bold tracking-wider text-emerald-100 uppercase">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300">
                <Bus className="w-4 h-4" />
              </div>
              <span>50+ Certified Bus Companies</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Secure Telebirr & CBE Birr Payments</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300">
                <Clock className="w-4 h-4" />
              </div>
              <span>24/7 Digital Boarding Support</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AUTHENTICATION FORM (Clean Warm Light Theme) */}
        <div className="lg:w-1/2 p-5 sm:p-12 lg:p-16 flex flex-col justify-center max-w-2xl mx-auto w-full">
          
          {/* Subheader */}
          <div className="mb-6 sm:mb-8">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              WELCOME BACK
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-brand-dark tracking-tight mt-2.5 sm:mt-3">
              Sign in
            </h2>
            <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
              Continue to your EthioTransit travel or management account
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span>✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-status-error text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}


          {/* Main Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Email / Phone Identifier */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  id="login-identifier-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="0911 234 567 or +251 911 234 567"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-dark">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 my-1">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-xs font-medium text-brand-textMuted cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#07472c] to-[#0a5c39] hover:from-[#0a5c39] hover:to-[#07472c] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* OPERATOR / BUS COMPANY NOTICE BOX (Matching exact layout from user image) */}
          <div className="mt-8 p-4 rounded-xl bg-[#F7EFE3] border border-[#E8DCB9] text-xs text-[#523e1f]">
            <div className="font-extrabold text-[#382b13] mb-1">
              Bus Companies: <span className="font-medium text-[#5e4b2d]">Contact EthioTransit support to register your fleet or operator account.</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 font-bold text-[11px] text-[#423118]">
              <span>📧 Email: support@ethiotransit.et</span>
              <span>📱 Phone: +251 911 234 567</span>
            </div>
          </div>

          {/* Footer Link to Register */}
          <div className="mt-8 text-center text-xs text-brand-textMuted font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-800 hover:text-emerald-950 underline transition-colors">
              Create account
            </Link>
          </div>

        </div>

      </div>

      {/* Platform Rich Footer (Attached from reference image) */}
      <Footer />
    </div>
  );
};
