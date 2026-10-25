import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bus,
  Sparkles,
  MapPin,
  Navigation,
  ArrowRight,
  Search,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface InteractiveEthiopiaHeroProps {
  onSearchClick?: () => void;
}

interface MapCityNode {
  id: string;
  name: string;
  amharic: string;
  code: string;
  xPct: number;
  yPct: number;
  isHub?: boolean;
}

const MAP_NODES: MapCityNode[] = [
  { id: 'addis', name: 'Addis Ababa', amharic: 'አዲስ አበባ', code: 'ADD', xPct: 47, yPct: 47, isHub: true },
  { id: 'bahirdar', name: 'Bahir Dar', amharic: 'ባሕር ዳር', code: 'BJR', xPct: 33, yPct: 36 },
  { id: 'gondar', name: 'Gondar', amharic: 'ጎንደር', code: 'GDQ', xPct: 32, yPct: 25 },
  { id: 'lalibela', name: 'Lalibela', amharic: 'ላሊበላ', code: 'LLI', xPct: 45, yPct: 28 },
  { id: 'diredawa', name: 'Dire Dawa', amharic: 'ድሬዳዋ', code: 'DIR', xPct: 65, yPct: 35 },
  { id: 'hawassa', name: 'Hawassa', amharic: 'ሐዋሳ', code: 'HWA', xPct: 49, yPct: 69 },
];

const LIVE_TRIPS_DATA = [
  {
    id: 'trip-1',
    from: 'Addis Ababa',
    to: 'Bahir Dar',
    toAmharic: 'ባሕር ዳር',
    time: '14:30',
    seatsLeft: 4,
    totalSeats: 48,
    price: 750,
    operator: 'Selam Bus',
    image: '/ethiopia-hero.jpg',
    imagePos: '20% 40%',
  },
  {
    id: 'trip-2',
    from: 'Addis Ababa',
    to: 'Gondar',
    toAmharic: 'ጎንደር',
    time: '14:30',
    seatsLeft: 4,
    totalSeats: 48,
    price: 950,
    operator: 'Abay Bus',
    image: '/cities-collage.jpg',
    imagePos: '100% 0%',
  },
  {
    id: 'trip-3',
    from: 'Addis Ababa',
    to: 'Lalibela',
    toAmharic: 'ላሊበላ',
    time: '14:30',
    seatsLeft: 4,
    totalSeats: 48,
    price: 1100,
    operator: 'Golden Bus',
    image: '/cities-collage.jpg',
    imagePos: '0% 100%',
  },
  {
    id: 'trip-4',
    from: 'Addis Ababa',
    to: 'Dire Dawa',
    toAmharic: 'ድሬዳዋ',
    time: '15:15',
    seatsLeft: 6,
    totalSeats: 48,
    price: 850,
    operator: 'Selam Bus',
    image: '/ethiopia-filmstrip.jpg',
    imagePos: '60% 40%',
  },
];

export const InteractiveEthiopiaHero: React.FC<InteractiveEthiopiaHeroProps> = ({ onSearchClick }) => {
  const { t, i18n } = useTranslation(['common', 'navigation', 'search']);
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<MapCityNode | null>(null);
  const [passportQuery, setPassportQuery] = useState('');
  const [activeTripOffset, setActiveTripOffset] = useState(0);

  const isAmharic = i18n.language === 'am';

  const handleCityClick = (city: MapCityNode) => {
    setSelectedNode(city);
    const todayIso = new Date().toISOString().split('T')[0];
    if (city.code === 'ADD') {
      navigate(`/search?from=ADD&to=BJR&date=${todayIso}&passengers=1`);
    } else {
      navigate(`/search?from=ADD&to=${city.code}&date=${todayIso}&passengers=1`);
    }
  };

  const handlePassportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayIso = new Date().toISOString().split('T')[0];
    if (passportQuery.trim()) {
      const match = MAP_NODES.find(
        (c) =>
          c.name.toLowerCase().includes(passportQuery.toLowerCase()) ||
          c.amharic.includes(passportQuery) ||
          c.code.toLowerCase() === passportQuery.toLowerCase()
      );
      if (match) {
        navigate(`/search?from=ADD&to=${match.code}&date=${todayIso}&passengers=1`);
      } else {
        navigate(`/search`);
      }
    } else {
      navigate(`/search`);
    }
  };

  const nextTrips = () => {
    setActiveTripOffset((prev) => (prev + 1) % (LIVE_TRIPS_DATA.length - 2));
  };

  const prevTrips = () => {
    setActiveTripOffset((prev) => (prev - 1 + (LIVE_TRIPS_DATA.length - 2)) % (LIVE_TRIPS_DATA.length - 2));
  };

  return (
    <div className="relative w-full bg-[#051810] text-white overflow-hidden select-none">
      
      {/* 1. TOP PANORAMIC FILMSTRIP HEADER MONTAGE */}
      <div className="relative w-full h-20 sm:h-32 md:h-40 overflow-hidden border-b border-emerald-950/60">
        <img
          src="/ethiopia-filmstrip.jpg"
          alt="Ethiopian Transit Panoramic Heritage Montage"
          className="w-full h-full object-cover object-center opacity-70 filter contrast-110 saturate-110"
        />
        {/* Cinematic dark emerald gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#031d12]/40 via-[#042015]/60 to-[#051810]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#051810] via-transparent to-[#051810]" />
      </div>

      {/* 2. MAIN HERO STAGE */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT COLUMN: HEADLINE & GOLDEN ACTION BUTTONS */}
          <div className="lg:col-span-5 flex flex-col items-start pt-1 sm:pt-2 lg:pt-6 z-20 w-full">
            
            {/* Welcome Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-300 text-[11px] sm:text-xs font-black tracking-wide shadow-md backdrop-blur-md mb-3 sm:mb-6 hover:border-emerald-400/60 transition-colors">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
              <span>{isAmharic ? 'እንኳን ወደ ኢትዮ ትራንስፖርት በደህና መጡ' : 'Welcome to Ethio Transport'}</span>
            </div>

            {/* Main Headline with Gold Light Wave */}
            <div className="relative w-full">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.15] sm:leading-[1.14]">
                {isAmharic ? (
                  <>
                    በኢትዮጵያ ውስጥ፣
                    <br />
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#F4D58D] via-[#f7e4a8] to-[#D9A441] drop-shadow-md">
                      በዘመናዊ መንገድ ይጓዙ።
                      {/* Glowing golden sparkle arc trailing across Smarter */}
                      <span className="absolute -top-3 left-full -translate-x-12 w-36 h-8 bg-gradient-to-r from-amber-400/40 via-amber-200/60 to-transparent blur-md pointer-events-none rounded-full" />
                    </span>
                  </>
                ) : (
                  <>
                    Travel Across Ethiopia,
                    <br />
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#F4D58D] via-[#f7e4a8] to-[#D9A441] drop-shadow-md">
                      Smarter.
                      {/* Glowing golden sparkle arc trailing across Smarter */}
                      <span className="absolute -top-3 left-full -translate-x-12 w-36 h-8 bg-gradient-to-r from-amber-400/40 via-amber-200/60 to-transparent blur-md pointer-events-none rounded-full" />
                    </span>
                  </>
                )}
              </h1>
            </div>

            <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-emerald-100/75 leading-relaxed max-w-lg font-medium">
              {isAmharic
                ? 'የአገር አቋራጭ አውቶቡስ መስመሮችን ይፈልጉ፣ ወንበርዎን በቅጽበት ይያዙ፣ በቴሌብር እና በሲቢኢ ብር በደህንነት ይክፈሉ።'
                : 'Search verified intercity routes, select your seat with atomic reservation locks, and travel seamlessly with digital QR tickets.'}
            </p>

            {/* Golden & Glass Action Buttons matching image */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-5 sm:mt-7 w-full sm:w-auto">
              <a
                href="#search-section"
                onClick={(e) => {
                  if (onSearchClick) {
                    e.preventDefault();
                    onSearchClick();
                  }
                }}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#D9A441] via-[#e5b352] to-[#c78f2d] hover:from-[#e5b352] hover:to-[#D9A441] text-emerald-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-950/40 hover:shadow-amber-500/20 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Bus className="w-4 h-4 text-emerald-950 group-hover:scale-110 transition-transform" />
                <span>{isAmharic ? 'ጉዞዎችን ፈልግ' : 'Search Trips'}</span>
              </a>

              <Link
                to="/routes"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#8c6b29]/40 to-[#a37c2d]/30 hover:bg-[#a37c2d]/50 text-[#F4D58D] border border-[#D9A441]/50 font-black text-xs sm:text-sm shadow-md backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Navigation className="w-4 h-4 text-[#F4D58D]" />
                <span>{isAmharic ? 'መስመሮችን አስስ' : 'Explore Routes'}</span>
              </Link>
            </div>

            {/* LIVE TRIP FEED (Matching bottom left of screenshot) */}
            <div className="w-full mt-6 sm:mt-10">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-100">
                    {isAmharic ? 'የቀጥታ ጉዞዎች' : 'Live Trip Feed'}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prevTrips}
                    className="w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-700/40 hover:bg-emerald-800 text-white flex items-center justify-center text-xs transition-colors"
                    aria-label="Previous trip"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextTrips}
                    className="w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-700/40 hover:bg-emerald-800 text-white flex items-center justify-center text-xs transition-colors"
                    aria-label="Next trip"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Trip Cards: Horizontal edge-to-edge swipe on small screens, 3-column grid on sm+ */}
              <div className="flex sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 touch-scroll snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {LIVE_TRIPS_DATA.slice(activeTripOffset, activeTripOffset + 3).map((trip) => {
                  const todayIso = new Date().toISOString().split('T')[0];
                  const destCode = trip.to === 'Bahir Dar' ? 'BJR' : trip.to === 'Gondar' ? 'GDQ' : trip.to === 'Lalibela' ? 'LLI' : 'DIR';
                  return (
                    <div
                      key={trip.id}
                      onClick={() => navigate(`/search?from=ADD&to=${destCode}&date=${todayIso}&passengers=1`)}
                      className="relative group rounded-xl overflow-hidden border border-emerald-800/40 hover:border-amber-400 p-2.5 flex flex-col justify-between h-28 bg-[#092218] cursor-pointer shadow-lg hover:shadow-emerald-900/40 transition-all shrink-0 w-[220px] sm:w-auto snap-start"
                    >
                      {/* Photo Thumbnail */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url('${trip.image}')`,
                          backgroundPosition: trip.imagePos,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#051810]/95 via-[#051810]/70 to-[#051810]/40" />

                      {/* Content */}
                      <div className="relative z-10 flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-white bg-emerald-900/90 px-1.5 py-0.5 rounded border border-emerald-600/40">
                          {trip.from} ➔ {isAmharic ? trip.toAmharic : trip.to}
                        </span>
                      </div>

                      <div className="relative z-10">
                        <div className="text-xs font-black text-white flex items-center justify-between">
                          <span>{trip.time}</span>
                          <span className="text-amber-300 text-[10px]">{trip.price} ETB</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-emerald-200/80 font-bold mt-1">
                          <span>{trip.seatsLeft} {isAmharic ? 'የቀሩ ወንበሮች' : 'seats left'}</span>
                          {/* Seat bar indicator */}
                          <div className="w-12 h-1.5 bg-emerald-950 rounded-full overflow-hidden">
                            <div className="w-3/4 h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D ISOMETRIC RELIEF MAP OF ETHIOPIA + FLOATING PASSPORT & ANALYTICS WIDGET */}
          <div className="lg:col-span-7 relative flex flex-col items-end w-full mt-4 lg:mt-0">
            
            {/* FLOATING TOP-RIGHT GLASS WIDGET: ETHIOTRANSIT PASSPORT + LIVE ANALYTICS (Shown on desktop/tablet to eliminate mobile clutter) */}
            <div className="hidden lg:block w-full max-w-2xl bg-[#082419]/90 backdrop-blur-md rounded-2xl p-4 text-white shadow-2xl border border-emerald-500/30 mb-3 z-30">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Left Half: EthioTransit Passport */}
                <div className="md:col-span-7 border-b md:border-b-0 md:border-r border-emerald-800/50 pb-3 md:pb-0 md:pr-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {isAmharic ? 'የኢትዮ ትራንስፖርት ፓስፖርት' : 'EthioTransit Passport'}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                      {isAmharic ? 'ፈጣን መቀመጫ' : 'Instant Seat'}
                    </span>
                  </div>

                  {/* Search Input */}
                  <form onSubmit={handlePassportSubmit} className="relative flex items-center mb-2.5">
                    <input
                      type="text"
                      placeholder={isAmharic ? 'መድረሻ ከተማ ይፈልጉ (ባሕር ዳር፣ ጎንደር)...' : 'Passport Search (Bahir Dar, Gondar)...'}
                      value={passportQuery}
                      onChange={(e) => setPassportQuery(e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/50 text-xs font-bold text-white placeholder-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                    >
                      <Search className="w-3 h-3" />
                    </button>
                  </form>

                  {/* 3 Quick Destination Cards */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { name: 'Bahir Dar', amharic: 'ባሕር ዳር', code: 'BJR', img: '/cities-collage.jpg', pos: '0% 0%' },
                      { name: 'Gondar', amharic: 'ጎንደር', code: 'GDQ', img: '/cities-collage.jpg', pos: '100% 0%' },
                      { name: 'Lalibela', amharic: 'ላሊበላ', code: 'LLI', img: '/cities-collage.jpg', pos: '0% 100%' },
                    ].map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          const todayIso = new Date().toISOString().split('T')[0];
                          navigate(`/search?from=ADD&to=${c.code}&date=${todayIso}&passengers=1`);
                        }}
                        className="relative group rounded-lg overflow-hidden h-12 border border-emerald-700/40 hover:border-amber-400 p-1 flex flex-col justify-end text-left shadow-xs transition-all"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url('${c.img}')`, backgroundPosition: c.pos }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        <span className="relative z-10 text-[10px] font-black text-white leading-tight">
                          {isAmharic ? c.amharic : c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Half: Live Analytics Bar Chart */}
                <div className="md:col-span-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      {isAmharic ? 'የቀጥታ ትንተና' : 'Live Analytics'}
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold">{isAmharic ? 'የቀጥታ ፍሰት' : 'Live Flow'}</span>
                  </div>

                  {/* Mini Vertical Bar Chart matching screenshot */}
                  <div className="flex items-end justify-between gap-1 h-14 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/40">
                    <div className="flex flex-col items-center gap-1 w-full">
                      <div className="w-full flex items-end justify-center gap-1 h-10">
                        <div className="w-1.5 bg-emerald-500 rounded-t h-[40%]" />
                        <div className="w-1.5 bg-emerald-400 rounded-t h-[75%]" />
                        <div className="w-1.5 bg-amber-400 rounded-t h-[95%]" />
                        <div className="w-1.5 bg-emerald-500 rounded-t h-[60%]" />
                        <div className="w-1.5 bg-amber-400 rounded-t h-[85%]" />
                        <div className="w-1.5 bg-emerald-400 rounded-t h-[100%]" />
                      </div>
                      <span className="text-[8px] font-bold text-emerald-300 uppercase">{isAmharic ? 'የተጓዦች ቁጥር' : 'Passenger Count'}</span>
                    </div>

                    <div className="w-[1px] h-8 bg-emerald-800/60 mx-1" />

                    <div className="flex flex-col items-center gap-1 w-full">
                      <div className="w-full flex items-end justify-center gap-1 h-10">
                        <div className="w-2 bg-amber-400 rounded-t h-[90%]" />
                        <div className="w-2 bg-emerald-400 rounded-t h-[70%]" />
                        <div className="w-2 bg-emerald-500 rounded-t h-[80%]" />
                      </div>
                      <span className="text-[8px] font-bold text-emerald-300 uppercase">{isAmharic ? 'ዋና ዋና ጉዞዎች' : 'Key Trips'}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 3D TOPOGRAPHICAL RELIEF MAP OF ETHIOPIA WITH ANIMATED BUSES & HIGHWAY GLOW */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-[#03150e] aspect-[1000/600] min-h-[220px] sm:min-h-[320px]">
              
              {/* 3D Isometric Map Image */}
              <img
                src="/ethiopia-relief-map.jpg"
                alt="3D Isometric Topographical Elevation Map of Ethiopia with Route Grid"
                className="w-full h-full object-cover object-center filter brightness-95 contrast-110"
              />

              {/* OVERLAY SVG FOR CONTINUOUS ANIMATED BUSES TRAVELLING THE ROUTES */}
              <div className="absolute inset-0 pointer-events-none">
                <svg viewBox="0 0 1000 600" className="w-full h-full">
                  
                  {/* Glowing Route Lines */}
                  {/* Addis (470, 280) -> Bahir Dar (320, 220) */}
                  <path
                    d="M 470 280 Q 380 260 320 220"
                    fill="none"
                    stroke="#F4D58D"
                    strokeWidth="3.5"
                    className="animate-route-flow"
                    opacity="0.9"
                  />
                  {/* Bahir Dar (320, 220) -> Gondar (310, 150) */}
                  <path
                    d="M 320 220 L 310 150"
                    fill="none"
                    stroke="#F4D58D"
                    strokeWidth="3.5"
                    className="animate-route-flow"
                    opacity="0.9"
                  />
                  {/* Addis (470, 280) -> Lalibela (450, 170) */}
                  <path
                    d="M 470 280 Q 480 210 450 170"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3"
                    className="animate-route-flow"
                    opacity="0.85"
                  />
                  {/* Addis (470, 280) -> Dire Dawa (630, 210) */}
                  <path
                    d="M 470 280 Q 560 230 630 210"
                    fill="none"
                    stroke="#F4D58D"
                    strokeWidth="3.5"
                    className="animate-route-flow"
                    opacity="0.9"
                  />
                  {/* Addis (470, 280) -> Hawassa (490, 420) */}
                  <path
                    d="M 470 280 L 490 420"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3"
                    className="animate-route-flow"
                    opacity="0.9"
                  />

                  {/* ANIMATED BUS 1: Addis -> Bahir Dar */}
                  <g>
                    <animateMotion
                      dur="7s"
                      repeatCount="indefinite"
                      path="M 470 280 Q 380 260 320 220 Q 380 260 470 280"
                    />
                    {/* Glowing bus marker with headlight */}
                    <rect x="-10" y="-5" width="20" height="10" rx="3" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" filter="drop-shadow(0 0 6px #34d399)" />
                    <circle cx="8" cy="0" r="2" fill="#fffb00" />
                  </g>

                  {/* ANIMATED BUS 2: Addis -> Dire Dawa */}
                  <g>
                    <animateMotion
                      dur="9s"
                      repeatCount="indefinite"
                      path="M 470 280 Q 560 230 630 210 Q 560 230 470 280"
                    />
                    <rect x="-10" y="-5" width="20" height="10" rx="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" filter="drop-shadow(0 0 6px #f59e0b)" />
                    <circle cx="8" cy="0" r="2" fill="#fffb00" />
                  </g>

                  {/* ANIMATED BUS 3: Addis -> Hawassa */}
                  <g>
                    <animateMotion
                      dur="6s"
                      repeatCount="indefinite"
                      path="M 470 280 L 490 420 L 470 280"
                    />
                    <rect x="-10" y="-5" width="20" height="10" rx="3" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" filter="drop-shadow(0 0 6px #06b6d4)" />
                    <circle cx="0" cy="4" r="2" fill="#fffb00" />
                  </g>
                </svg>
              </div>

              {/* Interactive City Click Nodes overlaid on map */}
              <div className="absolute inset-0 pointer-events-auto">
                {MAP_NODES.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCityClick(city)}
                    style={{ left: `${city.xPct}%`, top: `${city.yPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center"
                    title={`Click to view trips from Addis Ababa to ${city.name}`}
                  >
                    {/* Glowing Ping */}
                    {city.isHub && (
                      <span className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                    )}

                    {/* Pin Icon */}
                    <div
                      className={`w-4.5 h-4.5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[7px] sm:text-[10px] font-black shadow-lg transition-transform group-hover:scale-125 ${
                        city.isHub
                          ? 'bg-amber-400 text-emerald-950 border sm:border-2 border-white'
                          : 'bg-emerald-500 text-white border sm:border-2 border-white'
                      }`}
                    >
                      <Bus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </div>

                    {/* City Label Tag on desktop/tablet */}
                    <div className="hidden sm:block mt-1 px-2 py-0.5 rounded bg-[#031d12]/90 border border-emerald-500/40 text-[10px] font-black text-white whitespace-nowrap shadow-md group-hover:border-amber-400 group-hover:text-amber-300 transition-colors">
                      {isAmharic ? city.amharic : city.name}
                    </div>

                    {/* Compact Code Tag on mobile phones to prevent overlap */}
                    <div className="sm:hidden mt-0.5 px-1 py-0.2 rounded bg-[#031d12]/95 border border-emerald-500/50 text-[7.5px] font-black text-amber-300 whitespace-nowrap leading-tight shadow-sm">
                      {city.code}
                    </div>
                  </button>
                ))}
              </div>

              {/* Map Floating Helper Tag */}
              <div className="absolute bottom-2 right-2 text-[8px] sm:text-[9px] font-black text-emerald-200 bg-[#031d12]/95 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-emerald-500/30 flex items-center gap-1.5 shadow-lg max-w-[70%] sm:max-w-none truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">{isAmharic ? 'በቀጥታ ቦታ ለማስያዝ የትኛውንም ከተማ ይጫኑ' : 'Tap any hub to book instantly'}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
