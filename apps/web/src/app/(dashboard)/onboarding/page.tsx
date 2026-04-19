"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sprout, Users, Wrench, MapPin, ArrowRight, ArrowLeft, Camera, Globe, Sparkles, TreePine, Store, Package } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const SEEKER_INTERESTS = [
  'Organic Produce', 'Permaculture', 'Urban Farming', 'Community Gardens',
  'Eco-Villages', 'Tool Sharing', 'Seed Exchange', 'Work Exchange',
  'Homesteading', 'Conservation', 'Food Forests', 'Composting',
  'Beekeeping', 'Agroforestry', 'Off-Grid Living', 'Local Food',
];

const PRODUCER_CATEGORIES = [
  { id: 'land', icon: TreePine, label: 'Land / Farm / Garden' },
  { id: 'produce', icon: Sprout, label: 'Fresh Produce / Goods' },
  { id: 'tools', icon: Wrench, label: 'Tools / Equipment' },
  { id: 'seeds', icon: Sprout, label: 'Seeds / Plants' },
  { id: 'services', icon: Wrench, label: 'Services / Skills' },
  { id: 'stays', icon: MapPin, label: 'Accommodation / Stays' },
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<'seeker' | 'producer' | ''>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [location, setLocation] = useState({ city: '', region: '', country: '' });
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopTagline, setShopTagline] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleInterest = (i: string) => setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
  const toggleCategory = (c: string) => setCategories(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const totalSteps = userType === 'producer' ? 5 : 4;

  const complete = async () => {
    if (!user) return;
    setSaving(true);

    const updates: any = {
      user_type: userType,
      interests,
      bio,
      city: location.city,
      region: location.region,
      country: location.country,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      onboarding_completed: true,
    };

    if (userType === 'producer') {
      updates.shop_name = shopName;
      updates.shop_tagline = shopTagline;
    }

    await supabase.from('profiles').update(updates).eq('id', user.id);
    await refreshProfile();
    setSaving(false);

    if (userType === 'producer') {
      router.push('/shop');
    } else {
      router.push('/feed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        {step > 0 && (
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-eden-500' : i === step ? 'bg-eden-500/50' : 'bg-white/[0.06]'}`} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

            {/* Step 0: Role Selection */}
            {step === 0 && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-eden-500/10 flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-8 h-8 text-eden-400" />
                </div>
                <h1 className="text-2xl font-display text-white mb-2">Welcome to EdenShare</h1>
                <p className="text-gray-400 text-sm mb-8">What brings you here?</p>

                <div className="space-y-3">
                  <button onClick={() => { setUserType('seeker'); setStep(1); }}
                    className="w-full flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.06] text-left transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                      <Search className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">I&apos;m exploring</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">Looking for land, produce, resources, or communities near me</p>
                    </div>
                  </button>

                  <button onClick={() => { setUserType('producer'); setStep(1); }}
                    className="w-full flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.06] text-left transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-eden-500/10 flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-6 h-6 text-eden-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">I have something to share</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">Land, produce, tools, services, or accommodation to offer</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-display text-white mb-2 text-center">Where are you based?</h1>
                <p className="text-gray-400 text-sm mb-8 text-center">We&apos;ll show you what&apos;s nearby</p>
                <div className="space-y-3 max-w-sm mx-auto">
                  <input type="text" value={location.city} onChange={e => setLocation(p => ({ ...p, city: e.target.value }))}
                    placeholder="City" className="input-field" />
                  <input type="text" value={location.region} onChange={e => setLocation(p => ({ ...p, region: e.target.value }))}
                    placeholder="State / Region" className="input-field" />
                  <input type="text" value={location.country} onChange={e => setLocation(p => ({ ...p, country: e.target.value }))}
                    placeholder="Country" className="input-field" />
                  <p className="text-[11px] text-gray-600 text-center">Your exact location is never shared publicly</p>
                </div>
              </div>
            )}

            {/* Step 2: Interests (Seeker) / Categories (Producer) */}
            {step === 2 && userType === 'seeker' && (
              <div>
                <h1 className="text-2xl font-display text-white mb-2 text-center">What interests you?</h1>
                <p className="text-gray-400 text-sm mb-6 text-center">Select at least 3 to personalize your feed</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SEEKER_INTERESTS.map(i => (
                    <button key={i} onClick={() => toggleInterest(i)}
                      className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                        interests.includes(i)
                          ? 'bg-eden-500/20 text-eden-400 border border-eden-500/30 font-medium'
                          : 'bg-white/[0.03] text-gray-400 border border-white/[0.06] active:bg-white/[0.06]'
                      }`}>
                      {i}
                    </button>
                  ))}
                </div>
                {interests.length > 0 && interests.length < 3 && (
                  <p className="text-xs text-amber-400/60 text-center mt-3">Select {3 - interests.length} more</p>
                )}
              </div>
            )}

            {step === 2 && userType === 'producer' && (
              <div>
                <h1 className="text-2xl font-display text-white mb-2 text-center">What will you offer?</h1>
                <p className="text-gray-400 text-sm mb-6 text-center">Select all that apply</p>
                <div className="grid grid-cols-2 gap-3">
                  {PRODUCER_CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => toggleCategory(c.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all text-left ${
                        categories.includes(c.id)
                          ? 'bg-eden-500/10 border border-eden-500/30'
                          : 'bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.06]'
                      }`}>
                      <c.icon className={`w-5 h-5 ${categories.includes(c.id) ? 'text-eden-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${categories.includes(c.id) ? 'text-eden-400 font-medium' : 'text-gray-300'}`}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Profile (Seeker) / Shop Setup (Producer) */}
            {step === 3 && userType === 'seeker' && (
              <div>
                <h1 className="text-2xl font-display text-white mb-2 text-center">Almost done!</h1>
                <p className="text-gray-400 text-sm mb-6 text-center">Tell the community about yourself</p>
                <div className="space-y-4 max-w-sm mx-auto">
                  <textarea value={bio} onChange={e => setBio(e.target.value)}
                    placeholder="Short bio — what you're looking for, what excites you about regenerative communities..."
                    rows={4} className="input-field resize-none" />
                </div>
              </div>
            )}

            {step === 3 && userType === 'producer' && (
              <div>
                <h1 className="text-2xl font-display text-white mb-2 text-center">Set up your shop</h1>
                <p className="text-gray-400 text-sm mb-6 text-center">This is how people will find you</p>
                <div className="space-y-4 max-w-sm mx-auto">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Shop Name</label>
                    <input type="text" value={shopName} onChange={e => setShopName(e.target.value)}
                      placeholder="e.g. Sarah's Permaculture Farm" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tagline</label>
                    <input type="text" value={shopTagline} onChange={e => setShopTagline(e.target.value)}
                      placeholder="e.g. Organic produce from Ojai, CA" className="input-field" maxLength={100} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)}
                      placeholder="Tell visitors about you and what you offer..."
                      rows={3} className="input-field resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Skills (comma separated)</label>
                    <input type="text" value={skills} onChange={e => setSkills(e.target.value)}
                      placeholder="Permaculture design, Organic farming, Beekeeping" className="input-field" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Producer — first action prompt */}
            {step === 4 && userType === 'producer' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-eden-500/10 flex items-center justify-center mx-auto mb-5">
                  <Store className="w-8 h-8 text-eden-400" />
                </div>
                <h1 className="text-2xl font-display text-white mb-2">Your shop is ready!</h1>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                  Create your first listing so people can discover what you offer.
                </p>
                <div className="space-y-3 max-w-xs mx-auto">
                  <button onClick={() => { complete().then(() => router.push('/listings/new')); }}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
                    <Package className="w-5 h-5" /> Create First Listing
                  </button>
                  <button onClick={complete} disabled={saving}
                    className="w-full py-3 text-sm text-gray-500 active:text-gray-300">
                    {saving ? 'Setting up...' : 'Skip — I\'ll do this later'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step > 0 && !(step === 4 && userType === 'producer') && (
          <div className="flex items-center justify-between mt-8">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} className="flex items-center gap-2 text-sm text-gray-500 active:text-white">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Seeker: step 3 is last */}
            {userType === 'seeker' && step === 3 ? (
              <button onClick={complete} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Start Exploring</>}
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={
                  (step === 1 && !location.city) ||
                  (step === 2 && userType === 'seeker' && interests.length < 3) ||
                  (step === 2 && userType === 'producer' && categories.length === 0) ||
                  (step === 3 && userType === 'producer' && !shopName)
                }
                className="btn-primary flex items-center gap-2 disabled:opacity-30">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
