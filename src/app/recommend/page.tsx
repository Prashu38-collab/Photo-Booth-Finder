'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, DollarSign, Layers, Users, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { BoothCard, BoothCardData } from '@/components/BoothCard';
import { KATHMANDU_POPULAR_AREAS } from '@/lib/geo';

interface RecommendationResultItem {
  booth: BoothCardData;
  score: number;
  matchBadge: 'Best Match' | 'Great Match' | 'Good Match';
  reasons: string[];
  distanceKm: number | null;
}

export default function RecommendationPage() {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [targetArea, setTargetArea] = useState<string>('all');
  const [budget, setBudget] = useState<string>('any');
  const [boothTypeSlug, setBoothTypeSlug] = useState<string>('any');
  const [groupSize, setGroupSize] = useState<string>('any');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Results State
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<RecommendationResultItem[]>([]);
  const [error, setError] = useState<string>('');

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setStep(2);
        },
        () => {
          alert('Geolocation denied or unavailable. Please choose an area instead.');
        }
      );
    }
  };

  const toggleFeature = (slug: string) => {
    if (selectedFeatures.includes(slug)) {
      setSelectedFeatures(selectedFeatures.filter((s) => s !== slug));
    } else {
      setSelectedFeatures([...selectedFeatures, slug]);
    }
  };

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLocation,
          targetArea,
          budget,
          boothTypeSlug,
          groupSize,
          requiredFeatureSlugs: selectedFeatures,
        }),
      });

      if (!res.ok) throw new Error('Failed to compute recommendations.');
      const data = await res.json();
      setResults(data.data || []);
      setStep(6); // Step 6 = Results screen
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error generating recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setUserLocation(null);
    setTargetArea('all');
    setBudget('any');
    setBoothTypeSlug('any');
    setGroupSize('any');
    setSelectedFeatures([]);
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Transparent Weighted Scoring Algorithm</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Me a Photo Booth
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Answer 5 quick preferences and our recommendation engine will calculate exact matches with transparent explanation reasons.
        </p>
      </div>

      {/* Progress Bar (Steps 1 to 5) */}
      {step <= 5 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && 'Where are you?'}
              {step === 2 && 'Budget Preference'}
              {step === 3 && 'Booth Style'}
              {step === 4 && 'Group Size'}
              {step === 5 && 'Required Features'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-maroonDark h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Location */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>Step 1: Where are you starting from?</span>
            </h3>
            <p className="text-xs text-slate-500">We calculate distance relative to your location or chosen neighborhood.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleLocationDetect}
              className="p-5 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-sky-950 mb-1">Use My Current Location</h4>
              <p className="text-xs text-sky-700">Find photo booths nearest to where you are right now in Kathmandu.</p>
            </button>

            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-left space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Select Kathmandu Area</h4>
              <select
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="all">Any Area in Kathmandu Valley</option>
                {KATHMANDU_POPULAR_AREAS.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setStep(2)}
                className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Continue with Area
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Budget */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Step 2: What is your price budget?</span>
            </h3>
            <p className="text-xs text-slate-500">Filter booths matching your target budget range per session.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'under-300', label: 'Under Rs. 300', desc: 'Budget friendly' },
              { id: '300-500', label: 'Rs. 300 – 500', desc: 'Popular standard' },
              { id: '500-1000', label: 'Rs. 500 – 1000', desc: 'Premium studio' },
              { id: 'any', label: 'No Preference', desc: 'Show all prices' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBudget(b.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  budget === b.id
                    ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-300 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 mb-1">{b.label}</div>
                <div className="text-[11px] text-slate-500">{b.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-colors flex items-center gap-1"
            >
              Next: Booth Style <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Booth Style */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Step 3: What booth style are you looking for?</span>
            </h3>
            <p className="text-xs text-slate-500">Choose your preferred photo booth aesthetic.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'korean-4-cut', label: 'Korean 4-cut', desc: 'Cute photo strips & props' },
              { id: 'selfie-booth', label: 'Selfie Booth', desc: 'Self-trigger remote shutter' },
              { id: '360-booth', label: '360° Slow-Mo', desc: '360 revolving video booth' },
              { id: 'mirror-booth', label: 'Touchscreen Mirror', desc: 'Full length glass mirror' },
              { id: 'studio', label: 'Private Studio', desc: 'Studio camera setup' },
              { id: 'any', label: 'Any Style', desc: 'No specific style requirement' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setBoothTypeSlug(st.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  boothTypeSlug === st.id
                    ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-300 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 mb-1">{st.label}</div>
                <div className="text-[11px] text-slate-500">{st.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-colors flex items-center gap-1"
            >
              Next: Group Size <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Group Size */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Step 4: Who are you taking photos with?</span>
            </h3>
            <p className="text-xs text-slate-500">Select group size suitability.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'solo', label: 'Solo', desc: 'Selfie session for 1 person' },
              { id: 'couple', label: 'Couple', desc: 'Date night photo session for 2' },
              { id: 'friends', label: 'Friends (3-5)', desc: 'Small group of friends' },
              { id: 'family', label: 'Family', desc: 'Family memories' },
              { id: 'group', label: 'Large Group (6+)', desc: 'Spacious booth for parties' },
              { id: 'any', label: 'No Preference', desc: 'Show all suitability' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setGroupSize(g.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  groupSize === g.id
                    ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-300 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 mb-1">{g.label}</div>
                <div className="text-[11px] text-slate-500">{g.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-colors flex items-center gap-1"
            >
              Next: Required Features <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Features Checklist & Generate */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Step 5: Any required features or outputs?</span>
            </h3>
            <p className="text-xs text-slate-500">Select any features you definitely want.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { slug: 'physical-prints', label: 'Physical Prints' },
              { slug: 'digital-copies', label: 'Digital Copies / QR' },
              { slug: 'props', label: 'Headband & Glasses Props' },
              { slug: 'custom-frames', label: 'Custom Frames' },
              { slug: 'video-gif', label: 'Video / Live GIF' },
              { slug: 'digital-payment', label: 'Digital Payment (eSewa/Fonepay)' },
            ].map((f) => {
              const isChecked = selectedFeatures.includes(f.slug);
              return (
                <button
                  key={f.slug}
                  onClick={() => toggleFeature(f.slug)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                    isChecked
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-900">{f.label}</span>
                  <CheckCircle
                    className={`w-4 h-4 ${isChecked ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'}`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleGenerateRecommendations}
              disabled={loading}
              className="px-8 py-3 text-sm font-extrabold text-white bg-gradient-to-r from-rose-600 to-maroonDark hover:from-maroonDark hover:to-moodsoft rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{loading ? 'Calculating Matches...' : 'Find My Matches'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Results Screen with Score Explanation Cards */}
      {step === 6 && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <span>Top Photobooth Matches for You</span>
            </h3>
            <button
              onClick={resetQuiz}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs p-4 rounded-2xl border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {results.map((item, idx) => (
              <div
                key={item.booth.id}
                className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md space-y-4 hover:border-rose-300 transition-colors"
              >
                {/* Match Banner Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        item.matchBadge === 'Best Match'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {item.matchBadge} (Match Score: {Math.round(item.score * 100)}%)
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-500">
                    {item.distanceKm !== null ? `${item.distanceKm.toFixed(1)} km from your location` : 'Kathmandu Valley'}
                  </span>
                </div>

                {/* Explanatory Reasons List */}
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">Why this booth was recommended:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 font-medium">
                    {item.reasons.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Preview */}
                <BoothCard booth={item.booth} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
