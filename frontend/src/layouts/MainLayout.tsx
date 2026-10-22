import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MobileBottomNav } from '../components/common/MobileBottomNav';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // On seat selection and checkout pages, hide MobileBottomNav so it does not collide with the sticky checkout action bar
  const isBookingFlow =
    path.includes('/seats') ||
    path.startsWith('/checkout') ||
    path.startsWith('/verify-payment');

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-textMain font-sans antialiased selection:bg-brand-emerald selection:text-white">
      <Navbar />
      <main className={`flex-1 ${isBookingFlow ? 'pb-0' : 'pb-16 lg:pb-0'}`}>
        <Outlet />
      </main>
      <div className={isBookingFlow ? 'hidden' : 'pb-16 lg:pb-0'}>
        <Footer />
      </div>
      {!isBookingFlow && <MobileBottomNav />}
    </div>
  );
};
