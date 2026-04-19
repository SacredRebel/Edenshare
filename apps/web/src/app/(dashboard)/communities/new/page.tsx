"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MapPin, Camera, Globe, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  'general', 'permaculture', 'urban_farming', 'eco_village', 'homestead',
  'food_forest', 'community_garden', 'regenerative_ag', 'seed_saving',
  'cooperative', 'land_trust', 'conservation',
];

export default function NewCommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', long_description: '', category: 'general',
    city: '', region: '', country: '', tags: '',
    is_private: false, join_approval_required: false, rules: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!user || !form.name) return;
    setCreating(true);
    setError('');

    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

      let avatar_url = null;
      if (avatarFile) {
        const path = `${slug}/avatar.${avatarFile.name.split('.').pop()}`;
        await supabase.storage.from('community-assets').upload(path, avatarFile);
        const { data } = supabase.storage.from('community-assets').getPublicUrl(path);
        avatar_url = data.publicUrl;
      }

      const { data, error: err } = await supabase.from('communities').insert({
        name: form.name,
        slug,
        description: form.description,
        long_description: form.long_description,
        category: form.category,
        city: form.city,
        region: form.region,
        country: form.country,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        is_private: form.is_private,
        join_approval_required: form.join_approval_required,
        rules: form.rules,
        avatar_url,
        owner_id: user.id,
        member_count: 1,
      }).select().single();

      if (err) throw err;

      // Add creator as owner member
      await supabase.from('community_members').insert({
        community_id: data.id, user_id: user.id, role: 'owner',
      });

      router.push(`/communities/${data.slug}`);
    } catch (e: any) {
      setError(e.message || 'Failed to create community');
      setCreating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6">
      <Link href="/communities" className="flex items-center gap-2 text-sm text-gray-500 active:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Communities
      </Link>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-eden-500' : 'bg-white/[0.06]'}`} />
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* Step 0: Basics */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display text-white mb-1">Create a Community</h1>
            <p className="text-sm text-gray-500">Build a network around a shared mission</p>
          </div>

          {/* Avatar */}
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-2xl bg-white/[0.04] border-2 border-dashed border-white/[0.1] flex items-center justify-center overflow-hidden hover:border-eden-500/30 transition-colors">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              <p className="text-[10px] text-gray-600 text-center mt-1.5">Add logo</p>
            </label>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Community Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. LA Regenerators" className="input-field" />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Short Description</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="One line about your community" className="input-field" maxLength={150} />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="input-field appearance-none text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </motion.div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <h2 className="text-lg font-display text-white text-center mb-4">Details & Location</h2>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Full Description</label>
            <textarea value={form.long_description} onChange={e => setForm(p => ({ ...p, long_description: e.target.value }))}
              placeholder="Tell people what your community is about, what you do, and what members can expect..."
              rows={4} className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-xs text-gray-500 mb-1.5 block">City</label><input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="input-field text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1.5 block">Region</label><input type="text" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className="input-field text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1.5 block">Country</label><input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="input-field text-sm" /></div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="permaculture, organic, food forest" className="input-field text-sm" />
          </div>
        </motion.div>
      )}

      {/* Step 2: Privacy & Rules */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <h2 className="text-lg font-display text-white text-center mb-4">Privacy & Rules</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-eden-400" />
                <div>
                  <p className="text-sm text-white">Public Community</p>
                  <p className="text-xs text-gray-500">Anyone can see and join</p>
                </div>
              </div>
              <button onClick={() => setForm(p => ({ ...p, is_private: false }))}
                className={`w-5 h-5 rounded-full border-2 ${!form.is_private ? 'bg-eden-500 border-eden-500' : 'border-gray-600'}`} />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm text-white">Private Community</p>
                  <p className="text-xs text-gray-500">Approval required to join</p>
                </div>
              </div>
              <button onClick={() => setForm(p => ({ ...p, is_private: true, join_approval_required: true }))}
                className={`w-5 h-5 rounded-full border-2 ${form.is_private ? 'bg-eden-500 border-eden-500' : 'border-gray-600'}`} />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Community Rules (optional)</label>
            <textarea value={form.rules} onChange={e => setForm(p => ({ ...p, rules: e.target.value }))}
              placeholder="Guidelines for members, expected behavior, posting rules..."
              rows={4} className="input-field resize-none text-sm" />
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button onClick={() => setStep(s => Math.max(0, s - 1))}
          className={`flex items-center gap-2 text-sm text-gray-500 active:text-white ${step === 0 ? 'invisible' : ''}`}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < 2 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !form.name}
            className="btn-primary flex items-center gap-2 disabled:opacity-30">
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleCreate} disabled={creating || !form.name}
            className="btn-primary flex items-center gap-2">
            {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Create Community</>}
          </button>
        )}
      </div>
    </div>
  );
}
