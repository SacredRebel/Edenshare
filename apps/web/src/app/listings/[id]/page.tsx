"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Users, Star, Shield, Heart, Share2, ArrowLeft, Clock,
  CheckCircle, Droplets, Zap, Car, Leaf, Calendar, MessageSquare,
  ChevronRight, Flag, TreePine, Sun, Wrench, Send, X, Eye, User, ExternalLink
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
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [sendingReview, setSendingReview] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportMsg, setReportMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    // Fetch listing
    const { data: l } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (!l) { setLoading(false); return; }
    setListing(l);

    // Increment view count
    await supabase.from('listings').update({ view_count: (l.view_count || 0) + 1 }).eq('id', id);

    // Fetch creator profile
    const { data: p } = await supabase.from('profiles').select('*').eq('id', l.creator_id).single();
    setCreator(p);

    // Fetch reviews
    const { data: r } = await supabase
      .from('reviews')
      .select('*, profiles!reviews_author_id_fkey(display_name, avatar_url)')
      .eq('listing_id', id)
      .order('created_at', { ascending: false });
    setReviews(r || []);

    // Check if saved
    if (user) {
      const { data: s } = await supabase.from('saved_listings').select('id').eq('user_id', user.id).eq('listing_id', id as string).single();
      setSaved(!!s);
    }

    // Check if already requested
    if (user) {
      const { data: req } = await supabase.from('requests').select('id').eq('listing_id', id as string).eq('requester_id', user.id).single();
      if (req) setRequestSent(true);
    }

    setLoading(false);
  };

  const toggleSave = async () => {
    if (!user || !listing) return;
    if (saved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listing.id);
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listing.id });
    }
    setSaved(!saved);
  };

  const sendRequest = async () => {
    if (!user || !listing) return;
    setSendingRequest(true);

    // Create request
    const { data: req } = await supabase.from('requests').insert({
      listing_id: listing.id,
      requester_id: user.id,
      message: requestMsg,
      status: 'pending',
    }).select().single();

    // Create conversation
    const { data: convo } = await supabase.from('conversations').insert({
      request_id: req?.id,
      title: listing.title,
      last_message_at: new Date().toISOString(),
    }).select().single();

    if (convo) {
      // Add both participants
      await supabase.from('conversation_participants').insert([
        { conversation_id: convo.id, user_id: user.id },
        { conversation_id: convo.id, user_id: listing.creator_id },
      ]);

      // Send initial message
      if (requestMsg) {
        await supabase.from('messages').insert({
          conversation_id: convo.id,
          sender_id: user.id,
          content: requestMsg,
          type: 'text',
        });
      }

      // System message
      await supabase.from('messages').insert({
        conversation_id: convo.id,
        sender_id: user.id,
        content: `Request sent for "${listing.title}"`,
        type: 'system',
      });

      // Notification to host
      await supabase.from('notifications').insert({
        user_id: listing.creator_id,
        type: 'request_received',
        title: 'New request received',
        body: `${user.email} sent a request for "${listing.title}"`,
        action_url: `/messages`,
      });
    }

    setRequestSent(true);
    setShowRequest(false);
    setSendingRequest(false);
  };

  const messageHost = async () => {
    if (!user || !listing) return;

    // Check if conversation already exists
    const { data: existingParts } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (existingParts) {
      for (const p of existingParts) {
        const { data: otherPart } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', p.conversation_id)
          .eq('user_id', listing.creator_id)
          .single();
        if (otherPart) {
          router.push('/messages');
          return;
        }
      }
    }

    // Create new conversation
    const { data: convo } = await supabase.from('conversations').insert({
      title: listing.title,
      last_message_at: new Date().toISOString(),
    }).select().single();

    if (convo) {
      await supabase.from('conversation_participants').insert([
        { conversation_id: convo.id, user_id: user.id },
        { conversation_id: convo.id, user_id: listing.creator_id },
      ]);
    }

    router.push('/messages');
  };

  const submitReview = async () => {
    if (!user || !listing) return;
    setSendingReview(true);
    await supabase.from('reviews').insert({
      listing_id: listing.id,
      author_id: user.id,
      subject_id: listing.creator_id,
      rating: reviewRating,
      comment: reviewComment,
    });
    setShowReviewForm(false);
    setReviewComment('');
    fetchListing(); // Refresh reviews
    setSendingReview(false);
  };

  const submitReport = async () => {
    if (!user || !listing || !reportMsg) return;
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_listing_id: listing.id,
      type: 'listing',
      reason: 'inappropriate',
      message: reportMsg,
    });
    setShowReport(false);
    setReportMsg('');
  };

  if (loading) return <div className="min-h-screen pt-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;
  if (!listing) return <div className="min-h-screen pt-16 flex items-center justify-center"><p className="text-gray-500">Listing not found</p></div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;
  const TypeIcon = TYPE_ICONS[listing.type] || MapPin;
  const isOwner = user?.id === listing.creator_id;

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-6">
        <Link href="/listings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6"><ArrowLeft className="w-4 h-4" /> Back to Listings</Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {listing.images && listing.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-80">
                <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                <div className="grid grid-rows-2 gap-2">
                  {listing.images[1] && <img src={listing.images[1]} alt="" className="w-full h-full object-cover" />}
                  {listing.images[2] ? (
                    <div className="relative"><img src={listing.images[2]} alt="" className="w-full h-full object-cover" />
                      {listing.images.length > 3 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">+{listing.images.length - 3}</div>}
                    </div>
                  ) : <div className="bg-eden-900/30" />}
                </div>
              </div>
            ) : (
              <div className="h-48 rounded-2xl bg-gradient-to-br from-eden-800/30 to-eden-900/30 flex items-center justify-center">
                <TypeIcon className="w-16 h-16 text-eden-600/30" />
              </div>
            )}

            {/* Title */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`badge-${listing.type === 'land' ? 'land' : listing.type === 'resource' ? 'resource' : 'service'}`}>
                  <TypeIcon className="w-3 h-3" /> {listing.type}
                </span>
                {listing.exchange_type && (
                  <span className="badge-type bg-amber-500/15 text-amber-400 border border-amber-500/20 capitalize">{listing.exchange_type.replace('_', ' ')}</span>
                )}
              </div>
              <h1 className="text-3xl font-display text-white mb-2">{listing.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {listing.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.city}{listing.region ? `, ${listing.region}` : ''}</span>}
                {listing.acreage && <span className="flex items-center gap-1"><TreePine className="w-4 h-4" /> {listing.acreage} acres</span>}
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {listing.view_count} views</span>
              </div>
            </div>

            {/* Description */}
            <div className="card-glass p-6">
              <h2 className="text-lg font-semibold text-white mb-3">About This Listing</h2>
              <div className="text-gray-400 leading-relaxed whitespace-pre-line text-sm">{listing.long_description || listing.description || 'No description provided.'}</div>
            </div>

            {/* Land details */}
            {listing.type === 'land' && (
              <div className="card-glass p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Land Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    listing.acreage && { icon: TreePine, label: 'Acreage', value: `${listing.acreage} acres` },
                    listing.soil_type && { icon: Leaf, label: 'Soil Type', value: listing.soil_type },
                    listing.climate && { icon: Sun, label: 'Climate', value: listing.climate },
                    { icon: Droplets, label: 'Water', value: listing.water_access ? 'Yes' : 'No' },
                    { icon: Zap, label: 'Electricity', value: listing.electricity_access ? 'Yes' : 'No' },
                    { icon: Car, label: 'Road Access', value: listing.road_access ? 'Yes' : 'No' },
                  ].filter(Boolean).map((d: any) => (
                    <div key={d.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0"><d.icon className="w-4 h-4 text-eden-400" /></div>
                      <div><div className="text-xs text-gray-500">{d.label}</div><div className="text-sm text-white">{d.value}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {listing.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-3 py-1.5 bg-white/[0.04] text-gray-400 rounded-lg border border-white/[0.06]">{tag}</span>
                ))}
              </div>
            )}

            {/* Reviews */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  {avgRating && <><Star className="w-5 h-5 text-eden-400 fill-eden-400" /> {avgRating} ·</>} {reviews.length} Reviews
                </h2>
                {user && !isOwner && (
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-sm text-eden-400 hover:text-eden-300">Write a Review</button>
                )}
              </div>

              {/* Review form */}
              {showReviewForm && (
                <div className="mb-6 p-4 bg-white/[0.02] rounded-xl space-y-3">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewRating(s)}>
                        <Star className={`w-6 h-6 ${s <= reviewRating ? 'text-eden-400 fill-eden-400' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience..." rows={3} className="input-field resize-none" />
                  <div className="flex gap-2">
                    <button onClick={submitReview} disabled={sendingReview} className="btn-primary text-sm">
                      {sendingReview ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Review'}
                    </button>
                    <button onClick={() => setShowReviewForm(false)} className="btn-ghost text-sm">Cancel</button>
                  </div>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-5">
                  {reviews.map((r, i) => (
                    <div key={r.id} className={`${i > 0 ? 'pt-5 border-t border-white/[0.04]' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-eden-400/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                            {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (r.profiles?.display_name || '?')[0]}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">{r.profiles?.display_name}</span>
                            <span className="text-xs text-gray-500 ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-eden-400 fill-eden-400" />)}</div>
                      </div>
                      {r.comment && <p className="text-sm text-gray-400 leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to leave one.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Action card */}
            <div className="card-glass p-6 sticky top-24">
              {listing.price_amount ? (
                <div className="text-center mb-6">
                  <div className="text-3xl font-display text-white">${listing.price_amount}</div>
                  <div className="text-sm text-gray-500">{listing.price_interval || 'one-time'}</div>
                </div>
              ) : (
                <div className="text-center mb-6">
                  <div className="text-xl font-display text-white capitalize">{(listing.exchange_type || 'flexible').replace('_', ' ')}</div>
                </div>
              )}

              {!isOwner && user && !requestSent ? (
                <button onClick={() => setShowRequest(true)} className="btn-primary w-full text-base mb-3 flex items-center justify-center gap-2">
                  Request to Join <Send className="w-4 h-4" />
                </button>
              ) : requestSent ? (
                <div className="w-full text-center py-3 bg-eden-500/10 text-eden-400 rounded-xl mb-3 text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Request Sent
                </div>
              ) : isOwner ? (
                <Link href={`/listings/new`} className="btn-secondary w-full text-center mb-3 block">Edit Listing</Link>
              ) : (
                <Link href="/login" className="btn-primary w-full text-center mb-3 block">Sign in to Request</Link>
              )}

              {!isOwner && user && (
                <button onClick={messageHost} className="btn-secondary w-full mb-3 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Message Host
                </button>
              )}

              <div className="flex gap-2">
                <button onClick={toggleSave} className={`btn-secondary flex-1 flex items-center justify-center gap-2 text-sm ${saved ? 'text-red-400' : ''}`}>
                  <Heart className={`w-4 h-4 ${saved ? 'fill-red-400' : ''}`} /> {saved ? 'Saved' : 'Save'}
                </button>
                <button className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                <button onClick={() => setShowReport(!showReport)} className="flex items-center gap-2 text-xs text-gray-500 hover:text-white">
                  <Flag className="w-3 h-3" /> Report this listing
                </button>
                {showReport && (
                  <div className="mt-3 space-y-2">
                    <textarea value={reportMsg} onChange={e => setReportMsg(e.target.value)} placeholder="What's wrong with this listing?" rows={2} className="input-field text-sm resize-none" />
                    <button onClick={submitReport} disabled={!reportMsg} className="btn-primary text-xs w-full py-2">Submit Report</button>
                  </div>
                )}
              </div>
            </div>

            {/* Host card */}
            {creator && (
              <div className="card-glass p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Your Host</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-eden-400 to-sky-400 flex items-center justify-center text-lg font-bold text-white overflow-hidden">
                    {creator.avatar_url ? <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" /> : (creator.display_name || 'U')[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">{creator.display_name}<Shield className="w-4 h-4 text-eden-400" /></div>
                    <div className="text-xs text-gray-500">Joined {new Date(creator.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center"><div className="text-lg font-display text-white">{(creator.trust_score || 0).toFixed(1)}</div><div className="text-[10px] text-gray-500">Trust</div></div>
                  <div className="text-center"><div className="text-lg font-display text-white">{creator.response_rate || 0}%</div><div className="text-[10px] text-gray-500">Response</div></div>
                </div>
                {creator.bio && <p className="text-xs text-gray-400 leading-relaxed mb-4">{creator.bio}</p>}
                {!isOwner && user && (
                  <button onClick={messageHost} className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowRequest(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="card-glass p-6 w-full max-w-md">
            <h2 className="text-xl font-display text-white mb-2">Send a Request</h2>
            <p className="text-gray-400 text-sm mb-6">Introduce yourself and explain why you&apos;re interested in &quot;{listing.title}&quot;</p>
            <textarea value={requestMsg} onChange={e => setRequestMsg(e.target.value)} placeholder="Hi! I'm interested in your listing because..." rows={4} className="input-field resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={sendRequest} disabled={sendingRequest} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {sendingRequest ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send Request</>}
              </button>
              <button onClick={() => setShowRequest(false)} className="btn-secondary">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
