import { User, UserRole } from '../../types';

let currentUser: User | null = null;
let currentToken: string | null = localStorage.getItem('ethiotransit_token');
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// Generate persistent guest lock ID if not present
if (!localStorage.getItem('ethiotransit_guest_lock_id')) {
  localStorage.setItem('ethiotransit_guest_lock_id', `gst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
}

const storedUser = localStorage.getItem('ethiotransit_user');
if (storedUser) {
  try {
    currentUser = JSON.parse(storedUser);
  } catch {
    currentUser = null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('ethiotransit_auth_expired', () => {
    currentUser = null;
    currentToken = null;
    notify();
  });
}

export const authStore = {
  getUser: () => currentUser,
  getToken: () => currentToken,
  getGuestLockId: () => localStorage.getItem('ethiotransit_guest_lock_id') || 'guest_default',
  isAuthenticated: () => !!currentToken && !!currentUser,
  hasRole: (role: UserRole) => currentUser?.role === role || currentUser?.role === UserRole.SUPER_ADMIN,

  setAuth: (user: User, token: string) => {
    currentUser = user;
    currentToken = token;
    localStorage.setItem('ethiotransit_token', token);
    localStorage.setItem('ethiotransit_user', JSON.stringify(user));
    notify();
  },

  logout: () => {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('ethiotransit_token');
    localStorage.removeItem('ethiotransit_user');
    notify();
  },

  subscribe: (callback: () => void) => {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },
};
