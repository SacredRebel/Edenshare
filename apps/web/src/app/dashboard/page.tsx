"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin, Users, MessageSquare, Star, Bell, Plus, ArrowRight,
  TrendingUp, Eye, Heart, Shield, CheckCircle, Clock, Leaf,
  LayoutDashboard, Settings, ChevronRight
} from 'lucide-react';

const QUICK_STATS = [
  { label: 'Active Listings', value: '3', change: '+1 this week', icon: MapPin, color: 'eden' },
  { label: 'Messages', value: '12', change: '4 unread', icon: MessageSquare, color: 'sky' },
  { label: 'Connections', value: '28', change: '+5 this month', icon: Users, color: 'purple' },
  { label: 'Trust Score', value: '4.8', change: 'Excellent', icon: Shield, color: 'amber' },
];

const RECENT_ACTIVITY = [
  { type: 'request', title: 'New request for "5-Acre Permaculture Farm"', user: 'Marcus T.', time: '2 hours ago', icon: MapPin },
  { type: 'message', title: 'Sarah M. sent you a message', user: 'Sarah M.', time: '4 hours ago', icon: MessageSquare },
  { type: 'review', title: 'Elena K. left a 5-star review', user: 'Elena K.', time: '1 day ago', icon: Star },
  { type: 'match', title: 'Match confirmed for "Tool Library Access"', user: 'System', time: '2 days ago', icon: CheckCircle },
];

const MY_LISTINGS = [
  { id: '1', title: '5-Acre Permaculture Farm', type: 'LAND', status: 'active', views: 234, requests: 8, rating: 4.8 },
  { id: '2', title: 'Tool Library Access', type: 'RESOURCE', status: 'active', views: 156, requests: 12, rating: 4.9 },
  { id: '3', title: 'Permaculture Design Service', type: 'SERVICE', status: 'draft', views: 0, requests: 0, rating: 0 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display text-white mb-1">Welcome back, Johny</h1>
            <p className="text-gray-500">Here&apos;s what&apos;s happening with your network</p>
          </div>
          <div className="flex gap-3">
            <Link href="/listings/new" className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Listing
            </Link>
            <Link href="/profile" className="btn-secondary text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {QUICK_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-glass p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'eden' ? 'bg-eden-500/10 text-eden-400' :
                  stat.color === 'sky' ? 'bg-sky-500/10 text-sky-400' :
                  stat.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-display text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className="text-xs text-eden-400 mt-1">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card-glass">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-eden-400" /> Recent Activity
                </h2>
                <button className="text-sm text-gray-500 hover:text-eden-400 transition-colors">View all</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {RECENT_ACTIVITY.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400">
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* My Listings */}
          <div>
            <div className="card-glass">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-eden-400" /> My Listings
                </h2>
                <Link href="/listings" className="text-sm text-gray-500 hover:text-eden-400 transition-colors">All</Link>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MY_LISTINGS.map((listing) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`} className="block px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white truncate">{listing.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        listing.status === 'active' ? 'bg-eden-500/15 text-eden-400' : 'bg-gray-500/15 text-gray-400'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.views}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {listing.requests}</span>
                      {listing.rating > 0 && (
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-eden-400" /> {listing.rating}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Verification Status */}
            <div className="card-glass mt-4 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-eden-400" /> Verification
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Email', done: true },
                  { label: 'Phone', done: true },
                  { label: 'ID Document', done: false },
                  { label: 'Selfie', done: false },
                ].map((v) => (
                  <div key={v.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{v.label}</span>
                    {v.done ? (
                      <CheckCircle className="w-4 h-4 text-eden-400" />
                    ) : (
                      <button className="text-xs text-eden-400 hover:text-eden-300">Verify</button>
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
