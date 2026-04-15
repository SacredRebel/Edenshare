"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Plus, MapPin, Leaf, Wrench, ChevronRight, Filter, Heart, Calendar, User, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  land: { icon: MapPin, color: 'eden' },
  resource: { icon: Leaf, color: 'sky' },
  service: { icon: Wrench, color: 'purple' },
};

export default function ListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [typeFilter]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, profiles!listings_creator_id_fkey(display_name, avatar_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (typeFilter) query = query.eq('type', typeFilter);

    const { data } = await query;
    setListings(data || []);
    setLoading(false);
  };

  const filtered = listings.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSave = async (listingId: string) => {
    if (!user) return;
    const { data: existing } = await supabase.from('saved_listings').select('id').eq('user_id', user.id).eq('listing_id', listingId).single();
    if (existing) {
      await supabase.from('saved_listings').delete().eq('id', existing.id);
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listingId });
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-eden-950 to-transparent border-b border-white/[0.04]">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display text-white mb-2">Listings</h1>
              <p className="text-gray-400">Find land, resources, and services from the community</p>
            </div>
            {user && (
              <Link href="/listings/new" className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create Listing
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-eden-950/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
            </div>
            <div className="flex gap-2">
              {[
                { type: 'land', label: 'Land', icon: MapPin },
                { type: 'resource', label: 'Resources', icon: Leaf },
                { type: 'service', label: 'Services', icon: Wrench },
              ].map(({ type, label, icon: Icon }) => (
                <button key={type} onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${
                    typeFilter === type ? 'bg-eden-500/20 text-eden-400 border border-eden-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:text-white'
                  }`}>
                  <Icon className="w-4 h-4" /><span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
            {filtered.map((listing, i) => {
              const cfg = TYPE_CONFIG[listing.type] || TYPE_CONFIG.land;
              const Icon = cfg.icon;
              return (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/listings/${listing.id}`} className="card-glass-hover p-5 flex gap-4 group block">
                    {/* Image placeholder */}
                    <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-eden-800/30 to-eden-900/30 flex items-center justify-center flex-shrink-0">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Icon className="w-8 h-8 text-eden-600/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge-${listing.type === 'land' ? 'land' : listing.type === 'resource' ? 'resource' : 'service'}`}>
                          <Icon className="w-3 h-3" /> {listing.type}
                        </span>
                        <span className="text-[10px] text-gray-600 capitalize">{listing.exchange_type?.replace('_', ' ')}</span>
                      </div>
                      <h3 className="text-white font-semibold group-hover:text-eden-400 transition-colors mb-1">{listing.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">{listing.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {listing.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.city}{listing.region ? `, ${listing.region}` : ''}</span>}
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.view_count}</span>
                        {listing.profiles && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {listing.profiles.display_name}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-eden-400 self-center flex-shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-display text-white mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share land, resources, or services.</p>
            {user && <Link href="/listings/new" className="btn-primary">Create a Listing</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
