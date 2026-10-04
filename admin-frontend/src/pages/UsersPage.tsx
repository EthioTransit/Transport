import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Pencil,
  Shield,
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  UserCheck,
  UserX,
} from 'lucide-react';
import { usersApi, operatorsApi } from '../api/endpoints';
import { StatusBadge } from '../components/StatusBadge';
import { UserModal } from '../features/UserModal';
import { User, UserRole, Operator } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, opData] = await Promise.all([
        usersApi.getAll({
          search: search.trim() || undefined,
          role: selectedRole !== 'ALL' ? selectedRole : undefined,
        }).catch(() => []),
        operatorsApi.getAll().catch(() => []),
      ]);
      setUsers(userData || []);
      setOperators(opData || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRole]);

  // Handle Enter key or Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleToggleStatus = async (user: User) => {
    const newStatus = !user.isActive;
    const confirmMsg = newStatus
      ? `Activate access for ${user.firstName} ${user.lastName}?`
      : `Suspend ${user.firstName} ${user.lastName}? They will be blocked from logging into the system.`;

    if (!window.confirm(confirmMsg)) return;

    setActionInProgress(user._id);
    try {
      await usersApi.toggleStatus(user._id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  // Filter in memory for status
  const filteredUsers = users.filter((u) => {
    if (selectedStatus === 'ACTIVE') return u.isActive === true;
    if (selectedStatus === 'SUSPENDED') return u.isActive === false;
    return true;
  });

  // Calculate statistics
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN).length;
  const operatorCount = users.filter((u) => u.role === UserRole.OPERATOR || u.role === UserRole.DRIVER).length;
  const passengerCount = users.filter((u) => u.role === UserRole.PASSENGER).length;

  const roles = [
    { key: 'ALL', label: 'All Roles' },
    { key: UserRole.SUPER_ADMIN, label: 'Super Admins' },
    { key: UserRole.ADMIN, label: 'Admins' },
    { key: UserRole.OPERATOR, label: 'Operators' },
    { key: UserRole.DRIVER, label: 'Drivers' },
    { key: UserRole.PASSENGER, label: 'Passengers' },
  ];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-purple-600" />
            Super Admin
          </span>
        );
      case UserRole.ADMIN:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1">
            <Shield className="w-3 h-3 text-sky-600" />
            Admin
          </span>
        );
      case UserRole.OPERATOR:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <Building2 className="w-3 h-3 text-emerald-600" />
            Operator
          </span>
        );
      case UserRole.DRIVER:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            Driver
          </span>
        );
      case UserRole.PASSENGER:
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
            Passenger
          </span>
        );
    }
  };

  const getOperatorName = (operatorId: any) => {
    if (!operatorId) return null;
    if (typeof operatorId === 'object' && operatorId.name) {
      return operatorId.name;
    }
    const matched = operators.find((op) => op._id === operatorId);
    return matched ? matched.name : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider">
            <span>Identity & Access Management</span>
          </div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight mt-0.5">
            Users & Roles Directory ({users.length})
          </h1>
          <p className="text-xs text-brand-textMuted mt-1">
            Audit platform permissions, edit personal user profiles, assign transit companies, and toggle account activation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-btn bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 shadow-xs"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card">
          <div className="text-gray-400 font-bold uppercase text-[10px]">Total Users</div>
          <div className="text-2xl font-black text-brand-dark mt-1">{totalCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Platform-wide accounts</div>
        </div>

        <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card">
          <div className="text-purple-600 font-bold uppercase text-[10px]">Administrators</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{adminCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Super & Standard Admins</div>
        </div>

        <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card">
          <div className="text-brand-emerald font-bold uppercase text-[10px]">Transit Staff</div>
          <div className="text-2xl font-black text-brand-emerald mt-1">{operatorCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Operators & Drivers</div>
        </div>

        <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card">
          <div className="text-sky-600 font-bold uppercase text-[10px]">Passengers</div>
          <div className="text-2xl font-black text-sky-700 mt-1">{passengerCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Registered travelers</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-card p-4 border border-gray-100 shadow-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or Ethiopian phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald"
          />
        </div>

        {/* Role filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => setSelectedRole(r.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedRole === r.key
                  ? 'bg-brand-emerald text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-bold uppercase whitespace-nowrap">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-1.5 rounded-btn border border-gray-200 text-xs bg-white text-gray-700 font-bold focus:outline-none focus:border-brand-emerald"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-brand-textMuted uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Security Role</th>
                <th className="py-3 px-4">Assigned Operator</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const opName = getOperatorName(u.operatorId);
                const isWorking = actionInProgress === u._id;

                return (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-brand-dark uppercase">
                          {u.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-brand-dark">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-600">
                      {u.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{u.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                    {/* Operator */}
                    <td className="py-3.5 px-4">
                      {opName ? (
                        <div className="flex items-center gap-1.5 text-brand-dark font-medium">
                          <Building2 className="w-3.5 h-3.5 text-brand-emerald" />
                          <span>{opName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None (Independent)</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-gray-400 text-[11px] font-mono">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit User Button */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1.5 rounded-btn bg-emerald-50 hover:bg-emerald-100 text-brand-emerald text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          title="Edit User Profile & Role"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Toggle Suspend/Activate */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isWorking}
                          className={`p-1.5 rounded-btn border text-xs font-bold inline-flex items-center transition-colors ${
                            u.isActive
                              ? 'border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                              : 'border-emerald-200 text-brand-emerald bg-emerald-50 hover:bg-emerald-100'
                          }`}
                          title={u.isActive ? 'Suspend User Access' : 'Activate User Access'}
                        >
                          {u.isActive ? (
                            <UserX className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="py-12 text-center text-xs text-gray-400">
            No users found matching your search or filters.
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSuccess={fetchData}
        userToEdit={editingUser}
        operators={operators}
      />
    </div>
  );
};
