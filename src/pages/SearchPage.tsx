import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  ArrowUpDown,
  X,
  AlertCircle,
  HelpCircle,
  PlusCircle,
  ChevronRight,
  Map as MapIcon,
  List as ListIcon,
  RotateCcw,
} from 'lucide-react';
import { SAMPLE_PROVIDERS } from '../data/providers';
import { Provider, SearchFilters, ProviderType, AnimalSpecies } from '../types';
import { ProviderCard, TYPE_LABELS } from '../components/provider/ProviderCard';
import { ProviderCardSkeleton } from '../components/provider/ProviderCardSkeleton';
import { FilterPanel } from '../components/search/FilterPanel';
import { DirectoryMap } from '../components/map/DirectoryMap';
import { Button } from '../components/ui/Button';
import { computeProviderOpenStatus } from '../utils/time';
import { calculateDistanceKm } from '../utils/distance';
import { track } from '../utils/analytics';
import { useDemo } from '../context/DemoContext';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { clockOverride, selectedCity, setSelectedCity, userCoords, latencyMs } = useDemo();

  // Search input state
  const [queryInput, setQueryInput] = useState<string>(searchParams.get('q') || '');
  const [cityInput, setCityInput] = useState<string>(searchParams.get('city') || selectedCity);

  // Layout & Mobile View State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'map'>('list');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  const loadMoreBtnRef = useRef<HTMLButtonElement>(null);
  const firstNewCardRef = useRef<HTMLDivElement>(null);

  // Sync state from URL query parameters
  const activeFilters: SearchFilters = useMemo(() => {
    const category = searchParams.get('type') as ProviderType | 'all' | null;
    const openNow = searchParams.get('openNow') === '1';
    const emergency24x7 = searchParams.get('emergency') === '1';
    const maxDistanceKm = searchParams.get('distance')
      ? parseInt(searchParams.get('distance')!, 10)
      : undefined;
    const animalsParam = searchParams.get('animals');
    const animals = animalsParam ? (animalsParam.split(',') as AnimalSpecies[]) : undefined;
    const service = searchParams.get('service') || undefined;
    const verifiedOnly = searchParams.get('verified') === '1';
    const minRating4 = searchParams.get('rating4') === '1';
    const feeRange = (searchParams.get('fee') as any) || 'all';
    const sort = (searchParams.get('sort') as any) || 'best_match';

    // Type-specific
    const hasCctv = searchParams.get('cctv') === '1';
    const cageFree = searchParams.get('cageFree') === '1';
    const homeSampleCollection = searchParams.get('homeSample') === '1';
    const hasOxygen = searchParams.get('oxygen') === '1';
    const acceptsDonations = searchParams.get('donations') === '1';
    const acceptsAdoption = searchParams.get('adoption') === '1';

    return {
      query: searchParams.get('q') || '',
      city: searchParams.get('city') || selectedCity,
      category: category || 'all',
      openNow,
      emergency24x7,
      maxDistanceKm,
      animals,
      service,
      verifiedOnly,
      minRating4,
      feeRange,
      sort,
      hasCctv,
      cageFree,
      homeSampleCollection,
      hasOxygen,
      acceptsDonations,
      acceptsAdoption,
    };
  }, [searchParams, selectedCity]);

  // Update URL Search Params when filters change
  const updateUrlFilters = (next: Partial<SearchFilters>) => {
    const merged = { ...activeFilters, ...next };
    const params = new URLSearchParams();

    if (merged.query) params.set('q', merged.query);
    if (merged.city && merged.city !== 'All') params.set('city', merged.city);
    if (merged.category && merged.category !== 'all') params.set('type', merged.category);
    if (merged.openNow) params.set('openNow', '1');
    if (merged.emergency24x7) params.set('emergency', '1');
    if (merged.maxDistanceKm) params.set('distance', merged.maxDistanceKm.toString());
    if (merged.animals && merged.animals.length > 0) params.set('animals', merged.animals.join(','));
    if (merged.service) params.set('service', merged.service);
    if (merged.verifiedOnly) params.set('verified', '1');
    if (merged.minRating4) params.set('rating4', '1');
    if (merged.feeRange && merged.feeRange !== 'all') params.set('fee', merged.feeRange);
    if (merged.sort && merged.sort !== 'best_match') params.set('sort', merged.sort);

    // Facets
    if (merged.hasCctv) params.set('cctv', '1');
    if (merged.cageFree) params.set('cageFree', '1');
    if (merged.homeSampleCollection) params.set('homeSample', '1');
    if (merged.hasOxygen) params.set('oxygen', '1');
    if (merged.acceptsDonations) params.set('donations', '1');
    if (merged.acceptsAdoption) params.set('adoption', '1');

    setSearchParams(params);
    track('filter_change', { filters: Object.fromEntries(params.entries()) });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setQueryInput('');
    track('filter_change', { action: 'reset_all' });
  };

  // Typo tolerance matching dictionary
  const normalizeText = (text: string) => {
    let lower = text.toLowerCase().trim();
    // Common typo mapping for animal search
    lower = lower.replace(/vetenary|vetenary|veternary|vetanary/g, 'veterinary');
    lower = lower.replace(/clinc|clnic|clinik/g, 'clinic');
    lower = lower.replace(/hospitl|hosptal/g, 'hospital');
    lower = lower.replace(/doc|docter/g, 'doctor');
    lower = lower.replace(/ambulanc|ambulence/g, 'ambulance');
    lower = lower.replace(/bording|bordng/g, 'boarding');
    return lower;
  };

  // Filter & Sort computation
  const filteredProviders = useMemo(() => {
    const rawQuery = normalizeText(activeFilters.query || '');
    const currentCity = activeFilters.city;

    return SAMPLE_PROVIDERS.filter((prov) => {
      // 1. Permanently closed items are hidden from search results as per spec
      if (prov.status === 'permanently_closed') {
        return false;
      }

      // 2. City filter
      if (currentCity && currentCity !== 'All' && prov.address.city.toLowerCase() !== currentCity.toLowerCase()) {
        return false;
      }

      // 3. Category
      if (activeFilters.category && activeFilters.category !== 'all') {
        if (!prov.types.includes(activeFilters.category)) return false;
      }

      // 4. Open Now
      if (activeFilters.openNow) {
        const openStatus = computeProviderOpenStatus(prov, clockOverride);
        if (openStatus.state !== 'open' && openStatus.state !== 'open_24x7' && openStatus.state !== 'closing_soon') {
          return false;
        }
      }

      // 5. 24x7 Emergency Ready
      if (activeFilters.emergency24x7) {
        const is24x7 = prov.hours?.is24x7 || prov.hours?.emergency === '24x7' || prov.types.includes('ambulance');
        if (!is24x7) return false;
      }

      // 6. Distance
      if (activeFilters.maxDistanceKm) {
        const dist = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          prov.address.lat,
          prov.address.lng
        );
        if (dist > activeFilters.maxDistanceKm) return false;
      }

      // 7. Animals treated
      if (activeFilters.animals && activeFilters.animals.length > 0) {
        const hasMatchingAnimal = activeFilters.animals.some((a) => prov.animals.includes(a));
        if (!hasMatchingAnimal) return false;
      }

      // 8. Service filter
      if (activeFilters.service) {
        const targetSrv = activeFilters.service.toLowerCase();
        const hasSrv = prov.services.some((s) => s.name.toLowerCase().includes(targetSrv));
        if (!hasSrv) return false;
      }

      // 9. Verified Only
      if (activeFilters.verifiedOnly && prov.verification !== 'document') {
        return false;
      }

      // 10. Rating 4+
      if (activeFilters.minRating4 && (!prov.rating || prov.rating.value < 4.0)) {
        return false;
      }

      // 11. Fee Range
      if (activeFilters.feeRange && activeFilters.feeRange !== 'all') {
        const minFee = prov.services.reduce((min, s) => {
          if (s.fromPrice !== undefined && s.fromPrice > 0) {
            return min === null ? s.fromPrice : Math.min(min, s.fromPrice);
          }
          return min;
        }, null as number | null);

        if (minFee === null) return false;
        if (activeFilters.feeRange === 'under_500' && minFee > 500) return false;
        if (activeFilters.feeRange === '500_1000' && (minFee < 500 || minFee > 1000)) return false;
        if (activeFilters.feeRange === 'above_1000' && minFee <= 1000) return false;
      }

      // 12. Type-specific Facets
      if (activeFilters.hasCctv && !prov.typeSpecific?.hasCctv) return false;
      if (activeFilters.cageFree && !prov.typeSpecific?.cageFree) return false;
      if (activeFilters.homeSampleCollection && !prov.typeSpecific?.homeSampleCollection) return false;
      if (activeFilters.hasOxygen && !prov.typeSpecific?.hasOxygen) return false;
      if (activeFilters.acceptsDonations && !prov.typeSpecific?.acceptsDonations) return false;
      if (activeFilters.acceptsAdoption && !prov.typeSpecific?.acceptsAdoption) return false;

      // 13. Query Search (Name, Area, Services, About)
      if (rawQuery) {
        const matchName = normalizeText(prov.name).includes(rawQuery);
        const matchArea = normalizeText(prov.address.area).includes(rawQuery);
        const matchService = prov.services.some((s) =>
          normalizeText(s.name).includes(rawQuery)
        );
        const matchAbout = normalizeText(prov.about).includes(rawQuery);
        if (!matchName && !matchArea && !matchService && !matchAbout) return false;
      }

      return true;
    });
  }, [activeFilters, clockOverride, userCoords]);

  // Sort logic
  const sortedProviders = useMemo(() => {
    const list = [...filteredProviders];
    const sort = activeFilters.sort || 'best_match';

    list.sort((a, b) => {
      const distA = calculateDistanceKm(userCoords.lat, userCoords.lng, a.address.lat, a.address.lng);
      const distB = calculateDistanceKm(userCoords.lat, userCoords.lng, b.address.lat, b.address.lng);

      if (sort === 'nearest') {
        return distA - distB;
      }

      if (sort === 'rating') {
        const ratingA = a.rating ? a.rating.value : 0;
        const ratingB = b.rating ? b.rating.value : 0;
        return ratingB - ratingA;
      }

      if (sort === 'open_now') {
        const statusA = computeProviderOpenStatus(a, clockOverride).state === 'open' ? 1 : 0;
        const statusB = computeProviderOpenStatus(b, clockOverride).state === 'open' ? 1 : 0;
        return statusB - statusA;
      }

      if (sort === 'fee_asc') {
        const feeA = a.services[0]?.fromPrice || 99999;
        const feeB = b.services[0]?.fromPrice || 99999;
        return feeA - feeB;
      }

      // Best match (Document verified first, then distance)
      const verWeightA = a.verification === 'document' ? 2 : a.verification === 'phone' ? 1 : 0;
      const verWeightB = b.verification === 'document' ? 2 : b.verification === 'phone' ? 1 : 0;
      if (verWeightB !== verWeightA) return verWeightB - verWeightA;

      return distA - distB;
    });

    return list;
  }, [filteredProviders, activeFilters.sort, userCoords, clockOverride]);

  // Simulate smooth loading with 300ms minimum to prevent layout shifts/flicker
  useEffect(() => {
    setIsLoading(true);
    const delay = Math.max(300, latencyMs);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [searchParams, latencyMs]);

  // Load More handler
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
    setTimeout(() => {
      firstNewCardRef.current?.focus();
    }, 100);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlFilters({ query: queryInput, city: cityInput });
    track('search_submit', { query: queryInput, city: cityInput });
  };

  // Count active filter tags
  const activeChipsCount = useMemo(() => {
    let count = 0;
    if (activeFilters.category && activeFilters.category !== 'all') count++;
    if (activeFilters.openNow) count++;
    if (activeFilters.emergency24x7) count++;
    if (activeFilters.maxDistanceKm) count++;
    if (activeFilters.animals?.length) count += activeFilters.animals.length;
    if (activeFilters.service) count++;
    if (activeFilters.verifiedOnly) count++;
    if (activeFilters.minRating4) count++;
    if (activeFilters.feeRange && activeFilters.feeRange !== 'all') count++;
    return count;
  }, [activeFilters]);

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* 1. Compact Emergency Strip on /search as per signature details */}
      <div className="bg-alert-100 border-b border-alert-700/20 py-2.5 px-4 text-xs">
        <div className="max-w-container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-alert-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 animate-pulse text-alert-700" strokeWidth={2} />
            <span className="line-clamp-1">
              <strong>Need urgent emergency care?</strong> 24×7 hospitals and ambulances ready now.
            </span>
          </div>
          <Link
            to="/emergency"
            onClick={() => track('emergency_open', { source: 'search_strip' })}
            className="shrink-0 font-bold text-alert-700 hover:underline flex items-center gap-1"
          >
            <span>Open Emergency Mode</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Top Search / Location Bar */}
      <section className="bg-surface border-b border-sand-200 py-4 px-4 sm:px-6 shadow-subtle">
        <div className="max-w-container mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
          >
            {/* Query Input */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search clinics, vets, services (e.g. Vaccination, X-Ray, Dr. Ramesh)"
                className="w-full pl-10 pr-4 py-2.5 rounded-btn border border-ink-400 bg-surface text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-moss-700"
              />
            </div>

            {/* City Selector */}
            <div className="relative sm:w-48">
              <MapPin
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-moss-700"
                strokeWidth={1.5}
              />
              <select
                aria-label="Filter by City"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setSelectedCity(e.target.value);
                  updateUrlFilters({ city: e.target.value });
                }}
                className="w-full pl-10 pr-8 py-2.5 rounded-btn border border-ink-400 bg-surface text-base text-ink-900 font-medium focus:outline-none focus:ring-2 focus:ring-moss-700 cursor-pointer"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
              </select>
            </div>

            {/* Primary Search Button */}
            <Button
              variant="primary"
              size="md"
              type="submit"
              className="bg-moss-700 text-white font-semibold"
            >
              <span>Search</span>
            </Button>
          </form>

          {/* Quick Filter Horizontal Scroll Bar (Scrolls with snap on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 mt-1 text-xs">
            {/* Mobile Filters trigger button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-sand-100 hover:bg-sand-200 border border-sand-200 text-ink-900 font-semibold shrink-0"
            >
              <Filter className="w-3.5 h-3.5 text-moss-700" />
              <span>Filters {activeChipsCount > 0 && `(${activeChipsCount})`}</span>
            </button>

            {/* Quick chips */}
            <button
              type="button"
              onClick={() => updateUrlFilters({ openNow: !activeFilters.openNow })}
              className={`px-3 py-1.5 rounded-pill font-medium shrink-0 border transition-colors ${
                activeFilters.openNow
                  ? 'bg-moss-700 text-white border-moss-700'
                  : 'bg-surface text-ink-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              Open now
            </button>

            <button
              type="button"
              onClick={() => updateUrlFilters({ emergency24x7: !activeFilters.emergency24x7 })}
              className={`px-3 py-1.5 rounded-pill font-medium shrink-0 border transition-colors ${
                activeFilters.emergency24x7
                  ? 'bg-alert-700 text-white border-alert-700'
                  : 'bg-surface text-ink-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              24×7 Emergency
            </button>

            <button
              type="button"
              onClick={() =>
                updateUrlFilters({
                  maxDistanceKm: activeFilters.maxDistanceKm === 5 ? undefined : 5,
                })
              }
              className={`px-3 py-1.5 rounded-pill font-medium shrink-0 border transition-colors tabular-nums ${
                activeFilters.maxDistanceKm === 5
                  ? 'bg-moss-700 text-white border-moss-700'
                  : 'bg-surface text-ink-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              Within 5 km
            </button>

            <button
              type="button"
              onClick={() => updateUrlFilters({ verifiedOnly: !activeFilters.verifiedOnly })}
              className={`px-3 py-1.5 rounded-pill font-medium shrink-0 border transition-colors ${
                activeFilters.verifiedOnly
                  ? 'bg-moss-700 text-white border-moss-700'
                  : 'bg-surface text-ink-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              Document-verified
            </button>

            <button
              type="button"
              onClick={() => {
                const animals = activeFilters.animals?.includes('dog')
                  ? activeFilters.animals.filter((a) => a !== 'dog')
                  : [...(activeFilters.animals || []), 'dog' as AnimalSpecies];
                updateUrlFilters({ animals });
              }}
              className={`px-3 py-1.5 rounded-pill font-medium shrink-0 border transition-colors ${
                activeFilters.animals?.includes('dog')
                  ? 'bg-moss-700 text-white border-moss-700'
                  : 'bg-surface text-ink-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              Dogs
            </button>

            <button
              type="button"
              onClick={() => {
                const animals = activeFilters.animals?.includes('cat')
                  ? activeFilters.animals.filter((a) => a !== 'cat')
                  : [...(activeFilters.animals || []), 'cat' as AnimalSpecies];
                updateUrlFilters({ animals });
              }}
              className={`px-3 py-1.5 rounded-pill font-medium shrink-0 border transition-colors ${
                activeFilters.animals?.includes('cat')
                  ? 'bg-moss-700 text-white border-moss-700'
                  : 'bg-surface text-ink-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              Cats
            </button>

            <button
              type="button"
              onClick={() => {
                const animals = activeFilters.animals?.includes('exotic')
                  ? activeFilters.animals.filter((a) => a !== 'exotic')
                  : [...(activeFilters.animals || []), 'exotic' as AnimalSpecies];
                updateUrlFilters({ animals });
              }}
              className={`px-3 py-1.5 rounded-pill font-medium shrink-0 border transition-colors ${
                activeFilters.animals?.includes('exotic')
                  ? 'bg-moss-700 text-white border-moss-700'
                  : 'bg-surface text-ink-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              Exotics
            </button>
          </div>
        </div>
      </section>

      {/* 3. Main Content: Results bar + Filter Rail (280px) + List + Map (40%) */}
      <main className="max-w-container mx-auto px-4 md:px-6 pt-6">
        
        {/* Results Count & Sort Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-sand-200">
          <div className="flex items-center gap-2">
            <h1
              className="text-lg sm:text-xl font-bold font-serif text-ink-900"
              aria-live="polite"
              aria-atomic="true"
            >
              {isLoading ? (
                'Finding care nearby…'
              ) : (
                <>
                  <span className="tabular-nums">{sortedProviders.length}</span> verified{' '}
                  {activeFilters.category !== 'all'
                    ? TYPE_LABELS[activeFilters.category!]
                    : 'animal care providers'}{' '}
                  in {activeFilters.city}
                </>
              )}
            </h1>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs text-ink-700 self-end sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-500" />
            <label htmlFor="search-sort" className="font-medium">
              Sort by:
            </label>
            <select
              id="search-sort"
              value={activeFilters.sort || 'best_match'}
              onChange={(e) => {
                updateUrlFilters({ sort: e.target.value as any });
                track('sort_change', { sort: e.target.value });
              }}
              className="bg-surface border border-ink-400 rounded-btn text-xs font-semibold text-ink-900 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-moss-700 cursor-pointer"
            >
              <option value="best_match">Best match</option>
              <option value="nearest">Nearest</option>
              <option value="open_now">Open now first</option>
              <option value="rating">Highest rating</option>
              <option value="fee_asc">Fee: Low to high</option>
            </select>
          </div>
        </div>

        {/* Removable Active Filter Chips */}
        {activeChipsCount > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6">
            <span className="text-xs text-ink-500 font-medium">Active filters:</span>

            {activeFilters.category && activeFilters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-moss-50 border border-moss-700/30 text-moss-800 text-xs font-medium">
                Category: {TYPE_LABELS[activeFilters.category]}
                <button
                  type="button"
                  onClick={() => updateUrlFilters({ category: 'all' })}
                  className="hover:text-alert-700 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilters.openNow && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-moss-50 border border-moss-700/30 text-moss-800 text-xs font-medium">
                Open now
                <button
                  type="button"
                  onClick={() => updateUrlFilters({ openNow: false })}
                  className="hover:text-alert-700 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilters.emergency24x7 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-alert-100 border border-alert-700/30 text-alert-700 text-xs font-medium">
                24×7 Emergency
                <button
                  type="button"
                  onClick={() => updateUrlFilters({ emergency24x7: false })}
                  className="hover:text-alert-700 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilters.maxDistanceKm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-sand-100 border border-sand-200 text-ink-900 text-xs font-medium tabular-nums">
                Within {activeFilters.maxDistanceKm} km
                <button
                  type="button"
                  onClick={() => updateUrlFilters({ maxDistanceKm: undefined })}
                  className="hover:text-alert-700 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeFilters.animals?.map((sp) => (
              <span
                key={sp}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-sand-100 border border-sand-200 text-ink-900 text-xs font-medium"
              >
                Treats: {sp}
                <button
                  type="button"
                  onClick={() => {
                    const next = activeFilters.animals?.filter((a) => a !== sp);
                    updateUrlFilters({ animals: next });
                  }}
                  className="hover:text-alert-700 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-moss-700 font-semibold hover:underline flex items-center gap-1 ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* 3-Column Layout: Filter Rail (280px) | Card List | Sticky Map (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Desktop Filter Rail (280px width) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <FilterPanel
              filters={activeFilters}
              onChange={updateUrlFilters}
              onReset={handleResetFilters}
              resultCount={sortedProviders.length}
            />
          </div>

          {/* Center Column: Listings or Map in Mobile Toggle */}
          <div
            className={`col-span-1 lg:col-span-5 space-y-4 ${
              mobileViewMode === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Loading Skeletons with exact card size for zero layout shift */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <ProviderCardSkeleton key={idx} />
                ))}
              </div>
            ) : sortedProviders.length === 0 ? (
              /* No Results Edge Case */
              <div className="bg-surface rounded-card border border-sand-200 p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-sand-100 text-ink-500 rounded-full flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6 text-moss-700" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-ink-900">
                    No matching providers found
                  </h3>
                  <p className="text-sm text-ink-500 max-w-sm mx-auto">
                    We couldn’t find any care facility matching your exact combination of filters in{' '}
                    {activeFilters.city}.
                  </p>
                </div>

                {/* Suggestions */}
                <div className="pt-2 flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => updateUrlFilters({ maxDistanceKm: 25 })}
                    className="text-xs bg-sand-100 hover:bg-sand-200 text-ink-900 px-3 py-1.5 rounded-pill font-medium border border-sand-200"
                  >
                    Widen radius to 25 km
                  </button>
                  <button
                    type="button"
                    onClick={() => updateUrlFilters({ category: 'all' })}
                    className="text-xs bg-sand-100 hover:bg-sand-200 text-ink-900 px-3 py-1.5 rounded-pill font-medium border border-sand-200"
                  >
                    All categories
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs bg-moss-50 hover:bg-moss-100 text-moss-800 px-3 py-1.5 rounded-pill font-medium border border-moss-700/30"
                  >
                    Reset all filters
                  </button>
                </div>

                <div className="pt-4 border-t border-sand-200">
                  <p className="text-xs text-ink-500 mb-2">Know a clinic or rescue here?</p>
                  <Link to="/list-your-business">
                    <Button variant="outline" size="sm" className="border-ink-400">
                      <PlusCircle className="w-4 h-4 mr-1.5 text-moss-700" />
                      <span>Add a Provider</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Provider Cards */
              <>
                <div className="space-y-4">
                  {sortedProviders.slice(0, visibleCount).map((provider, index) => (
                    <div
                      key={provider.id}
                      ref={index === 12 ? firstNewCardRef : undefined}
                      tabIndex={-1}
                    >
                      <ProviderCard
                        provider={provider}
                        isHovered={hoveredCardId === provider.id}
                        onHover={setHoveredCardId}
                      />
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {sortedProviders.length > visibleCount && (
                  <div className="pt-4 text-center">
                    <Button
                      ref={loadMoreBtnRef}
                      variant="outline"
                      size="md"
                      onClick={handleLoadMore}
                      className="border-ink-400 font-semibold text-ink-900"
                    >
                      <span>Load more results</span>
                      <span className="text-xs text-ink-500 ml-1">
                        ({visibleCount} of {sortedProviders.length})
                      </span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Sticky Map (40% viewport on desktop) */}
          <div
            className={`col-span-1 lg:col-span-4 sticky top-24 ${
              mobileViewMode === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <DirectoryMap
              providers={sortedProviders.slice(0, visibleCount)}
              hoveredId={hoveredCardId}
              onMarkerHover={setHoveredCardId}
              className="h-[calc(100vh-140px)]"
            />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar [Filters (n)] [Map / List] */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-sm border-t border-sand-200 p-3 shadow-floating flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 border-ink-400 font-semibold"
        >
          <Filter className="w-4 h-4 mr-1.5 text-moss-700" />
          <span>Filters {activeChipsCount > 0 && `(${activeChipsCount})`}</span>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setMobileViewMode(mobileViewMode === 'list' ? 'map' : 'list')}
          className="flex-1 font-semibold"
        >
          {mobileViewMode === 'list' ? (
            <>
              <MapIcon className="w-4 h-4 mr-1.5 text-moss-700" />
              <span>Map View</span>
            </>
          ) : (
            <>
              <ListIcon className="w-4 h-4 mr-1.5 text-moss-700" />
              <span>List View</span>
            </>
          )}
        </Button>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {mobileFilterOpen && (
        <FilterPanel
          filters={activeFilters}
          onChange={updateUrlFilters}
          onReset={handleResetFilters}
          resultCount={sortedProviders.length}
          isMobileModal
          onCloseMobile={() => setMobileFilterOpen(false)}
        />
      )}
    </div>
  );
};
