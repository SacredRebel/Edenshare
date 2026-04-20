"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Users, Star, Heart, Eye, Compass, Plus, ShoppingBag, ArrowRight, Leaf, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  land: { bg: 'bg-eden-500/12', text: 'text-eden-400' },
  resource: { bg: 'bg-sky-500/12', text: 'text-sky-400' },
  service: { bg: 'bg-purple-500/12', text: 'text-purple-400' },
};

function ListingCard({ listing }: { listing: any }) {
  const style = TYPE_STYLES[listing.type] || TYPE_STYLES.land;
  return (
    <Link href={`/listings/${listing.id}`} className="block">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden active:bg-white/[0.06] transition-colors">
        {/* Image */}
        <div className="aspect-[16/10] bg-[#0f2318] relative">
          {listing.images?.[0] ? (
            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="w-10 h-10 text-eden-800/40" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${style.bg} ${style.text}`}>
              {listing.type}
            </span>
          </div>
          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 active:text-red-400">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-[15px] font-semibold text-white mb-1 line-clamp-1">{listing.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">{listing.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {listing.city && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.city}</span>
              )}
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.view_count || 0}</span>
            </div>
            {listing.price_amount ? (
              <span className="text-sm font-semibold text-white">${listing.price_amount}</span>
            ) : (
              <span className="text-xs text-eden-400 capitalize">{(listing.exchange_type || 'flexible').replace('_', ' ')}</span>
            )}
          </div>

          {/* Host strip */}
          {listing.profiles && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]">
              <div className="w-6 h-6 rounded-full bg-eden-500/20 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden">
                {listing.profiles.avatar_url ? <img src={listing.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (listing.profiles.display_name || '?')[0]}
              </div>
              <span className="text-xs text-gray-500">{listing.profiles.display_name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [nearbyListings, setNearbyListings] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!user) return;
    fetchFeed();
  }, [user]);

  const fetchFeed = async () => {
    // Nearby listings (fallback to all if no location)
    const { data: nearby } = await supabase
      .from('listings')
      .select('*, profiles!listings_creator_id_fkey(display_name, avatar_url)')
      .eq('status', 'active')
      .neq('creator_id', user!.id)
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);

    // User's communities
    const { data: memberOf } = await supabase
      .from('community_members')
      .select('community_id, communities(id, name, slug, member_count, avatar_url)')
      .eq('user_id', user!.id)
      .limit(10);

    // Recommended (different from nearby — based on interests overlap)
    const { data: rec } = await supabase
      .from('listings')
      .select('*, profiles!listings_creator_id_fkey(display_name, avatar_url)')
      .eq('status', 'active')
      .neq('creator_id', user!.id)
      .order('view_count', { ascending: false })
      .limit(6);

    setNearbyListings(nearby || []);
    setHasMore((nearby || []).length >= PAGE_SIZE);
    setCommunities((memberOf || []).map((m: any) => m.communities).filter(Boolean));
    setRecommended(rec || []);
    setLoading(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || !user) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await supabase
      .from('listings')
      .select('*, profiles!listings_creator_id_fkey(display_name, avatar_url)')
      .eq('status', 'active')
      .neq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1);
    if (data && data.length > 0) {
      setNearbyListings(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length >= PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white/[0.03] rounded-2xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Location bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-eden-400" />
          <span className="text-white font-medium">{profile?.city || 'Your area'}</span>
          {profile?.region && <span className="text-gray-500">{profile.region}</span>}
        </div>
        <button className="text-xs text-eden-400 active:text-eden-300">Change</button>
      </div>

      {/* Quick actions */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <Link href="/explore" className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl active:bg-white/[0.08]">
            <Compass className="w-5 h-5 text-eden-400" />
            <span className="text-sm text-gray-300">Explore Map</span>
          </Link>
          <Link href="/marketplace" className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl active:bg-white/[0.08]">
            <ShoppingBag className="w-5 h-5 text-sky-400" />
            <span className="text-sm text-gray-300">Marketplace</span>
          </Link>
        </div>
      </div>

      {/* Your Communities */}
      {communities.length > 0 && (
        <div className="mb-6">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Your Communities</h2>
            <Link href="/communities" className="text-xs text-eden-400">See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {communities.map((c: any) => (
              <Link key={c.id} href={`/communities/${c.slug}`}
                className="flex-shrink-0 w-28 flex flex-col items-center gap-2 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl active:bg-white/[0.06]">
                <div className="w-10 h-10 rounded-full bg-eden-500/15 flex items-center justify-center">
                  <Users className="w-5 h-5 text-eden-400" />
                </div>
                <span className="text-xs text-white text-center line-clamp-1">{c.name}</span>
                <span className="text-[10px] text-gray-500">{c.member_count} members</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Near You */}
      <div className="mb-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Near You</h2>
          <Link href="/marketplace" className="text-xs text-eden-400 flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {nearbyListings.length > 0 ? (
          <div className="px-4 space-y-4">
            {nearbyListings.map((listing) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="px-4">
            <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
              <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-1">No listings near you yet</p>
              <p className="text-xs text-gray-500 mb-4">Be the first to share something in your area</p>
              <Link href="/listings/new" className="btn-primary text-sm inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Listing
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && nearbyListings.length > 0 && (
        <div className="px-4 mb-6 text-center">
          <button onClick={loadMore} disabled={loadingMore}
            className="btn-secondary text-sm py-2.5 w-full max-w-xs mx-auto flex items-center justify-center gap-2">
            {loadingMore ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Load More'}
          </button>
        </div>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <div className="mb-8">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Recommended</h2>
          </div>
          <div className="px-4 grid grid-cols-2 gap-3">
            {recommended.slice(0, 4).map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden active:bg-white/[0.06]">
                <div className="aspect-square bg-[#0f2318] relative">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Leaf className="w-8 h-8 text-eden-800/30" /></div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-medium text-white line-clamp-1">{listing.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{listing.type} · {(listing.exchange_type || 'flexible').replace('_', ' ')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
