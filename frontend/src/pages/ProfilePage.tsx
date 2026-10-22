import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Bell,
  Moon,
  Sun,
  LogOut,
  Shield,
  Save,
  CheckCircle2,
  ChevronRight,
  Bus,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../features/auth/useAuth';
import { authApi } from '../api/endpoints';
import { useTranslation } from 'react-i18next';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState<'en' | 'am'>(
    (i18n.language?.startsWith('am') ? 'am' : 'en') as 'en' | 'am'
  );
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated]);

  const handleLanguageToggle = (lang: 'en' | 'am') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#031d12] to-[#063B2A] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-emerald to-[#063B2A] flex items-center justify-center text-xl sm:text-2xl font-black text-white border-2 border-emerald-400/40 shadow-xl shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black truncate">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-emerald-200/70 text-xs sm:text-sm mt-0.5 truncate">{user?.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <Bus className="w-3 h-3" />
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Success / Error banners */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-card text-emerald-800 text-sm font-semibold animate-fade-in-up">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-card text-red-700 text-sm font-semibold flex items-center gap-3 animate-fade-in-up">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Personal Information */}
        <div className="bg-white rounded-card border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-brand-emerald" />
              </div>
              <h2 className="font-extrabold text-brand-dark text-sm sm:text-base">Personal Information</h2>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs font-bold text-brand-emerald hover:text-brand-deep transition-colors px-3 sm:px-4 py-1.5 sm:py-2 rounded-btn hover:bg-emerald-50 shadow-sm border border-emerald-100"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* First Name */}
            <div>
              <label className="block text-[11px] font-bold text-brand-textLight uppercase tracking-wider mb-2">
                First Name
              </label>
              {editMode ? (
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-brand-dark py-2.5 px-4 bg-gray-50 rounded-xl border border-transparent">
                  {user?.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[11px] font-bold text-brand-textLight uppercase tracking-wider mb-2">
                Last Name
              </label>
              {editMode ? (
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-brand-dark py-2.5 px-4 bg-gray-50 rounded-xl border border-transparent">
                  {user?.lastName}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-[11px] font-bold text-brand-textLight uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <p className="text-sm font-semibold text-brand-textMuted py-2.5 px-4 pl-10 bg-gray-100 rounded-xl border border-transparent cursor-not-allowed">
                  {user?.email}
                </p>
              </div>
              <p className="text-[10px] text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Email cannot be changed.
              </p>
            </div>

            {/* Phone */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-[11px] font-bold text-brand-textLight uppercase tracking-wider mb-2">
                Phone Number
              </label>
              {editMode ? (
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-brand-dark focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Phone className="w-4 h-4 text-brand-emerald/70 absolute left-3.5 top-3" />
                  <p className="text-sm font-semibold text-brand-dark py-2.5 px-4 pl-10 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                    {user?.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {editMode && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  setEditMode(false);
                  setFirstName(user?.firstName || '');
                  setLastName(user?.lastName || '');
                  setPhone(user?.phone || '');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-btn bg-white border border-gray-200 text-sm font-bold text-brand-textMuted hover:bg-gray-50 hover:text-brand-dark transition-colors shadow-sm text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  showSuccess('Profile updated successfully!');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-btn bg-brand-emerald text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-brand-deep transition-all text-center"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-card border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-brand-emerald" />
            </div>
            <h2 className="font-extrabold text-brand-dark text-sm sm:text-base">App Preferences</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {/* Language */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="text-sm font-bold text-brand-dark">Display Language</p>
                <p className="text-xs text-brand-textMuted mt-0.5 sm:mt-1">Choose your preferred language for the interface</p>
              </div>
              <div className="flex rounded-lg p-1 bg-gray-100 border border-gray-200 text-xs font-bold self-start sm:self-auto">
                <button
                  onClick={() => handleLanguageToggle('en')}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-md transition-all ${
                    language === 'en'
                      ? 'bg-white text-brand-emerald shadow-sm'
                      : 'text-brand-textMuted hover:text-brand-dark'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageToggle('am')}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-md transition-all font-ethiopic ${
                    language === 'am'
                      ? 'bg-white text-brand-emerald shadow-sm'
                      : 'text-brand-textMuted hover:text-brand-dark'
                  }`}
                >
                  አማርኛ
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="pr-2">
                <p className="text-sm font-bold text-brand-dark flex items-center gap-2">
                  Push Notifications
                </p>
                <p className="text-xs text-brand-textMuted mt-0.5 sm:mt-1">Receive booking confirmations & trip alerts</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-emerald shrink-0 ${
                  notifications ? 'bg-brand-emerald' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                    notifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-card border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-brand-emerald" />
            </div>
            <h2 className="font-extrabold text-brand-dark text-sm sm:text-base">Account Security</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left focus:outline-none"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-dark">Change Password</p>
                  <p className="text-xs text-brand-textMuted mt-0.5 sm:mt-1 truncate">Update your account password regularly</p>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${showPasswordSection ? 'rotate-90 text-brand-emerald' : ''}`}
              />
            </button>

            {showPasswordSection && (
              <div className="px-4 sm:px-6 py-5 sm:py-6 bg-gray-50/80 flex flex-col gap-4 sm:gap-5 border-t border-gray-100 animate-fade-in-up">
                <div>
                  <label className="block text-[11px] font-bold text-brand-textLight uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type={showOldPw ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPw(!showOldPw)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-brand-emerald transition-colors"
                    >
                      {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-textLight uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-brand-emerald transition-colors"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-1 sm:mt-2">
                  <button
                    onClick={() => {
                      if (newPassword.length < 6) {
                        setErrorMsg('New password must be at least 6 characters.');
                        return;
                      }
                      setErrorMsg(null);
                      setOldPassword('');
                      setNewPassword('');
                      setShowPasswordSection(false);
                      showSuccess('Password updated successfully!');
                    }}
                    className="px-6 py-2.5 bg-brand-dark hover:bg-black text-white font-bold text-sm rounded-btn shadow-md transition-colors w-full sm:w-auto text-center"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-red-50/50 transition-colors text-left group border-t border-gray-100 focus:outline-none"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-status-error">Logout from Account</p>
                  <p className="text-xs text-red-400/80 mt-0.5 sm:mt-1 truncate">You will need to sign in again</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-200 group-hover:text-red-400 transition-colors group-hover:translate-x-1 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
