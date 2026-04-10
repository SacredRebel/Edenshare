"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Leaf, ArrowRight, ArrowLeft, Check,
  Shield, Users, TreePine, Wrench, Heart, Globe, Sparkles
} from 'lucide-react';

const STEPS = [
  { id: 'role', title: 'What brings you here?', subtitle: 'Choose your primary role' },
  { id: 'interests', title: 'What are you interested in?', subtitle: 'Select all that apply' },
  { id: 'location', title: 'Where are you based?', subtitle: 'Help us find communities near you' },
  { id: 'profile', title: 'Tell us about yourself', subtitle: 'A brief introduction for the community' },
  { id: 'ready', title: 'You\'re all set!', subtitle: 'Welcome to the EdenShare network' },
];

const ROLES = [
  { id: 'landowner', icon: TreePine, label: 'Landowner', desc: 'I have land to share or list' },
  { id: 'seeker', icon: MapPin, label: 'Seeker', desc: 'I\'m looking for land or resources' },
  { id: 'community', icon: Users, label: 'Community Leader', desc: 'I represent a community or group' },
  { id: 'service', icon: Wrench, label: 'Service Provider', desc: 'I offer skills or services' },
];

const INTERESTS = [
  'Permaculture', 'Urban Farming', 'Food Forests', 'Seed Saving',
  'Eco-Villages', 'Homesteading', 'Regenerative Ag', 'Community Gardens',
  'Conservation', 'Off-Grid Living', 'Composting', 'Beekeeping',
  'Agroforestry', 'Tool Sharing', 'Work Exchange', 'Cooperative Living',
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const canProceed = step === 0 ? !!role : step === 1 ? interests.length > 0 : step === 2 ? !!location : step === 3 ? !!name : true;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-eden-500/[0.05] via-transparent to-transparent" />

      <div className="relative w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center gap-2">
              <div className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-eden-500' : 'bg-white/[0.06]'}`} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display text-white mb-2">{STEPS[step].title}</h1>
              <p className="text-gray-500">{STEPS[step].subtitle}</p>
            </div>

            {/* Step 0: Role */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`card-glass p-5 text-left transition-all ${
                      role === r.id ? 'border-eden-500/40 bg-eden-500/[0.06]' : 'hover:border-white/10'
                    }`}
                  >
                    <r.icon className={`w-8 h-8 mb-3 ${role === r.id ? 'text-eden-400' : 'text-gray-500'}`} />
                    <div className="font-medium text-white text-sm mb-1">{r.label}</div>
                    <div className="text-xs text-gray-500">{r.desc}</div>
                    {role === r.id && <Check className="absolute top-3 right-3 w-5 h-5 text-eden-400" />}
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Interests */}
            {step === 1 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {INTERESTS.map((i) => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      interests.includes(i)
                        ? 'bg-eden-500/20 text-eden-400 border border-eden-500/30'
                        : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:border-white/10'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State or Country"
                    className="input-field pl-12 text-lg py-4"
                  />
                </div>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4" /> Use My Current Location
                </button>
                <p className="text-xs text-gray-600 text-center">Your exact location is never shared. Only approximate area is shown.</p>
              </div>
            )}

            {/* Step 3: Profile */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-field pl-12" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Short Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community what you're about..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-eden-500/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-eden-400" />
                </div>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Your profile is set up and you&apos;re ready to explore the network.
                  Start by browsing the globe, discovering communities near you, or creating your first listing.
                </p>
                <div className="flex flex-col gap-3">
                  <a href="/explore" className="btn-primary text-base flex items-center justify-center gap-2">
                    Explore the Globe <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="/dashboard" className="btn-secondary text-base flex items-center justify-center gap-2">
                    Go to Dashboard
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className={`btn-ghost flex items-center gap-2 ${step === 0 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(s => Math.min(4, s + 1))}
              disabled={!canProceed}
              className="btn-primary flex items-center gap-2"
            >
              {step === 3 ? 'Complete' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
