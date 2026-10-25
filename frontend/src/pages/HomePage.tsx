import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  QrCode,
  CreditCard,
  Clock,
  Calendar,
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

const FALLBACK_POPULAR_ROUTES: Route[] = [
  {
    _id: 'pop-1',
    origin: { _id: 'c1', name: 'Addis Ababa', amharicName: 'አዲስ አበባ', region: 'Addis Ababa', code: 'ADD', country: 'ET', status: 'ACTIVE' },
    destination: { _id: 'c2', name: 'Bahir Dar', amharicName: 'ባሕር ዳር', region: 'Amhara Region', code: 'BJR', country: 'ET', status: 'ACTIVE' },
    distanceKm: 565,
    estimatedDurationHours: 10,
    image: '/dest-bahirdar.jpg',
    pickupPoints: [{ name: 'Autobis Tera', timeOffsetMinutes: 0 }],
    dropOffPoints: [{ name: 'Bahir Dar Central Bus Station' }],
    status: 'ACTIVE',
    popularityScore: 98,
  },
  {
    _id: 'pop-2',
    origin: { _id: 'c1', name: 'Addis Ababa', amharicName: 'አዲስ አበባ', region: 'Addis Ababa', code: 'ADD', country: 'ET', status: 'ACTIVE' },
    destination: { _id: 'c3', name: 'Hawassa', amharicName: 'ሐዋሳ', region: 'Sidama Region', code: 'HWA', country: 'ET', status: 'ACTIVE' },
    distanceKm: 275,
    estimatedDurationHours: 4.5,
    image: '/dest-hawassa.jpg',
    pickupPoints: [{ name: 'Kality Terminal', timeOffsetMinutes: 0 }],
    dropOffPoints: [{ name: 'Hawassa Piazza Terminal' }],
    status: 'ACTIVE',
    popularityScore: 95,
  },
  {
    _id: 'pop-3',
    origin: { _id: 'c1', name: 'Addis Ababa', amharicName: 'አዲስ አበባ', region: 'Addis Ababa', code: 'ADD', country: 'ET', status: 'ACTIVE' },
    destination: { _id: 'c4', name: 'Gondar', amharicName: 'ጎንደር', region: 'Amhara Region', code: 'GDQ', country: 'ET', status: 'ACTIVE' },
    distanceKm: 720,
    estimatedDurationHours: 12.5,
    image: '/cities-collage.jpg',
    pickupPoints: [{ name: 'Autobis Tera', timeOffsetMinutes: 0 }],
    dropOffPoints: [{ name: 'Azezo Terminal' }],
    status: 'ACTIVE',
    popularityScore: 92,
  },
  {
    _id: 'pop-4',
    origin: { _id: 'c1', name: 'Addis Ababa', amharicName: 'አዲስ አበባ', region: 'Addis Ababa', code: 'ADD', country: 'ET', status: 'ACTIVE' },
    destination: { _id: 'c5', name: 'Dire Dawa', amharicName: 'ድሬዳዋ', region: 'Dire Dawa', code: 'DIR', country: 'ET', status: 'ACTIVE' },
    distanceKm: 450,
    estimatedDurationHours: 8,
    image: '/ethiopia-hero.jpg',
    pickupPoints: [{ name: 'Lamberet Terminal', timeOffsetMinutes: 0 }],
    dropOffPoints: [{ name: 'Dire Dawa Main Station' }],
    status: 'ACTIVE',
    popularityScore: 89,
  },
  {
    _id: 'pop-5',
    origin: { _id: 'c1', name: 'Addis Ababa', amharicName: 'አዲስ አበባ', region: 'Addis Ababa', code: 'ADD', country: 'ET', status: 'ACTIVE' },
    destination: { _id: 'c6', name: 'Debre Berhan', amharicName: 'ደብረ ብርሃን', region: 'Amhara Region', code: 'DBR', country: 'ET', status: 'ACTIVE' },
    distanceKm: 130,
    estimatedDurationHours: 2.5,
    image: '/dest-debreberhan.jpg',
    pickupPoints: [{ name: 'Lamberet Terminal', timeOffsetMinutes: 0 }],
    dropOffPoints: [{ name: 'Debre Berhan Bus Station' }],
    status: 'ACTIVE',
    popularityScore: 85,
  },
  {
    _id: 'pop-6',
    origin: { _id: 'c1', name: 'Addis Ababa', amharicName: 'አዲስ አበባ', region: 'Addis Ababa', code: 'ADD', country: 'ET', status: 'ACTIVE' },
    destination: { _id: 'c7', name: 'Adama', amharicName: 'አዳማ', region: 'Oromia Region', code: 'ADA', country: 'ET', status: 'ACTIVE' },
    distanceKm: 98,
    estimatedDurationHours: 1.5,
    image: '/dest-adama.jpg',
    pickupPoints: [{ name: 'Kality Terminal', timeOffsetMinutes: 0 }],
    dropOffPoints: [{ name: 'Adama Posta Station' }],
    status: 'ACTIVE',
    popularityScore: 88,
  },
];

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'navigation', 'search']);
  const isAmharic = i18n.language === 'am';
  const [popularRoutes, setPopularRoutes] = useState<Route[]>(FALLBACK_POPULAR_ROUTES);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routes = await routesApi.getPopular();
        if (routes && routes.length > 0) {
          setPopularRoutes(routes);
        } else {
          setPopularRoutes(FALLBACK_POPULAR_ROUTES);
        }
      } catch (err) {
        console.error('Failed to load popular routes, using defaults:', err);
        setPopularRoutes(FALLBACK_POPULAR_ROUTES);
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
      <section id="search-section" className="relative bg-brand-bg py-6 sm:py-10 px-3 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto -mt-6 sm:-mt-8 relative z-20">
          <SearchCard />
        </div>
      </section>

      {/* 3. POPULAR ROUTES SECTION */}
      <section className="py-10 sm:py-16 bg-[#F7F9FC] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-3 sm:gap-0">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-emerald bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {isAmharic ? 'ተመራጭ የኢትዮጵያ መዳረሻዎች' : 'Top Ethiopian Destinations'}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-brand-dark mt-2">
                {isAmharic ? 'ተወዳጅ የከተማ አቋራጭ መስመሮች' : 'Popular Intercity Routes'}
              </h2>
              <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
                {isAmharic
                  ? 'በፈቃድ በተሰጣቸው ምቹ አውቶቡሶች በኢትዮጵያ ተወዳጅ መስመሮች ይጓዙ።'
                  : "Explore Ethiopia's most traveled regional corridors with certified luxury buses."}
              </p>
            </div>
            <Link
              to="/routes"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-deep transition-colors"
            >
              <span>{isAmharic ? 'ሁሉንም መስመሮች ይመልከቱ' : 'View All Routes'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

                  const photoUrl = route.image || getDestPhoto(destName, originName);
                  const todayIso = new Date().toISOString().split('T')[0];
                  const baseFare = Math.round(route.distanceKm * 1.5 + 50);

                  const displayOrigin = isAmharic && originAmharic ? originAmharic : originName;
                  const displayDest = isAmharic && destAmharic ? destAmharic : destName;

                  return (
                    <Link
                      key={route._id}
                      to={`/search?from=${route.origin?.code}&to=${route.destination?.code}&date=${todayIso}&passengers=1`}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Card Image Header */}
                      <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-gray-900">
                        <img
                          src={photoUrl}
                          alt={`${originName} to ${destName}`}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 flex items-center justify-between z-10 gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#031d12]/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 shadow-sm truncate max-w-[55%]">
                            📍 {destRegion}
                          </span>
                          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-emerald-950 shadow-md shrink-0">
                            {isAmharic ? `ከ ${baseFare} ብር` : `From ${baseFare} ETB`}
                          </span>
                        </div>

                        {/* Bottom Image Title */}
                        <div className="absolute bottom-2.5 left-2.5 sm:left-3 right-2.5 sm:right-3 z-10 flex items-end justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                              {isAmharic ? 'ቀጥታ መስመር' : 'Direct Corridor'}
                            </span>
                            <div className="text-white text-sm sm:text-base font-black tracking-tight drop-shadow-sm truncate">
                              {displayOrigin} ➔ {displayDest}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-500 group-hover:bg-amber-400 text-white group-hover:text-emerald-950 flex items-center justify-center shadow-lg transition-colors shrink-0">
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 bg-white">
                        <div className="flex items-center justify-between text-xs text-brand-textMuted font-bold pb-2 border-b border-gray-100 gap-2">
                          <span className="truncate">{originAmharic || originName} ➔ {destAmharic || destName}</span>
                          <span className="text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-100 shrink-0">
                            <Calendar className="w-3 h-3 text-brand-emerald" />
                            <span>
                              {route.operatingDays && route.operatingDays.length === 7
                                ? (isAmharic ? 'በየቀኑ' : 'Daily')
                                : route.operatingDays && route.operatingDays.length > 0
                                ? route.operatingDays.map((d: string) => d.slice(0, 3)).join(', ')
                                : (isAmharic ? 'በየቀኑ' : 'Daily')}
                            </span>
                          </span>
                        </div>

                        {/* Daily Departures row */}
                        <div className="mt-2 sm:mt-2.5 text-[11px] text-gray-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-brand-emerald shrink-0" />
                          <span className="text-gray-400 font-medium">{isAmharic ? 'ሰዓታት:' : 'Times:'}</span>
                          <span className="font-mono font-bold text-brand-dark truncate">
                            {route.departureTimes && route.departureTimes.length > 0
                              ? route.departureTimes.slice(0, 3).join(' • ')
                              : '06:00 AM • 08:30 AM'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 sm:mt-2.5 pt-1 text-xs text-brand-textMuted">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span className="text-brand-emerald">🛣️</span>
                            <span>{route.distanceKm} km</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold justify-end">
                            <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                            <span>~{route.estimatedDurationHours}{isAmharic ? 'ሰ' : 'h'}</span>
                          </div>
                        </div>

                        <div className="mt-2.5 sm:mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-gray-500 truncate">
                            🚌 Selam • Abay • Oda Bus
                          </span>
                          <span className="text-xs font-black text-brand-emerald group-hover:text-brand-deep flex items-center gap-1 shrink-0">
                            {isAmharic ? 'ወንበር ይያዙ →' : 'Book Seat →'}
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
      <section className="py-12 sm:py-20 bg-brand-bg border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-emerald">
              {isAmharic ? 'ቀላል • ፈጣን • አስተማማኝ' : 'Simple • Fast • Trustworthy'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mt-1">
              {isAmharic ? 'ኢትዮትራንዚት እንዴት ይሰራል?' : 'How EthioTransit Works'}
            </h2>
            <p className="text-xs sm:text-sm text-brand-textMuted mt-1 sm:mt-2">
              {isAmharic ? 'ከፍለጋ እስከ መሳፈር በአራት ቀላል ደረጃዎች።' : 'From search to boarding in four simple steps.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                step: '01',
                title: isAmharic ? '1. ይፈልጉ' : 'Search',
                desc: isAmharic
                  ? 'የመነሻ እና መድረሻ ከተማዎን እንዲሁም የጉዞ ቀንዎን በመምረጥ ክፍት ወንበሮችን በእውነተኛ ጊዜ ያግኙ።'
                  : 'Find buses traveling to your destination on your chosen date with real-time seat availability.',
                icon: MapPin,
                color: 'bg-emerald-50 text-brand-emerald',
              },
              {
                step: '02',
                title: isAmharic ? '2. ወንበርዎን ይምረጡ' : 'Choose Your Seat',
                desc: isAmharic
                  ? 'በይነተገናኝ የአውቶቡስ ካርታ ላይ የሚፈልጉትን ወንበር ይምረጡ። የመረጡት ወንበር ለ 10 ደቂቃ ተቆልፎ ይጠብቅዎታል።'
                  : 'Select your preferred seat on an interactive bus map. Your seat is held for 10 minutes.',
                icon: Armchair,
                color: 'bg-blue-50 text-blue-600',
              },
              {
                step: '03',
                title: isAmharic ? '3. በደህንነት ይክፈሉ' : 'Pay Securely',
                desc: isAmharic
                  ? 'በቻፓ፣ ቴሌብር ወይም ሲቢኢ ብር በደህንነት ክፍያ ይፈጽሙ። ያለ ምንም ድብቅ ክፍያ ትክክለኛውን ታሪፍ ይክፈሉ።'
                  : 'Complete your booking using Telebirr, CBE Birr, or Chapa. Official fare, no hidden fees.',
                icon: CreditCard,
                color: 'bg-amber-50 text-amber-600',
              },
              {
                step: '04',
                title: isAmharic ? '4. ይጓዙ' : 'Travel',
                desc: isAmharic
                  ? 'በሚሳፈሩበት ወቅት ዲጂታል የQR ቲኬትዎን ያሳዩ። ወረቀት ማተም አያስፈልግም — በቀጥታ በስልክዎ ይሰራል!'
                  : 'Show your digital QR ticket when boarding. No paper needed — works right on your phone.',
                icon: QrCode,
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-card p-5 sm:p-7 border border-gray-100 shadow-card hover:shadow-cardHover transition-all duration-200 flex flex-col relative group hover:-translate-y-0.5"
                >
                  <span className="text-3xl sm:text-4xl font-black text-gray-100 mb-2 sm:mb-4 select-none">{item.step}</span>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.color} flex items-center justify-center mb-3 sm:mb-4 shadow-sm`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-brand-dark mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-brand-textMuted leading-relaxed">{item.desc}</p>

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

          <div className="mt-8 sm:mt-10 text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-deep transition-colors"
            >
              <span>{isAmharic ? 'ስለ ሂደቱ ተጨማሪ ዝርዝር ይመልከቱ' : 'Learn more about the process'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TRAVEL WITH CONFIDENCE — TRUST SECTION */}
      <section className="py-12 sm:py-20 bg-[#F7F9FC] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-emerald">
              {isAmharic ? 'ለምን ኢትዮትራንዚትን ይመርጣሉ?' : 'Why Choose EthioTransit'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-dark mt-1 sm:mt-2">
              {isAmharic ? 'በእርግጠኝነት እና በሰላም ይጓዙ' : 'Travel With Confidence'}
            </h2>
            <p className="text-xs sm:text-sm text-brand-textMuted mt-1 sm:mt-2">
              {isAmharic
                ? 'ኢትዮትራንዚትን ቀላል፣ ግልጽ እና አስተማማኝ አድርገን የገነባነው በጉዞዎ ላይ ብቻ እንዲያተኩሩ ነው።'
                : "We've built EthioTransit to be simple, transparent, and trustworthy — so you can focus on your journey."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Lock,
                title: isAmharic ? 'አስተማማኝ ቦታ ማስያዝ' : 'Secure Booking',
                desc: isAmharic
                  ? 'የቦታ ማስያዣ መረጃዎ በከፍተኛ የባንክ ደረጃ ጥበቃ የተደረገለት ነው። ምንም ሚስጥራዊ መረጃ አላስፈላጊ በሆነ ሁኔታ አይቀመጥም።'
                  : 'Your booking information is protected with bank-level security. No sensitive data is stored unnecessarily.',
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50',
                iconColor: 'text-brand-emerald',
              },
              {
                icon: Armchair,
                title: isAmharic ? 'ወንበርዎን ይምረጡ' : 'Choose Your Seat',
                desc: isAmharic
                  ? 'ከመክፈልዎ በፊት የሚመርጡትን የመስኮት ወይም የመተላለፊያ ወንበር በካርታው ላይ ይምረጡ።'
                  : 'Select your preferred seat — window, aisle, or middle — on an interactive bus seat map before you pay.',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
                iconColor: 'text-blue-600',
              },
              {
                icon: QrCode,
                title: isAmharic ? 'ዲጂታል ቲኬቶች' : 'Digital Tickets',
                desc: isAmharic
                  ? 'ቲኬትዎ ዲጂታል ነው። በስልክዎ ውስጥ ያስቀምጡት። በሚሳፈሩበት ጊዜ የQR ኮዱን ያሳዩ — ማተም አያስፈልግም።'
                  : 'Your ticket is digital. Keep it right on your phone. Show the QR code when boarding — no printing needed.',
                color: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50',
                iconColor: 'text-purple-600',
              },
              {
                icon: Smartphone,
                title: isAmharic ? 'ፈጣን ቦታ ማስያዝ' : 'Easy Booking',
                desc: isAmharic
                  ? 'ከየትኛውም ቦታ ሆነው ከመፈለግ ጀምሮ እስከ ክፍያና ቲኬት ድረስ ከሁለት ደቂቃ ባነሰ ጊዜ ውስጥ ያጠናቅቁ።'
                  : 'Book your entire journey from anywhere — from search to payment to boarding pass in under two minutes.',
                color: 'from-amber-500 to-amber-600',
                bg: 'bg-amber-50',
                iconColor: 'text-amber-600',
              },
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-cardLg p-5 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 sm:gap-4"
                >
                  <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ${benefit.bg} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${benefit.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-brand-dark mb-1 sm:mb-2">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-brand-textMuted leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. PAYMENT TRANSPARENCY BANNER */}
      <section className="py-10 sm:py-16 bg-brand-dark text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/20 text-emerald-300 text-xs font-bold w-fit">
                <ShieldCheck className="w-4 h-4" />
                <span>{isAmharic ? '100% ግልጽ የክፍያ ዋስትና' : '100% Payment Transparency Guarantee'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                {isAmharic ? (
                  <>ምንም ድብቅ ክፍያ የለም።<br className="hidden sm:inline" />ተጨማሪ ህገ-ወጥ የቲኬት ዋጋ የለም።</>
                ) : (
                  <>No Hidden Surcharges.<br className="hidden sm:inline" />No Unofficial Ticket Prices.</>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {isAmharic
                  ? 'የኢትዮጵያ ተጓዦች አላስፈላጊ የዋጋ መዋዠቅ እና ተጨማሪ ህገ-ወጥ ክፍያዎች ያጋጥሟቸዋል። ኢትዮትራንዚት በመንግስት የተወሰነውን ትክክለኛ ታሪፍ ያረጋግጣል። አሽከርካሪዎች ወይም ረዳቶች ዋጋውን መለወጥ ወይም ተጨማሪ ክፍያ መጠየቅ አይችሉም።'
                  : 'Ethiopian travelers often face fluctuating fares and unofficial collections. EthioTransit locks the official government-regulated fare upfront. Drivers and conductors cannot modify the fare or solicit extra charges.'}
              </p>
              <div className="flex flex-col gap-2 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-emerald flex-shrink-0" />
                  <span>{isAmharic ? 'ከመክፈልዎ በፊት ትክክለኛውን የታሪፍ ዝርዝር ማየት' : 'Exact official fare breakdown before you pay'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-emerald flex-shrink-0" />
                  <span>{isAmharic ? 'በሲስተም የተረጋገጡ የገንዘብ ግብይት ሰነዶች' : 'Verified server-side financial transaction records'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-emerald flex-shrink-0" />
                  <span>{isAmharic ? 'ከቻፓ እና ከኢትዮጵያ የክፍያ አሰራር ጋር በቀጥታ የተገናኘ' : 'Direct integration with Chapa and Ethiopian digital payments'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-cardLg p-4 sm:p-8 border border-white/10 flex flex-col gap-4 sm:gap-6">
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-gold">
                {isAmharic ? 'የግልጽ ዋጋ ምሳሌ' : 'Price Transparency Example'}
              </span>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs sm:text-sm gap-2">
                <span className="text-gray-300 truncate">
                  {isAmharic ? 'አዲስ አበባ → ደብረ ብርሃን (130 ኪ.ሜ)' : 'Addis Ababa → Debre Berhan (130 km)'}
                </span>
                <span className="font-bold text-white shrink-0">250 {isAmharic ? 'ብር' : 'ETB'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs sm:text-sm gap-2">
                <span className="text-gray-300 truncate">
                  {isAmharic ? 'አዲስ አበባ → ባሕር ዳር (565 ኪ.ሜ)' : 'Addis Ababa → Bahir Dar (565 km)'}
                </span>
                <span className="font-bold text-white shrink-0">1,250 {isAmharic ? 'ብር' : 'ETB'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs sm:text-sm gap-2">
                <span className="text-gray-300 truncate">
                  {isAmharic ? 'የሲስተም ቴክኖሎጂ ክፍያ' : 'Platform Technology Fee'}
                </span>
                <span className="font-bold text-brand-gold shrink-0">15 {isAmharic ? 'ብር' : 'ETB'}</span>
              </div>
              <div className="p-3 sm:p-4 rounded-btn bg-brand-emerald/20 border border-brand-emerald/40 text-[11px] sm:text-xs text-emerald-200">
                {isAmharic
                  ? 'ትክክለኛው ታሪፍ ከተረጋገጡ የትራንስፖርት ማህበራት እና ከሚኒስቴሩ መመሪያዎች ጋር በመተባበር የተዘጋጀ ነው።'
                  : 'Official fare is established in partnership with certified transport associations and Ministry standards.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FEATURED OPERATORS */}
      <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-textLight">
            {isAmharic ? 'ሕጋዊ የትራንስፖርት አጋሮች' : 'Official Transportation Partners'}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-brand-dark mt-1 mb-6 sm:mb-8">
            {isAmharic ? 'ፈቃድ የተሰጣቸው አገር አቋራጭ ድርጅቶች' : 'Authorized Intercity Operators'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-center justify-center max-w-3xl mx-auto">
            {['Selam Bus Line S.C.', 'Sky Bus Transport', 'Oda Bus Transport S.C.', 'Golden Bus Express'].map(
              (name, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-5 rounded-xl bg-gray-50 border border-gray-100 font-bold text-xs sm:text-sm text-brand-textMain text-center hover:bg-emerald-50/50 hover:border-brand-emerald transition-all cursor-default"
                >
                  <Bus className="w-5 h-5 text-brand-emerald mx-auto mb-1.5 sm:mb-2" />
                  <span className="text-[11px] sm:text-xs">{name}</span>
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
