'use client';

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  boothId: string;
  boothName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ boothId, boothName, isOpen, onClose }: ReportModalProps) {
  const [issueType, setIssueType] = useState<string>('WRONG_PRICE');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide details about what is incorrect.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boothId, issueType, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit report.');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-amber-600 font-bold text-lg">
          <AlertCircle className="w-5 h-5" />
          <span>Report Incorrect Info</span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Help us maintain trustworthy data for <strong className="text-slate-800">{boothName}</strong> in Kathmandu.
        </p>

        {success ? (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center space-y-2 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm">Report Submitted!</h4>
            <p className="text-xs text-emerald-700">Thank you. Our moderation team will investigate this report.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What information is incorrect?
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="WRONG_PRICE">Wrong Pricing Range</option>
                <option value="BUSINESS_CLOSED">Business is Closed / Moved</option>
                <option value="WRONG_LOCATION">Incorrect Map Location / Address</option>
                <option value="WRONG_HOURS">Incorrect Opening Hours</option>
                <option value="WRONG_PHONE">Invalid Contact Number / Social Links</option>
                <option value="DUPLICATE">Duplicate Business Listing</option>
                <option value="OTHER">Other Information Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Details & Correct Info
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Explain what needs updating (e.g. New price is Rs. 400, or booth relocated to 2nd floor)..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
