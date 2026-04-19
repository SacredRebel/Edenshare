"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Settings, Megaphone, Shield, UserX, UserPlus, Crown, Trash2, Save, Check, Pin } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function CommunityManagePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [tab, setTab] = useState<'members' | 'announcements' | 'settings'>('members');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({ name: '', description: '', rules: '', is_private: false });

  useEffect(() => { if (slug && user) fetchData(); }, [slug, user]);

  const fetchData = async () => {
    const { data: c } = await supabase.from('communities').select('*').eq('slug', slug).single();
    if (!c || c.owner_id !== user?.id) { router.push('/communities'); return; }
    setCommunity(c);
    setEditForm({ name: c.name, description: c.description || '', rules: c.rules || '', is_private: c.is_private || false });

    const { data: m } = await supabase.from('community_members').select('*, profiles(id, display_name, avatar_url, trust_score)').eq('community_id', c.id).order('joined_at', { ascending: true });
    setMembers(m || []);

    const { data: jr } = await supabase.from('community_join_requests').select('*, profiles:user_id(display_name, avatar_url)').eq('community_id', c.id).eq('status', 'pending');
    setJoinRequests(jr || []);

    const { data: a } = await supabase.from('announcements').select('*').eq('community_id', c.id).order('created_at', { ascending: false });
    setAnnouncements(a || []);

    setLoading(false);
  };

  const changeMemberRole = async (memberId: string, role: string) => {
    await supabase.from('community_members').update({ role }).eq('id', memberId);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
  };

  const removeMember = async (memberId: string, userId: string) => {
    if (!confirm('Remove this member?')) return;
    await supabase.from('community_members').delete().eq('id', memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
    if (community) {
      await supabase.from('communities').update({ member_count: Math.max(0, community.member_count - 1) }).eq('id', community.id);
    }
  };

  const handleJoinRequest = async (requestId: string, userId: string, status: 'approved' | 'rejected') => {
    await supabase.from('community_join_requests').update({ status }).eq('id', requestId);
    if (status === 'approved' && community) {
      await supabase.from('community_members').insert({ community_id: community.id, user_id: userId, role: 'member' });
      await supabase.from('communities').update({ member_count: community.member_count + 1 }).eq('id', community.id);
      await supabase.from('notifications').insert({ user_id: userId, type: 'community_invite', title: 'Welcome!', body: `You've been accepted into ${community.name}`, action_url: `/communities/${community.slug}` });
    }
    setJoinRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const postAnnouncement = async () => {
    if (!announcementTitle || !community) return;
    const { data } = await supabase.from('announcements').insert({ community_id: community.id, title: announcementTitle, content: announcementContent }).select().single();
    if (data) setAnnouncements(prev => [data, ...prev]);
    setAnnouncementTitle('');
    setAnnouncementContent('');
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const saveSettings = async () => {
    if (!community) return;
    setSaving(true);
    await supabase.from('communities').update(editForm).eq('id', community.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;
  if (!community) return null;

  const ROLE_COLORS: Record<string, string> = { owner: 'text-amber-400', admin: 'text-sky-400', moderator: 'text-purple-400', member: 'text-gray-500' };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Link href={`/communities/${slug}`} className="flex items-center gap-2 text-sm text-gray-500 active:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to {community.name}
      </Link>

      <h1 className="text-xl font-display text-white mb-1">Manage Community</h1>
      <p className="text-sm text-gray-500 mb-6">{community.name} · {community.member_count} members</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 mb-6">
        {[
          { id: 'members' as const, label: 'Members', icon: Users, badge: joinRequests.length },
          { id: 'announcements' as const, label: 'Announcements', icon: Megaphone },
          { id: 'settings' as const, label: 'Settings', icon: Settings },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${tab === t.id ? 'bg-eden-500/15 text-eden-400' : 'text-gray-500'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
            {t.badge && t.badge > 0 ? <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded-full">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* Members */}
      {tab === 'members' && (
        <div className="space-y-4">
          {/* Join requests */}
          {joinRequests.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4">
              <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4" /> Join Requests ({joinRequests.length})</h3>
              <div className="space-y-2">
                {joinRequests.map(jr => (
                  <div key={jr.id} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-eden-500/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {jr.profiles?.avatar_url ? <img src={jr.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (jr.profiles?.display_name || '?')[0]}
                    </div>
                    <span className="text-sm text-white flex-1">{jr.profiles?.display_name}</span>
                    <button onClick={() => handleJoinRequest(jr.id, jr.user_id, 'approved')} className="text-xs px-3 py-1.5 bg-eden-500/15 text-eden-400 rounded-lg">Accept</button>
                    <button onClick={() => handleJoinRequest(jr.id, jr.user_id, 'rejected')} className="text-xs px-3 py-1.5 bg-white/[0.05] text-gray-400 rounded-lg">Decline</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member list */}
          <div className="space-y-1">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                <div className="w-9 h-9 rounded-full bg-eden-500/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                  {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (m.profiles?.display_name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{m.profiles?.display_name}</p>
                  <p className={`text-[10px] capitalize ${ROLE_COLORS[m.role] || 'text-gray-500'}`}>{m.role}</p>
                </div>
                {m.role !== 'owner' && (
                  <div className="flex gap-1 flex-shrink-0">
                    <select value={m.role} onChange={e => changeMemberRole(m.id, e.target.value)}
                      className="text-[10px] bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-gray-400 appearance-none">
                      <option value="member">Member</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => removeMember(m.id, m.user_id)} className="p-1 text-gray-600 active:text-red-400">
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Post Announcement</h3>
            <input type="text" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)}
              placeholder="Title" className="input-field text-sm" />
            <textarea value={announcementContent} onChange={e => setAnnouncementContent(e.target.value)}
              placeholder="Content..." rows={3} className="input-field text-sm resize-none" />
            <button onClick={postAnnouncement} disabled={!announcementTitle} className="btn-primary text-sm disabled:opacity-30">
              <Megaphone className="w-4 h-4 mr-1.5 inline" /> Post
            </button>
          </div>

          {announcements.map(a => (
            <div key={a.id} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-white flex items-center gap-1.5">
                    {a.is_pinned && <Pin className="w-3 h-3 text-amber-400" />}{a.title}
                  </h4>
                  <p className="text-[10px] text-gray-600">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deleteAnnouncement(a.id)} className="p-1 text-gray-600 active:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {a.content && <p className="text-xs text-gray-400 leading-relaxed">{a.content}</p>}
            </div>
          ))}

          {announcements.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No announcements yet</p>}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Community Name</label>
            <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
            <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className="input-field text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Rules</label>
            <textarea value={editForm.rules} onChange={e => setEditForm(p => ({ ...p, rules: e.target.value }))} rows={3} className="input-field text-sm resize-none" />
          </div>
          <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
            <div><p className="text-sm text-white">Private Community</p><p className="text-xs text-gray-500">Require approval to join</p></div>
            <button onClick={() => setEditForm(p => ({ ...p, is_private: !p.is_private }))}
              className={`w-11 h-6 rounded-full transition-colors ${editForm.is_private ? 'bg-eden-500' : 'bg-gray-600'} relative`}>
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${editForm.is_private ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
