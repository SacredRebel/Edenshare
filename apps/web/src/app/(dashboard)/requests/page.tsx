"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Clock, MessageSquare, MapPin, ChevronRight, Leaf } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Pending', icon: Clock },
  accepted: { bg: 'bg-eden-500/15', text: 'text-eden-400', label: 'Accepted', icon: CheckCircle },
  rejected: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Declined', icon: XCircle },
  cancelled: { bg: 'bg-gray-500/15', text: 'text-gray-400', label: 'Cancelled', icon: XCircle },
  completed: { bg: 'bg-sky-500/15', text: 'text-sky-400', label: 'Completed', icon: CheckCircle },
};

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('requests')
        .select('*, listings(id, title, type, city, images, creator_id, profiles:creator_id(display_name, avatar_url))')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const cancelRequest = async (id: string) => {
    await supabase.from('requests').update({ status: 'cancelled' }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
  };

  if (loading) return <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-display text-white">My Requests</h1>
        <p className="text-sm text-gray-500">Track requests you&apos;ve sent to hosts</p>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map(req => {
            const style = STATUS_STYLES[req.status] || STATUS_STYLES.pending;
            const StatusIcon = style.icon;
            const listing = req.listings;
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  {/* Listing thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-[#0f2318] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {listing?.images?.[0] ? (
                      <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Leaf className="w-5 h-5 text-eden-800/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${style.bg} ${style.text}`}>
                        <StatusIcon className="w-3 h-3" /> {style.label}
                      </span>
                    </div>
                    <Link href={`/listings/${listing?.id}`} className="text-sm font-medium text-white hover:text-eden-400 transition-colors">
                      {listing?.title || 'Listing'}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      {listing?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.city}</span>}
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    {req.message && (
                      <p className="text-xs text-gray-400 mt-2 italic line-clamp-1">&ldquo;{req.message}&rdquo;</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 ml-[68px]">
                  {req.status === 'accepted' && (
                    <Link href="/messages" className="flex items-center gap-1.5 px-3 py-1.5 bg-eden-500/15 text-eden-400 rounded-lg text-xs font-medium">
                      <MessageSquare className="w-3.5 h-3.5" /> Open Chat
                    </Link>
                  )}
                  {req.status === 'pending' && (
                    <button onClick={() => cancelRequest(req.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] text-gray-400 rounded-lg text-xs font-medium">
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                  <Link href={`/listings/${listing?.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] text-gray-400 rounded-lg text-xs font-medium">
                    View Listing <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No requests yet</h3>
          <p className="text-sm text-gray-500 mb-4">Browse listings and send requests to hosts you&apos;re interested in.</p>
          <Link href="/marketplace" className="btn-primary text-sm">Browse Marketplace</Link>
        </div>
      )}
    </div>
  );
}
