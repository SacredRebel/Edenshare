"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Users, Star, Shield, Heart, Share2, ArrowLeft, Clock,
  CheckCircle, Droplets, Zap, Car, Leaf, Calendar, MessageSquare,
  ChevronRight, Flag, TreePine, Sun, Wind
} from 'lucide-react';

const LISTING = {
  id: '1',
  title: '5-Acre Permaculture Farm',
  type: 'LAND',
  description: 'Beautiful established permaculture farm with food forest, pond, and multiple growing zones. We are seeking seasonal collaborators for work-exchange programs running April through October.',
  longDescription: `This 5-acre property has been under permaculture management for over 12 years. It features a mature food forest with over 40 species of fruit and nut trees, a natural swimming pond fed by a year-round spring, extensive herb gardens, composting infrastructure, and a small greenhouse.

We welcome collaborators who are interested in learning regenerative agriculture practices. In exchange for 20 hours per week of farm work, we provide private accommodation in a renovated barn studio, access to all farm produce, and mentorship in permaculture design.

The property is located 15 minutes from downtown Ojai, with access to hiking trails, farmers markets, and a vibrant local community. We have reliable water, solar electricity, and high-speed internet.`,
  location: 'Ojai, California',
  latitude: 34.45,
  longitude: -119.24,
  acreage: 5.0,
  soilType: 'Sandy loam',
  waterAccess: true,
  electricityAccess: true,
  roadAccess: true,
  climate: 'Mediterranean',
  exchangeType: 'WORK_EXCHANGE',
  availableFrom: '2026-04-01',
  availableTo: '2026-10-31',
  tags: ['permaculture', 'food forest', 'work-exchange', 'organic', 'regenerative'],
  viewCount: 1247,
  images: [
    { url: '/placeholder1.jpg', caption: 'Main food forest area' },
    { url: '/placeholder2.jpg', caption: 'Natural swimming pond' },
    { url: '/placeholder3.jpg', caption: 'Barn studio accommodation' },
    { url: '/placeholder4.jpg', caption: 'Herb spiral garden' },
  ],
  community: { name: 'LA Regenerators', members: 156, slug: 'la-regenerators' },
  creator: {
    name: 'Sarah M.',
    avatarUrl: null,
    trustScore: 4.8,
    responseRate: 98,
    responseTime: 2,
    verified: true,
    badges: ['VERIFIED_ID', 'SUPER_HOST', 'TRUSTED_HOST'],
    reviewCount: 23,
    joinedYear: 2023,
  },
};

const REVIEWS = [
  { author: 'Marcus T.', rating: 5, comment: 'An incredible experience. Sarah is a wonderful host and the farm is even more beautiful than described. I learned so much about food forests.', date: '2 months ago', verified: true },
  { author: 'Elena K.', rating: 5, comment: 'The accommodation is clean and private, the work expectations are clear, and the food from the garden is amazing. Highly recommend.', date: '4 months ago', verified: true },
  { author: 'James W.', rating: 4, comment: 'Great experience overall. The location is a bit remote if you don\'t have a car, but the farm itself is a paradise.', date: '6 months ago', verified: false },
];

export default function ListingDetailPage() {
  const [saved, setSaved] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Back */}
        <Link href="/listings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-80">
              <div className="bg-gradient-to-br from-eden-800/40 to-eden-900/40 flex items-center justify-center">
                <TreePine className="w-16 h-16 text-eden-600/40" />
              </div>
              <div className="grid grid-rows-2 gap-2">
                <div className="bg-gradient-to-br from-sky-800/30 to-sky-900/30 flex items-center justify-center">
                  <Droplets className="w-10 h-10 text-sky-600/40" />
                </div>
                <div className="bg-gradient-to-br from-soil-800/30 to-soil-900/30 flex items-center justify-center relative">
                  <Sun className="w-10 h-10 text-soil-600/40" />
                  <button className="absolute bottom-2 right-2 text-xs bg-white/10 backdrop-blur px-3 py-1 rounded-lg text-white">
                    +{LISTING.images.length - 3} more
                  </button>
                </div>
              </div>
            </div>

            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="badge-land"><MapPin className="w-3 h-3" /> LAND</span>
                <span className="badge-type bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  <Leaf className="w-3 h-3" /> Work Exchange
                </span>
              </div>
              <h1 className="text-3xl font-display text-white mb-2">{LISTING.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {LISTING.location}</span>
                <span className="flex items-center gap-1"><TreePine className="w-4 h-4" /> {LISTING.acreage} acres</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Apr – Oct 2026</span>
              </div>
            </div>

            {/* Description */}
            <div className="card-glass p-6">
              <h2 className="text-lg font-semibold text-white mb-3">About This Listing</h2>
              <div className="text-gray-400 leading-relaxed whitespace-pre-line text-sm">
                {LISTING.longDescription}
              </div>
            </div>

            {/* Land Details */}
            <div className="card-glass p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Land Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: TreePine, label: 'Acreage', value: `${LISTING.acreage} acres` },
                  { icon: Leaf, label: 'Soil Type', value: LISTING.soilType },
                  { icon: Sun, label: 'Climate', value: LISTING.climate },
                  { icon: Droplets, label: 'Water Access', value: LISTING.waterAccess ? 'Yes — Spring fed' : 'No' },
                  { icon: Zap, label: 'Electricity', value: LISTING.electricityAccess ? 'Yes — Solar' : 'No' },
                  { icon: Car, label: 'Road Access', value: LISTING.roadAccess ? 'Yes — Paved' : 'No' },
                ].map((d) => (
                  <div key={d.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <d.icon className="w-4 h-4 text-eden-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{d.label}</div>
                      <div className="text-sm text-white">{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {LISTING.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1.5 bg-white/[0.04] text-gray-400 rounded-lg border border-white/[0.06]">
                  {tag}
                </span>
              ))}
            </div>

            {/* Reviews */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-eden-400 fill-eden-400" />
                  {LISTING.creator.trustScore} · {LISTING.creator.reviewCount} Reviews
                </h2>
              </div>
              <div className="space-y-5">
                {REVIEWS.map((r, i) => (
                  <div key={i} className={`${i > 0 ? 'pt-5 border-t border-white/[0.04]' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eden-400/20 to-sky-400/20 flex items-center justify-center text-xs font-bold text-white">
                          {r.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white flex items-center gap-1">
                            {r.author}
                            {r.verified && <Shield className="w-3 h-3 text-eden-400" />}
                          </span>
                          <span className="text-xs text-gray-500">{r.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 text-eden-400 fill-eden-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Request Card */}
            <div className="card-glass p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-1">Exchange Type</div>
                <div className="text-xl font-display text-white">Work Exchange</div>
                <div className="text-sm text-gray-500 mt-1">20 hrs/week · Room & board included</div>
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn-primary w-full text-base mb-3 flex items-center justify-center gap-2"
              >
                Request to Join
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSaved(!saved)} className={`btn-secondary flex-1 flex items-center justify-center gap-2 text-sm ${saved ? 'text-red-400' : ''}`}>
                  <Heart className={`w-4 h-4 ${saved ? 'fill-red-400' : ''}`} /> {saved ? 'Saved' : 'Save'}
                </button>
                <button className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-2 text-xs text-gray-500">
                <Flag className="w-3 h-3" />
                <button className="hover:text-white transition-colors">Report this listing</button>
              </div>
            </div>

            {/* Host Card */}
            <div className="card-glass p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Your Host</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-eden-400 to-sky-400 flex items-center justify-center text-lg font-bold text-white">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    {LISTING.creator.name}
                    <Shield className="w-4 h-4 text-eden-400" />
                  </div>
                  <div className="text-xs text-gray-500">Member since {LISTING.creator.joinedYear}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-display text-white">{LISTING.creator.trustScore}</div>
                  <div className="text-[10px] text-gray-500">Trust Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display text-white">{LISTING.creator.responseRate}%</div>
                  <div className="text-[10px] text-gray-500">Response</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-display text-white">{LISTING.creator.responseTime}h</div>
                  <div className="text-[10px] text-gray-500">Avg Reply</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {LISTING.creator.badges.map((b) => (
                  <span key={b} className="badge-verified text-[10px]">
                    <CheckCircle className="w-3 h-3" />
                    {b.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
              <button className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" /> Message Host
              </button>
            </div>

            {/* Community Card */}
            <Link href={`/communities/${LISTING.community.slug}`} className="card-glass-hover p-5 flex items-center gap-3 group block">
              <div className="w-10 h-10 rounded-xl bg-eden-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-eden-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white group-hover:text-eden-400 transition-colors">{LISTING.community.name}</div>
                <div className="text-xs text-gray-500">{LISTING.community.members} members</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-eden-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
