"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Users, MessageSquare, Star, Bell, Plus, Settings,
  Eye, Shield, CheckCircle, ChevronRight, LayoutDashboard,
  TrendingUp, Leaf, Clock, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ listings: 0, messages: 0, communities: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!user) return;

    const fetchData = async () => {
      // Fetch user's listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch requests on user's listings
      const { data: requestsData } = await supabase
        .from('requests')
        .select('*, listings!inner(title, creator_id), profiles!requests_requester_id_fkey(display_name, avatar_url)')
        .eq('listings.creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch notifications
      const { data: notifsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Counts
      const { count: listingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('creator_id', user.id);
      const { count: communityCount } = await supabase.from('community_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: unreadMessages } = await supabase
        .from('conversation_participants')
        .select('conversation_id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setListings(listingsData || []);
      setRequests(requestsData || []);
      setNotifications(notifsData || []);
      setStats({
        listings: listingCount || 0,
        messages: unreadMessages || 0,
        communities: communityCount || 0,
      });
      setLoading(false);
    };

    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const QUICK_STATS = [
    { label: 'Listings', value: stats.listings.toString(), icon: MapPin, color: 'eden' },
    { label: 'Conversations', value: stats.messages.toString(), icon: MessageSquare, color: 'sky' },
    { label: 'Communities', value: stats.communities.toString(), icon: Users, color: 'purple' },
    { label: 'Trust Score', value: profile?.trust_score?.toFixed(1) || '0.0', icon: Shield, color: 'amber' },
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display text-white mb-1">
              Welcome back, {profile?.display_name || 'there'}
            </h1>
            <p className="text-gray-500">Here&apos;s what&apos;s happening with your network</p>
          </div>
          <div className="flex gap-3">
            <Link href="/listings/new" className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Listing
            </Link>
            <Link href="/settings" className="btn-secondary text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </div>
        </div>

        {/* Onboarding prompt */}
        {!profile?.onboarding_completed && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-eden-500/10 to-sky-500/10 border border-eden-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Complete your profile</h3>
                <p className="text-gray-400 text-sm">Add your bio, skills, and interests to get discovered by communities.</p>
              </div>
              <Link href="/onboarding" className="btn-primary text-sm flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {QUICK_STATS.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-glass p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                stat.color === 'eden' ? 'bg-eden-500/10 text-eden-400' :
                stat.color === 'sky' ? 'bg-sky-500/10 text-sky-400' :
                stat.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-display text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity / Notifications */}
          <div className="lg:col-span-2">
            <div className="card-glass">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2"><Bell className="w-4 h-4 text-eden-400" /> Recent Activity</h2>
              </div>
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {notifications.map((n) => (
                    <div key={n.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${!n.is_read ? 'bg-eden-500/[0.03]' : ''}`}>
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.body}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No activity yet. Create a listing or join a community to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* My Listings */}
          <div>
            <div className="card-glass">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-eden-400" /> My Listings</h2>
                <Link href="/listings" className="text-sm text-gray-500 hover:text-eden-400">All</Link>
              </div>
              {listings.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {listings.map((l) => (
                    <Link key={l.id} href={`/listings/${l.id}`} className="block px-6 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white truncate">{l.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          l.status === 'active' ? 'bg-eden-500/15 text-eden-400' : 'bg-gray-500/15 text-gray-400'
                        }`}>{l.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {l.view_count}</span>
                        <span className="capitalize">{l.type}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                  <p className="text-sm text-gray-500 mb-3">No listings yet</p>
                  <Link href="/listings/new" className="btn-primary text-sm">Create Your First Listing</Link>
                </div>
              )}
            </div>

            {/* Verification Status */}
            <div className="card-glass mt-4 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-eden-400" /> Verification
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Email', done: !!user.email_confirmed_at },
                  { label: 'Profile Complete', done: !!profile?.bio },
                  { label: 'Skills Added', done: (profile?.skills?.length || 0) > 0 },
                  { label: 'First Listing', done: listings.length > 0 },
                ].map((v) => (
                  <div key={v.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{v.label}</span>
                    {v.done ? (
                      <CheckCircle className="w-4 h-4 text-eden-400" />
                    ) : (
                      <span className="text-xs text-gray-600">Incomplete</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
