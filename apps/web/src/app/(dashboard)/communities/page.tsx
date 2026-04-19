"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Plus, Users, MapPin, Globe, ChevronRight, Grid, List } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newComm, setNewComm] = useState({ name: '', description: '', city: '', region: '', country: '', category: 'general' });

  useEffect(() => { fetchCommunities(); }, []);

  const fetchCommunities = async () => {
    const { data } = await supabase.from('communities').select('*').eq('is_public', true).order('member_count', { ascending: false });
    setCommunities(data || []);
    setLoading(false);
  };

  const createCommunity = async () => {
    if (!user || !newComm.name) return;
    setCreating(true);
    const slug = newComm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase.from('communities').insert({
      name: newComm.name,
      slug: slug + '-' + Date.now().toString(36),
      description: newComm.description,
      city: newComm.city,
      region: newComm.region,
      country: newComm.country,
      category: newComm.category,
      owner_id: user.id,
    }).select().single();

    if (!error && data) {
      await supabase.from('community_members').insert({ community_id: data.id, user_id: user.id, role: 'owner' });
      setShowCreate(false);
      setNewComm({ name: '', description: '', city: '', region: '', country: '', category: 'general' });
      fetchCommunities();
    }
    setCreating(false);
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) return;
    await supabase.from('community_members').upsert({ community_id: communityId, user_id: user.id, role: 'member' });
    await supabase.from('communities').update({ member_count: communities.find(c => c.id === communityId)!.member_count + 1 }).eq('id', communityId);
    fetchCommunities();
  };

  const filtered = communities.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen pt-16">
      <div className="bg-gradient-to-b from-eden-950 to-transparent border-b border-white/[0.04]">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div><h1 className="text-3xl font-display text-white mb-2">Communities</h1><p className="text-gray-400">Discover and join communities around the world</p></div>
            {user && <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Create Community</button>}
          </div>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="card-glass p-6 w-full max-w-lg">
            <h2 className="text-xl font-display text-white mb-6">Create a Community</h2>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-2">Name *</label><input type="text" value={newComm.name} onChange={e => setNewComm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Community name" /></div>
              <div><label className="block text-sm text-gray-400 mb-2">Description</label><textarea value={newComm.description} onChange={e => setNewComm(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" rows={3} placeholder="What is this community about?" /></div>
              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={newComm.city} onChange={e => setNewComm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="input-field" />
                <input type="text" value={newComm.region} onChange={e => setNewComm(p => ({ ...p, region: e.target.value }))} placeholder="Region" className="input-field" />
                <input type="text" value={newComm.country} onChange={e => setNewComm(p => ({ ...p, country: e.target.value }))} placeholder="Country" className="input-field" />
              </div>
              <div><label className="block text-sm text-gray-400 mb-2">Category</label>
                <select value={newComm.category} onChange={e => setNewComm(p => ({ ...p, category: e.target.value }))} className="input-field">
                  {['general','permaculture','urban_farming','eco_village','homestead','food_forest','community_garden','regenerative_ag','seed_saving','cooperative','land_trust','conservation'].map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={createCommunity} disabled={creating || !newComm.name} className="btn-primary flex-1">
                  {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Create Community'}
                </button>
                <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search */}
      <div className="sticky top-16 z-40 bg-eden-950/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="container mx-auto px-4 py-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search communities..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card-glass-hover overflow-hidden group">
                <div className="h-20 bg-gradient-to-br from-eden-600/20 to-sky-600/10" />
                <div className="p-5 -mt-6">
                  <div className="w-14 h-14 rounded-xl bg-eden-500/10 border-4 border-eden-950 flex items-center justify-center mb-3">
                    <Users className="w-7 h-7 text-eden-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-eden-400 transition-colors mb-1">{c.name}</h3>
                  {c.city && <div className="flex items-center gap-1 text-xs text-gray-500 mb-2"><MapPin className="w-3 h-3" /> {c.city}{c.region ? `, ${c.region}` : ''}</div>}
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{c.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {c.member_count} members</span>
                    {user && (
                      <button onClick={() => joinCommunity(c.id)} className="text-xs text-eden-400 hover:text-eden-300">Join</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-display text-white mb-2">No communities yet</h3>
            <p className="text-gray-500 mb-6">Be the first to create one.</p>
            {user && <button onClick={() => setShowCreate(true)} className="btn-primary">Create a Community</button>}
          </div>
        )}
      </div>
    </div>
  );
}
