"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe, Map, List, Search, SlidersHorizontal, MapPin, Users, Leaf, Wrench,
  Eye, Star, Heart, X, ChevronRight, TreePine
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const EarthGlobe = dynamic(() => import('@/components/globe/EarthGlobe'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><div className="w-20 h-20 rounded-full border-2 border-eden-500/20 animate-pulse" /></div>,
});

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  land: { bg: 'bg-eden-500/12', text: 'text-eden-400', icon: MapPin },
  resource: { bg: 'bg-sky-500/12', text: 'text-sky-400', icon: Leaf },
  service: { bg: 'bg-purple-500/12', text: 'text-purple-400', icon: Wrench },
};

export default function ExplorePage() {
  const { user } = useAuth();
  const [view, setView] = useState<'globe' | 'map' | 'list'>('globe');
  const [listings, setListings] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: l }, { data: c }] = await Promise.all([
      supabase.from('listings').select('*, profiles!listings_creator_id_fkey(display_name, avatar_url, trust_score)').eq('status', 'active').order('created_at', { ascending: false }).limit(50),
      supabase.from('communities').select('*').order('member_count', { ascending: false }).limit(20),
    ]);
    setListings(l || []);
    setCommunities(c || []);
    setLoading(false);
  };

  const filtered = listings
    .filter(l => !typeFilter || l.type === typeFilter)
    .filter(l => !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase()));

  // For map view — simple CSS grid-based map visualization
  const listingsWithCoords = filtered.filter(l => l.latitude && l.longitude);

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] lg:h-screen">
      {/* Top bar */}
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search places, listings..." value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 py-2 text-sm" />
          </div>
          {/* View toggle */}
          <div className="flex gap-0.5 bg-white/[0.03] rounded-xl p-0.5">
            {[
              { id: 'globe' as const, icon: Globe },
              { id: 'map' as const, icon: Map },
              { id: 'list' as const, icon: List },
            ].map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`p-2 rounded-lg transition-colors ${view === v.id ? 'bg-eden-500/15 text-eden-400' : 'text-gray-500'}`}>
                <v.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Type chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { type: null, label: 'All' },
            { type: 'land', label: 'Land' },
            { type: 'resource', label: 'Resources' },
            { type: 'service', label: 'Services' },
          ].map(c => (
            <button key={c.label} onClick={() => setTypeFilter(c.type === typeFilter ? null : c.type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                (c.type === null && !typeFilter) || typeFilter === c.type
                  ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25'
                  : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'
              }`}>
              {c.label}
            </button>
          ))}
          {search && <button onClick={() => setSearch('')} className="px-3 py-1.5 text-xs text-gray-500 flex items-center gap-1"><X className="w-3 h-3" /> Clear</button>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Globe View */}
        {view === 'globe' && (
          <div className="h-full relative">
            <EarthGlobe />
            {/* Floating stats */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <div className="flex-1 bg-[#0a1a10]/90 backdrop-blur-xl rounded-xl p-3 border border-white/[0.06]">
                <div className="text-lg font-display text-white">{listings.length}</div>
                <div className="text-[10px] text-gray-500">Active Listings</div>
              </div>
              <div className="flex-1 bg-[#0a1a10]/90 backdrop-blur-xl rounded-xl p-3 border border-white/[0.06]">
                <div className="text-lg font-display text-white">{communities.length}</div>
                <div className="text-[10px] text-gray-500">Communities</div>
              </div>
            </div>
          </div>
        )}

        {/* Map View — Interactive HTML/CSS map with pins */}
        {view === 'map' && (
          <div className="h-full relative bg-[#071a0e]">
            {/* Simple visual map background */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(26,173,92,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(59,156,246,0.15) 0%, transparent 50%)',
            }} />

            {/* Map notice */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="bg-[#0a1a10]/90 backdrop-blur-xl rounded-xl p-3 border border-white/[0.06] text-center">
                <p className="text-xs text-gray-400">
                  <MapPin className="w-3 h-3 inline mr-1 text-eden-400" />
                  {listingsWithCoords.length > 0
                    ? `${listingsWithCoords.length} listings with location data`
                    : 'Add a Mapbox token in env to enable the interactive map'
                  }
                </p>
              </div>
            </div>

            {/* Listing pins as absolute positioned dots (visualization) */}
            {listingsWithCoords.map((l, i) => {
              const style = TYPE_STYLES[l.type] || TYPE_STYLES.land;
              // Normalize lat/lng to viewport percentages
              const x = ((l.longitude + 180) / 360) * 100;
              const y = ((90 - l.latitude) / 180) * 100;
              return (
                <Link key={l.id} href={`/listings/${l.id}`}
                  className="absolute z-10 group" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                  <div className={`w-4 h-4 rounded-full ${style.bg.replace('/12', '/60')} border-2 border-current ${style.text} animate-pulse cursor-pointer`} />
                  <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0f2318] border border-white/[0.08] rounded-xl p-3 min-w-[180px] shadow-2xl">
                    <p className="text-xs font-medium text-white truncate">{l.title}</p>
                    <p className="text-[10px] text-gray-500">{l.city}</p>
                  </div>
                </Link>
              );
            })}

            {/* Bottom listing strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a1a10] via-[#0a1a10]/90 to-transparent pt-10 pb-4 px-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {filtered.slice(0, 8).map(l => {
                  const style = TYPE_STYLES[l.type] || TYPE_STYLES.land;
                  return (
                    <Link key={l.id} href={`/listings/${l.id}`}
                      className="flex-shrink-0 w-56 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 active:bg-white/[0.08]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>{l.type}</span>
                        {l.city && <span className="text-[10px] text-gray-500 truncate">{l.city}</span>}
                      </div>
                      <p className="text-xs font-medium text-white truncate">{l.title}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="h-full overflow-y-auto p-4 space-y-2">
            {loading ? (
              [1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)
            ) : filtered.length > 0 ? (
              filtered.map((l, i) => {
                const style = TYPE_STYLES[l.type] || TYPE_STYLES.land;
                const Icon = style.icon;
                return (
                  <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                    <Link href={`/listings/${l.id}`}
                      className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl active:bg-white/[0.06]">
                      <div className="w-14 h-14 rounded-xl bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" /> : <Icon className="w-5 h-5 text-eden-800/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>{l.type}</span>
                          {l.exchange_type && <span className="text-[10px] text-gray-600 capitalize">{l.exchange_type.replace('_', ' ')}</span>}
                        </div>
                        <p className="text-sm text-white truncate">{l.title}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
                          {l.city && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {l.city}</span>}
                          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {l.view_count || 0}</span>
                          {l.profiles?.trust_score > 0 && <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-eden-400" /> {l.profiles.trust_score.toFixed(1)}</span>}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {l.price_amount ? (
                          <span className="text-sm font-semibold text-white">${l.price_amount}</span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No listings found</p>
                <button onClick={() => { setSearch(''); setTypeFilter(null); }} className="text-xs text-eden-400 mt-2">Clear filters</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
