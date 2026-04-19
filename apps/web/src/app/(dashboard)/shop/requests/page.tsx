"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, MessageSquare, Clock, User, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const STATUS_TABS = ['pending', 'accepted', 'rejected', 'all'] as const;
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Pending' },
  accepted: { bg: 'bg-eden-500/15', text: 'text-eden-400', label: 'Accepted' },
  rejected: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Rejected' },
  cancelled: { bg: 'bg-gray-500/15', text: 'text-gray-400', label: 'Cancelled' },
  completed: { bg: 'bg-sky-500/15', text: 'text-sky-400', label: 'Completed' },
};

export default function ShopRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<typeof STATUS_TABS[number]>('pending');

  useEffect(() => { if (user) fetchRequests(); }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    const { data: myListings } = await supabase.from('listings').select('id').eq('creator_id', user.id);
    if (!myListings || myListings.length === 0) { setLoading(false); return; }

    const { data } = await supabase
      .from('requests')
      .select('*, listings(id, title, type, city), profiles!requests_requester_id_fkey(id, display_name, avatar_url, bio, city)')
      .in('listing_id', myListings.map(l => l.id))
      .order('created_at', { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    await supabase.from('requests').update({ status }).eq('id', requestId);

    if (status === 'accepted') {
      const req = requests.find(r => r.id === requestId);
      if (req) {
        // Create conversation if not exists
        const { data: convo } = await supabase.from('conversations').insert({
          request_id: requestId,
          title: req.listings?.title,
          last_message_at: new Date().toISOString(),
        }).select().single();

        if (convo) {
          await supabase.from('conversation_participants').insert([
            { conversation_id: convo.id, user_id: user!.id },
            { conversation_id: convo.id, user_id: req.requester_id },
          ]);
          await supabase.from('messages').insert({
            conversation_id: convo.id,
            sender_id: user!.id,
            content: `Request accepted for "${req.listings?.title}"`,
            type: 'system',
          });
        }

        await supabase.from('notifications').insert({
          user_id: req.requester_id,
          type: 'request_accepted',
          title: 'Request accepted!',
          body: `Your request for "${req.listings?.title}" has been accepted.`,
          action_url: '/messages',
        });
      }
    }

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  };

  const filtered = requests.filter(r => tab === 'all' || r.status === tab);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) return <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-display text-white flex items-center gap-2">
          Requests
          {pendingCount > 0 && <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} pending</span>}
        </h1>
        <p className="text-sm text-gray-500">Manage incoming requests on your listings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-5">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              tab === t ? 'bg-eden-500/15 text-eden-400 font-medium' : 'text-gray-500 hover:text-white'
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((req) => {
            const style = STATUS_STYLES[req.status] || STATUS_STYLES.pending;
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-eden-500/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                    {req.profiles?.avatar_url ? <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (req.profiles?.display_name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white">{req.profiles?.display_name}</span>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Wants to join <span className="text-gray-300">{req.listings?.title}</span>
                    </p>
                    {req.profiles?.city && (
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {req.profiles.city}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Message */}
                {req.message && (
                  <div className="bg-white/[0.02] rounded-xl p-3 mb-3 ml-13">
                    <p className="text-sm text-gray-300 italic leading-relaxed">&ldquo;{req.message}&rdquo;</p>
                  </div>
                )}

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="flex gap-2 ml-13">
                    <button onClick={() => handleRequest(req.id, 'accepted')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-eden-500/15 text-eden-400 rounded-xl text-sm font-medium active:bg-eden-500/25 transition-colors">
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleRequest(req.id, 'rejected')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.05] text-gray-400 rounded-xl text-sm font-medium active:bg-white/[0.1] transition-colors">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                    <Link href="/messages"
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.05] text-gray-400 rounded-xl text-sm font-medium active:bg-white/[0.1] transition-colors">
                      <MessageSquare className="w-4 h-4" /> Message
                    </Link>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No {tab === 'all' ? '' : tab} requests</h3>
          <p className="text-sm text-gray-500">When people request to join your listings, they&apos;ll appear here.</p>
        </div>
      )}
    </div>
  );
}
