import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, ShieldCheck, QrCode, CreditCard, Phone, Mail, MapPin, Smartphone, Star } from 'lucide-react';
import { BRAND } from '../../config/brand';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-white border-t border-gray-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-btn bg-brand-emerald flex items-center justify-center text-white shadow-md">
                <Bus className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-white leading-none">
                  EthioTransit
                </span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400/70 font-bold">
                  ኢትዮ-ትራንዚት
                </span>
              </div>
            </div>
            <p className="text-sm text-brand-textLight max-w-sm leading-relaxed">
              Ethiopia's modern intercity transportation booking platform. Find your route, choose your seat, pay securely, and travel with a verified digital QR ticket.
            </p>
            <div className="flex flex-col gap-2 mt-2 text-xs text-brand-textLight">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span>Bole Medhanialem, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <a href={`tel:${BRAND.supportPhone}`} className="hover:text-white transition-colors">
                  {BRAND.supportPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-white transition-colors">
                  {BRAND.supportEmail}
                </a>
              </div>
            </div>
          </div>

          {/* For Passengers */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">Passengers</h4>
            <ul className="flex flex-col gap-2 text-sm text-brand-textLight">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">Search Trips</Link>
              </li>
              <li>
                <Link to="/routes" className="hover:text-white transition-colors">All Routes</Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-white transition-colors">My Tickets</Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-white transition-colors">My Bookings</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
              </li>
            </ul>
          </div>

          {/* Account & Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">Account</h4>
            <ul className="flex flex-col gap-2 text-sm text-brand-textLight">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">My Profile</Link>
              </li>
              <li>
                <Link to="/help#account" className="hover:text-white transition-colors">Account Help</Link>
              </li>
            </ul>
          </div>

          {/* Trust & Payments */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">Safe & Secure</h4>
            <div className="flex flex-col gap-2.5 text-xs text-brand-textLight">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald flex-shrink-0" />
                <span>Official Verified Fares</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5 text-brand-emerald flex-shrink-0" />
                <span>Tamper-Proof QR Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-brand-emerald flex-shrink-0" />
                <span>Mobile-First Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span>Rated 4.9 by passengers</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <span className="text-[11px] text-gray-500 block mb-2">Accepted payments:</span>
              <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-gray-300">
                <span className="px-2 py-1 bg-gray-800/80 rounded border border-gray-700">Telebirr</span>
                <span className="px-2 py-1 bg-gray-800/80 rounded border border-gray-700">CBE Birr</span>
                <span className="px-2 py-1 bg-gray-800/80 rounded border border-gray-700">Chapa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-textLight gap-4">
          <p>© {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Your journey across Ethiopia, made simple.</span>
            <span className="text-brand-gold">★ ኢትዮጵያ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
