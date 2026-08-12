import React from 'react';
import Link from 'next/link';
import { Camera, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">SnapSpot Nepal</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Kathmandu Valley&apos;s photo booth finder and local discovery platform. Helping you find, compare, and get directions to photo booths near you.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Data Freshness Guarantee & Verified Listings</span>
            </div>
          </div>

          {/* Quick Areas */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Kathmandu Areas</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/explore?area=Thamel" className="hover:text-white transition-colors">Thamel Photo Booths</Link></li>
              <li><Link href="/explore?area=Basantapur" className="hover:text-white transition-colors">Basantapur & Durbar Square</Link></li>
              <li><Link href="/explore?area=Civil Mall" className="hover:text-white transition-colors">Civil Mall Sundhara</Link></li>
              <li><Link href="/explore?area=Patan" className="hover:text-white transition-colors">Patan & Pulchowk (Lalitpur)</Link></li>
              <li><Link href="/explore?area=Baneshwor" className="hover:text-white transition-colors">Naya Baneshwor</Link></li>
              <li><Link href="/explore?district=Bhaktapur" className="hover:text-white transition-colors">Bhaktapur Durbar Square</Link></li>
            </ul>
          </div>

          {/* Booth Styles */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Popular Booth Styles</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/explore?boothType=korean-4-cut" className="hover:text-white transition-colors">Korean 4-cut Photo Strips</Link></li>
              <li><Link href="/explore?boothType=selfie-booth" className="hover:text-white transition-colors">Self-Service Selfie Booths</Link></li>
              <li><Link href="/explore?boothType=360-booth" className="hover:text-white transition-colors">360° Slow-Mo Video Platforms</Link></li>
              <li><Link href="/explore?boothType=mirror-booth" className="hover:text-white transition-colors">Touchscreen Mirror Booths</Link></li>
              <li><Link href="/explore?boothType=studio" className="hover:text-white transition-colors">Private Self-Photo Studios</Link></li>
            </ul>
          </div>

          {/* Business Owners & Platform */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">For Business Owners</h4>
            <p className="text-xs text-slate-400 mb-3">
              Do you own a photo booth in Kathmandu Valley? Claim your listing to update pricing, opening hours, and respond to reviews.
            </p>
            <Link
              href="/login?role=owner"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Claim Business Listing</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 SnapSpot Nepal. Designed for Kathmandu Valley, extensible to Nepal.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Kathmandu, Lalitpur & Bhaktapur
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
