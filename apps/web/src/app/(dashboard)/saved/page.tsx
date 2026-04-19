"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MapPin, Leaf, Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function SavedPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('saved_listings')
        .select('*, listings(*, profiles!listings_creator_id_fkey(display_name, avatar_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setSaved((data || []).filter(d => d.listings));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const unsave = async (savedId: string) => {
    await supabase.from('saved_listings').delete().eq('id', savedId);
    setSaved(prev => prev.filter(s => s.id !== savedId));
  };

  if (loading) return <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-display text-white mb-1">Saved</h1>
      <p className="text-sm text-gray-500 mb-5">{saved.length} saved listings</p>

      {saved.length > 0 ? (
        <div className="space-y-2">
          {saved.map(s => {
            const l = s.listings;
            return (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <Link href={`/listings/${l.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <Leaf className="w-5 h-5 text-eden-800/40" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{l.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="capitalize">{l.type}</span>
                      {l.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.city}</span>}
                      {l.price_amount ? <span>${l.price_amount}</span> : <span className="text-eden-400/70 capitalize">{(l.exchange_type || 'flexible').replace('_', ' ')}</span>}
                    </div>
                    {l.profiles && <p className="text-[10px] text-gray-600 mt-1">by {l.profiles.display_name}</p>}
                  </div>
                </Link>
                <button onClick={() => unsave(s.id)} className="p-2 text-red-400/50 active:text-red-400 rounded-lg flex-shrink-0">
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No saved listings</h3>
          <p className="text-sm text-gray-500 mb-4">Tap the heart icon on any listing to save it here.</p>
          <Link href="/marketplace" className="btn-primary text-sm">Browse Marketplace</Link>
        </div>
      )}
    </div>
  );
}
