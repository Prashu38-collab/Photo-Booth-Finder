'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex flex-col items-center justify-center text-slate-400">
      <div className="w-10 h-10 rounded-full bg-slate-200 mb-2"></div>
      <p className="text-xs font-semibold">Loading Kathmandu Interactive Map...</p>
    </div>
  ),
});

interface PhotoboothMarkerData {
  id: string;
  name: string;
  slug: string;
  area: string;
  district: string;
  latitude: number;
  longitude: number;
  priceFrom?: number | null;
  priceTo?: number | null;
  verificationStatus: string;
  isDemoData?: boolean;
  boothType?: { name: string };
  avgRating?: number | null;
  distanceKm?: number | null;
}

interface MapProps {
  booths: PhotoboothMarkerData[];
  selectedBoothId?: string | null;
  onMarkerClick?: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function Map(props: MapProps) {
  return <MapInner {...props} />;
}
