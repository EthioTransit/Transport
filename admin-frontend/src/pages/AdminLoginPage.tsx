import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export const AdminLoginPage: React.FC = () => {
  const { login, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your admin email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        {/* EthioTransit Brand Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-deep to-brand-emerald text-white shadow-xl shadow-brand-emerald/20 mb-4 border border-emerald-400/20">
          <Bus className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          EthioTransit Console
        </h1>
        <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto">
          Centralized Platform Administration, Fleet Monitoring & Dynamic Route Governance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-8 shadow-2xl rounded-cardLg border border-slate-800">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  id="admin-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ethiotransit.et"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-emerald transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700 rounded-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-emerald transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="admin-login-submit-btn"
              disabled={submitting || isLoading}
              className="w-full mt-3 py-3 px-4 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-brand-emerald/20 flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security & Access Information */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center gap-2.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>Single designated administrator console. Access requires authorized credentials.</span>
          </div>
        </div>

        {/* Port indicator footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          Running on dedicated port <span className="font-mono text-brand-emerald font-bold">:{BRAND.ports.adminFrontend}</span> • EthioTransit Platform v{BRAND.platformVersion}
        </div>
      </div>
    </div>
  );
};
