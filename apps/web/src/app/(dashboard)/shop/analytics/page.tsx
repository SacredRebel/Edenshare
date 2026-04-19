"use client";

import { useEffect, useState } from 'react';
import { BarChart3, Eye, Package, Star, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function ShopAnalyticsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('listings').select('*').eq('creator_id', user.id).neq('status', 'archived').order('view_count', { ascending: false });
      setListings(data || []);
      setTotalViews((data || []).reduce((s, l) => s + (l.view_count || 0), 0));

      const ids = (data || []).map(l => l.id);
      if (ids.length > 0) {
        const { count: reqCount } = await supabase.from('requests').select('*', { count: 'exact', head: true }).in('listing_id', ids);
        setTotalRequests(reqCount || 0);
      }

      const { count: revCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('subject_id', user.id);
      setTotalReviews(revCount || 0);

      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-display text-white mb-6">Analytics</h1>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-sky-400 bg-sky-500/10' },
          { label: 'Listings', value: listings.length, icon: Package, color: 'text-eden-400 bg-eden-500/10' },
          { label: 'Requests', value: totalRequests, icon: MessageSquare, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Reviews', value: totalReviews, icon: Star, color: 'text-eden-400 bg-eden-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color.split(' ')[1]}`}>
              <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
            </div>
            <div className="text-2xl font-display text-white">{s.value}</div>
            <div className="text-[11px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-listing breakdown */}
      <h2 className="text-base font-semibold text-white mb-3">Listing Performance</h2>
      {listings.length > 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-white/[0.05] text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            <span className="col-span-2">Listing</span>
            <span className="text-center">Views</span>
            <span className="text-center">Status</span>
          </div>
          {listings.map((l, i) => (
            <div key={l.id} className={`grid grid-cols-4 gap-2 px-4 py-3 items-center ${i < listings.length - 1 ? 'border-b border-white/[0.03]' : ''}`}>
              <div className="col-span-2 min-w-0">
                <p className="text-sm text-white truncate">{l.title}</p>
                <p className="text-[10px] text-gray-500 capitalize">{l.type}</p>
              </div>
              <div className="text-center">
                <span className="text-sm text-white">{l.view_count || 0}</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  l.status === 'active' ? 'bg-eden-500/15 text-eden-400' : 'bg-gray-500/15 text-gray-400'
                }`}>{l.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/[0.02] rounded-2xl">
          <BarChart3 className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Create listings to see performance data</p>
        </div>
      )}
    </div>
  );
}
