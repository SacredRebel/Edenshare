"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Map, List, Search, Filter, MapPin, Users, Leaf, Wrench, ChevronRight, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const EarthGlobe = dynamic(() => import('../components/globe/EarthGlobe'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-eden-950"><div className="animate-pulse text-eden-400">Loading Globe...</div></div>,
});

type ViewMode = 'globe' | 'list';
const TYPE_ICONS: Record<string, any> = { land: MapPin, resource: Leaf, service: Wrench };

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('globe');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: l } = await supabase.from('listings').select('*, profiles!listings_creator_id_fkey(display_name)').eq('status', 'active').order('created_at', { ascending: false }).limit(50);
    const { data: c } = await supabase.from('communities').select('*').eq('is_public', true).order('member_count', { ascending: false }).limit(50);
    setListings(l || []);
    setCommunities(c || []);
    setLoading(false);
  };

  const filtered = listings.filter(l => {
    if (typeFilter && l.type !== typeFilter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-eden-950/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" placeholder="Search communities, land, resources..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
            </div>
            <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-1">
              {([
                { mode: 'globe' as const, icon: Globe, label: 'Globe' },
                { mode: 'list' as const, icon: List, label: 'List' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === mode ? 'bg-eden-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                  <Icon className="w-4 h-4" /><span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                { type: 'land', icon: MapPin, label: 'Land' },
                { type: 'resource', icon: Leaf, label: 'Resources' },
                { type: 'service', icon: Wrench, label: 'Services' },
              ].map(({ type, icon: Icon, label }) => (
                <button key={type} onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                    typeFilter === type ? 'bg-eden-500/20 text-eden-400 border border-eden-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'
                  }`}>
                  <Icon className="w-4 h-4" /><span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-8rem)]">
        {viewMode === 'globe' && (
          <div className="flex-1">
            <EarthGlobe />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              {/* Communities section */}
              {communities.length > 0 && !typeFilter && (
                <div className="mb-8">
                  <h2 className="text-lg font-display text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-eden-400" /> Communities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {communities.slice(0, 6).map(c => (
                      <Link key={c.id} href={`/communities/${c.slug}`} className="card-glass-hover p-4 flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-eden-500/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-eden-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white group-hover:text-eden-400 truncate">{c.name}</h3>
                          <p className="text-xs text-gray-500">{c.member_count} members</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Listings */}
              <h2 className="text-lg font-display text-white mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-eden-400" /> Listings</h2>
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>
              ) : filtered.length > 0 ? (
                <div className="space-y-3">
                  {filtered.map(l => {
                    const Icon = TYPE_ICONS[l.type] || MapPin;
                    return (
                      <Link key={l.id} href={`/listings/${l.id}`} className="card-glass-hover p-4 flex items-center gap-4 group block">
                        <div className="w-16 h-16 rounded-xl bg-eden-800/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <Icon className="w-6 h-6 text-eden-600/40" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${l.type === 'land' ? 'bg-eden-500/15 text-eden-400' : l.type === 'resource' ? 'bg-sky-500/15 text-sky-400' : 'bg-purple-500/15 text-purple-400'}`}>{l.type}</span>
                          <h3 className="text-sm font-medium text-white mt-1 group-hover:text-eden-400 truncate">{l.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            {l.city && <span>{l.city}</span>}
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {l.view_count}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-eden-400 flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">No listings found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
