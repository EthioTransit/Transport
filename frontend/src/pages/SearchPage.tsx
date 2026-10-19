import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Filter, Calendar, Users, SlidersHorizontal, Bus, ArrowRight, RefreshCw, Image as ImageIcon, Map as MapIcon } from 'lucide-react';
import { tripsApi, citiesApi, operatorsApi } from '../api/endpoints';
import { TripCard } from '../features/search/TripCard';
import { FilterSidebar } from '../features/search/FilterSidebar';
import { TripCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Trip, Operator, City } from '../types';
import { useTranslation } from 'react-i18next';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromParam = searchParams.get('from') || 'ADD';
  const toParam = searchParams.get('to') || 'DBR';
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const passengersParam = parseInt(searchParams.get('passengers') || '1', 10);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [destCity, setDestCity] = useState<City | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [sideView, setSideView] = useState<'photo' | 'map'>('photo');

  // Filter & Sort State
  const [sortBy, setSortBy] = useState('DEPARTURE_EARLIEST');
  const [priceMax, setPriceMax] = useState(0);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsApi.search({
        from: fromParam,
        to: toParam,
        date: dateParam,
        passengers: passengersParam,
        priceMax: priceMax > 0 ? priceMax : undefined,
        operatorId: selectedOperator || undefined,
        vehicleType: selectedVehicleType || undefined,
        sortBy,
      });

      setTrips(res.trips);
      if (res.originCity) setOriginCity(res.originCity);
      if (res.destinationCity) setDestCity(res.destinationCity);
    } catch (err: any) {
      setError(err.message || 'Failed to search available trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [fromParam, toParam, dateParam, passengersParam, sortBy, priceMax, selectedOperator, selectedVehicleType]);

  const handleResetFilters = () => {
    setSortBy('DEPARTURE_EARLIEST');
    setPriceMax(0);
    setSelectedOperator('');
    setSelectedVehicleType('');
  };

  // Format date for display
  const formattedDate = (() => {
    try {
      return new Date(dateParam + 'T00:00:00').toLocaleDateString('en-ET', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateParam;
    }
  })();

  const routePhoto = trips[0]?.route?.image || (destCity as any)?.image || (trips[0]?.route?.destination as any)?.image;

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Search Header Banner */}
      <div className="relative bg-[#031d12] text-white py-7 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/50 overflow-hidden">
        {routePhoto && (
          <div className="absolute inset-0 z-0">
            <img
              src={routePhoto}
              alt="Route corridor backdrop"
              className="w-full h-full object-cover opacity-20 filter blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#031d12] via-[#031d12]/90 to-[#031d12]/75" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {isAmharic ? 'የኢትዮጵያ የከተማ አቋራጭ መስመር' : 'Ethiopian Intercity Route'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {originCity ? (isAmharic ? originCity.amharicName || originCity.name : originCity.name) : fromParam}
                <span className="mx-2 text-emerald-400">→</span>
                {destCity ? (isAmharic ? destCity.amharicName || destCity.name : destCity.name) : toParam}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200/70 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  {passengersParam} {isAmharic ? 'ተጓዦች' : (passengersParam === 1 ? 'Passenger' : 'Passengers')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/"
                className="px-4 py-2.5 rounded-btn bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
              >
                {isAmharic ? 'ፍለጋ ቀይር' : 'Modify Search'}
              </Link>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-4 py-2.5 rounded-btn bg-brand-emerald text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-brand-deep transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-8">
          <FilterSidebar
            sortBy={sortBy}
            onSortChange={setSortBy}
            priceMax={priceMax}
            onPriceMaxChange={setPriceMax}
            selectedOperator={selectedOperator}
            onOperatorChange={setSelectedOperator}
            selectedVehicleType={selectedVehicleType}
            onVehicleTypeChange={setSelectedVehicleType}
            operators={operators}
            onReset={handleResetFilters}
            isMobileOpen={mobileFilterOpen}
            onCloseMobile={() => setMobileFilterOpen(false)}
          />

          {/* Trips List Container */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Results count + sort hint */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-sm font-extrabold text-brand-dark">
                {loading ? (
                  <span className="text-brand-textMuted">{isAmharic ? 'አውቶቡሶችን በመፈለግ ላይ...' : 'Searching buses...'}</span>
                ) : (
                  <>
                    <span className="text-brand-emerald">{trips.length}</span>
                    {' '}{isAmharic ? 'ጉዞ(ዎች) ተገኝተዋል' : `trip${trips.length !== 1 ? 's' : ''} available`}
                  </>
                )}
              </span>
              {!loading && trips.length > 0 && (
                <span className="text-xs text-brand-textLight font-medium">
                  Sorted by {sortBy === 'DEPARTURE_EARLIEST' ? 'earliest departure' : sortBy === 'PRICE_LOW' ? 'lowest price' : 'filter'}
                </span>
              )}
            </div>

            <div className="flex flex-col xl:flex-row gap-6 items-start">
              {/* Left Side: Trips List */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                {loading ? (
                  <div className="flex flex-col gap-4">
                    <TripCardSkeleton />
                    <TripCardSkeleton />
                    <TripCardSkeleton />
                  </div>
                ) : error ? (
                  <ErrorState message={error} onRetry={fetchSearchResults} />
                ) : trips.length === 0 ? (
                  <EmptyState
                    icon={Bus}
                    title={isAmharic ? "ምንም ጉዞ አልተገኘም" : "No Trips Found"}
                    description={isAmharic 
                      ? `ከ ${originCity?.amharicName || fromParam} ወደ ${destCity?.amharicName || toParam} በ ${formattedDate} የተመደበ ጉዞ የለም። እባክዎ የተለየ ቀን ወይም መድረሻ ይምረጡ።`
                      : `No scheduled departures found from ${originCity?.name || fromParam} to ${destCity?.name || toParam} on ${formattedDate}. Try selecting a different date or destination.`}
                    actionText={isAmharic ? "ፍለጋ ቀይር" : "Modify Search"}
                    onAction={() => navigate('/')}
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {trips.map((trip) => (
                      <TripCard
                        key={trip._id}
                        trip={trip}
                        travelDate={dateParam}
                        passengersCount={passengersParam}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Route Photo & Map Panel */}
              <div className="hidden xl:block w-[340px] flex-shrink-0 sticky top-28 h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative flex flex-col">
                {/* View Mode Toggle Pill */}
                <div className="absolute top-3 right-3 z-20 flex items-center bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-md">
                  <button
                    onClick={() => setSideView('photo')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors ${
                      sideView === 'photo'
                        ? 'bg-brand-emerald text-white shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Photo</span>
                  </button>
                  <button
                    onClick={() => setSideView('map')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors ${
                      sideView === 'map'
                        ? 'bg-brand-emerald text-white shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <MapIcon className="w-3 h-3" />
                    <span>Map</span>
                  </button>
                </div>

                {!loading && (
                  <>
                    {sideView === 'photo' && routePhoto ? (
                      <div className="relative w-full h-full bg-gray-900 overflow-hidden">
                        <img
                          src={routePhoto}
                          alt="Route corridor"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                            Ethiopian Scenic Corridor
                          </span>
                        </div>
                      </div>
                    ) : (
                      <iframe
                        title="Route Map"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent((originCity?.name || fromParam) + ' to ' + (destCity?.name || toParam) + ', Ethiopia')}&t=&z=6&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        allowFullScreen
                        className="absolute inset-0 z-0"
                      ></iframe>
                    )}

                    {/* Distance overlay */}
                    {trips.length > 0 && trips[0].route?.distanceKm && (
                      <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-brand-emerald" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-textMuted">
                              {isAmharic ? 'የመንገዱ ርቀት' : 'Route Distance'}
                            </span>
                            <span className="text-sm font-black text-brand-dark">
                              {trips[0].route.distanceKm} km
                            </span>
                          </div>
                        </div>
                        {trips[0].route?.estimatedDurationHours && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-textMuted block">
                              {isAmharic ? 'ግምታዊ ሰዓት' : 'Est. Time'}
                            </span>
                            <span className="text-sm font-black text-brand-dark">
                              ~{trips[0].route.estimatedDurationHours} {isAmharic ? 'ሰዓት' : 'hrs'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
