"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, MapPin, Settings, Share2, Flag, Globe, Lock,
  UserPlus, UserMinus, Crown, Shield, Star, Leaf, Megaphone, Pin, Calendar
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function CommunityDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'feed' | 'listings' | 'members' | 'about'>('feed');

  useEffect(() => { if (slug) fetchData(); }, [slug, user]);

  const fetchData = async () => {
    const { data: c } = await supabase.from('communities').select('*').eq('slug', slug).single();
    if (!c) { setLoading(false); return; }
    setCommunity(c);
    setIsOwner(user?.id === c.owner_id);

    if (user) {
      const { data: m } = await supabase.from('community_members').select('id').eq('community_id', c.id).eq('user_id', user.id).maybeSingle();
      setIsMember(!!m);
    }

    const { data: ms } = await supabase.from('community_members').select('*, profiles(id, display_name, avatar_url, trust_score)').eq('community_id', c.id).order('joined_at', { ascending: true });
    setMembers(ms || []);

    // Get member user IDs for listing query
    const memberIds = (ms || []).map((m: any) => m.user_id);
    if (memberIds.length > 0) {
      const { data: ls } = await supabase.from('listings').select('*, profiles!listings_creator_id_fkey(display_name, avatar_url)').in('creator_id', memberIds).eq('status', 'active').order('created_at', { ascending: false }).limit(20);
      setListings(ls || []);
    }

    const { data: an } = await supabase.from('announcements').select('*').eq('community_id', c.id).order('created_at', { ascending: false }).limit(10);
    setAnnouncements(an || []);

    setLoading(false);
  };

  const joinCommunity = async () => {
    if (!user || !community) return;
    if (community.is_private) {
      await supabase.from('community_join_requests').insert({ community_id: community.id, user_id: user.id });
      await supabase.from('notifications').insert({ user_id: community.owner_id, type: 'request_received', title: 'Join request', body: `Someone wants to join ${community.name}`, action_url: `/communities/${community.slug}/manage` });
      alert('Join request sent! The owner will review it.');
    } else {
      await supabase.from('community_members').insert({ community_id: community.id, user_id: user.id, role: 'member' });
      await supabase.from('communities').update({ member_count: community.member_count + 1 }).eq('id', community.id);
      setIsMember(true);
      setCommunity((p: any) => ({ ...p, member_count: p.member_count + 1 }));
    }
  };

  const leaveCommunity = async () => {
    if (!user || !community || isOwner) return;
    await supabase.from('community_members').delete().eq('community_id', community.id).eq('user_id', user.id);
    await supabase.from('communities').update({ member_count: Math.max(0, community.member_count - 1) }).eq('id', community.id);
    setIsMember(false);
    setCommunity((p: any) => ({ ...p, member_count: Math.max(0, p.member_count - 1) }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;
  if (!community) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Community not found</p></div>;

  const ROLE_STYLES: Record<string, { color: string; icon: any }> = {
    owner: { color: 'text-amber-400', icon: Crown },
    admin: { color: 'text-sky-400', icon: Shield },
    moderator: { color: 'text-purple-400', icon: Shield },
    member: { color: 'text-gray-500', icon: Users },
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-8">
      {/* Header */}
      <div className="px-4 py-3">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 active:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Cover + Info */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-eden-500/15 flex items-center justify-center overflow-hidden flex-shrink-0">
            {community.avatar_url ? <img src={community.avatar_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-7 h-7 text-eden-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-display text-white flex items-center gap-2">{community.name} {community.is_private ? <Lock className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-gray-500" />}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {community.member_count} members</span>
              {community.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {community.city}</span>}
              <span className="capitalize px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px]">{(community.category || 'general').replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {community.description && <p className="text-sm text-gray-300 leading-relaxed mb-4">{community.description}</p>}

        {/* Actions */}
        <div className="flex gap-2">
          {!isMember && user && (
            <button onClick={joinCommunity} className="btn-primary flex items-center gap-2 flex-1 justify-center py-2.5">
              <UserPlus className="w-4 h-4" /> {community.is_private ? 'Request to Join' : 'Join'}
            </button>
          )}
          {isMember && !isOwner && (
            <button onClick={leaveCommunity} className="btn-secondary flex items-center gap-2 flex-1 justify-center py-2.5 text-sm">
              <UserMinus className="w-4 h-4" /> Leave
            </button>
          )}
          {isOwner && (
            <Link href={`/communities/${slug}/manage`} className="btn-primary flex items-center gap-2 flex-1 justify-center py-2.5">
              <Settings className="w-4 h-4" /> Manage
            </Link>
          )}
          <button className="p-2.5 bg-white/[0.05] border border-white/[0.06] rounded-xl text-gray-400 active:text-white">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1">
          {(['feed', 'listings', 'members', 'about'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-eden-500/15 text-eden-400' : 'text-gray-500'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {tab === 'feed' && (
        <div className="px-4 space-y-3">
          {/* Announcements */}
          {announcements.length > 0 && announcements.map(a => (
            <div key={a.id} className="bg-amber-500/5 border-l-2 border-amber-400/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">{a.title}</span>
                {a.is_pinned && <Pin className="w-3 h-3 text-amber-400" />}
              </div>
              {a.content && <p className="text-xs text-gray-400 leading-relaxed">{a.content}</p>}
              <p className="text-[10px] text-gray-600 mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
          ))}

          {/* Recent listings */}
          {listings.length > 0 ? listings.slice(0, 5).map(l => (
            <Link key={l.id} href={`/listings/${l.id}`} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl active:bg-white/[0.05]">
              <div className="w-12 h-12 rounded-lg bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <Leaf className="w-5 h-5 text-eden-800/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{l.title}</p>
                <p className="text-[10px] text-gray-500">by {l.profiles?.display_name} · {l.type}</p>
              </div>
            </Link>
          )) : (
            <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      )}

      {/* Listings */}
      {tab === 'listings' && (
        <div className="px-4 space-y-2">
          {listings.map(l => (
            <Link key={l.id} href={`/listings/${l.id}`} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl active:bg-white/[0.05]">
              <div className="w-12 h-12 rounded-lg bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <Leaf className="w-5 h-5 text-eden-800/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{l.title}</p>
                <p className="text-[10px] text-gray-500 capitalize">{l.type} · {(l.exchange_type || 'flexible').replace('_', ' ')}</p>
              </div>
            </Link>
          ))}
          {listings.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No listings from members yet</p>}
        </div>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div className="px-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {members.map(m => {
            const role = ROLE_STYLES[m.role] || ROLE_STYLES.member;
            const RoleIcon = role.icon;
            return (
              <Link key={m.id} href={`/profile/${m.user_id}`}
                className="flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl active:bg-white/[0.05] text-center">
                <div className="w-12 h-12 rounded-full bg-eden-500/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                  {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (m.profiles?.display_name || '?')[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-white truncate max-w-[100px]">{m.profiles?.display_name}</p>
                  <p className={`text-[10px] capitalize flex items-center justify-center gap-1 ${role.color}`}>
                    <RoleIcon className="w-2.5 h-2.5" /> {m.role}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* About */}
      {tab === 'about' && (
        <div className="px-4 space-y-4">
          {community.long_description && (
            <div><h3 className="text-sm font-semibold text-white mb-2">About</h3><p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{community.long_description}</p></div>
          )}
          {community.rules && (
            <div><h3 className="text-sm font-semibold text-white mb-2">Rules</h3><p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{community.rules}</p></div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Details</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /> Created {new Date(community.created_at).toLocaleDateString()}</div>
              {community.city && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /> {community.city}{community.region ? `, ${community.region}` : ''}{community.country ? `, ${community.country}` : ''}</div>}
              <div className="flex items-center gap-2">{community.is_private ? <Lock className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-gray-500" />} {community.is_private ? 'Private — approval required' : 'Public — anyone can join'}</div>
            </div>
          </div>
          {community.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {community.tags.map((t: string) => <span key={t} className="text-xs px-2.5 py-1 bg-white/[0.03] text-gray-400 rounded-full border border-white/[0.05]">{t}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
