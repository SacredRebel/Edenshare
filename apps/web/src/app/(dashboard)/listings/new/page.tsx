"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, MapPin, Leaf, Wrench, TreePine, Sprout, Home, Package,
  Camera, X, GripVertical, Sparkles, Calendar, DollarSign, Clock, Save,
  Droplets, Zap, Car, Sun, Check, Eye
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const TYPES = [
  { id: 'land', label: 'Land / Farm / Garden', icon: TreePine, desc: 'Fields, plots, farms, food forests, garden beds', color: 'eden' },
  { id: 'resource', label: 'Produce / Goods', icon: Sprout, desc: 'Vegetables, fruits, eggs, dairy, seeds, plants', color: 'sky' },
  { id: 'tools', label: 'Tools / Equipment', icon: Wrench, desc: 'Tractors, hand tools, irrigation, machinery', color: 'amber' },
  { id: 'service', label: 'Services / Skills', icon: Wrench, desc: 'Design, labor, teaching, consulting', color: 'purple' },
  { id: 'accommodation', label: 'Accommodation / Stays', icon: Home, desc: 'Rooms, cabins, camping, housing', color: 'pink' },
  { id: 'other', label: 'Other Resources', icon: Package, desc: 'Anything else to share', color: 'gray' },
];

const SOIL_TYPES = ['Sandy', 'Clay', 'Loam', 'Silt', 'Peat', 'Chalky', 'Mixed'];
const CLIMATES = ['Tropical', 'Subtropical', 'Mediterranean', 'Temperate', 'Continental', 'Arid', 'Semi-arid', 'Alpine'];
const EXCHANGE_TYPES = [
  { id: 'free', label: 'Free', desc: 'No cost, share freely', icon: Sparkles },
  { id: 'work_exchange', label: 'Work Exchange', desc: 'Hours per week in return', icon: Clock },
  { id: 'trade', label: 'Trade / Barter', desc: 'Exchange for something else', icon: Package },
  { id: 'paid', label: 'Paid', desc: 'Set a price', icon: DollarSign },
  { id: 'donation', label: 'Donation Based', desc: 'Suggested donation', icon: Sparkles },
  { id: 'flexible', label: 'Flexible / Open', desc: 'Discuss and agree', icon: Sparkles },
];
const WORK_INCLUDES = ['Accommodation', 'Meals', 'WiFi', 'Tools Provided', 'Training', 'Transportation'];
const PRODUCE_CATS = ['Vegetables', 'Fruits', 'Eggs', 'Dairy', 'Meat', 'Honey', 'Herbs', 'Grains', 'Nuts', 'Mushrooms', 'Flowers', 'Seedlings'];

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    type: '', title: '', description: '', long_description: '',
    tags: '',
    images: [] as string[],
    imageFiles: [] as File[],
    city: '', region: '', country: '', latitude: 0, longitude: 0,
    show_exact_location: false,
    // Land
    acreage: '', soil_type: '', climate: '', water_access: false,
    electricity_access: false, road_access: false, zoning: '', current_use: '',
    // Produce
    produce_category: '', organic_certified: false, organic_cert_name: '',
    quantity_available: '',
    // Service
    remote_possible: false, experience_years: '',
    // Exchange
    exchange_type: 'flexible', price_amount: '', price_interval: 'month',
    work_exchange_hours_per_week: '', work_exchange_includes: [] as string[],
    trade_description: '', donation_amount: '',
    // Availability
    available_from: '', available_to: '', flexible_dates: true,
    min_stay_days: '', booking_lead_days: '',
  });

  const u = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));
  const totalSteps = 8;

  // Photo handling
  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (form.imageFiles.length + files.length > 10) { setError('Maximum 10 photos'); return; }
    const newFiles = [...form.imageFiles, ...files];
    const newPreviews = [...form.images];
    files.forEach(f => { newPreviews.push(URL.createObjectURL(f)); });
    setForm(p => ({ ...p, imageFiles: newFiles, images: newPreviews }));
  };

  const removePhoto = (idx: number) => {
    setForm(p => ({
      ...p,
      images: p.images.filter((_, i) => i !== idx),
      imageFiles: p.imageFiles.filter((_, i) => i !== idx),
    }));
  };

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const imgs = [...form.images]; const files = [...form.imageFiles];
    [imgs[from], imgs[to]] = [imgs[to], imgs[from]];
    [files[from], files[to]] = [files[to], files[from]];
    setForm(p => ({ ...p, images: imgs, imageFiles: files }));
  };

  const publish = async (asDraft = false) => {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of form.imageFiles) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file);
        if (!upErr) {
          const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
          imageUrls.push(data.publicUrl);
        }
      }

      const listingData: any = {
        creator_id: user.id,
        type: form.type === 'tools' ? 'resource' : form.type === 'accommodation' ? 'land' : form.type === 'other' ? 'resource' : form.type,
        title: form.title,
        description: form.description,
        long_description: form.long_description,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        images: imageUrls,
        city: form.city, region: form.region, country: form.country,
        latitude: form.latitude || null, longitude: form.longitude || null,
        show_exact_location: form.show_exact_location,
        exchange_type: form.exchange_type,
        status: asDraft ? 'draft' : 'active',
        view_count: 0,
      };

      // Land fields
      if (form.type === 'land' || form.type === 'accommodation') {
        if (form.acreage) listingData.acreage = parseFloat(form.acreage);
        listingData.soil_type = form.soil_type;
        listingData.climate = form.climate;
        listingData.water_access = form.water_access;
        listingData.electricity_access = form.electricity_access;
        listingData.road_access = form.road_access;
        listingData.zoning = form.zoning;
      }

      // Exchange fields
      if (form.exchange_type === 'paid') {
        listingData.price_amount = parseFloat(form.price_amount) || 0;
        listingData.price_interval = form.price_interval;
      }
      if (form.exchange_type === 'work_exchange') {
        listingData.work_exchange_hours_per_week = parseInt(form.work_exchange_hours_per_week) || 0;
        listingData.work_exchange_includes = form.work_exchange_includes;
      }
      if (form.exchange_type === 'donation') {
        listingData.price_amount = parseFloat(form.donation_amount) || 0;
      }

      // Availability
      if (form.available_from) listingData.available_from = form.available_from;
      if (form.available_to) listingData.available_to = form.available_to;
      if (form.min_stay_days) listingData.min_stay_days = parseInt(form.min_stay_days);
      if (form.booking_lead_days) listingData.booking_lead_days = parseInt(form.booking_lead_days);

      // Produce
      listingData.organic_certified = form.organic_certified;
      if (form.organic_cert_name) listingData.organic_cert_name = form.organic_cert_name;

      const { error: insertErr } = await supabase.from('listings').insert(listingData);
      if (insertErr) throw insertErr;

      router.push(asDraft ? '/shop/listings' : '/marketplace');
    } catch (e: any) {
      setError(e.message || 'Failed to create listing');
      setSaving(false);
    }
  };

  const canContinue = () => {
    if (step === 0) return !!form.type;
    if (step === 1) return !!form.title && !!form.description;
    if (step === 5) return !!form.exchange_type;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()} className="flex items-center gap-2 text-sm text-gray-500 active:text-white">
          <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <span className="text-xs text-gray-600">Step {step + 1} of {totalSteps}</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-eden-500' : i === step ? 'bg-eden-500/50' : 'bg-white/[0.06]'}`} />
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

          {/* Step 0: Type */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-display text-white mb-1 text-center">What are you listing?</h1>
              <p className="text-sm text-gray-500 text-center mb-6">Choose the category that best fits</p>
              <div className="space-y-2">
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => { u('type', t.id); setStep(1); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                      form.type === t.id ? 'bg-eden-500/10 border border-eden-500/30' : 'bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.06]'
                    }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      t.color === 'eden' ? 'bg-eden-500/10 text-eden-400' : t.color === 'sky' ? 'bg-sky-500/10 text-sky-400' :
                      t.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : t.color === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                      t.color === 'pink' ? 'bg-pink-500/10 text-pink-400' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <div><p className="text-sm font-medium text-white">{t.label}</p><p className="text-xs text-gray-500">{t.desc}</p></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Title & Description */}
          {step === 1 && (
            <div className="space-y-5">
              <h1 className="text-2xl font-display text-white text-center mb-4">Describe your listing</h1>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Title *</label>
                <input type="text" value={form.title} onChange={e => u('title', e.target.value)}
                  placeholder="e.g. 5-Acre Permaculture Farm" className="input-field" maxLength={80} />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{form.title.length}/80</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Short Description *</label>
                <textarea value={form.description} onChange={e => u('description', e.target.value)}
                  placeholder="A brief summary shown in search results..." rows={2} className="input-field resize-none" maxLength={200} />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{form.description.length}/200</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Full Description</label>
                <textarea value={form.long_description} onChange={e => u('long_description', e.target.value)}
                  placeholder="Go into detail — what makes this special, what to expect, rules, what's included..." rows={6} className="input-field resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={e => u('tags', e.target.value)}
                  placeholder="permaculture, organic, food forest" className="input-field text-sm" />
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-display text-white text-center mb-1">Add Photos</h1>
              <p className="text-sm text-gray-500 text-center mb-6">Up to 10 photos. First photo is the cover.</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#0f2318] group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <div className="absolute top-1 left-1 bg-eden-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">COVER</div>}
                    <div className="absolute top-1 right-1 flex gap-1">
                      {i > 0 && <button onClick={() => movePhoto(i, i - 1)} className="w-6 h-6 bg-black/60 rounded text-white text-[10px] flex items-center justify-center">←</button>}
                      {i < form.images.length - 1 && <button onClick={() => movePhoto(i, i + 1)} className="w-6 h-6 bg-black/60 rounded text-white text-[10px] flex items-center justify-center">→</button>}
                      <button onClick={() => removePhoto(i)} className="w-6 h-6 bg-red-500/80 rounded text-white flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {form.images.length < 10 && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-white/[0.1] flex flex-col items-center justify-center gap-1.5 text-gray-500 active:border-eden-500/30 active:text-eden-400">
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px]">Add</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
              <div className="bg-white/[0.02] rounded-xl p-3 text-xs text-gray-500">
                <p className="font-medium text-gray-400 mb-1">Tips for great photos:</p>
                <p>• Show the space from multiple angles</p>
                <p>• Include surrounding environment</p>
                <p>• Natural lighting works best</p>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-4">
              <h1 className="text-2xl font-display text-white text-center mb-4">Location</h1>
              <div className="grid grid-cols-1 gap-3">
                <div><label className="text-xs text-gray-500 mb-1.5 block">City *</label><input type="text" value={form.city} onChange={e => u('city', e.target.value)} className="input-field" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Region</label><input type="text" value={form.region} onChange={e => u('region', e.target.value)} className="input-field text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Country</label><input type="text" value={form.country} onChange={e => u('country', e.target.value)} className="input-field text-sm" /></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                <div><p className="text-sm text-white">Show exact location</p><p className="text-xs text-gray-500">Otherwise shows approximate area</p></div>
                <button onClick={() => u('show_exact_location', !form.show_exact_location)}
                  className={`w-11 h-6 rounded-full transition-colors ${form.show_exact_location ? 'bg-eden-500' : 'bg-gray-600'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${form.show_exact_location ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Type-Specific Details */}
          {step === 4 && (
            <div className="space-y-4">
              <h1 className="text-2xl font-display text-white text-center mb-4">Details</h1>

              {/* Land / Accommodation */}
              {(form.type === 'land' || form.type === 'accommodation') && (
                <>
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Size (acres)</label><input type="number" value={form.acreage} onChange={e => u('acreage', e.target.value)} placeholder="e.g. 5" className="input-field text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Soil Type</label>
                    <div className="flex flex-wrap gap-2">{SOIL_TYPES.map(s => (
                      <button key={s} onClick={() => u('soil_type', s)} className={`px-3 py-2 rounded-lg text-xs ${form.soil_type === s ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25' : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'}`}>{s}</button>
                    ))}</div>
                  </div>
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Climate</label>
                    <select value={form.climate} onChange={e => u('climate', e.target.value)} className="input-field text-sm appearance-none">
                      <option value="">Select climate</option>
                      {CLIMATES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'water_access', label: 'Water', icon: Droplets },
                      { key: 'electricity_access', label: 'Electric', icon: Zap },
                      { key: 'road_access', label: 'Road', icon: Car },
                    ].map(f => (
                      <button key={f.key} onClick={() => u(f.key, !(form as any)[f.key])}
                        className={`p-3 rounded-xl text-center transition-all ${(form as any)[f.key] ? 'bg-eden-500/10 border border-eden-500/30' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                        <f.icon className={`w-5 h-5 mx-auto mb-1 ${(form as any)[f.key] ? 'text-eden-400' : 'text-gray-500'}`} />
                        <p className="text-xs text-gray-400">{f.label}</p>
                        <p className={`text-[10px] font-medium ${(form as any)[f.key] ? 'text-eden-400' : 'text-gray-600'}`}>{(form as any)[f.key] ? 'Yes' : 'No'}</p>
                      </button>
                    ))}
                  </div>
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Zoning</label><input type="text" value={form.zoning} onChange={e => u('zoning', e.target.value)} placeholder="Agricultural, Residential, Mixed..." className="input-field text-sm" /></div>
                </>
              )}

              {/* Produce */}
              {form.type === 'resource' && (
                <>
                  <div><label className="text-xs text-gray-500 mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">{PRODUCE_CATS.map(c => (
                      <button key={c} onClick={() => u('produce_category', c)} className={`px-3 py-2 rounded-lg text-xs ${form.produce_category === c ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25' : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'}`}>{c}</button>
                    ))}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <div><p className="text-sm text-white">Organic Certified</p></div>
                    <button onClick={() => u('organic_certified', !form.organic_certified)}
                      className={`w-11 h-6 rounded-full transition-colors ${form.organic_certified ? 'bg-eden-500' : 'bg-gray-600'} relative`}>
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${form.organic_certified ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {form.organic_certified && (
                    <input type="text" value={form.organic_cert_name} onChange={e => u('organic_cert_name', e.target.value)} placeholder="Certification name" className="input-field text-sm" />
                  )}
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Quantity Available</label><input type="text" value={form.quantity_available} onChange={e => u('quantity_available', e.target.value)} placeholder="e.g. 50 lbs/week" className="input-field text-sm" /></div>
                </>
              )}

              {/* Service / Tools */}
              {(form.type === 'service' || form.type === 'tools') && (
                <>
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <div><p className="text-sm text-white">Remote possible</p><p className="text-xs text-gray-500">Can be done remotely</p></div>
                    <button onClick={() => u('remote_possible', !form.remote_possible)}
                      className={`w-11 h-6 rounded-full transition-colors ${form.remote_possible ? 'bg-eden-500' : 'bg-gray-600'} relative`}>
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${form.remote_possible ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Years of Experience</label><input type="number" value={form.experience_years} onChange={e => u('experience_years', e.target.value)} className="input-field text-sm" /></div>
                </>
              )}

              {/* Other / accommodation — minimal extra */}
              {form.type === 'other' && <p className="text-sm text-gray-500 text-center py-8">No extra details needed for this type. Continue to set up exchange and availability.</p>}
            </div>
          )}

          {/* Step 5: Exchange Model */}
          {step === 5 && (
            <div className="space-y-4">
              <h1 className="text-2xl font-display text-white text-center mb-4">Exchange Model</h1>
              <div className="space-y-2">
                {EXCHANGE_TYPES.map(e => (
                  <button key={e.id} onClick={() => u('exchange_type', e.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                      form.exchange_type === e.id ? 'bg-eden-500/10 border border-eden-500/30' : 'bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.06]'
                    }`}>
                    <e.icon className={`w-5 h-5 ${form.exchange_type === e.id ? 'text-eden-400' : 'text-gray-500'}`} />
                    <div><p className="text-sm font-medium text-white">{e.label}</p><p className="text-xs text-gray-500">{e.desc}</p></div>
                  </button>
                ))}
              </div>

              {/* Conditional fields */}
              {form.exchange_type === 'paid' && (
                <div className="mt-4 space-y-3 p-4 bg-white/[0.02] rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-500 mb-1.5 block">Price ($)</label><input type="number" value={form.price_amount} onChange={e => u('price_amount', e.target.value)} placeholder="0" className="input-field text-sm" /></div>
                    <div><label className="text-xs text-gray-500 mb-1.5 block">Per</label>
                      <select value={form.price_interval} onChange={e => u('price_interval', e.target.value)} className="input-field text-sm appearance-none">
                        <option value="hour">Hour</option><option value="day">Day</option><option value="week">Week</option><option value="month">Month</option><option value="season">Season</option><option value="once">One-time</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {form.exchange_type === 'work_exchange' && (
                <div className="mt-4 space-y-3 p-4 bg-white/[0.02] rounded-xl">
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Hours per week</label><input type="number" value={form.work_exchange_hours_per_week} onChange={e => u('work_exchange_hours_per_week', e.target.value)} placeholder="20" className="input-field text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-2 block">What&apos;s included</label>
                    <div className="flex flex-wrap gap-2">{WORK_INCLUDES.map(w => (
                      <button key={w} onClick={() => u('work_exchange_includes', form.work_exchange_includes.includes(w) ? form.work_exchange_includes.filter(x => x !== w) : [...form.work_exchange_includes, w])}
                        className={`px-3 py-2 rounded-lg text-xs ${form.work_exchange_includes.includes(w) ? 'bg-eden-500/15 text-eden-400 border border-eden-500/25' : 'bg-white/[0.03] text-gray-400 border border-white/[0.06]'}`}>{w}</button>
                    ))}</div>
                  </div>
                </div>
              )}
              {form.exchange_type === 'trade' && (
                <div className="mt-4 p-4 bg-white/[0.02] rounded-xl">
                  <label className="text-xs text-gray-500 mb-1.5 block">What do you want in return?</label>
                  <textarea value={form.trade_description} onChange={e => u('trade_description', e.target.value)} placeholder="Describe what you'd accept in trade..." rows={3} className="input-field text-sm resize-none" />
                </div>
              )}
              {form.exchange_type === 'donation' && (
                <div className="mt-4 p-4 bg-white/[0.02] rounded-xl">
                  <label className="text-xs text-gray-500 mb-1.5 block">Suggested donation ($)</label>
                  <input type="number" value={form.donation_amount} onChange={e => u('donation_amount', e.target.value)} placeholder="25" className="input-field text-sm" />
                </div>
              )}
            </div>
          )}

          {/* Step 6: Availability */}
          {step === 6 && (
            <div className="space-y-4">
              <h1 className="text-2xl font-display text-white text-center mb-4">Availability</h1>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1.5 block">Available From</label><input type="date" value={form.available_from} onChange={e => u('available_from', e.target.value)} className="input-field text-sm" /></div>
                <div><label className="text-xs text-gray-500 mb-1.5 block">Available Until</label><input type="date" value={form.available_to} onChange={e => u('available_to', e.target.value)} className="input-field text-sm" /></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                <div><p className="text-sm text-white">Flexible dates</p><p className="text-xs text-gray-500">Open to negotiation</p></div>
                <button onClick={() => u('flexible_dates', !form.flexible_dates)}
                  className={`w-11 h-6 rounded-full transition-colors ${form.flexible_dates ? 'bg-eden-500' : 'bg-gray-600'} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${form.flexible_dates ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {(form.type === 'accommodation' || form.type === 'land') && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Min Stay (days)</label><input type="number" value={form.min_stay_days} onChange={e => u('min_stay_days', e.target.value)} placeholder="7" className="input-field text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1.5 block">Booking Lead (days)</label><input type="number" value={form.booking_lead_days} onChange={e => u('booking_lead_days', e.target.value)} placeholder="3" className="input-field text-sm" /></div>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Preview + Publish */}
          {step === 7 && (
            <div>
              <h1 className="text-2xl font-display text-white text-center mb-6">Review & Publish</h1>

              {/* Preview card */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
                {form.images.length > 0 && (
                  <div className="aspect-[16/9] bg-[#0f2318]"><img src={form.images[0]} alt="" className="w-full h-full object-cover" /></div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-eden-500/12 text-eden-400">{form.type}</span>
                    <span className="text-[10px] text-gray-500 capitalize">{form.exchange_type.replace('_', ' ')}</span>
                  </div>
                  <h2 className="text-lg font-display text-white">{form.title}</h2>
                  <p className="text-sm text-gray-400">{form.description}</p>
                  {form.city && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {form.city}{form.region ? `, ${form.region}` : ''}</p>}
                  {form.exchange_type === 'paid' && form.price_amount && (
                    <p className="text-base font-semibold text-white">${form.price_amount} / {form.price_interval}</p>
                  )}
                  {form.images.length > 1 && <p className="text-[10px] text-gray-600">{form.images.length} photos</p>}
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2 mb-6">
                {[
                  { label: 'Title & description', done: !!form.title },
                  { label: 'Photos', done: form.images.length > 0 },
                  { label: 'Location', done: !!form.city },
                  { label: 'Exchange model', done: !!form.exchange_type },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-2 text-sm">
                    {c.done ? <Check className="w-4 h-4 text-eden-400" /> : <div className="w-4 h-4 rounded-full border border-gray-600" />}
                    <span className={c.done ? 'text-white' : 'text-gray-500'}>{c.label}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={() => publish(false)} disabled={saving || !form.title}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-base">
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Eye className="w-5 h-5" /> Publish</>}
                </button>
                <button onClick={() => publish(true)} disabled={saving}
                  className="btn-secondary py-3 px-4 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Draft
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation (except step 0 which auto-advances and step 7 which has its own buttons) */}
      {step > 0 && step < 7 && (
        <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 lg:left-[260px] z-40 bg-[#0a1a10]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 safe-bottom">
          <div className="max-w-2xl mx-auto flex justify-end">
            <button onClick={() => setStep(s => s + 1)} disabled={!canContinue()}
              className="btn-primary flex items-center gap-2 disabled:opacity-30">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
