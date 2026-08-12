'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, BarChart3, CheckCircle2, XCircle, Search, Store } from 'lucide-react';
import { BoothCardData } from '@/components/BoothCard';

interface AnalyticsData {
  totalBooths: number;
  verifiedBooths: number;
  needsVerification: number;
  totalUsers: number;
  totalReviews: number;
  pendingReports: number;
  recentSearches: { query: string | null; area: string | null; createdAt: string }[];
}

interface ReportItem {
  id: string;
  issueType: string;
  comment: string;
  status: string;
  createdAt: string;
  booth: { name: string; slug: string; area: string };
  user?: { name: string; email: string };
}

export default function AdminDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [unverifiedBooths, setUnverifiedBooths] = useState<BoothCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState<string>('');

  const loadAdminData = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if (!data.user || data.user.role !== 'ADMIN') {
          window.location.href = '/login';
        }
      });

    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setAnalytics(data.data);
      })
      .catch(() => {});

    fetch('/api/admin/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setReports(data.data);
      })
      .catch(() => {});

    fetch('/api/photobooths?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setUnverifiedBooths(data.data.filter((b: BoothCardData) => b.verificationStatus !== 'VERIFIED'));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyBooth = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/verify/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED', notes: 'Verified via Admin Dashboard' }),
      });

      if (res.ok) {
        setActionMsg('Photobooth successfully verified!');
        loadAdminData();
      }
    } catch {}
  };

  const handleResolveReport = async (reportId: string, status: 'RESOLVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status }),
      });

      if (res.ok) {
        setActionMsg(`Report marked as ${status.toLowerCase()}`);
        loadAdminData();
      }
    } catch {}
  };

  if (loading) {
    return <div className="p-12 text-center text-xs">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Banner Header */}
      <div className="bg-purple-950 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Admin Moderation & Analytics</h1>
            <p className="text-xs text-purple-200">
              Verify businesses, process user reports, and monitor Kathmandu search activity.
            </p>
          </div>
        </div>

        <div className="text-xs text-purple-200 bg-purple-900/80 px-4 py-2 rounded-xl border border-purple-800">
          Admin User: <strong className="text-white">{user?.name}</strong>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-semibold">
          {actionMsg}
        </div>
      )}

      {/* Analytics Counter Grid */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Photobooths</span>
            <div className="text-2xl font-black text-slate-900">{analytics.totalBooths}</div>
            <span className="text-[11px] text-emerald-600 font-semibold">{analytics.verifiedBooths} Verified</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Needs Verification</span>
            <div className="text-2xl font-black text-amber-600">{analytics.needsVerification}</div>
            <span className="text-[11px] text-slate-400">Pending audit</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">User Reports</span>
            <div className="text-2xl font-black text-rose-600">{analytics.pendingReports}</div>
            <span className="text-[11px] text-slate-400">Pending moderation</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Community Reviews</span>
            <div className="text-2xl font-black text-purple-600">{analytics.totalReviews}</div>
            <span className="text-[11px] text-slate-400">{analytics.totalUsers} registered users</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Verification Queue Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Store className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Listings Needing Verification</h3>
            </div>

            {unverifiedBooths.length === 0 ? (
              <p className="text-slate-400 italic py-4 text-center">All listings in Kathmandu are verified!</p>
            ) : (
              <div className="space-y-3">
                {unverifiedBooths.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{b.name}</h4>
                        <p className="text-[10px] text-slate-500">{b.area}, {b.district}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {b.verificationStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">{b.description}</p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleVerifyBooth(b.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify Business</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Reports Moderation Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">Reported Information Queue</h3>
            </div>

            {reports.length === 0 ? (
              <p className="text-slate-400 italic py-4 text-center">No reports in moderation queue.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{rep.booth.name}</h4>
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                          Issue: {rep.issueType.replace('_', ' ')}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rep.status === 'PENDING'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded border border-slate-100">
                      &ldquo;{rep.comment}&rdquo;
                    </p>

                    {rep.status === 'PENDING' && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Analytics Activity */}
          {analytics?.recentSearches && analytics.recentSearches.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Recent User Search Events</span>
              </h4>

              <div className="space-y-1 border-t border-slate-100 pt-2">
                {analytics.recentSearches.map((s, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-50">
                    <span className="font-bold text-slate-800">&ldquo;{s.query}&rdquo;</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
