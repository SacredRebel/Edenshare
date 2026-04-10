"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Shield, Edit3, Camera, Users, Calendar, Globe,
  CheckCircle, Award, MessageSquare, Settings, Heart, Eye, Link as LinkIcon
} from 'lucide-react';

export default function ProfilePage() {
  const [tab, setTab] = useState<'listings' | 'reviews' | 'communities'>('listings');

  const profile = {
    name: 'Johny',
    bio: 'Regenerative agriculture enthusiast. Building EdenShare to connect communities and land stewards worldwide. Passionate about permaculture, food forests, and decentralized coordination.',
    location: 'Azusa, California',
    joinedDate: 'March 2025',
    trustScore: 4.8,
    responseRate: 96,
    badges: ['VERIFIED_EMAIL', 'EARLY_ADOPTER', 'COMMUNITY_BUILDER'],
    skills: ['Permaculture Design', 'Web Development', 'Community Building', 'Seed Saving'],
    interests: ['Food Forests', 'Eco-Villages', 'Regenerative Ag', 'Cooperative Living'],
    stats: { listings: 3, reviews: 12, communities: 5, connections: 28 },
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Cover */}
      <div className="h-48 bg-gradient-to-br from-eden-800/30 via-eden-900/40 to-sky-900/20 relative">
        <div className="absolute inset-0 bg-grain opacity-30" />
        <button className="absolute bottom-4 right-4 btn-ghost bg-white/[0.05] backdrop-blur text-sm flex items-center gap-2">
          <Camera className="w-4 h-4" /> Edit Cover
        </button>
      </div>

      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-8">
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-eden-400 to-sky-400 flex items-center justify-center text-4xl font-bold text-white border-4 border-eden-950 shadow-xl">
              J
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-eden-500 text-white flex items-center justify-center hover:bg-eden-400 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 pt-4 md:pt-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-display text-white flex items-center gap-2">
                  {profile.name}
                  <Shield className="w-5 h-5 text-eden-400" />
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {profile.joinedDate}</span>
                </div>
              </div>
              <button className="btn-secondary text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-3 max-w-2xl leading-relaxed">{profile.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.badges.map((b) => (
                <span key={b} className="badge-verified text-[10px]">
                  <CheckCircle className="w-3 h-3" />
                  {b.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Trust Score', value: profile.trustScore.toString(), icon: Star, sub: 'Excellent' },
            { label: 'Listings', value: profile.stats.listings.toString(), icon: MapPin, sub: 'Active' },
            { label: 'Reviews', value: profile.stats.reviews.toString(), icon: MessageSquare, sub: 'Received' },
            { label: 'Communities', value: profile.stats.communities.toString(), icon: Users, sub: 'Joined' },
          ].map((s) => (
            <div key={s.label} className="card-glass p-4 text-center">
              <s.icon className="w-4 h-4 text-eden-400 mx-auto mb-2" />
              <div className="text-2xl font-display text-white">{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 mb-6">
              {(['listings', 'reviews', 'communities'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    tab === t ? 'bg-eden-500/20 text-eden-400' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {tab === 'listings' && (
              <div className="space-y-3">
                {[
                  { title: '5-Acre Permaculture Farm', type: 'LAND', status: 'active', views: 234, location: 'Ojai, CA' },
                  { title: 'Tool Library Access', type: 'RESOURCE', status: 'active', views: 156, location: 'Azusa, CA' },
                  { title: 'Permaculture Design Service', type: 'SERVICE', status: 'draft', views: 0, location: 'Remote' },
                ].map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-glass-hover p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-eden-800/30 to-eden-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-eden-600/50" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.type === 'LAND' ? 'bg-eden-500/15 text-eden-400' : l.type === 'RESOURCE' ? 'bg-sky-500/15 text-sky-400' : 'bg-purple-500/15 text-purple-400'}`}>
                          {l.type}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.status === 'active' ? 'bg-eden-500/10 text-eden-400' : 'bg-gray-500/10 text-gray-400'}`}>
                          {l.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-white">{l.title}</h3>
                      <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.location}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{l.views} views</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="space-y-4">
                {[
                  { author: 'Marcus T.', rating: 5, comment: 'Incredible host. Clear expectations, beautiful land, wonderful experience.', date: '2 months ago' },
                  { author: 'Elena K.', rating: 5, comment: 'Johny is building something amazing with EdenShare. A true community builder.', date: '4 months ago' },
                ].map((r, i) => (
                  <div key={i} className="card-glass p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-eden-400/20 flex items-center justify-center text-xs font-bold text-white">
                          {r.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-white">{r.author}</span>
                      </div>
                      <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-eden-400 fill-eden-400" />)}</div>
                    </div>
                    <p className="text-sm text-gray-400">{r.comment}</p>
                    <p className="text-xs text-gray-600 mt-2">{r.date}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'communities' && (
              <div className="grid grid-cols-2 gap-3">
                {['LA Regenerators', 'SoCal Permaculture', 'Edverse Collective', 'Seed Savers West', 'Off-Grid Network'].map((c, i) => (
                  <div key={i} className="card-glass-hover p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-eden-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-eden-400" /></div>
                    <div>
                      <div className="text-sm font-medium text-white">{c}</div>
                      <div className="text-xs text-gray-500">Member</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card-glass p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s} className="text-xs px-3 py-1.5 bg-eden-500/10 text-eden-400 rounded-lg border border-eden-500/20">{s}</span>
                ))}
              </div>
            </div>
            <div className="card-glass p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-white/[0.04] text-gray-400 rounded-lg border border-white/[0.06]">{i}</span>
                ))}
              </div>
            </div>
            <div className="card-glass p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Verification</h3>
              <div className="space-y-2">
                {[
                  { label: 'Email', done: true },
                  { label: 'Phone', done: false },
                  { label: 'ID Document', done: false },
                  { label: 'Background Check', done: false },
                ].map((v) => (
                  <div key={v.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{v.label}</span>
                    {v.done ? <CheckCircle className="w-4 h-4 text-eden-400" /> : <button className="text-xs text-eden-400 hover:text-eden-300">Verify</button>}
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
