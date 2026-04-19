"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, ArrowRight, ArrowLeft, Globe, Sparkles, TreePine, Users, Wrench } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const ROLES = [
  { id: 'landowner', icon: TreePine, label: 'Landowner', desc: 'I have land to share' },
  { id: 'seeker', icon: MapPin, label: 'Seeker', desc: 'Looking for land or resources' },
  { id: 'community', icon: Users, label: 'Community Leader', desc: 'I represent a group' },
  { id: 'service', icon: Wrench, label: 'Service Provider', desc: 'I offer skills or services' },
];

const INTERESTS = [
  'Permaculture', 'Urban Farming', 'Food Forests', 'Seed Saving', 'Eco-Villages', 'Homesteading',
  'Regenerative Ag', 'Community Gardens', 'Conservation', 'Off-Grid Living', 'Composting', 'Beekeeping',
  'Agroforestry', 'Tool Sharing', 'Work Exchange', 'Cooperative Living',
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState({ city: '', region: '', country: '' });
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleInterest = (i: string) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const complete = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      join_reason: role,
      interests,
      bio,
      city: location.city,
      region: location.region,
      country: location.country,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      onboarding_completed: true,
    }).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="relative w-full max-w-xl">
        {/* Progress */}
        <div className="flex gap-2 mb-8">{[0,1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-eden-500' : 'bg-white/[0.06]'}`} />)}</div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

            {step === 0 && (
              <div>
                <h1 className="text-3xl font-display text-white mb-2 text-center">What brings you here?</h1>
                <p className="text-gray-500 text-center mb-8">Choose your primary role</p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <button key={r.id} onClick={() => { setRole(r.id); setStep(1); }}
                      className={`card-glass p-5 text-left transition-all hover:border-eden-500/30 ${role === r.id ? 'border-eden-500/40 bg-eden-500/[0.06]' : ''}`}>
                      <r.icon className={`w-8 h-8 mb-3 ${role === r.id ? 'text-eden-400' : 'text-gray-500'}`} />
                      <div className="font-medium text-white text-sm mb-1">{r.label}</div>
                      <div className="text-xs text-gray-500">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="text-3xl font-display text-white mb-2 text-center">Your interests</h1>
                <p className="text-gray-500 text-center mb-8">Select all that apply</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {INTERESTS.map(i => (
                    <button key={i} onClick={() => toggleInterest(i)}
                      className={`px-4 py-2 rounded-xl text-sm transition-all ${interests.includes(i) ? 'bg-eden-500/20 text-eden-400 border border-eden-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="text-3xl font-display text-white mb-2 text-center">Where are you based?</h1>
                <p className="text-gray-500 text-center mb-8">Help us find communities near you</p>
                <div className="space-y-4 max-w-md mx-auto">
                  <input type="text" value={location.city} onChange={e => setLocation(p => ({ ...p, city: e.target.value }))} placeholder="City" className="input-field" />
                  <input type="text" value={location.region} onChange={e => setLocation(p => ({ ...p, region: e.target.value }))} placeholder="State / Region" className="input-field" />
                  <input type="text" value={location.country} onChange={e => setLocation(p => ({ ...p, country: e.target.value }))} placeholder="Country" className="input-field" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="text-3xl font-display text-white mb-2 text-center">Almost done!</h1>
                <p className="text-gray-500 text-center mb-8">Tell the community about yourself</p>
                <div className="space-y-4 max-w-md mx-auto">
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short bio — what you're about, what you're looking for..." rows={4} className="input-field resize-none" />
                  <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills (comma separated)" className="input-field" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} className={`btn-ghost flex items-center gap-2 ${step === 0 ? 'invisible' : ''}`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary flex items-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={complete} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Complete Setup</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
