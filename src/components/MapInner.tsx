'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { FreshnessBadge } from './FreshnessBadge';
import { MapPin, Navigation, Star } from 'lucide-react';

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

interface MapInnerProps {
  booths: PhotoboothMarkerData[];
  selectedBoothId?: string | null;
  onMarkerClick?: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Custom Marker Icon Generator
const createCustomIcon = (isHoveredOrSelected: boolean) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative group cursor-pointer transition-all ${isHoveredOrSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'}">
        <div class="w-9 h-9 rounded-full ${
          isHoveredOrSelected
            ? 'bg-rose-600 border-2 border-white ring-4 ring-rose-300'
            : 'bg-slate-900 border-2 border-white shadow-md'
        } flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-75"></span>
        <div class="w-5 h-5 rounded-full bg-sky-600 border-2 border-white shadow-lg"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to handle map center animation dynamically when selectedBoothId changes
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [map, center, zoom]);
  return null;
}

export default function MapInner({
  booths,
  selectedBoothId,
  onMarkerClick,
  userLocation,
  center = { lat: 27.7172, lng: 85.3240 },
  zoom = 13,
}: MapInnerProps) {
  const selectedBooth = booths.find((b) => b.id === selectedBoothId);
  const activeCenter: [number, number] = selectedBooth
    ? [selectedBooth.latitude, selectedBooth.longitude]
    : [center.lat, center.lng];

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={activeCenter} zoom={selectedBooth ? 15 : zoom} />

        {/* User Geolocation Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserLocationIcon()}>
            <Popup>
              <div className="text-xs font-semibold text-sky-800">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {/* Photobooths Markers */}
        {booths.map((booth) => {
          const isSelected = booth.id === selectedBoothId;
          return (
            <Marker
              key={booth.id}
              position={[booth.latitude, booth.longitude]}
              icon={createCustomIcon(isSelected)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(booth.id);
                },
              }}
            >
              <Popup className="snapspot-custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="mb-1">
                    <FreshnessBadge
                      status={booth.verificationStatus}
                      isDemoData={booth.isDemoData}
                    />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight mb-0.5">
                    {booth.name}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-rose-500 inline" />
                    {booth.area}, {booth.district}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2 rounded-lg mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Price</span>
                      <span className="font-bold text-rose-600">
                        {booth.priceFrom
                          ? `Rs. ${booth.priceFrom}${booth.priceTo ? '–' + booth.priceTo : ''}`
                          : 'Unverified'}
                      </span>
                    </div>
                    {booth.avgRating && (
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{booth.avgRating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/photobooths/${booth.slug}`}
                      className="flex-1 text-center py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                    >
                      View Details
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${booth.latitude},${booth.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                      title="Get Directions"
                    >
                      <Navigation className="w-4 h-4 text-sky-600" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
