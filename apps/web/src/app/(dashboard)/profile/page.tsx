"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, Shield, Camera, Users, Calendar, CheckCircle, MessageSquare, Eye, Save, X, Edit3, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<'listings' | 'reviews' | 'communities'>('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [form, setForm] = useState({ display_name: '', bio: '', city: '', region: '', country: '', website: '', skills: '', interests: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name || '', bio: profile.bio || '', city: profile.city || '',
      region: profile.region || '', country: profile.country || '', website: profile.website || '',
      skills: (profile.skills || []).join(', '), interests: (profile.interests || []).join(', '),
    });
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!user) return;
    const { data: l } = await supabase.from('listings').select('*').eq('creator_id', user.id).neq('status', 'archived').order('created_at', { ascending: false });
    const { data: cm } = await supabase.from('community_members').select('*, communities(*)').eq('user_id', user.id);
    const { data: r } = await supabase.from('reviews').select('*, profiles!reviews_author_id_fkey(display_name, avatar_url)').eq('subject_id', user.id).order('created_at', { ascending: false });
    setListings(l || []);
    setCommunities((cm || []).map((c: any) => c.communities).filter(Boolean));
    setReviews(r || []);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: form.display_name, bio: form.bio, city: form.city, region: form.region,
      country: form.country, website: form.website,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()) : [],
      interests: form.interests ? form.interests.split(',').map(s => s.trim()) : [],
    }).eq('id', user.id);
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/avatar.${file.name.split('.').pop()}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl + '?t=' + Date.now() }).eq('id', user.id);
    await refreshProfile();
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/cover.${file.name.split('.').pop()}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ cover_url: data.publicUrl + '?t=' + Date.now() }).eq('id', user.id);
    await refreshProfile();
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="relative">
        <label className="cursor-pointer block">
          <div className="h-32 bg-gradient-to-br from-eden-800/30 via-eden-900/40 to-sky-900/20 relative overflow-hidden group">
            {profile.cover_url && <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/0 group-active:bg-black/30 flex items-center justify-center transition-colors">
              <Camera className="w-6 h-6 text-white/0 group-active:text-white/70" />
            </div>
          </div>
          <input type="file" accept="image/*" onChange={uploadCover} className="hidden" />
        </label>
        <div className="px-4 -mt-12 flex items-end gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-eden-500/30 border-4 border-[#0a1a10] flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-xl">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile.display_name || 'U')[0]}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-eden-500 text-white flex items-center justify-center cursor-pointer active:scale-90">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </label>
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-lg font-display text-white flex items-center gap-1.5">{profile.display_name}{profile.onboarding_completed && <Shield className="w-4 h-4 text-eden-400" />}</h1>
            <p className="text-xs text-gray-500 capitalize">{profile.user_type || 'seeker'}{profile.city ? ` · ${profile.city}` : ''}</p>
          </div>
          <button onClick={() => setEditing(!editing)} className="p-2 text-gray-400 active:text-white rounded-lg">
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Edit form */}
        {editing ? (
          <div className="space-y-3 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <input type="text" value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder="Name" className="input-field text-sm" />
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Bio" rows={3} className="input-field text-sm resize-none" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="input-field text-sm" />
              <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Country" className="input-field text-sm" />
            </div>
            <input type="text" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="Skills (comma separated)" className="input-field text-sm" />
            <input type="text" value={form.interests} onChange={e => setForm(p => ({ ...p, interests: e.target.value }))} placeholder="Interests (comma separated)" className="input-field text-sm" />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
              <button onClick={() => setEditing(false)} className="text-sm text-gray-500 px-3">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {profile.bio && <p className="text-sm text-gray-300 leading-relaxed mb-4">{profile.bio}</p>}
            {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(profile.skills || []).map((s: string) => <span key={s} className="text-[10px] px-2.5 py-1 bg-eden-500/10 text-eden-400 rounded-full border border-eden-500/20">{s}</span>)}
                {(profile.interests || []).map((i: string) => <span key={i} className="text-[10px] px-2.5 py-1 bg-white/[0.04] text-gray-400 rounded-full border border-white/[0.06]">{i}</span>)}
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Trust', value: (profile.trust_score || 0).toFixed(1), icon: Star },
            { label: 'Listings', value: listings.length, icon: MapPin },
            { label: 'Reviews', value: reviews.length, icon: MessageSquare },
            { label: 'Groups', value: communities.length, icon: Users },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
              <s.icon className="w-3.5 h-3.5 text-eden-400 mx-auto mb-1" />
              <div className="text-base font-display text-white">{s.value}</div>
              <div className="text-[9px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 mb-4">
          {(['listings', 'reviews', 'communities'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t ? 'bg-eden-500/15 text-eden-400' : 'text-gray-500'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'listings' && (
          <div className="space-y-2 pb-8">
            {listings.map(l => (
              <Link key={l.id} href={`/listings/${l.id}`} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl active:bg-white/[0.05]">
                <div className="w-12 h-12 rounded-lg bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <MapPin className="w-5 h-5 text-eden-800/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{l.title}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{l.type} · {l.status}</p>
                </div>
              </Link>
            ))}
            {listings.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No listings</p>}
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
                {r.comment && <p className="text-xs text-gray-400 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No reviews</p>}
          </div>
        )}

        {tab === 'communities' && (
          <div className="space-y-2 pb-8">
            {communities.map((c: any) => (
              <Link key={c.id} href={`/communities/${c.slug}`} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl active:bg-white/[0.05]">
                <div className="w-10 h-10 rounded-lg bg-eden-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-eden-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-500">{c.member_count} members</p>
                </div>
              </Link>
            ))}
            {communities.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Not in any communities</p>}
          </div>
        )}
      </div>
    </div>
  );
}
