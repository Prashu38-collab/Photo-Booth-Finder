'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, MapPin, Sparkles, Heart, User, LogOut, Shield, Store, Menu, X } from 'lucide-react';

export function Navbar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    // Load session user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {});

    // Sync favorites count from localStorage
    const updateFavCount = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('snapspot_favs') || '[]');
        setFavoritesCount(favs.length);
      } catch {
        setFavoritesCount(0);
      }
    };

    updateFavCount();
    window.addEventListener('storage', updateFavCount);
    return () => window.removeEventListener('storage', updateFavCount);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-rose-900 to-slate-900">
                SnapSpot<span className="text-rose-600">.np</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-700 -mt-1">
                Kathmandu Booth Finder
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors"
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Explore Map</span>
            </Link>

            <Link
              href="/recommend"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm hover:shadow hover:opacity-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>Find Me a Booth</span>
            </Link>

            <Link
              href="/favorites"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors relative"
            >
              <Heart className="w-4 h-4 text-slate-500" />
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {favoritesCount}
                </span>
              )}
            </Link>
          </nav>

          {/* User Auth & Action Links */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-200"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {user.role === 'BUSINESS_OWNER' && (
                  <Link
                    href="/business/dashboard"
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-200"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Owner Portal</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 border-b border-slate-100"
          >
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Explore Map & Photobooths</span>
          </Link>
          <Link
            href="/recommend"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-semibold text-rose-600 border-b border-slate-100"
          >
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Find Me a Booth (Recommendation Engine)</span>
          </Link>
          <Link
            href="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 border-b border-slate-100"
          >
            <Heart className="w-4 h-4 text-slate-500" />
            <span>Favorites ({favoritesCount})</span>
          </Link>
          {user ? (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-xs text-rose-600 bg-rose-50 rounded border border-rose-200"
                >
                  Logout
                </button>
              </div>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-semibold bg-purple-100 text-purple-700 rounded"
                >
                  Admin Panel
                </Link>
              )}
              {user.role === 'BUSINESS_OWNER' && (
                <Link
                  href="/business/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-semibold bg-blue-100 text-blue-700 rounded"
                >
                  Business Owner Dashboard
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 text-sm font-medium border border-slate-300 rounded-lg"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
