import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import { BRAND } from '../config/brand';

export const AdminLoginPage: React.FC = () => {
  const { login, loginAsDemo, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide admin email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSelect = async (role: 'SUPER_ADMIN' | 'ADMIN') => {
    setSubmitting(true);
    setError('');
    try {
      await loginAsDemo(role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-deep to-brand-emerald text-white shadow-xl shadow-brand-emerald/20 mb-4">
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
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ethiotransit.et"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-input text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full mt-2 py-3 px-4 rounded-btn bg-brand-emerald hover:bg-brand-deep text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-brand-emerald/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant 1-Click Demo Login
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BRAND.demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoSelect(account.role as any)}
                  disabled={submitting || isLoading}
                  className="p-3 text-left rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-brand-emerald/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white group-hover:text-brand-emerald transition-colors">
                      {account.badge}
                    </span>
                    <KeyRound className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-emerald transition-colors" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">{account.name}</div>
                  <div className="text-[9px] font-mono text-slate-500 truncate">{account.email}</div>
                </button>
              ))}
            </div>
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
