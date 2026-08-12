'use client';

import React, { useState, useEffect } from 'react';
import { Store, ShieldAlert, CheckCircle2, Edit3, DollarSign, Clock, Phone, Instagram, Send, MapPin } from 'lucide-react';
import { BoothCardData } from '@/components/BoothCard';

export default function BusinessDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [booths, setBooths] = useState<BoothCardData[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<BoothCardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Claim Form State
  const [claimBoothId, setClaimBoothId] = useState<string>('');
  const [claimProof, setClaimProof] = useState<string>('');
  const [claimMsg, setClaimMsg] = useState<string>('');

  // Edit Form State
  const [priceFrom, setPriceFrom] = useState<number | string>('');
  const [priceTo, setPriceTo] = useState<number | string>('');
  const [description, setDescription] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<string>('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if (!data.user) {
          window.location.href = '/login?role=owner';
        }
      });

    fetch('/api/photobooths?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setBooths(data.data);
          if (data.data.length > 0) {
            setSelectedBooth(data.data[0]);
            populateEditForm(data.data[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const populateEditForm = (b: BoothCardData) => {
    setPriceFrom(b.priceFrom || '');
    setPriceTo(b.priceTo || '');
    setDescription(b.description || '');
    setPhone(b.phone || '');
    setInstagram(b.instagram || '');
    setAddress(b.address || '');
  };

  const handleSelectBoothChange = (id: string) => {
    const found = booths.find((b) => b.id === id);
    if (found) {
      setSelectedBooth(found);
      populateEditForm(found);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimBoothId || !claimProof) return;
    try {
      const res = await fetch('/api/business/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boothId: claimBoothId, proofDetails: claimProof }),
      });
      if (res.ok) {
        setClaimMsg('Claim request submitted! Admin will verify ownership.');
        setClaimProof('');
      }
    } catch {}
  };

  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooth) return;

    setSaving(true);
    setSaveMsg('');

    try {
      const res = await fetch(`/api/business/photobooths/${selectedBooth.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceFrom: priceFrom ? parseInt(priceFrom.toString(), 10) : null,
          priceTo: priceTo ? parseInt(priceTo.toString(), 10) : null,
          description,
          phone,
          instagram,
          address,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveMsg('Updates saved! Information status set to Needs Verification pending audit.');
      } else {
        setSaveMsg(data.error || 'Failed to save updates.');
      }
    } catch {
      setSaveMsg('Failed to save updates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs">Loading Business Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Business Owner Portal</h1>
            <p className="text-xs text-slate-300">
              Manage your Kathmandu photo booth listing, pricing, and operating specs.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
          Logged in as: <strong className="text-white">{user?.name}</strong> ({user?.email})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Claim Listing Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Claim a Photo Booth Listing</span>
            </h3>
            <p className="text-slate-500">
              If your photo booth is already listed on SnapSpot Nepal, select it below and submit proof of ownership.
            </p>

            {claimMsg && (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200">
                {claimMsg}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Booth</label>
                <select
                  value={claimBoothId}
                  onChange={(e) => setClaimBoothId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Photobooth --</option>
                  {booths.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.area})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proof Details / Contact</label>
                <textarea
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  rows={3}
                  placeholder="Provide your official business phone number or Instagram page handle for verification..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Claim Request</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Edit Photobooth Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Edit Photobooth Information</h3>
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={selectedBooth?.id || ''}
                  onChange={(e) => handleSelectBoothChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl p-2"
                >
                  {booths.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {saveMsg && (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveMsg}</span>
              </div>
            )}

            {selectedBooth && (
              <form onSubmit={handleSaveEdits} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Price From (NPR)</span>
                    </label>
                    <input
                      type="number"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(e.target.value)}
                      placeholder="350"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Price To (NPR)</span>
                    </label>
                    <input
                      type="number"
                      value={priceTo}
                      onChange={(e) => setPriceTo(e.target.value)}
                      placeholder="500"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description & Services</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Room 415, 4th Floor, Civil Mall, Sundhara, Kathmandu"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Saving a changed address auto-locates it on the map.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-rose-500" /> Phone Contact
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 9801234567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@thebanhanstudio"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save & Submit Updates'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
