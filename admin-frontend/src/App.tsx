import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAdminAuth } from './context/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { CitiesPage } from './pages/CitiesPage';
import { RoutesPage } from './pages/RoutesPage';
import { OperatorsPage } from './pages/OperatorsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { TripsPage } from './pages/TripsPage';
import { BookingsPage } from './pages/BookingsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';

// Protected Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin" />
          <span>Verifying Administrative Credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Protected Administrative Routes */}
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<DashboardOverviewPage />} />
            <Route path="cities" element={<CitiesPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="operators" element={<OperatorsPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
