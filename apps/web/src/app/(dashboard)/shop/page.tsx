"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package, Eye, Star, MessageSquare, ClipboardList, Plus,
  BarChart3, Settings, ArrowRight, TrendingUp, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function ShopDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ views: 0, activeListings: 0, pendingRequests: 0, avgRating: 0, totalReviews: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchShopData();
  }, [user]);

  const fetchShopData = async () => {
    if (!user) return;

    // My listings
    const { data: listings } = await supabase
      .from('listings')
      .select('id, view_count, status')
      .eq('creator_id', user.id);

    const activeListings = (listings || []).filter(l => l.status === 'active').length;
    const totalViews = (listings || []).reduce((sum, l) => sum + (l.view_count || 0), 0);
    const listingIds = (listings || []).map(l => l.id);

    // Pending requests
    let pendingRequests = 0;
    let recentReqs: any[] = [];
    if (listingIds.length > 0) {
      const { count } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .in('listing_id', listingIds)
        .eq('status', 'pending');
      pendingRequests = count || 0;

      const { data: reqs } = await supabase
        .from('requests')
        .select('*, listings(title), profiles!requests_requester_id_fkey(display_name, avatar_url)')
        .in('listing_id', listingIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      recentReqs = reqs || [];
    }

    // Reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, profiles!reviews_author_id_fkey(display_name, avatar_url)')
      .eq('subject_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    setStats({
      views: totalViews,
      activeListings,
      pendingRequests,
      avgRating,
      totalReviews: reviews?.length || 0,
    });
    setRecentRequests(recentReqs);
    setRecentReviews(reviews || []);
    setLoading(false);
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    await supabase.from('requests').update({ status }).eq('id', requestId);
    setRecentRequests(prev => prev.filter(r => r.id !== requestId));
    setStats(prev => ({ ...prev, pendingRequests: Math.max(0, prev.pendingRequests - 1) }));
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-display text-white">
            {profile?.shop_name || 'My Shop'}
          </h1>
          <p className="text-sm text-gray-500">Manage your listings, requests, and reviews</p>
        </div>
        <Link href="/listings/new" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Views', value: stats.views, icon: Eye, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { label: 'Active Listings', value: stats.activeListings, icon: Package, color: 'text-eden-400', bg: 'bg-eden-500/10' },
          { label: 'Pending Requests', value: stats.pendingRequests, icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Avg Rating', value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—', icon: Star, color: 'text-eden-400', bg: 'bg-eden-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-xl font-display text-white">{s.value}</div>
            <div className="text-[11px] text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Pending Requests */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-400" /> Pending Requests
              {stats.pendingRequests > 0 && (
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingRequests}</span>
              )}
            </h2>
            <Link href="/shop/requests" className="text-xs text-eden-400">See all</Link>
          </div>
          {recentRequests.length > 0 ? (
            <div className="divide-y divide-white/[0.04]">
              {recentRequests.map((req) => (
                <div key={req.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-eden-500/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                      {req.profiles?.avatar_url ? <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (req.profiles?.display_name || '?')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white"><strong>{req.profiles?.display_name}</strong> wants to join</p>
                      <p className="text-xs text-gray-500 truncate">{req.listings?.title}</p>
                      {req.message && <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">&ldquo;{req.message}&rdquo;</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-11">
                    <button onClick={() => handleRequest(req.id, 'accepted')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-eden-500/15 text-eden-400 rounded-lg text-xs font-medium active:bg-eden-500/25">
                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button onClick={() => handleRequest(req.id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.05] text-gray-400 rounded-lg text-xs font-medium active:bg-white/[0.1]">
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <ClipboardList className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No pending requests</p>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-eden-400" /> Recent Reviews
            </h2>
            <Link href="/shop/reviews" className="text-xs text-eden-400">See all</Link>
          </div>
          {recentReviews.length > 0 ? (
            <div className="divide-y divide-white/[0.04]">
              {recentReviews.map((rev) => (
                <div key={rev.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-eden-500/20 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden">
                      {rev.profiles?.avatar_url ? <img src={rev.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (rev.profiles?.display_name || '?')[0]}
                    </div>
                    <span className="text-xs text-gray-300">{rev.profiles?.display_name}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {Array.from({ length: rev.rating }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 text-eden-400 fill-eden-400" />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-xs text-gray-400 line-clamp-2">{rev.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Star className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No reviews yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { href: '/shop/listings', label: 'Manage Listings', icon: Package, color: 'text-eden-400' },
          { href: '/shop/analytics', label: 'View Analytics', icon: BarChart3, color: 'text-sky-400' },
          { href: '/shop/settings', label: 'Shop Settings', icon: Settings, color: 'text-gray-400' },
        ].map((action) => (
          <Link key={action.href} href={action.href}
            className="flex flex-col items-center gap-2 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl active:bg-white/[0.06] text-center">
            <action.icon className={`w-5 h-5 ${action.color}`} />
            <span className="text-xs text-gray-400">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
