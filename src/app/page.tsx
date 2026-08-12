'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Sparkles, ShieldCheck, Navigation, ArrowRight, Camera, CheckCircle } from 'lucide-react';
import { BoothCard, BoothCardData } from '@/components/BoothCard';
import { KATHMANDU_POPULAR_AREAS } from '@/lib/geo';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [featuredBooths, setFeaturedBooths] = useState<BoothCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Fetch initial featured verified booths
    fetch('/api/photobooths?limit=6&sortBy=freshness')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setFeaturedBooths(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedArea !== 'all') params.set('area', selectedArea);
    window.location.href = `/explore?${params.toString()}`;
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          window.location.href = `/explore?lat=${lat}&lng=${lng}&radius=5&sortBy=distance`;
        },
        () => {
          alert('Location access unavailable. You can search by area instead.');
        }
      );
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-rose-50/60 via-white to-slate-50 border-b border-slate-100 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-800 text-xs font-semibold border border-rose-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Kathmandu Valley&apos;s Verified Photo Booth Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
            Find Your Perfect <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600">
              Photo Booth in Kathmandu
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover photo booths around Kathmandu Valley, compare prices and features, and find the best spot for your next memory.
          </p>

          {/* Search Box Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2.5"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by area or booth name (e.g. Thamel, Basantapur, Civil Mall, Patan)..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 text-sm font-medium text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all border border-transparent"
              />
            </div>

            <div className="w-full sm:w-auto min-w-[160px]">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">All Kathmandu Areas</option>
                {KATHMANDU_POPULAR_AREAS.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Find Booths</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <button
              onClick={handleNearMe}
              className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold rounded-xl border border-sky-200 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>Near Me Now</span>
            </button>

            <Link
              href="/recommend"
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-xl border border-amber-200 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>&ldquo;Find Me a Booth&rdquo; Quiz</span>
            </Link>

            <Link
              href="/explore"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Explore Interactive Map</span>
            </Link>
          </div>

          {/* Popular Location Chips */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Popular Areas:</span>
            {KATHMANDU_POPULAR_AREAS.slice(0, 6).map((area) => (
              <Link
                key={area.name}
                href={`/explore?area=${area.name}`}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 font-medium transition-colors"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Verified Booths Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              <Camera className="w-4 h-4" />
              <span>Verified & Fresh Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Popular Photo Booths in Kathmandu
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Kathmandu Booths</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBooths.map((booth) => (
              <BoothCard key={booth.id} booth={booth} />
            ))}
          </div>
        )}
      </section>

      {/* Platform Core Principles & Data Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Our Product Principle</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Not just a map with random pins. <br />
              <span className="text-rose-400">A trustworthy Kathmandu discovery platform.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Information freshness matters. We verify business prices, opening hours, features, and coordinates. Every listing displays its verification badge, last verified date, and source provenance so you never arrive at a closed or overcharged booth.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Verified Prices</h4>
                  <p className="text-slate-400 text-[11px]">Real price ranges in NPR verified by field audits.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Freshness Tracking</h4>
                  <p className="text-slate-400 text-[11px]">Clear badges showing when data was last updated.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">User Reports</h4>
                  <p className="text-slate-400 text-[11px]">Report closed or wrong info with quick admin review.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guided "Find Me a Booth" Teaser Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-200">Personalized Match</span>
            <h3 className="text-2xl sm:text-3xl font-black">Not sure which photo booth to choose?</h3>
            <p className="text-sm text-rose-100 max-w-xl">
              Answer 5 quick questions about your location, budget, preferred style (Korean 4-cut, 360°, selfie), and group size to get instant transparent recommendations.
            </p>
          </div>
          <Link
            href="/recommend"
            className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm rounded-2xl shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>Launch Recommendation Quiz</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
