import React, { useState, useEffect } from 'react';
import { Settings, Server, Shield, Database, Radio, CheckCircle, ExternalLink } from 'lucide-react';
import { BRAND } from '../config/brand';
import { systemApi } from '../api/endpoints';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [serviceFee, setServiceFee] = useState<number>(15);
  const [currency, setCurrency] = useState('ETB');

  useEffect(() => {
    systemApi.checkHealth().then((h) => setHealth(h));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
          <span>Configuration & Infrastructure</span>
        </div>
        <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
          Platform Architecture & Settings
        </h1>
        <p className="text-xs text-brand-textMuted mt-1">
          System parameters, network ports, payment gateway routing, and runtime health status.
        </p>
      </div>

      {/* Network & Port Architecture Card */}
      <div className="bg-white rounded-card p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Server className="w-5 h-5 text-brand-emerald" />
          <h3 className="font-extrabold text-base text-brand-dark">Network & Port Topography</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1">
            <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider">
              Admin Portal (This Console)
            </span>
            <div className="font-mono text-xl font-black">:{BRAND.ports.adminFrontend}</div>
            <p className="text-[11px] text-slate-400">Isolated administrative frontend for operations</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Public Passenger App
            </span>
            <div className="font-mono text-xl font-black text-brand-dark">
              :{BRAND.ports.publicFrontend}
            </div>
            <a
              href={`http://localhost:${BRAND.ports.publicFrontend}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-brand-emerald font-semibold hover:underline flex items-center gap-1"
            >
              <span>Open Passenger App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              Backend REST API
            </span>
            <div className="font-mono text-xl font-black text-brand-dark">
              :{BRAND.ports.backendApi}
            </div>
            <p className="text-[11px] text-gray-500">Express, MongoDB, Auth, Seats Engine</p>
          </div>
        </div>
      </div>

      {/* Live System Health Card */}
      <div className="bg-white rounded-card p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-brand-emerald" />
            <h3 className="font-extrabold text-base text-brand-dark">API Server Health Diagnostics</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {health?.status || 'Online'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 font-semibold block">Service Identifier</span>
            <span className="font-bold text-brand-dark mt-0.5 block">
              {health?.service || 'EthioTransit Transportation Platform API'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 font-semibold block">Server Timestamp</span>
            <span className="font-mono text-gray-600 mt-0.5 block">
              {health?.timestamp ? new Date(health.timestamp).toLocaleString() : new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Parameters Card */}
      <div className="bg-white rounded-card p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Shield className="w-5 h-5 text-brand-gold" />
          <h3 className="font-extrabold text-base text-brand-dark">Fare & Platform Economics</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Standard Platform Service Fee ({BRAND.currency})
            </label>
            <input
              type="number"
              value={serviceFee}
              onChange={(e) => setServiceFee(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Transparent digital processing fee added to each ticket reservation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              System Base Currency
            </label>
            <input
              type="text"
              value={currency}
              disabled
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs bg-gray-50 text-gray-500 font-mono"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Ethiopian Birr (ETB) official legal currency for ticket transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
