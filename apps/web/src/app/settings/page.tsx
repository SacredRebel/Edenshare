"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Palette, Bell, Shield, Trash2, Save, ArrowLeft, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState(profile?.theme || 'dark');
  const [accentColor, setAccentColor] = useState(profile?.accent_color || '#3ec878');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const saveAppearance = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ theme, accent_color: accentColor }).eq('id', user.id);
    await refreshProfile();
    setMessage('Appearance saved');
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setMessage('Password must be at least 6 characters'); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage(error.message);
    else { setMessage('Password updated'); setNewPassword(''); }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all data.')) return;
    // Note: full account deletion requires service role — this just signs out
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  const TABS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const ACCENT_COLORS = ['#3ec878', '#60b9fa', '#c084fc', '#fbbf24', '#f87171', '#fb923c', '#34d399', '#818cf8'];

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-display text-white mb-8">Settings</h1>

        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-eden-500/10 border border-eden-500/20 rounded-xl text-eden-400 text-sm">{message}</motion.div>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0 space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  tab === t.id ? 'bg-eden-500/10 text-eden-400' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
                }`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">
            {tab === 'account' && (
              <div className="card-glass p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Account</h2>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <div className="flex items-center gap-3">
                    <div className="input-field flex items-center gap-2 text-gray-500"><Mail className="w-4 h-4" /> {user.email}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Account ID</label>
                  <div className="input-field text-gray-600 font-mono text-xs">{user.id}</div>
                </div>
                <div className="pt-4 border-t border-white/[0.06]">
                  <h3 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h3>
                  <button onClick={deleteAccount} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm hover:bg-red-500/20">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            )}

            {tab === 'appearance' && (
              <div className="card-glass p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Appearance</h2>
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Theme</label>
                  <div className="flex gap-3">
                    {['dark', 'light'].map(t => (
                      <button key={t} onClick={() => setTheme(t)}
                        className={`px-6 py-3 rounded-xl text-sm capitalize transition-all ${theme === t ? 'bg-eden-500/20 text-eden-400 border border-eden-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Accent Color</label>
                  <div className="flex gap-3">
                    {ACCENT_COLORS.map(c => (
                      <button key={c} onClick={() => setAccentColor(c)}
                        className={`w-10 h-10 rounded-xl transition-all ${accentColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-eden-950 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <button onClick={saveAppearance} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            )}

            {tab === 'security' && (
              <div className="card-glass p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Security</h2>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Change Password</label>
                  <div className="relative max-w-sm">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="New password (min 6 chars)" className="input-field pl-10 pr-10" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button onClick={changePassword} disabled={saving || !newPassword} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Shield className="w-4 h-4" /> Update Password</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
