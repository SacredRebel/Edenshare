"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Users, ArrowLeft, Shield, Globe, Star, Plus, Settings, LogOut, ChevronRight, MessageSquare, Calendar, Eye, Leaf, Wrench } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function CommunityDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'about' | 'listings' | 'members'>('about');

  useEffect(() => { if (slug) fetchCommunity(); }, [slug, user]);

  const fetchCommunity = async () => {
    const { data: c } = await supabase.from('communities').select('*').eq('slug', slug).single();
    if (!c) { setLoading(false); return; }
    setCommunity(c);
    setIsOwner(user?.id === c.owner_id);

    const { data: m } = await supabase
      .from('community_members')
      .select('*, profiles(display_name, avatar_url, trust_score)')
      .eq('community_id', c.id);
    setMembers(m || []);

    if (user) setIsMember(!!(m || []).find((cm: any) => cm.user_id === user.id));

    const { data: l } = await supabase.from('listings').select('*').eq('community_id', c.id).eq('status', 'active').order('created_at', { ascending: false });
    setListings(l || []);

    setLoading(false);
  };

  const joinCommunity = async () => {
    if (!user || !community) return;
    await supabase.from('community_members').insert({ community_id: community.id, user_id: user.id, role: 'member' });
    await supabase.from('communities').update({ member_count: (community.member_count || 0) + 1 }).eq('id', community.id);
    setIsMember(true);
    fetchCommunity();
  };

  const leaveCommunity = async () => {
    if (!user || !community || isOwner) return;
    await supabase.from('community_members').delete().eq('community_id', community.id).eq('user_id', user.id);
    await supabase.from('communities').update({ member_count: Math.max(0, (community.member_count || 1) - 1) }).eq('id', community.id);
    setIsMember(false);
    fetchCommunity();
  };

  if (loading) return <div className="min-h-screen pt-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;
  if (!community) return <div className="min-h-screen pt-16 flex items-center justify-center"><p className="text-gray-500">Community not found</p></div>;

  const TYPE_ICONS: Record<string, any> = { land: MapPin, resource: Leaf, service: Wrench };

  return (
    <div className="min-h-screen pt-16">
      {/* Cover */}
      <div className="h-48 bg-gradient-to-br from-eden-800/30 via-eden-900/40 to-sky-900/20 relative">
        {community.cover_url && <img src={community.cover_url} alt="" className="w-full h-full object-cover absolute inset-0" />}
      </div>

      <div className="container mx-auto px-4">
        <Link href="/communities" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white -mt-12 mb-4 relative z-10">
          <ArrowLeft className="w-4 h-4" /> Communities
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 -mt-8">
          <div className="w-24 h-24 rounded-2xl bg-eden-500/10 border-4 border-eden-950 flex items-center justify-center flex-shrink-0 shadow-xl">
            {community.avatar_url ? <img src={community.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" /> : <Users className="w-10 h-10 text-eden-400" />}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-display text-white flex items-center gap-2">
                  {community.name}
                  {community.is_verified && <Shield className="w-5 h-5 text-eden-400" />}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  {community.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {community.city}{community.region ? `, ${community.region}` : ''}</span>}
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {community.member_count} members</span>
                  <span className="capitalize text-xs bg-white/[0.04] px-2 py-0.5 rounded">{(community.category || 'general').replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {user && !isMember && <button onClick={joinCommunity} className="btn-primary text-sm">Join Community</button>}
                {user && isMember && !isOwner && <button onClick={leaveCommunity} className="btn-secondary text-sm flex items-center gap-2"><LogOut className="w-4 h-4" /> Leave</button>}
                {isOwner && <button className="btn-secondary text-sm flex items-center gap-2"><Settings className="w-4 h-4" /> Manage</button>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 mb-6">
          {(['about', 'listings', 'members'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-eden-500/20 text-eden-400' : 'text-gray-500 hover:text-white'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)} {t === 'listings' ? `(${listings.length})` : t === 'members' ? `(${members.length})` : ''}
            </button>
          ))}
        </div>

        {/* About */}
        {tab === 'about' && (
          <div className="grid lg:grid-cols-3 gap-6 pb-12">
            <div className="lg:col-span-2">
              <div className="card-glass p-6">
                <h2 className="text-lg font-semibold text-white mb-3">About</h2>
                <p className="text-gray-400 leading-relaxed whitespace-pre-line">{community.long_description || community.description || 'No description yet.'}</p>
              </div>
              {community.rules && (
                <div className="card-glass p-6 mt-4">
                  <h2 className="text-lg font-semibold text-white mb-3">Community Rules</h2>
                  <p className="text-gray-400 leading-relaxed whitespace-pre-line text-sm">{community.rules}</p>
                </div>
              )}
            </div>
            <div>
              <div className="card-glass p-5">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Members</span><span className="text-white">{community.member_count}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Listings</span><span className="text-white">{listings.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Created</span><span className="text-white">{new Date(community.created_at).toLocaleDateString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Status</span><span className={community.is_online ? 'text-eden-400' : 'text-gray-500'}>{community.is_online ? 'Online' : 'Offline'}</span></div>
                </div>
              </div>
              {community.tags?.length > 0 && (
                <div className="card-glass p-5 mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {community.tags.map((t: string) => <span key={t} className="text-xs px-3 py-1.5 bg-white/[0.04] text-gray-400 rounded-lg">{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Listings */}
        {tab === 'listings' && (
          <div className="space-y-3 pb-12">
            {listings.map(l => {
              const Icon = TYPE_ICONS[l.type] || MapPin;
              return (
                <Link key={l.id} href={`/listings/${l.id}`} className="card-glass-hover p-5 flex items-center gap-4 block">
                  <div className="w-16 h-16 rounded-xl bg-eden-800/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <Icon className="w-6 h-6 text-eden-600/40" />}
                  </div>
                  <div className="flex-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${l.type === 'land' ? 'bg-eden-500/15 text-eden-400' : l.type === 'resource' ? 'bg-sky-500/15 text-sky-400' : 'bg-purple-500/15 text-purple-400'}`}>{l.type}</span>
                    <h3 className="text-sm font-medium text-white mt-1">{l.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{l.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                </Link>
              );
            })}
            {listings.length === 0 && <p className="text-gray-500 text-center py-12">No listings in this community yet.</p>}
          </div>
        )}

        {/* Members */}
        {tab === 'members' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-12">
            {members.map((m: any) => (
              <div key={m.id} className="card-glass p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-eden-400/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                  {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (m.profiles?.display_name || '?')[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{m.profiles?.display_name || 'User'}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
