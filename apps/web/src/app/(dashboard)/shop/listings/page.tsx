"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Eye, Star, MessageSquare, MoreVertical, Pause, Play, Trash2, Copy, ExternalLink, Edit3, MapPin, Leaf, Wrench, Package, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['all', 'active', 'draft', 'paused', 'closed'] as const;
const TYPE_ICONS: Record<string, any> = { land: MapPin, resource: Leaf, service: Wrench };
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-eden-500/15 text-eden-400',
  draft: 'bg-gray-500/15 text-gray-400',
  paused: 'bg-amber-500/15 text-amber-400',
  closed: 'bg-red-500/15 text-red-400',
  archived: 'bg-gray-500/15 text-gray-500',
  pending_review: 'bg-sky-500/15 text-sky-400',
};

export default function ShopListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<typeof STATUS_TABS[number]>('all');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => { if (user) fetchListings(); }, [user]);

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('creator_id', user!.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('listings').update({ status }).eq('id', id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    setMenuOpen(null);
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure? This will archive the listing.')) return;
    await supabase.from('listings').update({ status: 'archived' }).eq('id', id);
    setListings(prev => prev.filter(l => l.id !== id));
    setMenuOpen(null);
  };

  const duplicateListing = async (listing: any) => {
    const { id, created_at, updated_at, view_count, ...rest } = listing;
    const { data } = await supabase.from('listings').insert({ ...rest, title: `${rest.title} (copy)`, status: 'draft', view_count: 0 }).select().single();
    if (data) setListings(prev => [data, ...prev]);
    setMenuOpen(null);
  };

  const filtered = listings
    .filter(l => tab === 'all' || l.status === tab)
    .filter(l => !search || l.title.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    draft: listings.filter(l => l.status === 'draft').length,
    paused: listings.filter(l => l.status === 'paused').length,
    closed: listings.filter(l => l.status === 'closed').length,
  };

  if (loading) return <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-display text-white">My Listings</h1>
          <p className="text-sm text-gray-500">{listings.length} total listings</p>
        </div>
        <Link href="/listings/new" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search your listings..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 py-2.5 text-sm" />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-5 pb-1">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              tab === t ? 'bg-eden-500/15 text-eden-400 font-medium' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="ml-1.5 text-xs opacity-60">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Listings */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((listing) => {
            const Icon = TYPE_ICONS[listing.type] || Package;
            return (
              <motion.div key={listing.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-6 h-6 text-eden-800/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[listing.status] || ''}`}>
                      {listing.status}
                    </span>
                    <span className="text-[10px] text-gray-600 capitalize">{listing.type}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white truncate">{listing.title}</h3>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.view_count || 0}</span>
                    {listing.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.city}</span>}
                    {listing.price_amount && <span>${listing.price_amount}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link href={`/listings/${listing.id}`} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/[0.05]">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === listing.id ? null : listing.id)}
                      className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/[0.05]">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === listing.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 mt-1 w-44 bg-[#142e1e] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1">
                          <Link href={`/listings/${listing.id}`} onClick={() => setMenuOpen(null)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.05]">
                            <Edit3 className="w-4 h-4" /> Edit
                          </Link>
                          {listing.status === 'active' ? (
                            <button onClick={() => updateStatus(listing.id, 'paused')}
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.05] w-full text-left">
                              <Pause className="w-4 h-4" /> Pause
                            </button>
                          ) : listing.status !== 'closed' && (
                            <button onClick={() => updateStatus(listing.id, 'active')}
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.05] w-full text-left">
                              <Play className="w-4 h-4" /> Activate
                            </button>
                          )}
                          <button onClick={() => duplicateListing(listing)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.05] w-full text-left">
                            <Copy className="w-4 h-4" /> Duplicate
                          </button>
                          <div className="border-t border-white/[0.06] my-1" />
                          <button onClick={() => deleteListing(listing.id)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-white/[0.05] w-full text-left">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">
            {tab === 'all' ? 'No listings yet' : `No ${tab} listings`}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {tab === 'all' ? 'Create your first listing to start sharing with the community.' : `You don't have any ${tab} listings right now.`}
          </p>
          {tab === 'all' && (
            <Link href="/listings/new" className="btn-primary text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Listing
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
