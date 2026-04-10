"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Sample community nodes - in production these come from the database
const SAMPLE_NODES = [
  { id: '1', name: 'Permaculture Farm', lat: 34.05, lng: -118.24, type: 'land', online: true },
  { id: '2', name: 'Urban Garden Network', lat: 40.71, lng: -74.01, type: 'resource', online: true },
  { id: '3', name: 'Eco Village', lat: 51.51, lng: -0.13, type: 'community', online: false },
  { id: '4', name: 'Regenerative Homestead', lat: -33.87, lng: 151.21, type: 'land', online: true },
  { id: '5', name: 'Community Seed Bank', lat: 35.68, lng: 139.69, type: 'resource', online: true },
  { id: '6', name: 'Forest Garden Collective', lat: 48.86, lng: 2.35, type: 'community', online: true },
];

const getMarkerColor = (type: string): string => {
  switch (type) {
    case 'land': return '#22c55e';
    case 'resource': return '#3b82f6';
    case 'community': return '#a855f7';
    default: return '#22c55e';
  }
};

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedNode, setSelectedNode] = useState<typeof SAMPLE_NODES[0] | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if Mapbox token is available
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!token) {
      // Show placeholder if no token
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      projection: 'mercator',
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add markers for each node
      SAMPLE_NODES.forEach((node) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = getMarkerColor(node.type);
        el.style.border = '3px solid rgba(255,255,255,0.8)';
        el.style.cursor = 'pointer';
        el.style.boxShadow = `0 0 10px ${getMarkerColor(node.type)}`;
        el.style.opacity = node.online ? '1' : '0.5';

        el.addEventListener('click', () => {
          setSelectedNode(node);
          map.current?.flyTo({
            center: [node.lng, node.lat],
            zoom: 8,
          });
        });

        new mapboxgl.Marker(el)
          .setLngLat([node.lng, node.lat])
          .addTo(map.current!);
      });

      // Add navigation controls
      map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Placeholder UI when no Mapbox token
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!token) {
    return (
      <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Map View</h3>
          <p className="text-gray-400 mb-4">
            Add your Mapbox token to enable the interactive map view.
          </p>
          <code className="text-xs bg-gray-800 text-green-400 px-3 py-2 rounded-lg block">
            NEXT_PUBLIC_MAPBOX_TOKEN=your_token
          </code>
          
          {/* Show sample nodes as list */}
          <div className="mt-8 text-left">
            <p className="text-gray-500 text-sm mb-3">Sample nodes:</p>
            <div className="space-y-2">
              {SAMPLE_NODES.slice(0, 3).map((node) => (
                <div key={node.id} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getMarkerColor(node.type) }}
                  />
                  <span className="text-gray-300 text-sm">{node.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Selected Node Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700 p-4 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${getMarkerColor(selectedNode.type)}20`,
                  color: getMarkerColor(selectedNode.type)
                }}
              >
                {selectedNode.type.toUpperCase()}
              </span>
              <h3 className="text-white font-semibold mt-2">{selectedNode.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${selectedNode.online ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-gray-400 text-sm">
                  {selectedNode.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-gray-500 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
              View Details
            </button>
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm">
              Message
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-xs text-white border border-gray-700">
        <div className="font-semibold mb-2 text-green-400">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span>Land</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Resources</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Communities</span>
          </div>
        </div>
      </div>
    </div>
  );
}
