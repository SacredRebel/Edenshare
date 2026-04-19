"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flag, ArrowLeft, CheckCircle, XCircle, Eye, AlertTriangle, User, Package, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['pending', 'resolved', 'dismissed', 'all'] as const;
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  resolved: 'bg-eden-500/15 text-eden-400',
  dismissed: 'bg-gray-500/15 text-gray-400',
};

export default function AdminReportsPage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<typeof STATUS_TABS[number]>('pending');

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    const fetch = async () => {
      const { data } = await supabase.from('reports')
        .select('*, reporter:reporter_id(display_name, avatar_url)')
        .order('created_at', { ascending: false }).limit(100);
      setReports(data || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const updateReport = async (id: string, status: string) => {
    await supabase.from('reports').update({ status, resolved_at: new Date().toISOString() }).eq('id', id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const filtered = reports.filter(r => tab === 'all' || r.status === tab);
  const pendingCount = reports.filter(r => r.status === 'pending').length;

  if (profile?.role !== 'admin') return null;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-500 active:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Admin
      </Link>

      <h1 className="text-xl font-display text-white flex items-center gap-2 mb-5">
        Reports
        {pendingCount > 0 && <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} pending</span>}
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-5">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${tab === t ? 'bg-eden-500/15 text-eden-400 font-medium' : 'text-gray-500'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span>
                  <span className="text-[10px] text-gray-600 capitalize">{r.type} report</span>
                  <span className="text-[10px] text-gray-600">· {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Reporter */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-eden-500/20 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden">
                  {r.reporter?.avatar_url ? <img src={r.reporter.avatar_url} alt="" className="w-full h-full object-cover" /> : (r.reporter?.display_name || '?')[0]}
                </div>
                <span className="text-xs text-gray-400">Reported by <span className="text-white">{r.reporter?.display_name}</span></span>
              </div>

              {/* Reason */}
              <div className="bg-white/[0.02] rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">Reason: {r.reason}</p>
                {r.message && <p className="text-sm text-gray-300 leading-relaxed">{r.message}</p>}
              </div>

              {/* Context link */}
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                {r.reported_listing_id && (
                  <Link href={`/listings/${r.reported_listing_id}`} className="flex items-center gap-1 text-eden-400 active:text-eden-300">
                    <Package className="w-3 h-3" /> View Listing
                  </Link>
                )}
                {r.reported_user_id && (
                  <Link href={`/profile/${r.reported_user_id}`} className="flex items-center gap-1 text-eden-400 active:text-eden-300">
                    <User className="w-3 h-3" /> View User
                  </Link>
                )}
              </div>

              {/* Actions */}
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => updateReport(r.id, 'resolved')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-eden-500/15 text-eden-400 rounded-xl text-xs font-medium active:bg-eden-500/25">
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                  <button onClick={() => updateReport(r.id, 'dismissed')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.05] text-gray-400 rounded-xl text-xs font-medium active:bg-white/[0.1]">
                    <XCircle className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Flag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No {tab === 'all' ? '' : tab} reports</h3>
          <p className="text-sm text-gray-500">Everything looks clean.</p>
        </div>
      )}
    </div>
  );
}
