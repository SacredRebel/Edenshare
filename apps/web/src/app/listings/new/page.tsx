"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Leaf, Wrench, Upload, X, Image as ImageIcon, Save, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const LISTING_TYPES = [
  { value: 'land', label: 'Land', icon: MapPin, desc: 'Farm, garden, forest, or plot' },
  { value: 'resource', label: 'Resource', icon: Leaf, desc: 'Tools, seeds, materials, equipment' },
  { value: 'service', label: 'Service', icon: Wrench, desc: 'Skills, consulting, labor' },
];

const EXCHANGE_TYPES = [
  { value: 'free', label: 'Free' },
  { value: 'trade', label: 'Trade / Barter' },
  { value: 'work_exchange', label: 'Work Exchange' },
  { value: 'paid', label: 'Paid' },
  { value: 'donation', label: 'Donation Based' },
  { value: 'flexible', label: 'Flexible' },
];

export default function NewListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    long_description: '',
    city: '',
    region: '',
    country: '',
    exchange_type: 'flexible',
    price_amount: '',
    tags: '',
    // Land fields
    acreage: '',
    soil_type: '',
    water_access: false,
    electricity_access: false,
    road_access: false,
    climate: '',
    // Resource fields
    resource_category: '',
    quantity: '',
    condition: '',
    // Service fields
    service_category: '',
    hourly_rate: '',
    is_remote: false,
  });

  const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files].slice(0, 6));
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setImagePreviews(prev => [...prev, reader.result as string].slice(0, 6));
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (status: 'draft' | 'active') => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error: uploadErr } = await supabase.storage.from('listings').upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('listings').getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      // Insert listing
      const { data, error: insertErr } = await supabase.from('listings').insert({
        creator_id: user.id,
        type: form.type,
        title: form.title,
        description: form.description,
        long_description: form.long_description,
        city: form.city,
        region: form.region,
        country: form.country,
        exchange_type: form.exchange_type,
        price_amount: form.price_amount ? parseFloat(form.price_amount) : null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        images: imageUrls,
        status,
        acreage: form.acreage ? parseFloat(form.acreage) : null,
        soil_type: form.soil_type || null,
        water_access: form.water_access,
        electricity_access: form.electricity_access,
        road_access: form.road_access,
        climate: form.climate || null,
        resource_category: form.resource_category || null,
        quantity: form.quantity ? parseInt(form.quantity) : null,
        condition: form.condition || null,
        service_category: form.service_category || null,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
        is_remote: form.is_remote,
      }).select().single();

      if (insertErr) throw insertErr;
      router.push(`/listings/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Sign in to create a listing</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/listings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>

        <h1 className="text-2xl font-display text-white mb-8">Create a Listing</h1>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

        {/* Step 0: Type */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-semibold text-white mb-4">What are you listing?</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {LISTING_TYPES.map(t => (
                <button key={t.value} onClick={() => { updateForm('type', t.value); setStep(1); }}
                  className={`card-glass p-6 text-center hover:border-eden-500/30 transition-all ${form.type === t.value ? 'border-eden-500/40 bg-eden-500/[0.06]' : ''}`}>
                  <t.icon className="w-8 h-8 mx-auto mb-3 text-eden-400" />
                  <div className="font-medium text-white mb-1">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Details</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title *</label>
              <input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="Give your listing a clear title" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Short Description *</label>
              <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Brief summary..." rows={3} className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Description</label>
              <textarea value={form.long_description} onChange={e => updateForm('long_description', e.target.value)} placeholder="Detailed info, expectations, what's included..." rows={6} className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm text-gray-400 mb-2">City</label><input type="text" value={form.city} onChange={e => updateForm('city', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm text-gray-400 mb-2">State / Region</label><input type="text" value={form.region} onChange={e => updateForm('region', e.target.value)} className="input-field" /></div>
              <div><label className="block text-sm text-gray-400 mb-2">Country</label><input type="text" value={form.country} onChange={e => updateForm('country', e.target.value)} className="input-field" /></div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={e => updateForm('tags', e.target.value)} placeholder="permaculture, organic, work-exchange" className="input-field" />
            </div>

            {/* Type-specific fields */}
            {form.type === 'land' && (
              <div className="card-glass p-5 space-y-4">
                <h3 className="text-sm font-medium text-eden-400">Land Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-400 mb-2">Acreage</label><input type="number" step="0.1" value={form.acreage} onChange={e => updateForm('acreage', e.target.value)} className="input-field" /></div>
                  <div><label className="block text-sm text-gray-400 mb-2">Soil Type</label><input type="text" value={form.soil_type} onChange={e => updateForm('soil_type', e.target.value)} className="input-field" /></div>
                  <div><label className="block text-sm text-gray-400 mb-2">Climate</label><input type="text" value={form.climate} onChange={e => updateForm('climate', e.target.value)} className="input-field" /></div>
                </div>
                <div className="flex gap-6">
                  {[
                    { key: 'water_access', label: 'Water Access' },
                    { key: 'electricity_access', label: 'Electricity' },
                    { key: 'road_access', label: 'Road Access' },
                  ].map(c => (
                    <label key={c.key} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={(form as any)[c.key]} onChange={e => updateForm(c.key, e.target.checked)} className="rounded border-gray-600 bg-gray-700 text-eden-500" />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {form.type === 'service' && (
              <div className="card-glass p-5 space-y-4">
                <h3 className="text-sm font-medium text-eden-400">Service Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-400 mb-2">Category</label><input type="text" value={form.service_category} onChange={e => updateForm('service_category', e.target.value)} className="input-field" /></div>
                  <div><label className="block text-sm text-gray-400 mb-2">Hourly Rate ($)</label><input type="number" value={form.hourly_rate} onChange={e => updateForm('hourly_rate', e.target.value)} className="input-field" /></div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={form.is_remote} onChange={e => updateForm('is_remote', e.target.checked)} className="rounded border-gray-600 bg-gray-700 text-eden-500" />
                  Available remotely
                </label>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(0)} className="btn-ghost flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setStep(2)} disabled={!form.title} className="btn-primary flex items-center gap-2">Images & Exchange <ArrowRight className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Images & Exchange */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Images & Exchange</h2>

            {/* Image upload */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Photos (up to 6)</label>
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.04]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-white/[0.08] hover:border-eden-500/30 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-gray-500 mb-2" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Exchange type */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Exchange Type</label>
              <div className="grid grid-cols-3 gap-2">
                {EXCHANGE_TYPES.map(e => (
                  <button key={e.value} onClick={() => updateForm('exchange_type', e.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                      form.exchange_type === e.value ? 'bg-eden-500/20 text-eden-400 border border-eden-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'
                    }`}>{e.label}</button>
                ))}
              </div>
            </div>

            {form.exchange_type === 'paid' && (
              <div><label className="block text-sm text-gray-400 mb-2">Price ($)</label><input type="number" value={form.price_amount} onChange={e => updateForm('price_amount', e.target.value)} className="input-field w-48" /></div>
            )}

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
              <div className="flex gap-3">
                <button onClick={() => handleSubmit('draft')} disabled={loading} className="btn-secondary flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Draft
                </button>
                <button onClick={() => handleSubmit('active')} disabled={loading} className="btn-primary flex items-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Eye className="w-4 h-4" /> Publish</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
