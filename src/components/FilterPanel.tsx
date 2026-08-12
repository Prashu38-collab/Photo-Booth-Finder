'use client';

import React from 'react';
import { RotateCcw, ShieldCheck, MapPin, Filter, Layers, DollarSign, Users } from 'lucide-react';

export interface FilterState {
  area: string;
  district: string;
  boothType: string;
  budget: string;
  verificationStatus: string;
  groupSize: string;
  selectedFeatures: string[];
  sortBy: string;
  radiusKm: number | null;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  availableAreas: string[];
  availableBoothTypes: { name: string; slug: string }[];
  availableFeatures: { name: string; slug: string }[];
  userLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
}

export function FilterPanel({
  filters,
  onChange,
  availableAreas,
  availableBoothTypes,
  availableFeatures,
  userLocation,
  onRequestLocation,
}: FilterPanelProps) {
  const handleReset = () => {
    onChange({
      area: 'all',
      district: 'all',
      boothType: 'all',
      budget: 'any',
      verificationStatus: 'all',
      groupSize: 'any',
      selectedFeatures: [],
      sortBy: 'relevance',
      radiusKm: null,
    });
  };

  const toggleFeature = (slug: string) => {
    const exists = filters.selectedFeatures.includes(slug);
    const updated = exists
      ? filters.selectedFeatures.filter((f) => f !== slug)
      : [...filters.selectedFeatures, slug];
    onChange({ ...filters, selectedFeatures: updated });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-sm text-slate-800">
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Filter className="w-4 h-4 text-rose-600" />
          <span>Filter Photobooths</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Near Me & Location Radius */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>Distance / Near Me</span>
        </label>
        {userLocation ? (
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Search Radius:</span>
              <span className="font-bold text-rose-600">
                {filters.radiusKm ? `${filters.radiusKm} km` : 'Entire Valley'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={filters.radiusKm || 15}
              onChange={(e) =>
                onChange({ ...filters, radiusKm: parseInt(e.target.value, 10) })
              }
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>
        ) : (
          <button
            onClick={onRequestLocation}
            className="w-full text-left py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center justify-between transition-colors"
          >
            <span>Use My Current Location</span>
            <MapPin className="w-4 h-4 text-rose-600 animate-bounce" />
          </button>
        )}
      </div>

      {/* Neighborhood / Area Dropdown */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Kathmandu Area
        </label>
        <select
          value={filters.area}
          onChange={(e) => onChange({ ...filters, area: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
        >
          <option value="all">All Areas in Kathmandu Valley</option>
          {availableAreas.map((areaName) => (
            <option key={areaName} value={areaName}>
              {areaName}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Range Options */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Price Budget</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'any', label: 'Any Budget' },
            { id: 'under-300', label: 'Under Rs. 300' },
            { id: '300-500', label: 'Rs. 300–500' },
            { id: '500-1000', label: 'Rs. 500–1000' },
            { id: 'above-1000', label: 'Above Rs. 1000' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => onChange({ ...filters, budget: b.id })}
              className={`py-1.5 px-2.5 rounded-lg text-left font-medium transition-all ${
                filters.budget === b.id
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Booth Style / Type */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Booth Style</span>
        </label>
        <select
          value={filters.boothType}
          onChange={(e) => onChange({ ...filters, boothType: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
        >
          <option value="all">All Styles (Korean 4-cut, 360°, Selfie, Mirror)</option>
          {availableBoothTypes.map((bt) => (
            <option key={bt.slug} value={bt.slug}>
              {bt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Verification Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Information Freshness</span>
        </label>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => onChange({ ...filters, verificationStatus: 'all' })}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium border text-center ${
              filters.verificationStatus === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            All Listings
          </button>
          <button
            onClick={() => onChange({ ...filters, verificationStatus: 'VERIFIED' })}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold border text-center flex items-center justify-center gap-1 ${
              filters.verificationStatus === 'VERIFIED'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Only
          </button>
        </div>
      </div>

      {/* Suitability Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-purple-500" />
          <span>Going With</span>
        </label>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'any', label: 'Anyone' },
            { id: 'solo', label: 'Solo' },
            { id: 'couple', label: 'Couple' },
            { id: 'friends', label: 'Friends' },
            { id: 'group', label: 'Large Group' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => onChange({ ...filters, groupSize: g.id })}
              className={`py-1 px-2.5 rounded-full text-xs font-medium border transition-colors ${
                filters.groupSize === g.id
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Features Checkboxes */}
      {availableFeatures.length > 0 && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Required Features
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableFeatures.map((f) => {
              const isChecked = filters.selectedFeatures.includes(f.slug);
              return (
                <label
                  key={f.slug}
                  className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFeature(f.slug)}
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{f.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
