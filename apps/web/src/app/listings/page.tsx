"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, MapPin, Leaf, Wrench, 
  ChevronRight, Filter, Heart, Share2,
  Calendar, User
} from 'lucide-react';

// Sample data
const SAMPLE_LISTINGS = [
  {
    id: '1',
    title: '5-Acre Permaculture Farm',
    type: 'LAND' as const,
    description: 'Beautiful established permaculture farm with food forest, pond, and multiple growing zones. Seeking collaborators for seasonal work-exchange.',
    location: 'Ojai, California',
    community: 'LA Regenerators',
    creator: 'Sarah M.',
    createdAt: '2 days ago',
    images: ['/placeholder-land.jpg'],
    tags: ['permaculture', 'food forest', 'work-exchange'],
  },
  {
    id: '2',
    title: 'Tool Library Access',
    type: 'RESOURCE' as const,
    description: 'Shared access to our community tool library including tillers, chainsaws, and gardening equipment.',
    location: 'Brooklyn, NY',
    community: 'NYC Urban Gardens',
    creator: 'Marcus T.',
    createdAt: '1 week ago',
    images: ['/placeholder-resource.jpg'],
    tags: ['tools', 'sharing', 'community'],
  },
  {
    id: '3',
    title: 'Permaculture Design Consultation',
    type: 'SERVICE' as const,
    description: 'Professional permaculture design services for your land. 15 years experience in regenerative agriculture.',
    location: 'Remote / Anywhere',
    community: 'UK Eco Villages',
    creator: 'James W.',
    createdAt: '3 days ago',
    images: ['/placeholder-service.jpg'],
    tags: ['design', 'consultation', 'permaculture'],
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'LAND': return MapPin;
    case 'RESOURCE': return Leaf;
    case 'SERVICE': return Wrench;
    default: return MapPin;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'LAND': return 'green';
    case 'RESOURCE': return 'blue';
    case 'SERVICE': return 'purple';
    default: return 'green';
  }
};

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Listings
              </h1>
              <p className="text-gray-400">
                Find land, resources, and services from our community
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/20">
              <Plus className="w-5 h-5" />
              <span>Create Listing</span>
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
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {/* Type Filters */}
            <div className="flex gap-2">
              {[
                { type: 'LAND', icon: MapPin, label: 'Land' },
                { type: 'RESOURCE', icon: Leaf, label: 'Resources' },
                { type: 'SERVICE', icon: Wrench, label: 'Services' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    selectedType === type
                      ? `bg-${getTypeColor(type)}-500/20 text-${getTypeColor(type)}-400 border border-${getTypeColor(type)}-500/30`
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* More Filters */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {SAMPLE_LISTINGS.map((listing, index) => {
            const TypeIcon = getTypeIcon(listing.type);
            const color = getTypeColor(listing.type);
            
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-green-500/30 transition-all cursor-pointer group overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-48 h-48 md:h-auto bg-gray-700 flex-shrink-0 relative">
                    <div className={`absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${color}-500/20 text-${color}-400 text-xs font-medium`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      <span>{listing.type}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors mb-2">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{listing.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{listing.createdAt}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {listing.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {listing.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>{listing.creator}</span>
                            <span>·</span>
                            <span>{listing.community}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                              <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-white transition-colors">
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
