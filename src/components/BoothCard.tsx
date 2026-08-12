'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Heart, Navigation, ChevronRight, Layers } from 'lucide-react';
import { FreshnessBadge } from './FreshnessBadge';
import { formatDistance } from '@/lib/geo';

export interface BoothCardData {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  area: string;
  district: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  instagram?: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  verificationStatus: string;
  isDemoData?: boolean;
  lastVerifiedAt?: string | Date | null;
  verifiedBySource?: string | null;
  boothType: {
    name: string;
    slug: string;
  };
  features?: {
    feature: {
      name: string;
      slug: string;
    };
  }[];
  photos?: { url: string; isPrimary?: boolean }[];
  avgRating?: number | null;
  reviewCount?: number;
  distanceKm?: number | null;
}

interface BoothCardProps {
  booth: BoothCardData;
  isSelected?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export function BoothCard({ booth, isSelected = false, onHover, onLeave }: BoothCardProps) {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('snapspot_favs') || '[]');
      setIsFavorite(favs.includes(booth.id));
    } catch {}
  }, [booth.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('snapspot_favs') || '[]');
      let updated: string[] = [];
      if (favs.includes(booth.id)) {
        updated = favs.filter((id) => id !== booth.id);
        setIsFavorite(false);
      } else {
        updated = [...favs, booth.id];
        setIsFavorite(true);
      }
      localStorage.setItem('snapspot_favs', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const primaryPhoto =
    booth.photos && booth.photos.length > 0
      ? booth.photos.find((p) => p.isPrimary)?.url || booth.photos[0].url
      : '/placeholder-booth.svg';

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'border-rose-500 ring-2 ring-rose-300 shadow-lg scale-[1.01]'
          : 'border-slate-200 hover:border-rose-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
          <Image
            src={primaryPhoto}
            alt={booth.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Overlay Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <FreshnessBadge
              status={booth.verificationStatus}
              isDemoData={booth.isDemoData}
              lastVerifiedAt={booth.lastVerifiedAt}
              source={booth.verifiedBySource}
            />

            <button
              onClick={toggleFavorite}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 shadow-sm hover:scale-110 transition-transform"
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-rose-500'
                }`}
              />
            </button>
          </div>

          {/* Distance Tag if available */}
          {booth.distanceKm !== undefined && booth.distanceKm !== null && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow">
              <Navigation className="w-3 h-3 text-sky-400" />
              <span>{formatDistance(booth.distanceKm)} away</span>
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="p-4 space-y-3">
          {/* Category Pill & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              <Layers className="w-3 h-3" />
              {booth.boothType.name}
            </span>

            {booth.avgRating ? (
              <div className="flex items-center gap-1 text-slate-800 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{booth.avgRating}</span>
                <span className="text-[10px] text-slate-400 font-normal">({booth.reviewCount || 0})</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium italic">No reviews yet</span>
            )}
          </div>

          {/* Name & Area */}
          <div>
            <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-rose-600 transition-colors">
              <Link href={`/photobooths/${booth.slug}`}>{booth.name}</Link>
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="font-medium text-slate-700">{booth.area}</span>, {booth.district}
            </p>
          </div>

          {/* Features preview pills */}
          {booth.features && booth.features.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {booth.features.slice(0, 3).map((f) => (
                <span
                  key={f.feature.slug}
                  className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                >
                  {f.feature.name}
                </span>
              ))}
              {booth.features.length > 3 && (
                <span className="text-[10px] font-medium text-slate-400 px-1 py-0.5">
                  +{booth.features.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Price & Action */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Price Range</span>
          <span className="font-extrabold text-sm text-slate-900">
            {booth.priceFrom
              ? `Rs. ${booth.priceFrom}${booth.priceTo ? ' – ' + booth.priceTo : ''}`
              : 'Price not verified'}
          </span>
        </div>

        <Link
          href={`/photobooths/${booth.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-200"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
