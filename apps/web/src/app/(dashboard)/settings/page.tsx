"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Palette, Bell, Shield, Lock, Mail, Eye, EyeOff, Save, Check, Trash2, MapPin, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const SECTIONS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

const COLORS = ['#3ec878','#60b9fa','#c084fc','#fbbf24','#f87171','#fb923c','#34d399','#818cf8','#ec4899','#14b8a6'];

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState('account');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    theme: 'dark', accent_color: '#3ec878', font_size: 'medium', compact_mode: false,
    notification_email: true, notification_push: true, notification_digest: 'instant',
    is_public: true, show_exact_location: false, show_online_status: true,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      theme: profile.theme || 'dark',
      accent_color: profile.accent_color || '#3ec878',
      font_size: profile.font_size || 'medium',
      compact_mode: profile.compact_mode || false,
      notification_email: profile.notification_email !== false,
      notification_push: profile.notification_push !== false,
      notification_digest: profile.notification_digest || 'instant',
      is_public: profile.is_public !== false,
      show_exact_location: profile.show_exact_location || false,
      show_online_status: profile.show_online_status !== false,
    });
  }, [profile]);

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update(form).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePw = async () => {
    if (!newPw || newPw.length < 6) { setMsg('Min 6 characters'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setMsg(error ? error.message : 'Password updated');
    if (!error) setNewPw('');
    setTimeout(() => setMsg(''), 3000);
  };

  const deleteAccount = async () => {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-display text-white mb-6">Settings</h1>

      {msg && <div className="mb-4 p-3 bg-eden-500/10 border border-eden-500/20 rounded-xl text-eden-400 text-sm">{msg}</div>}

      {/* Section tabs — horizontal scroll on mobile */}
      <div className="flex gap-1 overflow-x-auto mb-6 pb-1 scrollbar-hide">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
              section === s.id ? 'bg-eden-500/15 text-eden-400 font-medium' : 'text-gray-500 active:text-white'
            }`}>
            <s.icon className="w-4 h-4" /> {s.label}
          </button>
        ))}
      </div>

      {/* Account */}
      {section === 'account' && (
        <div className="space-y-5">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 text-sm text-gray-400"><Mail className="w-4 h-4" /> {user.email}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Change Password</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                    placeholder="New password" className="input-field pl-10 pr-10 text-sm py-2.5" />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={changePw} disabled={!newPw} className="btn-primary text-sm py-2.5 px-4">Update</button>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-red-500/10 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
            <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all data.</p>
            <button onClick={deleteAccount} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm active:bg-red-500/20">
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Appearance */}
      {section === 'appearance' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-6">
          <div>
            <label className="text-xs text-gray-500 mb-3 block">Theme</label>
            <div className="flex gap-2">
              {['dark', 'light', 'system'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, theme: t }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm capitalize transition-all ${form.theme === t ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25' : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-3 block">Accent Color</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, accent_color: c }))}
                  className={`w-9 h-9 rounded-xl transition-transform ${form.accent_color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a1a10] scale-110' : 'active:scale-95'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-3 block">Font Size</label>
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, font_size: s }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm capitalize transition-all ${form.font_size === s ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25' : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {section === 'notifications' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          {[
            { key: 'notification_email', label: 'Email notifications', desc: 'Receive updates via email' },
            { key: 'notification_push', label: 'Push notifications', desc: 'Browser push notifications' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div><p className="text-sm text-white">{n.label}</p><p className="text-xs text-gray-500">{n.desc}</p></div>
              <button onClick={() => setForm(p => ({ ...p, [n.key]: !(p as any)[n.key] }))}
                className={`w-11 h-6 rounded-full transition-colors ${(form as any)[n.key] ? 'bg-eden-500' : 'bg-gray-600'} relative`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${(form as any)[n.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
          <div>
            <p className="text-sm text-white mb-2">Digest frequency</p>
            <div className="flex gap-2">
              {['instant', 'daily', 'weekly'].map(d => (
                <button key={d} onClick={() => setForm(p => ({ ...p, notification_digest: d }))}
                  className={`flex-1 py-2 rounded-xl text-xs capitalize transition-all ${form.notification_digest === d ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25' : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy */}
      {section === 'privacy' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
          {[
            { key: 'is_public', label: 'Public profile', desc: 'Others can see your profile' },
            { key: 'show_exact_location', label: 'Show exact location', desc: 'Show precise location on listings' },
            { key: 'show_online_status', label: 'Show online status', desc: 'Others can see when you\'re active' },
          ].map(p => (
            <div key={p.key} className="flex items-center justify-between">
              <div><p className="text-sm text-white">{p.label}</p><p className="text-xs text-gray-500">{p.desc}</p></div>
              <button onClick={() => setForm(prev => ({ ...prev, [p.key]: !(prev as any)[p.key] }))}
                className={`w-11 h-6 rounded-full transition-colors ${(form as any)[p.key] ? 'bg-eden-500' : 'bg-gray-600'} relative`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${(form as any)[p.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Save button for appearance/notifications/privacy */}
      {section !== 'account' && (
        <div className="mt-5">
          <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
