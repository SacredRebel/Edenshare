"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Leaf, Wrench, Heart, Eye, X, SlidersHorizontal, Grid3X3, List, Star, ArrowUpDown, Package } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  land: { bg: 'bg-eden-500/12', text: 'text-eden-400' },
  resource: { bg: 'bg-sky-500/12', text: 'text-sky-400' },
  service: { bg: 'bg-purple-500/12', text: 'text-purple-400' },
};

const EXCHANGE_LABELS: Record<string, string> = {
  free: 'Free', trade: 'Trade', paid: 'Paid', work_exchange: 'Work Exchange', donation: 'Donation', flexible: 'Flexible',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [exchangeFilter, setExchangeFilter] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  useEffect(() => { fetchListings(); fetchSaved(); }, []);

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*, profiles!listings_creator_id_fkey(display_name, avatar_url, trust_score)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(60);
    setListings(data || []);
    setLoading(false);
  };

  const fetchSaved = async () => {
    if (!user) return;
    const { data } = await supabase.from('saved_listings').select('listing_id').eq('user_id', user.id);
    setSavedIds(new Set((data || []).map(d => d.listing_id)));
  };

  const toggleSave = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (savedIds.has(listingId)) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listingId);
      setSavedIds(prev => { const n = new Set(prev); n.delete(listingId); return n; });
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listingId });
      setSavedIds(prev => new Set(prev).add(listingId));
    }
  };

  // Filter + sort
  let filtered = listings.filter(l => {
    if (typeFilter && l.type !== typeFilter) return false;
    if (exchangeFilter && l.exchange_type !== exchangeFilter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (sort === 'popular') filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
  if (sort === 'price_low') filtered.sort((a, b) => (a.price_amount || 0) - (b.price_amount || 0));
  if (sort === 'price_high') filtered.sort((a, b) => (b.price_amount || 0) - (a.price_amount || 0));

  const activeFilterCount = [typeFilter, exchangeFilter].filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-display text-white mb-1">Marketplace</h1>
        <p className="text-sm text-gray-500">{filtered.length} listings available</p>
      </div>

      {/* Search + Controls */}
      <div className="sticky top-0 lg:top-0 z-30 bg-[#0a1a10]/95 backdrop-blur-xl px-4 py-3 border-b border-white/[0.04]">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors relative ${showFilters ? 'bg-eden-500/10 border-eden-500/30 text-eden-400' : 'bg-white/[0.04] border-white/[0.06] text-gray-400'}`}>
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-eden-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <div className="hidden md:flex gap-1 bg-white/[0.03] rounded-xl p-0.5">
            <button onClick={() => setLayout('grid')} className={`p-2 rounded-lg ${layout === 'grid' ? 'bg-eden-500/15 text-eden-400' : 'text-gray-500'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setLayout('list')} className={`p-2 rounded-lg ${layout === 'list' ? 'bg-eden-500/15 text-eden-400' : 'text-gray-500'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Type chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { type: null, label: 'All', icon: Package },
            { type: 'land', label: 'Land', icon: MapPin },
            { type: 'resource', label: 'Resources', icon: Leaf },
            { type: 'service', label: 'Services', icon: Wrench },
          ].map(c => (
            <button key={c.label} onClick={() => setTypeFilter(c.type === typeFilter ? null : c.type)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                (c.type === null && !typeFilter) || typeFilter === c.type
                  ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25'
                  : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'
              }`}>
              <c.icon className="w-3.5 h-3.5" /> {c.label}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 mt-3 border-t border-white/[0.04]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Exchange Type</span>
              {exchangeFilter && <button onClick={() => setExchangeFilter(null)} className="text-[10px] text-eden-400">Clear</button>}
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              {Object.entries(EXCHANGE_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setExchangeFilter(exchangeFilter === key ? null : key)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    exchangeFilter === key ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25' : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'
                  }`}>{label}</button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Sort by</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-gray-300 appearance-none">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Grid */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-white/[0.03] rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className={`grid gap-3 ${layout === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
            {filtered.map((l, i) => {
              const style = TYPE_STYLES[l.type] || TYPE_STYLES.land;
              const isSaved = savedIds.has(l.id);
              return (
                <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                  <Link href={`/listings/${l.id}`} className="block group">
                    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden active:bg-white/[0.05] transition-colors ${layout === 'list' ? 'flex' : ''}`}>
                      {/* Image */}
                      <div className={`relative bg-[#0f2318] ${layout === 'list' ? 'w-28 h-28 flex-shrink-0' : 'aspect-square'}`}>
                        {l.images?.[0] ? (
                          <img src={l.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="w-8 h-8 text-eden-800/30" />
                          </div>
                        )}
                        {/* Save */}
                        <button onClick={(e) => toggleSave(e, l.id)}
                          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            isSaved ? 'bg-red-500/80 text-white' : 'bg-black/40 backdrop-blur-sm text-white/70 active:text-red-400'
                          }`}>
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                        </button>
                        {/* Type badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm ${style.bg} ${style.text}`}>
                            {l.type}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="text-[13px] font-semibold text-white line-clamp-1 mb-0.5 group-hover:text-eden-400 transition-colors">{l.title}</h3>
                        {layout === 'list' && <p className="text-xs text-gray-400 line-clamp-1 mb-1">{l.description}</p>}
                        <div className="flex items-center justify-between mt-1">
                          {l.city ? (
                            <span className="text-[11px] text-gray-500 flex items-center gap-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0" /> {l.city}</span>
                          ) : <span />}
                          {l.price_amount ? (
                            <span className="text-xs font-semibold text-white">${l.price_amount}</span>
                          ) : (
                            <span className="text-[10px] text-eden-400/80 capitalize">{(l.exchange_type || 'flexible').replace('_', ' ')}</span>
                          )}
                        </div>
                        {/* Host */}
                        {l.profiles && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.04]">
                            <div className="w-5 h-5 rounded-full bg-eden-500/20 flex items-center justify-center text-[8px] font-bold text-white overflow-hidden">
                              {l.profiles.avatar_url ? <img src={l.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (l.profiles.display_name || '?')[0]}
                            </div>
                            <span className="text-[10px] text-gray-500 truncate">{l.profiles.display_name}</span>
                            {l.profiles.trust_score > 0 && (
                              <span className="text-[10px] text-gray-600 flex items-center gap-0.5 ml-auto"><Star className="w-2.5 h-2.5 text-eden-400 fill-eden-400" /> {l.profiles.trust_score.toFixed(1)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No listings found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(''); setTypeFilter(null); setExchangeFilter(null); }} className="text-sm text-eden-400">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
