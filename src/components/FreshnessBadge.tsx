import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, HelpCircle } from 'lucide-react';

interface FreshnessBadgeProps {
  status: 'VERIFIED' | 'UNVERIFIED' | 'NEEDS_VERIFICATION' | string;
  isDemoData?: boolean;
  lastVerifiedAt?: string | Date | null;
  source?: string | null;
  className?: string;
}

export function FreshnessBadge({
  status,
  isDemoData = false,
  lastVerifiedAt,
  source,
  className = '',
}: FreshnessBadgeProps) {
  let dateFormatted = '';
  if (lastVerifiedAt) {
    const d = new Date(lastVerifiedAt);
    dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (isDemoData) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-900 border border-amber-300 ${className}`}
        title="Demo Data record used for development testing"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
        <span>Demo Data</span>
      </span>
    );
  }

  if (status === 'VERIFIED') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 ${className}`}
        title={source ? `Verified via ${source} on ${dateFormatted}` : `Verified on ${dateFormatted}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span>Verified {dateFormatted ? `(${dateFormatted})` : ''}</span>
      </span>
    );
  }

  if (status === 'NEEDS_VERIFICATION') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        title="Information may need updated field verification"
      >
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Needs Verification</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
      title="Unverified community listing"
    >
      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
      <span>Unverified</span>
    </span>
  );
}
