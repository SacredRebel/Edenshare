"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Palette, FileText, Save, Camera, Upload, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const ACCENT_COLORS = ['#3ec878', '#60b9fa', '#c084fc', '#fbbf24', '#f87171', '#fb923c', '#34d399', '#818cf8', '#ec4899', '#14b8a6'];
const LAYOUTS = [
  { value: 'grid', label: 'Grid', desc: 'Two columns, visual' },
  { value: 'list', label: 'List', desc: 'Single column, detailed' },
  { value: 'magazine', label: 'Magazine', desc: 'Mixed sizes, editorial' },
];

export default function ShopSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState<'profile' | 'appearance' | 'policies'>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    shop_name: '',
    shop_tagline: '',
    shop_description: '',
    shop_accent_color: '#3ec878',
    shop_layout: 'grid',
    shop_policies: '',
  });
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        shop_name: profile.shop_name || '',
        shop_tagline: profile.shop_tagline || '',
        shop_description: profile.shop_description || '',
        shop_accent_color: profile.shop_accent_color || '#3ec878',
        shop_layout: profile.shop_layout || 'grid',
        shop_policies: profile.shop_policies || '',
      });
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update(form).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLogoUploading(true);
    const path = `${user.id}/shop-logo.${file.name.split('.').pop()}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ shop_logo_url: data.publicUrl + '?t=' + Date.now() }).eq('id', user.id);
    await refreshProfile();
    setLogoUploading(false);
  };

  const TABS = [
    { id: 'profile' as const, label: 'Shop Profile', icon: Store },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'policies' as const, label: 'Policies', icon: FileText },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-display text-white">Shop Settings</h1>
        <p className="text-sm text-gray-500">Customize your storefront appearance and policies</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
              tab === t.id ? 'bg-eden-500/15 text-eden-400 font-medium' : 'text-gray-500'
            }`}>
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-[#0f2318] border border-white/[0.06] flex items-center justify-center overflow-hidden">
              {profile?.shop_logo_url ? (
                <img src={profile.shop_logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <div>
              <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
                {logoUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                {logoUploading ? 'Uploading...' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
              </label>
              <p className="text-xs text-gray-600 mt-1">Recommended: 200x200px</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Shop Name</label>
            <input type="text" value={form.shop_name} onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))}
              placeholder="e.g. Sarah's Permaculture Farm" className="input-field" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Tagline</label>
            <input type="text" value={form.shop_tagline} onChange={e => setForm(p => ({ ...p, shop_tagline: e.target.value }))}
              placeholder="e.g. Organic produce from Ojai, California" className="input-field" maxLength={100} />
            <p className="text-xs text-gray-600 mt-1">{form.shop_tagline.length}/100</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea value={form.shop_description} onChange={e => setForm(p => ({ ...p, shop_description: e.target.value }))}
              placeholder="Tell visitors about your farm, mission, and what you offer..." rows={5} className="input-field resize-none" />
          </div>
        </motion.div>
      )}

      {/* Appearance */}
      {tab === 'appearance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-3">Accent Color</label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, shop_accent_color: c }))}
                  className={`w-10 h-10 rounded-xl transition-all ${form.shop_accent_color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a1a10] scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">Listing Layout</label>
            <div className="grid grid-cols-3 gap-3">
              {LAYOUTS.map(l => (
                <button key={l.value} onClick={() => setForm(p => ({ ...p, shop_layout: l.value }))}
                  className={`p-4 rounded-xl text-center transition-all ${
                    form.shop_layout === l.value
                      ? 'bg-eden-500/10 border border-eden-500/30 text-eden-400'
                      : 'bg-white/[0.03] border border-white/[0.06] text-gray-400'
                  }`}>
                  <p className="text-sm font-medium mb-0.5">{l.label}</p>
                  <p className="text-[10px] text-gray-500">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">Preview</label>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#0f2318]">
                  {profile?.shop_logo_url ? <img src={profile.shop_logo_url} alt="" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-gray-600 m-auto mt-2.5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{form.shop_name || 'Your Shop'}</p>
                  <p className="text-xs text-gray-500">{form.shop_tagline || 'Your tagline'}</p>
                </div>
              </div>
              <div className="h-1 rounded-full" style={{ backgroundColor: form.shop_accent_color }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Policies */}
      {tab === 'policies' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Shop Policies</label>
            <p className="text-xs text-gray-600 mb-3">Cancellation terms, work exchange expectations, house rules, liability — anything visitors should know.</p>
            <textarea value={form.shop_policies} onChange={e => setForm(p => ({ ...p, shop_policies: e.target.value }))}
              placeholder="e.g. Cancellations must be made 48 hours in advance. Work exchange is 20 hours per week, Monday-Friday..." rows={8} className="input-field resize-none" />
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
