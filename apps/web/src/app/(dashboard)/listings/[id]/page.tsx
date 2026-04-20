"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, Share2, MapPin, Star, Shield, Eye, Calendar, Send,
  Droplets, Zap, Car, TreePine, Sun, Leaf, Wrench, MessageSquare,
  Flag, CheckCircle, ChevronLeft, ChevronRight, X, User, Clock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const TYPE_ICONS: Record<string, any> = { land: MapPin, resource: Leaf, service: Wrench };

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageIdx, setImageIdx] = useState(0);
  const [showRequest, setShowRequest] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportMsg, setReportMsg] = useState('');

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    const { data: l } = await supabase.from('listings').select('*').eq('id', id).single();
    if (!l) { setLoading(false); return; }
    setListing(l);
    await supabase.from('listings').update({ view_count: (l.view_count || 0) + 1 }).eq('id', id);

    const { data: p } = await supabase.from('profiles').select('*').eq('id', l.creator_id).single();
    setCreator(p);

    const { data: r } = await supabase.from('reviews').select('*, profiles!reviews_author_id_fkey(display_name, avatar_url)').eq('listing_id', id).order('created_at', { ascending: false });
    setReviews(r || []);

    // Similar listings (same type, different listing)
    const { data: sim } = await supabase.from('listings').select('id, title, type, images, city, price_amount, exchange_type')
      .eq('type', l.type).eq('status', 'active').neq('id', id as string).limit(4);
    setSimilar(sim || []);

    if (user) {
      const { data: s } = await supabase.from('saved_listings').select('id').eq('user_id', user.id).eq('listing_id', id as string).maybeSingle();
      setSaved(!!s);
      const { data: req } = await supabase.from('requests').select('id').eq('listing_id', id as string).eq('requester_id', user.id).maybeSingle();
      if (req) setRequestSent(true);
    }
    setLoading(false);
  };

  const toggleSave = async () => {
    if (!user || !listing) return;
    if (saved) { await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listing.id); }
    else { await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listing.id }); }
    setSaved(!saved);
  };

  const sendRequest = async () => {
    if (!user || !listing) return;
    setSending(true);
    const { data: req } = await supabase.from('requests').insert({ listing_id: listing.id, requester_id: user.id, message: requestMsg, status: 'pending' }).select().single();
    const { data: convo } = await supabase.from('conversations').insert({ request_id: req?.id, title: listing.title, last_message_at: new Date().toISOString() }).select().single();
    if (convo) {
      await supabase.from('conversation_participants').insert([{ conversation_id: convo.id, user_id: user.id }, { conversation_id: convo.id, user_id: listing.creator_id }]);
      if (requestMsg) await supabase.from('messages').insert({ conversation_id: convo.id, sender_id: user.id, content: requestMsg });
      await supabase.from('messages').insert({ conversation_id: convo.id, sender_id: user.id, content: `Request sent for "${listing.title}"`, type: 'system' });
      await supabase.from('notifications').insert({ user_id: listing.creator_id, type: 'request_received', title: 'New request', body: `Someone is interested in "${listing.title}"`, action_url: '/shop/requests' });
    }
    setRequestSent(true);
    setShowRequest(false);
    setSending(false);
  };

  const messageHost = async () => {
    if (!user || !listing) return;
    const { data: parts } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
    if (parts) {
      for (const p of parts) {
        const { data } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', p.conversation_id).eq('user_id', listing.creator_id).maybeSingle();
        if (data) { router.push('/messages'); return; }
      }
    }
    const { data: convo } = await supabase.from('conversations').insert({ title: listing.title, last_message_at: new Date().toISOString() }).select().single();
    if (convo) {
      await supabase.from('conversation_participants').insert([{ conversation_id: convo.id, user_id: user.id }, { conversation_id: convo.id, user_id: listing.creator_id }]);
    }
    router.push('/messages');
  };

  const submitReview = async () => {
    if (!user || !listing) return;
    await supabase.from('reviews').insert({ listing_id: listing.id, author_id: user.id, subject_id: listing.creator_id, rating: reviewRating, comment: reviewComment });
    setShowReview(false);
    setReviewComment('');
    fetchData();
  };

  const submitReport = async () => {
    if (!user || !listing || !reportMsg) return;
    await supabase.from('reports').insert({ reporter_id: user.id, reported_listing_id: listing.id, type: 'listing', reason: 'inappropriate', message: reportMsg });
    setShowReport(false);
    setReportMsg('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Listing not found</p></div>;

  const images = listing.images || [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length).toFixed(1) : null;
  const isOwner = user?.id === listing.creator_id;
  const TypeIcon = TYPE_ICONS[listing.type] || MapPin;

  return (
    <div className="max-w-3xl mx-auto pb-24 lg:pb-8">
      {/* Back button */}
      <div className="px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 active:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-1">
          <button onClick={toggleSave} className={`p-2 rounded-lg ${saved ? 'text-red-400' : 'text-gray-400'} active:scale-90 transition-transform`}>
            <Heart className={`w-5 h-5 ${saved ? 'fill-red-400' : ''}`} />
          </button>
          <button className="p-2 rounded-lg text-gray-400 active:scale-90 transition-transform">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="relative mx-4 rounded-2xl overflow-hidden bg-[#0f2318]">
        <div className="aspect-[4/3] relative">
          {images.length > 0 ? (
            <img src={images[imageIdx]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><TypeIcon className="w-16 h-16 text-eden-800/30" /></div>
          )}
          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button onClick={() => setImageIdx(i => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center active:scale-90 disabled:opacity-30" disabled={imageIdx === 0}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setImageIdx(i => Math.min(images.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center active:scale-90 disabled:opacity-30" disabled={imageIdx === images.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_: string, i: number) => (
                <button key={i} onClick={() => setImageIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imageIdx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
          {/* Image count */}
          {images.length > 1 && <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">{imageIdx + 1}/{images.length}</div>}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4 space-y-5">
        {/* Type + Title */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              listing.type === 'land' ? 'bg-eden-500/12 text-eden-400' : listing.type === 'resource' ? 'bg-sky-500/12 text-sky-400' : 'bg-purple-500/12 text-purple-400'
            }`}>{listing.type}</span>
            {listing.exchange_type && <span className="text-[10px] text-gray-500 capitalize">{(listing.exchange_type).replace('_', ' ')}</span>}
          </div>
          <h1 className="text-2xl font-display text-white leading-tight">{listing.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {listing.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {listing.city}{listing.region ? `, ${listing.region}` : ''}</span>}
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {listing.view_count}</span>
            {avgRating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-eden-400 fill-eden-400" /> {avgRating}</span>}
          </div>
        </div>

        {/* Host Card */}
        {creator && (
          <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-eden-500/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
              {creator.avatar_url ? <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" /> : (creator.display_name || 'U')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-white">{creator.display_name}</span>
                {creator.onboarding_completed && <Shield className="w-3.5 h-3.5 text-eden-400" />}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                {creator.trust_score > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-eden-400" /> {creator.trust_score.toFixed(1)}</span>}
                <span>Joined {new Date(creator.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            {!isOwner && user && (
              <button onClick={messageHost} className="px-3 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-xs text-gray-300 active:bg-white/[0.1]">
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className="text-base font-semibold text-white mb-2">About</h2>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{listing.long_description || listing.description || 'No description provided.'}</p>
        </div>

        {/* Land Details */}
        {listing.type === 'land' && (listing.acreage || listing.water_access !== null) && (
          <div>
            <h2 className="text-base font-semibold text-white mb-3">Details</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                listing.acreage && { icon: TreePine, label: 'Size', value: `${listing.acreage} acres` },
                listing.soil_type && { icon: Leaf, label: 'Soil', value: listing.soil_type },
                listing.climate && { icon: Sun, label: 'Climate', value: listing.climate },
                listing.water_access !== null && { icon: Droplets, label: 'Water', value: listing.water_access ? 'Yes' : 'No' },
                listing.electricity_access !== null && { icon: Zap, label: 'Electric', value: listing.electricity_access ? 'Yes' : 'No' },
                listing.road_access !== null && { icon: Car, label: 'Road', value: listing.road_access ? 'Yes' : 'No' },
              ].filter(Boolean).map((d: any) => (
                <div key={d.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
                  <d.icon className="w-4 h-4 text-eden-400 mx-auto mb-1.5" />
                  <p className="text-xs text-white font-medium">{d.value}</p>
                  <p className="text-[10px] text-gray-500">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {listing.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((t: string) => <span key={t} className="text-xs px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] text-gray-400 rounded-full">{t}</span>)}
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Reviews
              {reviews.length > 0 && <span className="text-xs text-gray-500 font-normal">({reviews.length})</span>}
            </h2>
            {user && !isOwner && <button onClick={() => setShowReview(!showReview)} className="text-xs text-eden-400">Write Review</button>}
          </div>

          {showReview && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4 space-y-3">
              <div className="flex gap-1">{[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)}><Star className={`w-7 h-7 ${s <= reviewRating ? 'text-eden-400 fill-eden-400' : 'text-gray-600'}`} /></button>
              ))}</div>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience..." rows={3} className="input-field resize-none text-sm" />
              <div className="flex gap-2">
                <button onClick={submitReview} className="btn-primary text-sm py-2">Submit</button>
                <button onClick={() => setShowReview(false)} className="text-sm text-gray-500 px-3">Cancel</button>
              </div>
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="bg-white/[0.02] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-eden-500/20 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden">
                        {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (r.profiles?.display_name || '?')[0]}
                      </div>
                      <span className="text-xs font-medium text-white">{r.profiles?.display_name}</span>
                      <span className="text-[10px] text-gray-600">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 text-eden-400 fill-eden-400" />)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-300 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No reviews yet</p>
          )}
        </div>

        {/* Similar Listings */}
        {similar.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-white mb-3">Similar Listings</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {similar.map(sl => (
                <Link key={sl.id} href={`/listings/${sl.id}`}
                  className="flex-shrink-0 w-40 bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden active:bg-white/[0.06]">
                  <div className="aspect-square bg-[#0f2318]">
                    {sl.images?.[0] ? <img src={sl.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Leaf className="w-6 h-6 text-eden-800/30" /></div>}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-white line-clamp-1">{sl.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {sl.price_amount ? `$${sl.price_amount}` : (sl.exchange_type || 'Flexible').replace('_', ' ')}
                      {sl.city ? ` · ${sl.city}` : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Report */}
        <div className="pt-2">
          <button onClick={() => setShowReport(!showReport)} className="text-xs text-gray-600 flex items-center gap-1 active:text-gray-400">
            <Flag className="w-3 h-3" /> Report listing
          </button>
          {showReport && (
            <div className="mt-2 space-y-2">
              <textarea value={reportMsg} onChange={e => setReportMsg(e.target.value)} placeholder="What's wrong?" rows={2} className="input-field text-sm resize-none" />
              <button onClick={submitReport} disabled={!reportMsg} className="btn-primary text-xs py-2 w-full">Submit Report</button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA — bottom bar */}
      <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 lg:left-[260px] z-40 bg-[#0a1a10]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 safe-bottom">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            {listing.price_amount ? (
              <div><span className="text-lg font-display text-white">${listing.price_amount}</span><span className="text-xs text-gray-500 ml-1">{listing.price_interval || ''}</span></div>
            ) : (
              <span className="text-sm text-white capitalize font-medium">{(listing.exchange_type || 'Flexible').replace('_', ' ')}</span>
            )}
          </div>
          {!isOwner && user && !requestSent ? (
            <button onClick={() => setShowRequest(true)} className="btn-primary flex items-center gap-2 py-3 px-6">
              Request to Join <Send className="w-4 h-4" />
            </button>
          ) : requestSent ? (
            <div className="flex items-center gap-2 px-6 py-3 bg-eden-500/10 text-eden-400 rounded-xl text-sm">
              <CheckCircle className="w-4 h-4" /> Request Sent
            </div>
          ) : isOwner ? (
            <Link href="/shop/listings" className="btn-secondary py-3 px-6">Manage</Link>
          ) : (
            <Link href="/login" className="btn-primary py-3 px-6">Sign in to Request</Link>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60" onClick={() => setShowRequest(false)}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="w-full lg:max-w-md bg-[#0f2318] rounded-t-3xl lg:rounded-2xl border-t lg:border border-white/[0.08] p-6 safe-bottom">
            <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5 lg:hidden" />
            <h2 className="text-lg font-display text-white mb-1">Send a Request</h2>
            <p className="text-sm text-gray-500 mb-5">Introduce yourself to the host</p>
            <textarea value={requestMsg} onChange={e => setRequestMsg(e.target.value)}
              placeholder="Hi! I'm interested in your listing because..."
              rows={4} className="input-field resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={sendRequest} disabled={sending} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send Request</>}
              </button>
              <button onClick={() => setShowRequest(false)} className="btn-secondary px-4">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
