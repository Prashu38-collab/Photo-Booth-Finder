'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Map } from '@/components/Map';
import { BoothCard, BoothCardData } from '@/components/BoothCard';
import { FilterPanel, FilterState } from '@/components/FilterPanel';
import { Search, MapPin, SlidersHorizontal, Map as MapIcon, List, Navigation } from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();

  // Search & Filter state initialized from URL
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>({
    area: searchParams.get('area') || 'all',
    district: searchParams.get('district') || 'all',
    boothType: searchParams.get('boothType') || 'all',
    budget: searchParams.get('budget') || 'any',
    verificationStatus: searchParams.get('verificationStatus') || 'all',
    groupSize: searchParams.get('groupSize') || 'any',
    selectedFeatures: searchParams.get('features') ? searchParams.get('features')!.split(',') : [],
    sortBy: searchParams.get('sortBy') || 'relevance',
    radiusKm: searchParams.get('radius') ? parseInt(searchParams.get('radius')!, 10) : null,
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    searchParams.get('lat') && searchParams.get('lng')
      ? { lat: parseFloat(searchParams.get('lat')!), lng: parseFloat(searchParams.get('lng')!) }
      : null
  );

  const [booths, setBooths] = useState<BoothCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);

  // Filter options from API
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availableBoothTypes, setAvailableBoothTypes] = useState<{ name: string; slug: string }[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<{ name: string; slug: string }[]>([]);

  // Mobile View Toggle ('list' | 'map')
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Load Metadata (Areas & Features)
  useEffect(() => {
    fetch('/api/areas')
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.areas) setAvailableAreas(data.data.areas);
      })
      .catch(() => {});

    fetch('/api/features')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setAvailableBoothTypes(data.data.boothTypes || []);
          setAvailableFeatures(data.data.features || []);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch photobooths matching filters & search
  const fetchBooths = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (filters.area !== 'all') params.set('area', filters.area);
    if (filters.district !== 'all') params.set('district', filters.district);
    if (filters.boothType !== 'all') params.set('boothType', filters.boothType);
    if (filters.budget !== 'any') params.set('budget', filters.budget);
    if (filters.verificationStatus !== 'all') params.set('verificationStatus', filters.verificationStatus);
    if (filters.groupSize !== 'any') params.set('groupSize', filters.groupSize);
    if (filters.selectedFeatures.length > 0) params.set('features', filters.selectedFeatures.join(','));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (userLocation) {
      params.set('lat', userLocation.lat.toString());
      params.set('lng', userLocation.lng.toString());
      if (filters.radiusKm) params.set('radius', filters.radiusKm.toString());
    }
    params.set('page', page.toString());
    params.set('limit', '12');

    fetch(`/api/photobooths?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setBooths(data.data);
          setTotalPages(data.meta?.totalPages || 1);
          setTotalCount(data.meta?.total || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [searchQuery, filters, userLocation, page]);

  useEffect(() => {
    fetchBooths();
  }, [fetchBooths]);

  const handleRequestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setFilters((prev) => ({ ...prev, radiusKm: prev.radiusKm || 5, sortBy: 'distance' }));
        },
        () => {
          alert('Geolocation denied or unavailable. Please search by Kathmandu area instead.');
        }
      );
    }
  };

  const handleCardClick = (id: string) => {
    setSelectedBoothId(id);
    if (window.innerWidth < 768) {
      setMobileTab('map');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search Thamel, Civil Mall, Patan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        {/* Controls: Sorting & Mobile Filter Drawer toggle */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 text-xs">
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 font-semibold rounded-xl text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium hidden sm:inline">Sort By:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              {userLocation && <option value="distance">Nearest to Me</option>}
              <option value="rating">Highest Rated</option>
              <option value="freshness">Recently Verified</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {!userLocation && (
            <button
              onClick={handleRequestLocation}
              className="hidden lg:flex items-center gap-1 px-3 py-2 bg-sky-50 text-sky-700 font-semibold rounded-xl border border-sky-200 hover:bg-sky-100 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Near Me</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher (Map vs List) */}
      <div className="md:hidden flex rounded-xl bg-slate-200 p-1 text-xs font-bold">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <List className="w-4 h-4" />
          <span>List ({totalCount})</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <MapIcon className="w-4 h-4 text-rose-600" />
          <span>Map View</span>
        </button>
      </div>

      {/* Main Split Layout: Filter Drawer + List + Map */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Filter Panel (Desktop Left Sidebar / Mobile Drawer) */}
        <div
          className={`md:col-span-4 lg:col-span-3 ${
            showFilterDrawer ? 'block' : 'hidden md:block'
          }`}
        >
          <FilterPanel
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1);
            }}
            availableAreas={availableAreas}
            availableBoothTypes={availableBoothTypes}
            availableFeatures={availableFeatures}
            userLocation={userLocation}
            onRequestLocation={handleRequestLocation}
          />
        </div>

        {/* Results List Column */}
        <div
          className={`md:col-span-8 lg:col-span-5 space-y-4 ${
            mobileTab === 'list' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>
              Showing {booths.length} of {totalCount} Kathmandu Photo Booths
            </span>
            {userLocation && (
              <span className="text-sky-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Sorted relative to your location
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : booths.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">No photo booths match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your budget, resetting required features, or searching another neighborhood in Kathmandu Valley.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    area: 'all',
                    district: 'all',
                    boothType: 'all',
                    budget: 'any',
                    verificationStatus: 'all',
                    groupSize: 'any',
                    selectedFeatures: [],
                    sortBy: 'relevance',
                    radiusKm: null,
                  })
                }
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {booths.map((booth) => (
                <div key={booth.id} onClick={() => handleCardClick(booth.id)}>
                  <BoothCard
                    booth={booth}
                    isSelected={selectedBoothId === booth.id}
                    onHover={() => setSelectedBoothId(booth.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Sticky Interactive Leaflet Map Column */}
        <div
          className={`md:col-span-8 lg:col-span-4 md:sticky md:top-20 h-[550px] lg:h-[650px] ${
            mobileTab === 'map' ? 'block' : 'hidden md:block'
          }`}
        >
          <Map
            booths={booths}
            selectedBoothId={selectedBoothId}
            onMarkerClick={(id) => setSelectedBoothId(id)}
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-semibold text-slate-400">Loading Kathmandu Map Explorer...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
