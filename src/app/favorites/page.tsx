'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MapPin, ArrowRight } from 'lucide-react';
import { BoothCard, BoothCardData } from '@/components/BoothCard';

export default function FavoritesPage() {
  const [favoriteBooths, setFavoriteBooths] = useState<BoothCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const favIds: string[] = JSON.parse(localStorage.getItem('snapspot_favs') || '[]');
      if (favIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all booths and filter saved ones
      fetch('/api/photobooths?limit=50')
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            const saved = data.data.filter((b: BoothCardData) => favIds.includes(b.id));
            setFavoriteBooths(saved);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Saved Favorites</h1>
            <p className="text-xs text-slate-500">Quick access to photo booths you bookmarked in Kathmandu.</p>
          </div>
        </div>

        <Link
          href="/explore"
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
        >
          <span>Explore Map</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : favoriteBooths.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm max-w-md mx-auto">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">No saved photo booths yet</h3>
          <p className="text-xs text-slate-500">
            Click the heart icon on any photo booth card to save it for your next trip.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>Discover Kathmandu Booths</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteBooths.map((booth) => (
            <BoothCard key={booth.id} booth={booth} />
          ))}
        </div>
      )}
    </div>
  );
}
