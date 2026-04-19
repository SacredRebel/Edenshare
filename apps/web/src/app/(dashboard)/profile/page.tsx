"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Star, Shield, Edit3, Camera, Users, Calendar, CheckCircle, MessageSquare, Eye, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<'listings' | 'reviews' | 'communities'>('listings');
  const [listings, setListings] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [form, setForm] = useState({ display_name: '', bio: '', city: '', region: '', country: '', website: '', skills: '', interests: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!user || !profile) return;
    setForm({
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      city: profile.city || '',
      region: profile.region || '',
      country: profile.country || '',
      website: profile.website || '',
      skills: (profile.skills || []).join(', '),
      interests: (profile.interests || []).join(', '),
    });
    fetchData();
  }, [user, profile, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    const { data: l } = await supabase.from('listings').select('*').eq('creator_id', user.id).order('created_at', { ascending: false });
    const { data: cm } = await supabase.from('community_members').select('*, communities(*)').eq('user_id', user.id);
    const { data: r } = await supabase.from('reviews').select('*, profiles!reviews_author_id_fkey(display_name, avatar_url)').eq('subject_id', user.id);
    setListings(l || []);
    setCommunities((cm || []).map((c: any) => c.communities));
    setReviews(r || []);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: form.display_name,
      bio: form.bio,
      city: form.city,
      region: form.region,
      country: form.country,
      website: form.website,
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
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl + '?t=' + Date.now() }).eq('id', user.id);
    await refreshProfile();
    setUploading(false);
  };

  if (authLoading || !profile) return <div className="min-h-screen pt-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen pt-16">
      {/* Cover */}
      <div className="h-48 bg-gradient-to-br from-eden-800/30 via-eden-900/40 to-sky-900/20 relative">
        <div className="absolute inset-0 bg-grain opacity-30" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-eden-400 to-sky-400 flex items-center justify-center text-4xl font-bold text-white border-4 border-eden-950 shadow-xl overflow-hidden">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.display_name?.[0] || 'U'}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-eden-500 text-white flex items-center justify-center hover:bg-eden-400 cursor-pointer">
              {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-8">
            {editing ? (
              <div className="space-y-3 max-w-lg">
                <input type="text" value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder="Display Name" className="input-field" />
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Bio" rows={3} className="input-field resize-none" />
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className="input-field" />
                  <input type="text" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} placeholder="Region" className="input-field" />
                  <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Country" className="input-field" />
                </div>
                <input type="text" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="Website" className="input-field" />
                <input type="text" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="Skills (comma separated)" className="input-field" />
                <input type="text" value={form.interests} onChange={e => setForm(p => ({ ...p, interests: e.target.value }))} placeholder="Interests (comma separated)" className="input-field" />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost text-sm"><X className="w-4 h-4" /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-display text-white flex items-center gap-2">{profile.display_name}<Shield className="w-5 h-5 text-eden-400" /></h1>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.city}{profile.region ? `, ${profile.region}` : ''}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit Profile</button>
                </div>
                {profile.bio && <p className="text-gray-400 text-sm mt-3 max-w-2xl leading-relaxed">{profile.bio}</p>}
                {(profile.badges?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {profile.badges.map((b: string) => (
                      <span key={b} className="badge-verified text-[10px]"><CheckCircle className="w-3 h-3" /> {b.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Trust Score', value: (profile.trust_score || 0).toFixed(1), icon: Star },
            { label: 'Listings', value: listings.length, icon: MapPin },
            { label: 'Reviews', value: reviews.length, icon: MessageSquare },
            { label: 'Communities', value: communities.length, icon: Users },
          ].map(s => (
            <div key={s.label} className="card-glass p-4 text-center">
              <s.icon className="w-4 h-4 text-eden-400 mx-auto mb-2" />
              <div className="text-2xl font-display text-white">{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 mb-6">
          {(['listings', 'reviews', 'communities'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-eden-500/20 text-eden-400' : 'text-gray-500 hover:text-white'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'listings' && (
          <div className="space-y-3 pb-12">
            {listings.map(l => (
              <a key={l.id} href={`/listings/${l.id}`} className="card-glass-hover p-5 flex items-center gap-4 block">
                <div className="w-16 h-16 rounded-xl bg-eden-800/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <MapPin className="w-6 h-6 text-eden-600/40" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.status === 'active' ? 'bg-eden-500/15 text-eden-400' : 'bg-gray-500/15 text-gray-400'}`}>{l.status}</span>
                    <span className="text-[10px] text-gray-600 capitalize">{l.type}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white">{l.title}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{l.view_count} views</span>
                  </div>
                </div>
              </a>
            ))}
            {listings.length === 0 && <p className="text-gray-500 text-center py-8">No listings yet</p>}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-4 pb-12">
            {reviews.map(r => (
              <div key={r.id} className="card-glass p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-eden-400/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (r.profiles?.display_name || '?')[0]}
                    </div>
                    <span className="text-sm font-medium text-white">{r.profiles?.display_name}</span>
                  </div>
                  <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-eden-400 fill-eden-400" />)}</div>
                </div>
                <p className="text-sm text-gray-400">{r.comment}</p>
                <p className="text-xs text-gray-600 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet</p>}
          </div>
        )}

        {tab === 'communities' && (
          <div className="grid grid-cols-2 gap-3 pb-12">
            {communities.map((c: any) => (
              <a key={c.id} href={`/communities/${c.slug}`} className="card-glass-hover p-4 flex items-center gap-3 block">
                <div className="w-10 h-10 rounded-xl bg-eden-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-eden-400" /></div>
                <div><div className="text-sm font-medium text-white">{c.name}</div><div className="text-xs text-gray-500">{c.member_count} members</div></div>
              </a>
            ))}
            {communities.length === 0 && <p className="text-gray-500 text-center py-8 col-span-2">Not a member of any communities yet</p>}
          </div>
        )}
      </div>
    </div>
  );
}
