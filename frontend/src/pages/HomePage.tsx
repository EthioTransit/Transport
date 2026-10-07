import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  QrCode,
  CreditCard,
  Clock,
  ArrowRight,
  Bus,
  CheckCircle2,
  Users,
  MapPin,
  Armchair,
  Smartphone,
  Lock,
} from 'lucide-react';
import { InteractiveEthiopiaHero } from '../features/hero/InteractiveEthiopiaHero';
import { PreFooterCta } from '../components/common/PreFooterCta';
import { SearchCard } from '../features/search/SearchCard';
import { routesApi } from '../api/endpoints';
import { BRAND } from '../config/brand';
import { Route } from '../types';

export const HomePage: React.FC = () => {
  const { t } = useTranslation(['common', 'navigation', 'search']);
  const [popularRoutes, setPopularRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routes = await routesApi.getPopular();
        setPopularRoutes(routes);
      } catch (err) {
        console.error('Failed to load popular routes:', err);
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  const scrollToSearch = () => {
    const el = document.getElementById('search-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. INTERACTIVE PANORAMIC ETHIOPIAN HERO WITH MOVING BUSES */}
      <InteractiveEthiopiaHero onSearchClick={scrollToSearch} />

      {/* 2. SEARCH SECTION */}
      <section id="search-section" className="relative bg-brand-bg py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto -mt-6 sm:-mt-8 relative z-20">
          <SearchCard />
        </div>
      </section>

      {/* 3. POPULAR ROUTES SECTION */}
      <section className="py-16 bg-[#F7F9FC] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-emerald bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                Top Ethiopian Destinations
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mt-2">
                Popular Intercity Routes
              </h2>
              <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
                Explore Ethiopia's most traveled regional corridors with certified luxury buses.
              </p>
            </div>
            <Link
              to="/routes"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-emerald hover:text-brand-deep mt-2 sm:mt-0 transition-colors"
            >
              <span>View All Routes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingRoutes
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100" />
                ))
              : popularRoutes.slice(0, 6).map((route) => {
                  const originName = route.origin?.name || 'Addis Ababa';
                  const destName = route.destination?.name || 'Destination';
                  const destAmharic =
                    route.destination?.amharicName ||
                    (destName === 'Bahir Dar'
                      ? 'ባሕር ዳር'
                      : destName === 'Hawassa'
                      ? 'ሐዋሳ'
                      : destName === 'Debre Berhan'
                      ? 'ደብረ ብርሃን'
                      : destName === 'Adama'
                      ? 'አዳማ'
                      : destName === 'Gondar'
                      ? 'ጎንደር'
                      : destName === 'Lalibela'
                      ? 'ላሊበላ'
                      : '');
                  const originAmharic =
                    route.origin?.amharicName || (originName === 'Addis Ababa' ? 'አዲስ አበባ' : '');
                  const destRegion =
                    route.destination?.region ||
                    (destName === 'Bahir Dar' || destName === 'Gondar' || destName === 'Debre Berhan' || destName === 'Lalibela'
                      ? 'Amhara Region'
                      : destName === 'Hawassa'
                      ? 'Sidama Region'
                      : destName === 'Adama'
                      ? 'Oromia Region'
                      : 'Ethiopia');

                  const getDestPhoto = (dest: string, origin: string) => {
                    const target = dest.toLowerCase();
                    const orig = origin.toLowerCase();
                    if (target.includes('bahir') || orig.includes('bahir')) return '/dest-bahirdar.jpg';
                    if (target.includes('hawassa') || orig.includes('hawassa')) return '/dest-hawassa.jpg';
                    if (target.includes('debre') || orig.includes('debre')) return '/dest-debreberhan.jpg';
                    if (target.includes('adama') || orig.includes('adama')) return '/dest-adama.jpg';
                    if (target.includes('gondar') || orig.includes('gondar')) return '/cities-collage.jpg';
                    if (target.includes('lali') || orig.includes('lali')) return '/cities-collage.jpg';
                    return '/ethiopia-hero.jpg';
                  };

                  const photoUrl = getDestPhoto(destName, originName);
                  const todayIso = new Date().toISOString().split('T')[0];
                  const baseFare = Math.round(route.distanceKm * 1.5 + 50);

                  return (
                    <Link
                      key={route._id}
                      to={`/search?from=${route.origin?.code}&to=${route.destination?.code}&date=${todayIso}&passengers=1`}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Card Image Header */}
                      <div className="relative h-44 w-full overflow-hidden bg-gray-900">
                        <img
                          src={photoUrl}
                          alt={`${originName} to ${destName}`}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#031d12]/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 shadow-sm">
                            📍 {destRegion}
                          </span>
                          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-emerald-950 shadow-md">
                            From {baseFare} ETB
                          </span>
                        </div>

                        {/* Bottom Image Title */}
                        <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-end justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                              Direct Corridor
                            </span>
                            <div className="text-white text-base font-black tracking-tight drop-shadow-sm">
                              {originName} ➔ {destName}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-500 group-hover:bg-amber-400 text-white group-hover:text-emerald-950 flex items-center justify-center shadow-lg transition-colors">
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
                        <div className="flex items-center justify-between text-xs text-brand-textMuted font-bold pb-2 border-b border-gray-100">
                          <span>{originAmharic || originName} ➔ {destAmharic || destName}</span>
                          <span className="text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            Daily
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-1 text-xs text-brand-textMuted">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span className="text-brand-emerald">🛣️</span>
                            <span>{route.distanceKm} km</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold justify-end">
                            <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                            <span>~{route.estimatedDurationHours}h</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-500">
                            🚌 Selam • Abay • Oda Bus
                          </span>
                          <span className="text-xs font-black text-brand-emerald group-hover:text-brand-deep flex items-center gap-1">
                            Book Seat →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-20 bg-brand-bg border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-emerald">
              Simple • Fast • Trustworthy
            </span>
            <h2 className="text-3xl font-black text-brand-dark mt-1">
              How EthioTransit Works
            </h2>
            <p className="text-sm text-brand-textMuted mt-2">
              From search to boarding in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Search',
                desc: 'Find buses traveling to your destination on your chosen date with real-time seat availability.',
                icon: MapPin,
                color: 'bg-emerald-50 text-brand-emerald',
              },
              {
                step: '02',
                title: 'Choose Your Seat',
                desc: 'Select your preferred seat on an interactive bus map. Your seat is held for 10 minutes.',
                icon: Armchair,
                color: 'bg-blue-50 text-blue-600',
              },
              {
                step: '03',
                title: 'Pay Securely',
                desc: 'Complete your booking using Telebirr, CBE Birr, or Chapa. Official fare, no hidden fees.',
                icon: CreditCard,
                color: 'bg-amber-50 text-amber-600',
              },
              {
                step: '04',
                title: 'Travel',
                desc: 'Show your digital QR ticket when boarding. No paper needed — works right on your phone.',
                icon: QrCode,
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-card p-7 border border-gray-100 shadow-card hover:shadow-cardHover transition-all duration-200 flex flex-col relative group hover:-translate-y-0.5"
                >
                  <span className="text-4xl font-black text-gray-100 mb-4 select-none">{item.step}</span>
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-brand-dark mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-textMuted leading-relaxed">{item.desc}</p>

                  {/* Step connector arrow (desktop only) */}
                  {idx < 3 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-gray-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-emerald hover:text-brand-deep transition-colors"
            >
              <span>Learn more about the process</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TRAVEL WITH CONFIDENCE — TRUST SECTION */}
      <section className="py-20 bg-[#F7F9FC] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-emerald">
              Why Choose EthioTransit
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-dark mt-2">
              Travel With Confidence
            </h2>
            <p className="text-sm text-brand-textMuted mt-2">
              We've built EthioTransit to be simple, transparent, and trustworthy — so you can focus on your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: 'Secure Booking',
                desc: 'Your booking information is protected with bank-level security. No sensitive data is stored unnecessarily.',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50',
                iconColor: 'text-brand-emerald',
              },
              {
                icon: Armchair,
                title: 'Choose Your Seat',
                desc: 'Select your preferred seat — window, aisle, or middle — on an interactive bus seat map before you pay.',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
                iconColor: 'text-blue-600',
              },
              {
                icon: QrCode,
                title: 'Digital Tickets',
                desc: 'Your ticket is digital. Keep it right on your phone. Show the QR code when boarding — no printing needed.',
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50',
                iconColor: 'text-purple-600',
              },
              {
                icon: Smartphone,
                title: 'Easy Booking',
                desc: 'Book your entire journey from anywhere — from search to payment to boarding pass in under two minutes.',
                color: 'from-amber-500 to-amber-600',
                bg: 'bg-amber-50',
                iconColor: 'text-amber-600',
              },
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-cardLg p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
                >
                  <div className={`w-13 h-13 rounded-2xl ${benefit.bg} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${benefit.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-brand-dark mb-2">{benefit.title}</h3>
                    <p className="text-sm text-brand-textMuted leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. PAYMENT TRANSPARENCY BANNER */}
      <section className="py-16 bg-brand-dark text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/20 text-emerald-300 text-xs font-bold w-fit">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Payment Transparency Guarantee</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                No Hidden Surcharges.<br />No Unofficial Ticket Prices.
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Ethiopian travelers often face fluctuating fares and unofficial collections. EthioTransit locks the official government-regulated fare upfront. Drivers and conductors cannot modify the fare or solicit extra charges.
              </p>
              <div className="flex flex-col gap-2 mt-2 text-sm text-gray-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-emerald flex-shrink-0" />
                  <span>Exact official fare breakdown before you pay</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-emerald flex-shrink-0" />
                  <span>Verified server-side financial transaction records</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-emerald flex-shrink-0" />
                  <span>Direct integration with Telebirr and Ethiopian banking</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-cardLg p-8 border border-white/10 flex flex-col gap-6">
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-gold">
                Price Transparency Example
              </span>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-sm">
                <span className="text-gray-300">Addis Ababa → Debre Berhan (130 km)</span>
                <span className="font-bold text-white">250 ETB</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-sm">
                <span className="text-gray-300">Addis Ababa → Bahir Dar (565 km)</span>
                <span className="font-bold text-white">1,250 ETB</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-sm">
                <span className="text-gray-300">Platform Technology Fee</span>
                <span className="font-bold text-brand-gold">15 ETB</span>
              </div>
              <div className="p-4 rounded-btn bg-brand-emerald/20 border border-brand-emerald/40 text-xs text-emerald-200">
                Official fare is established in partnership with certified transport associations and Ministry standards.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FEATURED OPERATORS */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-textLight">
            Official Transportation Partners
          </span>
          <h2 className="text-xl font-black text-brand-dark mt-1 mb-8">
            Authorized Intercity Operators
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 items-center justify-center max-w-3xl mx-auto">
            {['Selam Bus Line S.C.', 'Sky Bus Transport', 'Oda Bus Transport S.C.', 'Golden Bus Express'].map(
              (name, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-gray-50 border border-gray-100 font-bold text-sm text-brand-textMain text-center hover:bg-emerald-50/50 hover:border-brand-emerald transition-all cursor-default"
                >
                  <Bus className="w-5 h-5 text-brand-emerald mx-auto mb-2" />
                  <span className="text-xs">{name}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CALL TO ACTION */}
      <PreFooterCta />
    </div>
  );
};
