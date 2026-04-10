"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  Globe, Map, List, Search, Filter, X, 
  MapPin, Users, Leaf, ChevronRight 
} from 'lucide-react';

// Dynamic imports for heavy components
const GlobeView = dynamic(() => import('../components/globe/EarthGlobe'), { 
  ssr: false,
  loading: () => <LoadingPlaceholder text="Loading Globe..." />
});

const MapView = dynamic(() => import('../components/map/MapView'), { 
  ssr: false,
  loading: () => <LoadingPlaceholder text="Loading Map..." />
});

function LoadingPlaceholder({ text }: { text: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="animate-pulse text-green-400">{text}</div>
    </div>
  );
}

// Sample data - in production this comes from the API
const SAMPLE_LISTINGS = [
  {
    id: '1',
    title: 'Permaculture Farm',
    type: 'LAND' as const,
    description: 'Beautiful 5-acre permaculture farm seeking collaborators',
    location: { lat: 34.05, lng: -118.24 },
    community: 'LA Regenerators',
    image: '/placeholder-land.jpg',
  },
  {
    id: '2',
    title: 'Urban Garden Network',
    type: 'RESOURCE' as const,
    description: 'Shared tools and seeds for urban gardeners',
    location: { lat: 40.71, lng: -74.01 },
    community: 'NYC Gardens',
    image: '/placeholder-resource.jpg',
  },
  {
    id: '3',
    title: 'Eco Village Residency',
    type: 'SERVICE' as const,
    description: 'Work-exchange residency program in eco-village',
    location: { lat: 51.51, lng: -0.13 },
    community: 'UK Eco Communities',
    image: '/placeholder-service.jpg',
  },
];

type ViewMode = 'globe' | 'map' | 'list';

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('globe');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['LAND', 'RESOURCE', 'SERVICE']);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search communities, land, resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-1">
              {[
                { mode: 'globe' as const, icon: Globe, label: 'Globe' },
                { mode: 'map' as const, icon: Map, label: 'Map' },
                { mode: 'list' as const, icon: List, label: 'List' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    viewMode === mode
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                showFilters 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-800"
            >
              <div className="flex flex-wrap gap-3">
                <span className="text-gray-400 text-sm py-2">Type:</span>
                {[
                  { type: 'LAND', icon: MapPin, color: 'green' },
                  { type: 'RESOURCE', icon: Leaf, color: 'blue' },
                  { type: 'SERVICE', icon: Users, color: 'purple' },
                ].map(({ type, icon: Icon, color }) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      selectedTypes.includes(type)
                        ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
                        : 'bg-gray-800 text-gray-500 border border-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Map/Globe View */}
        <div className={`flex-1 ${viewMode === 'list' ? 'hidden md:block md:w-1/2' : 'w-full'}`}>
          {viewMode === 'globe' && <GlobeView />}
          {viewMode === 'map' && <MapView />}
          {viewMode === 'list' && <MapView />}
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="w-full md:w-1/2 overflow-y-auto border-l border-gray-800">
            <div className="p-4 space-y-4">
              {SAMPLE_LISTINGS.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-green-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gray-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            listing.type === 'LAND' ? 'bg-green-500/20 text-green-400' :
                            listing.type === 'RESOURCE' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {listing.type}
                          </span>
                          <h3 className="text-white font-semibold mt-2 group-hover:text-green-400 transition-colors">
                            {listing.title}
                          </h3>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {listing.description}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {listing.community}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
