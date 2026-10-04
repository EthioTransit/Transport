import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/endpoints';
import { BRAND } from '../config/brand';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: 'SUPER_ADMIN' | 'ADMIN') => Promise<void>;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ethiotransit_admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('ethiotransit_admin_token');
      const storedUser = localStorage.getItem('ethiotransit_admin_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === UserRole.SUPER_ADMIN || parsedUser.role === UserRole.ADMIN) {
            setUser(parsedUser);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { user: loggedInUser, accessToken } = response;

      // Verify Administrative Privileges
      if (
        loggedInUser.role !== UserRole.SUPER_ADMIN &&
        loggedInUser.role !== UserRole.ADMIN
      ) {
        throw new Error(
          'Access Denied: This administrative console requires Super Admin or Admin credentials.'
        );
      }

      localStorage.setItem('ethiotransit_admin_token', accessToken);
      localStorage.setItem('ethiotransit_admin_user', JSON.stringify(loggedInUser));

      setToken(accessToken);
      setUser(loggedInUser);
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: 'SUPER_ADMIN' | 'ADMIN') => {
    const account = BRAND.demoAccounts.find((a) => a.role === role);
    if (!account) return;
    await login(account.email, account.password);
  };

  const logout = () => {
    localStorage.removeItem('ethiotransit_admin_token');
    localStorage.removeItem('ethiotransit_admin_user');
    setUser(null);
    setToken(null);
  };

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginAsDemo,
        logout,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AuthProvider');
  }
  return context;
};
