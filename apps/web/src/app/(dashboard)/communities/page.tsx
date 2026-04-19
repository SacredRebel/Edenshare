"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Search, MapPin, Plus, Globe, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('communities').select('*').order('member_count', { ascending: false }).limit(50);
      setCommunities(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = communities.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-display text-white">Communities</h1>
          <p className="text-sm text-gray-500">{communities.length} communities</p>
        </div>
        <Link href="/communities/new" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Create
        </Link>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search communities..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 py-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/[0.03] rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
              <Link href={`/communities/${c.slug}`}
                className="block p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl active:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-eden-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {c.avatar_url ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-eden-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                      {c.name} {c.is_private ? <Lock className="w-3 h-3 text-amber-400" /> : null}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.member_count}</span>
                      {c.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.city}</span>}
                    </div>
                  </div>
                </div>
                {c.description && <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{c.description}</p>}
                {c.category && (
                  <div className="mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-500 capitalize">{c.category.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No communities found</h3>
          <p className="text-sm text-gray-500 mb-4">Be the first to start one!</p>
          <Link href="/communities/new" className="btn-primary text-sm inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create Community</Link>
        </div>
      )}
    </div>
  );
}
