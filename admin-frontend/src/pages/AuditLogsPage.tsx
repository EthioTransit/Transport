import React, { useState, useEffect } from 'react';
import { FileText, ShieldAlert, Search, RefreshCw, Filter, CheckCircle2 } from 'lucide-react';
import { analyticsApi } from '../api/endpoints';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.getAuditLogs();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const roles = ['ALL', 'SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'DRIVER', 'SYSTEM'];

  const filteredLogs = logs.filter((log) => {
    const matchesRole = selectedRole === 'ALL' || log.role === selectedRole;
    const q = search.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Cryptographic Security Trail</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Immutable Audit Trail ({logs.length})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Tamper-proof chronological trail of administrative, fare change, boarding, and user governance events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by action, resource, or actor email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
          />
        </div>

        {/* Role filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedRole === r
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-50 text-brand-textMuted uppercase font-bold border-b border-gray-100 font-sans">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC+3)</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-brand-dark font-sans text-xs">
                    {log.action}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-brand-emerald">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{log.resource}</td>
                  <td className="py-3 px-4 text-gray-500 font-sans text-xs">
                    {log.userEmail || log.user || 'System Dispatcher'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && !loading && (
          <div className="py-12 text-center text-xs text-gray-400 font-sans">
            No audit log entries matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
