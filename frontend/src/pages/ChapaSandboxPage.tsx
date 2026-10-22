import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, CreditCard, Smartphone, Building2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { BRAND } from '../config/brand';

export const ChapaSandboxPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ref = searchParams.get('ref') || `ET-CHP-${Date.now()}`;
  const amount = searchParams.get('amount') || '650';
  const name = searchParams.get('name') || 'Valued Passenger';
  const email = searchParams.get('email') || 'passenger@ethiotransit.et';
  const phone = searchParams.get('phone') || '0911000000';

  const [selectedMethod, setSelectedMethod] = useState<'card' | 'telebirr' | 'cbe'>('telebirr');
  const [processing, setProcessing] = useState(false);

  const handleSimulateSuccess = () => {
    setProcessing(true);
    setTimeout(() => {
      navigate(`/verify-payment?ref=${encodeURIComponent(ref)}`);
    }, 1200);
  };

  const handleSimulateFail = () => {
    setProcessing(true);
    setTimeout(() => {
      navigate(`/verify-payment?ref=${encodeURIComponent(ref)}&simulateResult=FAILED`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-purple-200/50">
        {/* Chapa Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-purple-700 flex items-center justify-center font-black text-lg shadow-md">
                C
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight">chapa</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/40 border border-purple-300/30">
                    Sandbox
                  </span>
                </div>
                <p className="text-[11px] text-purple-200">Official Payment Gateway</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-200 bg-white/10 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS 256-bit</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-purple-400/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-200 block">Total Due</span>
              <span className="text-2xl font-black tracking-tight">{Number(amount).toLocaleString()} ETB</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-purple-200 block">Merchant</span>
              <span className="text-xs font-bold text-white block">EthioTransit Transport</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Simulation Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[11px] text-purple-900">
                Interactive Chapa Simulation Environment
              </p>
              <p className="text-[11px] text-purple-700 leading-relaxed">
                To connect your live Chapa merchant account, simply paste your secret key in <code className="bg-purple-100 px-1 py-0.5 rounded font-mono font-bold">backend/.env</code> (<code className="font-mono">CHAPA_SECRET_KEY=CHASECK_TEST-...</code>).
              </p>
            </div>
          </div>

          {/* Passenger & Tx Reference Details */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs space-y-1.5 font-medium">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Name:</span>
              <span className="font-bold text-slate-800">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone Number:</span>
              <span className="font-mono text-slate-800">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Ref:</span>
              <span className="font-mono text-[10px] text-slate-600 truncate max-w-[200px]">{ref}</span>
            </div>
          </div>

          {/* Simulated Payment Channel Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Simulated Payment Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('telebirr')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'telebirr'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 shadow-xs ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span className="text-[11px]">Telebirr</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('cbe')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'cbe'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 shadow-xs ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="text-[11px]">CBE Birr</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedMethod === 'card'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 shadow-xs ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-[11px]">Bank Card</span>
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleSimulateSuccess}
              disabled={processing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing via Chapa...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize & Pay {Number(amount).toLocaleString()} ETB</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSimulateFail}
              disabled={processing}
              className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Simulate Payment Decline / Insufficient Funds</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel and Return to EthioTransit Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
