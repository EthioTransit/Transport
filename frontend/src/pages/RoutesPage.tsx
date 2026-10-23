import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Route as RouteIcon, Search, ArrowRight, Clock, MapPin, Bus, Calendar, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { routesApi } from '../api/endpoints';
import { Route } from '../types';

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const data = await routesApi.getAll();
        setRoutes(data);
      } catch (err) {
        console.error('Failed to load routes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.origin?.name?.toLowerCase().includes(q) ||
      (r.origin?.amharicName && r.origin.amharicName.includes(q)) ||
      r.destination?.name?.toLowerCase().includes(q) ||
      (r.destination?.amharicName && r.destination.amharicName.includes(q)) ||
      r.origin?.region?.toLowerCase().includes(q) ||
      r.destination?.region?.toLowerCase().includes(q)
    );
  });

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-brand-bg min-h-screen py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
              {isAmharic ? 'የሀገር አቀፍ የጉዞ መስመሮች' : 'Nationwide Network'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-dark tracking-tight mt-1">
              {isAmharic ? 'የኢትዮጵያ የከተማ አቋራጭ መስመሮች' : 'Ethiopian Intercity Routes'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
              {isAmharic
                ? 'በፈቃድ በተሰጣቸው የትራንስፖርት ድርጅቶች የሚሰሩ የከተማ አቋራጭ ጉዞዎችን ያስሱ።'
                : 'Explore dynamic intercity routes operated by certified transportation companies.'}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={isAmharic ? 'መስመር በከተማ ወይም ክልል ይፈልጉ...' : 'Search route by city or region...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm shadow-xs focus:outline-none focus:border-brand-emerald"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Route count hint */}
        {!loading && (
          <div className="flex items-center justify-between text-xs text-brand-textMuted mb-4 px-1">
            <span className="font-semibold">
              <strong className="text-brand-dark">{filtered.length}</strong> {isAmharic ? 'የተመዘገቡ መስመሮች' : 'routes available'}
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-brand-emerald font-bold hover:underline"
              >
                {isAmharic ? 'ፍለጋ አጽዳ' : 'Reset Filter'}
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Bus className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-700">
              {isAmharic ? 'ምንም የሚመሳሰል መስመር አልተገኘም።' : 'No routes matching your search.'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isAmharic ? 'እባክዎ ሌላ ከተማ ወይም የክልል ስም ይሞክሩ።' : 'Try searching with another city or region name.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-emerald text-white text-xs font-bold hover:bg-brand-deep transition-colors"
              >
                {isAmharic ? 'ሁሉንም መስመሮች አሳይ' : 'Show All Routes'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((route) => {
              const originEn = route.origin?.name || 'Addis Ababa';
              const destEn = route.destination?.name || 'Destination';
              const originDisplay = isAmharic && route.origin?.amharicName ? route.origin.amharicName : originEn;
              const destDisplay = isAmharic && route.destination?.amharicName ? route.destination.amharicName : destEn;
              const destRegion = route.destination?.region || 'Ethiopia';
              
              const getDestPhoto = (d: string, o: string) => {
                const target = d.toLowerCase();
                const orig = o.toLowerCase();
                if (target.includes('bahir') || orig.includes('bahir')) return '/dest-bahirdar.jpg';
                if (target.includes('hawassa') || orig.includes('hawassa')) return '/dest-hawassa.jpg';
                if (target.includes('debre') || orig.includes('debre')) return '/dest-debreberhan.jpg';
                if (target.includes('adama') || orig.includes('adama')) return '/dest-adama.jpg';
                if (target.includes('gondar') || orig.includes('gondar')) return '/cities-collage.jpg';
                if (target.includes('lali') || orig.includes('lali')) return '/cities-collage.jpg';
                return '/ethiopia-hero.jpg';
              };

              const photoUrl = getDestPhoto(destEn, originEn);
              const baseFare = Math.round(route.distanceKm * 1.5 + 50);

              return (
                <div
                  key={route._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-cardHover hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  {/* Image Header */}
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-gray-900">
                    <img
                      src={photoUrl}
                      alt={`${originEn} to ${destEn}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                    
                    <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 flex items-center justify-between z-10">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#031d12]/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                        📍 {destRegion}
                      </span>
                      <span className="text-[11px] font-black px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-400 text-emerald-950 shadow-xs">
                        {isAmharic ? `ከ ${baseFare} ብር` : `From ${baseFare} ETB`}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 z-10">
                      <h3 className="text-sm sm:text-base font-black text-white drop-shadow-sm flex items-center gap-1.5">
                        <span>{originDisplay}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span>{destDisplay}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 text-xs">
                        <span className="font-bold text-brand-emerald truncate max-w-[200px]">
                          {route.origin?.region} ➔ {route.destination?.region}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                          {isAmharic ? `ደረጃ ${route.popularityScore}` : `Score ${route.popularityScore}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-brand-textMuted mt-2">
                        <span className="flex items-center gap-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                          {route.distanceKm} km
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                          ~{route.estimatedDurationHours} {isAmharic ? 'ሰዓት' : 'hours'}
                        </span>
                      </div>

                      {route.pickupPoints && route.pickupPoints.length > 0 && (
                        <p className="text-[11px] text-gray-500 mt-2 truncate font-medium">
                          {isAmharic ? 'መነሻ ተርሚናል:' : 'Terminal:'} {route.pickupPoints[0].name}
                        </p>
                      )}

                      {/* Operating Days & Departure Times Section */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-brand-dark flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                            <span>
                              {route.operatingDays && route.operatingDays.length === 7
                                ? (isAmharic ? 'በየቀኑ ይሰራል (ከሰኞ - እሁድ)' : 'Daily (Mon-Sun)')
                                : route.operatingDays && route.operatingDays.length > 0
                                ? route.operatingDays.map((d: string) => d.slice(0, 3)).join(', ')
                                : (isAmharic ? 'በየቀኑ' : 'Daily')}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 flex-wrap">
                          <Clock className="w-3 h-3 text-brand-emerald shrink-0" />
                          <span className="text-gray-400 font-semibold">{isAmharic ? 'ሰዓታት:' : 'Departures:'}</span>
                          <span className="font-mono font-bold text-brand-dark">
                            {route.departureTimes && route.departureTimes.length > 0
                              ? route.departureTimes.join(' • ')
                              : '06:00 AM • 08:30 AM'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] sm:text-[11px] font-bold text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded-full truncate">
                        {route.operatingDays?.length === 7
                          ? (isAmharic ? 'የዕለት አገልግሎት' : 'Daily Service')
                          : (isAmharic ? 'የቀን መርሃ ግብር' : 'Scheduled Service')}
                      </span>
                      <Link
                        to={`/search?from=${route.origin?.code}&to=${route.destination?.code}&date=${todayIso}&passengers=1`}
                        className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <span>{isAmharic ? 'ጉዞዎችን ፈልግ' : 'Find Trips'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
