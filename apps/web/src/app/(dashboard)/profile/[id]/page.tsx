"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star, Shield, Users, Calendar, MessageSquare, Flag, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function UserProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'listings' | 'reviews'>('listings');

  useEffect(() => {
    if (!id) return;
    // If viewing own profile, redirect
    if (user?.id === id) { router.push('/profile'); return; }
    fetchProfile();
  }, [id, user]);

  const fetchProfile = async () => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (!p) { setLoading(false); return; }
    setProfile(p);

    const { data: l } = await supabase.from('listings').select('*').eq('creator_id', id as string).eq('status', 'active').order('created_at', { ascending: false });
    setListings(l || []);

    const { data: r } = await supabase.from('reviews').select('*, profiles!reviews_author_id_fkey(display_name, avatar_url)').eq('subject_id', id as string).order('created_at', { ascending: false });
    setReviews(r || []);

    setLoading(false);
  };

  const messageUser = async () => {
    if (!user || !profile) return;
    // Check existing conversation
    const { data: parts } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
    if (parts) {
      for (const p of parts) {
        const { data } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', p.conversation_id).eq('user_id', profile.id).maybeSingle();
        if (data) { router.push('/messages'); return; }
      }
    }
    // Create new
    const { data: convo } = await supabase.from('conversations').insert({ last_message_at: new Date().toISOString() }).select().single();
    if (convo) {
      await supabase.from('conversation_participants').insert([{ conversation_id: convo.id, user_id: user.id }, { conversation_id: convo.id, user_id: profile.id }]);
    }
    router.push('/messages');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">User not found</p></div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-br from-eden-800/30 via-eden-900/40 to-sky-900/20" />
        <div className="px-4 -mt-10 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-eden-500/30 border-4 border-[#0a1a10] flex items-center justify-center text-2xl font-bold text-white overflow-hidden shadow-xl">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile.display_name || 'U')[0]}
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-lg font-display text-white flex items-center gap-1.5">
              {profile.display_name}
              {profile.onboarding_completed && <Shield className="w-4 h-4 text-eden-400" />}
            </h1>
            <p className="text-xs text-gray-500 capitalize">
              {profile.user_type || 'seeker'}
              {profile.city ? ` · ${profile.city}` : ''}
              {profile.region ? `, ${profile.region}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Bio */}
        {profile.bio && <p className="text-sm text-gray-300 leading-relaxed mb-4">{profile.bio}</p>}

        {/* Skills + interests */}
        {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(profile.skills || []).map((s: string) => <span key={s} className="text-[10px] px-2.5 py-1 bg-eden-500/10 text-eden-400 rounded-full">{s}</span>)}
            {(profile.interests || []).map((i: string) => <span key={i} className="text-[10px] px-2.5 py-1 bg-white/[0.04] text-gray-400 rounded-full">{i}</span>)}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Trust', value: avgRating || '—', icon: Star },
            { label: 'Listings', value: listings.length, icon: MapPin },
            { label: 'Reviews', value: reviews.length, icon: MessageSquare },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
              <s.icon className="w-3.5 h-3.5 text-eden-400 mx-auto mb-1" />
              <div className="text-base font-display text-white">{s.value}</div>
              <div className="text-[9px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        {user && (
          <div className="flex gap-2 mb-6">
            <button onClick={messageUser} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
              <MessageSquare className="w-4 h-4" /> Message
            </button>
            {profile.user_type === 'producer' && profile.shop_name && (
              <Link href={`/marketplace?host=${profile.id}`} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                View Shop
              </Link>
            )}
          </div>
        )}

        {/* Joined */}
        <p className="text-xs text-gray-600 flex items-center gap-1 mb-4">
          <Calendar className="w-3 h-3" /> Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 mb-4">
          {(['listings', 'reviews'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-eden-500/15 text-eden-400' : 'text-gray-500'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'listings' ? listings.length : reviews.length})
            </button>
          ))}
        </div>

        {tab === 'listings' && (
          <div className="space-y-2 pb-8">
            {listings.map(l => (
              <Link key={l.id} href={`/listings/${l.id}`} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl active:bg-white/[0.05]">
                <div className="w-12 h-12 rounded-lg bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <MapPin className="w-5 h-5 text-eden-800/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{l.title}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{l.type} · {(l.exchange_type || 'flexible').replace('_', ' ')}</p>
                </div>
              </Link>
            ))}
            {listings.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No public listings</p>}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-2 pb-8">
            {reviews.map(r => (
              <div key={r.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-eden-500/20 flex items-center justify-center text-[8px] font-bold text-white overflow-hidden">
                    {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (r.profiles?.display_name || '?')[0]}
                  </div>
                  <span className="text-xs text-gray-300">{r.profiles?.display_name}</span>
                  <div className="flex gap-0.5 ml-auto">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 text-eden-400 fill-eden-400" />)}</div>
                </div>
                {r.comment && <p className="text-xs text-gray-400">{r.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No reviews</p>}
          </div>
        )}
      </div>
    </div>
  );
}
