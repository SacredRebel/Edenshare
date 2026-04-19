"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Package, ArrowLeft, MoreVertical, Eye, Pause, Play, Trash2, Star, MapPin, Leaf } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-eden-500/15 text-eden-400', draft: 'bg-gray-500/15 text-gray-400',
  paused: 'bg-amber-500/15 text-amber-400', closed: 'bg-red-500/15 text-red-400',
  pending_review: 'bg-sky-500/15 text-sky-400',
};

export default function AdminListingsPage() {
  const { profile } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    const fetch = async () => {
      const { data } = await supabase.from('listings')
        .select('*, profiles!listings_creator_id_fkey(display_name)')
        .neq('status', 'archived')
        .order('created_at', { ascending: false }).limit(100);
      setListings(data || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('listings').update({ status }).eq('id', id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    setMenuOpen(null);
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    await supabase.from('listings').update({ status: 'archived' }).eq('id', id);
    setListings(prev => prev.filter(l => l.id !== id));
    setMenuOpen(null);
  };

  const filtered = listings
    .filter(l => statusFilter === 'all' || l.status === statusFilter)
    .filter(l => !search || l.title.toLowerCase().includes(search.toLowerCase()));

  if (profile?.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-500 active:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Admin
      </Link>

      <h1 className="text-xl font-display text-white mb-5">Listing Moderation</h1>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 py-2.5 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input-field w-32 py-2.5 text-sm appearance-none">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="pending_review">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <Leaf className="w-5 h-5 text-eden-800/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${STATUS_COLORS[l.status] || ''}`}>{l.status}</span>
                  <span className="text-[10px] text-gray-600 capitalize">{l.type}</span>
                </div>
                <p className="text-sm text-white truncate">{l.title}</p>
                <p className="text-[10px] text-gray-500">by {l.profiles?.display_name} · {l.city || 'No location'} · {l.view_count || 0} views</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Link href={`/listings/${l.id}`} className="p-2 text-gray-500 active:text-white rounded-lg"><Eye className="w-4 h-4" /></Link>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === l.id ? null : l.id)} className="p-2 text-gray-500 active:text-white rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === l.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-10 w-36 bg-[#142e1e] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1">
                        {l.status !== 'active' && (
                          <button onClick={() => updateStatus(l.id, 'active')} className="flex items-center gap-2 px-3 py-2 text-xs text-eden-400 hover:bg-white/[0.05] w-full text-left">
                            <Play className="w-3.5 h-3.5" /> Activate
                          </button>
                        )}
                        {l.status === 'active' && (
                          <button onClick={() => updateStatus(l.id, 'paused')} className="flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-white/[0.05] w-full text-left">
                            <Pause className="w-3.5 h-3.5" /> Pause
                          </button>
                        )}
                        <button onClick={() => deleteListing(l.id)} className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-white/[0.05] w-full text-left">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12"><Package className="w-10 h-10 text-gray-600 mx-auto mb-2" /><p className="text-sm text-gray-500">No listings found</p></div>}
        </div>
      )}
    </div>
  );
}
