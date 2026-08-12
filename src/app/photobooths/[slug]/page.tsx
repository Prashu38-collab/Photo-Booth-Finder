'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FreshnessBadge } from '@/components/FreshnessBadge';
import { Map } from '@/components/Map';
import { ReviewModal } from '@/components/ReviewModal';
import { ReportModal } from '@/components/ReportModal';
import { MapPin, Navigation, Phone, Instagram, Globe, Clock, Star, AlertTriangle, Layers, Heart, ShieldCheck, ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft } from 'lucide-react';
import { AspectSentiment } from '@/lib/sentiment';

interface BoothDetailData {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  area: string;
  district: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  verificationStatus: string;
  isDemoData: boolean;
  verifiedBySource: string | null;
  lastVerifiedAt: string | null;
  updatedAt: string;
  boothType: {
    name: string;
    description: string | null;
  };
  features: {
    feature: {
      id: string;
      name: string;
      slug: string;
      category: string;
    };
  }[];
  photos: { id: string; url: string; caption?: string; isPrimary: boolean }[];
  openingHours: { id: string; dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { name: string; role: string };
  }[];
  avgRating: number | null;
  reviewCount: number;
  aspectSentiments: AspectSentiment[];
}

const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BoothDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [booth, setBooth] = useState<BoothDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [activePhoto, setActivePhoto] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const fetchDetails = () => {
    setLoading(true);
    fetch(`/api/photobooths/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Photo booth not found.');
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setBooth(data.data);
          if (data.data.photos && data.data.photos.length > 0) {
            setActivePhoto(data.data.photos[0].url);
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [slug]);

  useEffect(() => {
    if (booth) {
      try {
        const favs: string[] = JSON.parse(localStorage.getItem('snapspot_favs') || '[]');
        setIsFavorite(favs.includes(booth.id));
      } catch {}
    }
  }, [booth]);

  const toggleFavorite = () => {
    if (!booth) return;
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (error || !booth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Photo booth not found</h2>
        <p className="text-xs text-slate-500">The listing you requested may have been removed or relocated.</p>
        <Link href="/explore" className="inline-block px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl">
          Back to Map Explorer
        </Link>
      </div>
    );
  }

  const updatedDate = booth.updatedAt ? new Date(booth.updatedAt).toLocaleDateString() : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explorer</span>
      </Link>

      {/* Title & Top Badges Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full font-semibold text-xs flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {booth.boothType.name}
            </span>
            <FreshnessBadge
              status={booth.verificationStatus}
              isDemoData={booth.isDemoData}
              lastVerifiedAt={booth.lastVerifiedAt}
              source={booth.verifiedBySource}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isFavorite ? 'Saved' : 'Save Booth'}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{booth.name}</h1>
            <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold text-slate-800">{booth.address}</span> ({booth.area}, {booth.district})
            </p>
          </div>

          {/* Direct Actions: Directions */}
          <div className="flex items-center gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${booth.latitude},${booth.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-maroonDark hover:from-maroonDark hover:to-moodsoft text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Photos + Info Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photo Lightbox Gallery & Description */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Active Photo */}
          <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <Image
              src={activePhoto || '/placeholder-booth.svg'}
              alt={booth.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Photo Thumbnails */}
          {booth.photos && booth.photos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {booth.photos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePhoto(p.url)}
                  className={`relative w-24 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activePhoto === p.url ? 'border-rose-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={p.url} alt="Booth thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Specs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-900">About this Photo Booth</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{booth.description}</p>

            {/* Features Checklist Grid */}
            {booth.features && booth.features.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  Available Services & Features
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {booth.features.map((f) => (
                    <div
                      key={f.feature.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{f.feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Review Intelligence (Aspect Sentiment Breakdown) */}
          {booth.aspectSentiments && booth.aspectSentiments.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Review Intelligence</h3>
                <span className="text-xs text-slate-500 font-medium">Based on visitor feedback</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {booth.aspectSentiments.map((asp) => (
                  <div key={asp.aspect} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{asp.aspect}</span>
                    <div className="flex items-center gap-1 text-xs">
                      {asp.overall === 'positive' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px] flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-emerald-600" /> Positive
                        </span>
                      )}
                      {asp.overall === 'negative' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold text-[10px] flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3 text-rose-600" /> Mixed
                        </span>
                      )}
                      {asp.overall === 'neutral' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[10px]">
                          Neutral
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Customer Reviews</h3>
                <p className="text-xs text-slate-500">
                  {booth.reviewCount > 0
                    ? `${booth.reviewCount} total reviews (${booth.avgRating} average rating)`
                    : 'No reviews yet for this listing.'}
                </p>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Write Review</span>
              </button>
            </div>

            {/* Reviews List */}
            {booth.reviews && booth.reviews.length > 0 ? (
              <div className="space-y-4 divide-y divide-slate-100">
                {booth.reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                          {rev.user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900">{rev.user.name}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-9">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">Be the first person to leave a review!</p>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Hours, Contact & Interactive Map */}
        <div className="lg:col-span-4 space-y-6">
          {/* Price Box */}
          <div className="bg-gradient-to-br from-rose-50 to-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Price Range</span>
            <div className="text-2xl font-black text-slate-900">
              {booth.priceFrom ? `Rs. ${booth.priceFrom}${booth.priceTo ? ' – Rs. ' + booth.priceTo : ''}` : 'Price not verified'}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last updated: {updatedDate || 'Recently'}</span>
            </p>
          </div>

          {/* Contact & Social Links */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Contact & Socials</h4>

            {booth.phone && (
              <a href={`tel:${booth.phone}`} className="flex items-center gap-2 text-slate-700 hover:text-rose-600">
                <Phone className="w-4 h-4 text-rose-500" />
                <span className="font-semibold">{booth.phone}</span>
              </a>
            )}

            {booth.instagram && (
              <a
                href={`https://instagram.com/${booth.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-rose-600"
              >
                <Instagram className="w-4 h-4 text-maroon" />
                <span className="font-semibold">{booth.instagram}</span>
              </a>
            )}

            {booth.website && (
              <a
                href={booth.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-rose-600"
              >
                <Globe className="w-4 h-4 text-sky-500" />
                <span className="font-semibold truncate">{booth.website}</span>
              </a>
            )}
          </div>

          {/* Opening Hours Table */}
          {booth.openingHours && booth.openingHours.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Operating Hours</span>
              </h4>

              <div className="space-y-1.5 border-t border-slate-100 pt-2">
                {booth.openingHours.map((h) => (
                  <div key={h.id} className="flex justify-between py-1 border-b border-slate-50">
                    <span className="font-semibold text-slate-700">{DAYS_MAP[h.dayOfWeek]}</span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {h.isClosed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini Leaflet Map Preview */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Location Map</h4>
            <div className="h-56 rounded-2xl overflow-hidden border border-slate-200">
              <Map
                booths={[booth]}
                selectedBoothId={booth.id}
                center={{ lat: booth.latitude, lng: booth.longitude }}
                zoom={15}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal
        boothId={booth.id}
        boothName={booth.name}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={fetchDetails}
      />

      <ReportModal
        boothId={booth.id}
        boothName={booth.name}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
