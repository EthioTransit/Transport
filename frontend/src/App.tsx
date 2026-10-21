import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentVerificationPage } from './pages/PaymentVerificationPage';
import { ChapaSandboxPage } from './pages/ChapaSandboxPage';
import { TicketPage } from './pages/TicketPage';
import { RoutesPage } from './pages/RoutesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { OperatorDashboardPage } from './pages/OperatorDashboardPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { PassengerDashboardPage } from './pages/PassengerDashboardPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpPage } from './pages/HelpPage';
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/trips/:tripId/seats" element={<SeatSelectionPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/chapa-sandbox" element={<ChapaSandboxPage />} />
            <Route path="/verify-payment" element={<PaymentVerificationPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* Ticket pages */}
            <Route path="/tickets/:ticketId" element={<TicketPage />} />
            <Route path="/my-tickets" element={<PassengerDashboardPage />} />

            {/* Passenger customer pages */}
            <Route path="/passenger" element={<PassengerDashboardPage />} />
            <Route path="/my-bookings" element={<PassengerDashboardPage />} />
            <Route path="/my-trips" element={<MyTripsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Staff dashboards */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/operator" element={<OperatorDashboardPage />} />
            <Route path="/driver" element={<DriverDashboardPage />} />
          </Route>

          {/* Standalone Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
