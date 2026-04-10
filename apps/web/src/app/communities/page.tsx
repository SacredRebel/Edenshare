"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Users, MapPin, Globe, 
  ChevronRight, Filter, Grid, List 
} from 'lucide-react';

// Sample data
const SAMPLE_COMMUNITIES = [
  {
    id: '1',
    name: 'LA Regenerators',
    description: 'A network of permaculture enthusiasts and land stewards in Los Angeles',
    memberCount: 156,
    listingCount: 23,
    location: 'Los Angeles, CA',
    isOnline: true,
    tags: ['permaculture', 'urban farming', 'food forest'],
  },
  {
    id: '2',
    name: 'NYC Urban Gardens',
    description: 'Connecting urban gardeners across New York City boroughs',
    memberCount: 342,
    listingCount: 67,
    location: 'New York, NY',
    isOnline: true,
    tags: ['urban gardening', 'community gardens', 'composting'],
  },
  {
    id: '3',
    name: 'UK Eco Villages',
    description: 'A collective of intentional communities and eco-villages across the UK',
    memberCount: 89,
    listingCount: 12,
    location: 'United Kingdom',
    isOnline: false,
    tags: ['eco-village', 'off-grid', 'sustainable living'],
  },
];

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Communities
              </h1>
              <p className="text-gray-400">
                Discover and join communities around the world
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/20">
              <Plus className="w-5 h-5" />
              <span>Create Community</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors">
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Communities Grid/List */}
      <div className="container mx-auto px-4 py-8">
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {SAMPLE_COMMUNITIES.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-green-500/30 transition-all cursor-pointer group overflow-hidden"
            >
              {/* Banner */}
              <div className="h-24 bg-gradient-to-br from-green-600/30 to-emerald-600/30 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 -mt-8 relative">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-xl bg-gray-700 border-4 border-gray-800 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-green-400" />
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors">
                        {community.name}
                      </h3>
                      {community.isOnline && (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{community.location}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {community.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {community.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{community.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span>{community.listingCount} listings</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors flex-shrink-0 mt-2" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
