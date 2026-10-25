import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, Building2, Phone, Mail, Lock } from 'lucide-react';
import { Modal } from '../components/Modal';
import { usersApi } from '../api/endpoints';
import { User, UserRole, Operator } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit: User | null;
  operators: Operator[];
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
  operators,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PASSENGER);
  const [operatorId, setOperatorId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setFirstName(userToEdit.firstName || '');
      setLastName(userToEdit.lastName || '');
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role || UserRole.PASSENGER);
      
      const opId = typeof userToEdit.operatorId === 'object' && userToEdit.operatorId?._id
        ? userToEdit.operatorId._id
        : typeof userToEdit.operatorId === 'string'
        ? userToEdit.operatorId
        : '';
      setOperatorId(opId);
      setIsActive(userToEdit.isActive !== false);
    } else {
      setFirstName('');
      setLastName('');
      setPhone('');
      setRole(UserRole.PASSENGER);
      setOperatorId('');
      setIsActive(true);
    }
    setError('');
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        role,
        operatorId: operatorId ? operatorId : null,
        isActive,
      };

      await usersApi.update(userToEdit._id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update user account.');
    } finally {
      setLoading(false);
    }
  };

  if (!userToEdit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit User Account • ${userToEdit.firstName} ${userToEdit.lastName}`}
      subtitle="Modify administrative role privileges, transit operator affiliations, or account access."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-btn bg-red-50 border border-red-200 text-status-error text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Account Email (Immutable Identity) */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              readOnly
              value={userToEdit.email}
              className="w-full pl-9 pr-8 py-2 rounded-input border border-gray-200 bg-gray-50 text-xs text-gray-600 font-medium cursor-not-allowed"
            />
            <span className="absolute right-3 top-2.5 text-gray-400" title="Email is locked to authenticate user">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Email is the cryptographic login identifier for this account and cannot be modified directly.
          </span>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1">
            Contact Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="+251911234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs focus:outline-none focus:border-brand-emerald font-medium"
            />
          </div>
        </div>

        {/* User Role */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1">
            System Security Role & Permissions *
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 text-brand-emerald absolute left-3 top-2.5" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-bold text-brand-dark"
            >
              {(userToEdit.role === UserRole.SUPER_ADMIN || userToEdit.role === UserRole.ADMIN) && (
                <>
                  <option value={UserRole.SUPER_ADMIN}>SUPER_ADMIN (Designated Sole Administrator)</option>
                  <option value={UserRole.ADMIN}>ADMIN (Operations Administrator)</option>
                </>
              )}
              <option value={UserRole.OPERATOR}>OPERATOR (Bus Company Dispatcher / Manager)</option>
              <option value={UserRole.DRIVER}>DRIVER (Vehicle Captain / Boarding Validator)</option>
              <option value={UserRole.PASSENGER}>PASSENGER (Standard Traveler Account)</option>
            </select>
          </div>
          {userToEdit.role !== UserRole.SUPER_ADMIN && userToEdit.role !== UserRole.ADMIN && (
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mt-1.5 inline-block font-semibold">
              Platform operates with a single designated administrator.
            </span>
          )}
        </div>

        {/* Operator Assignment (Visible/Enabled for OPERATOR and DRIVER roles, or optional for others) */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1">
            Associated Bus Operator Company
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-input border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-emerald font-medium text-brand-dark"
            >
              <option value="">-- No Assigned Transit Operator (Global / Passenger) --</option>
              {operators.map((op) => (
                <option key={op._id} value={op._id}>
                  {op.name} ({op.licenseNumber})
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Required if role is OPERATOR or DRIVER to link ticketing and vehicle dispatching to that company.
          </span>
        </div>

        {/* Account Status */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1">
            Account Access Status
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`flex-1 py-2 px-3 rounded-btn border text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-emerald-50 border-brand-emerald text-brand-emerald'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Active (Authorized Access)
            </button>
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`flex-1 py-2 px-3 rounded-btn border text-xs font-bold transition-colors ${
                !isActive
                  ? 'bg-rose-50 border-rose-500 text-rose-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Suspended (Locked Out)
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-btn text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-btn bg-brand-emerald text-white text-xs font-bold hover:bg-brand-deep transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save User Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
