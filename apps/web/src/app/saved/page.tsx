"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, MapPin, Leaf, Wrench, ChevronRight, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!user) return;
    fetchSaved();
  }, [user, authLoading]);

  const fetchSaved = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_listings')
      .select('*, listings(*)')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const unsave = async (id: string) => {
    await supabase.from('saved_listings').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  if (authLoading || loading) return <div className="min-h-screen pt-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;

  const ICONS: Record<string, any> = { land: MapPin, resource: Leaf, service: Wrench };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-display text-white mb-6 flex items-center gap-2"><Heart className="w-6 h-6 text-red-400" /> Saved Listings</h1>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map(item => {
              const l = item.listings;
              if (!l) return null;
              const Icon = ICONS[l.type] || MapPin;
              return (
                <div key={item.id} className="card-glass-hover p-5 flex items-center gap-4">
                  <Link href={`/listings/${l.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-eden-800/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <Icon className="w-6 h-6 text-eden-600/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${l.type === 'land' ? 'bg-eden-500/15 text-eden-400' : l.type === 'resource' ? 'bg-sky-500/15 text-sky-400' : 'bg-purple-500/15 text-purple-400'}`}>{l.type}</span>
                      <h3 className="text-sm font-medium text-white mt-1 truncate">{l.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{l.city}{l.region ? `, ${l.region}` : ''}</p>
                    </div>
                  </Link>
                  <button onClick={() => unsave(item.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 mb-4">No saved listings yet</p>
            <Link href="/listings" className="btn-primary">Browse Listings</Link>
          </div>
        )}
      </div>
    </div>
  );
}
