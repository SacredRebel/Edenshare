"use client";

import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MapPin, Users, Leaf, ArrowRight, Star, Shield, X } from 'lucide-react';

// Community nodes — in production, fetched from API
const NODES = [
  { id: '1', name: 'Permaculture Oasis', lat: 34.05, lng: -118.24, type: 'land' as const, members: 156, rating: 4.8, online: true, desc: 'Established food forest in Southern California seeking seasonal collaborators.', verified: true },
  { id: '2', name: 'Brooklyn Urban Gardens', lat: 40.71, lng: -74.01, type: 'resource' as const, members: 342, rating: 4.9, online: true, desc: 'Tool library and seed exchange for NYC urban growers.', verified: true },
  { id: '3', name: 'Findhorn Eco Village', lat: 57.65, lng: -3.62, type: 'community' as const, members: 89, rating: 4.7, online: true, desc: 'One of the world\'s oldest intentional eco-communities.', verified: true },
  { id: '4', name: 'Blue Mountains Homestead', lat: -33.72, lng: 150.31, type: 'land' as const, members: 23, rating: 4.6, online: true, desc: 'Off-grid homestead with regenerative ag practices.', verified: false },
  { id: '5', name: 'Tokyo Community Farm', lat: 35.68, lng: 139.69, type: 'community' as const, members: 67, rating: 4.5, online: true, desc: 'Urban micro-farming collective in central Tokyo.', verified: true },
  { id: '6', name: 'Parisian Food Forest', lat: 48.86, lng: 2.35, type: 'land' as const, members: 134, rating: 4.8, online: true, desc: 'Community-managed forest garden near Paris.', verified: true },
  { id: '7', name: 'Costa Rica Regenerative', lat: 10.0, lng: -84.1, type: 'community' as const, members: 45, rating: 4.9, online: false, desc: 'Tropical permaculture community in the cloud forest.', verified: true },
  { id: '8', name: 'Seed Savers Kenya', lat: -1.29, lng: 36.82, type: 'resource' as const, members: 210, rating: 4.7, online: true, desc: 'Heirloom seed preservation and distribution network.', verified: true },
  { id: '9', name: 'Nordic Forest School', lat: 59.91, lng: 10.75, type: 'service' as const, members: 78, rating: 4.6, online: true, desc: 'Outdoor education and forest stewardship workshops.', verified: false },
  { id: '10', name: 'Auroville Earth Center', lat: 12.0, lng: 79.81, type: 'community' as const, members: 520, rating: 4.8, online: true, desc: 'International community dedicated to human unity.', verified: true },
  { id: '11', name: 'Portland Tool Library', lat: 45.52, lng: -122.68, type: 'resource' as const, members: 890, rating: 4.9, online: true, desc: 'Largest community tool sharing library on the West Coast.', verified: true },
  { id: '12', name: 'Patagonia Land Trust', lat: -43.1, lng: -71.8, type: 'land' as const, members: 34, rating: 4.5, online: false, desc: 'Conservation and regeneration projects in Chilean Patagonia.', verified: true },
];

type NodeType = typeof NODES[0];

function latLngToVec3(lat: number, lng: number, r = 1.01): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

const TYPE_COLORS: Record<string, string> = {
  land: '#3ec878',
  resource: '#3b9cf6',
  community: '#a855f7',
  service: '#f59e0b',
};

function NodeMarker({ node, isSelected, onSelect }: { node: NodeType; isSelected: boolean; onSelect: (n: NodeType | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLngToVec3(node.lat, node.lng), [node.lat, node.lng]);
  const col = TYPE_COLORS[node.type];
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2 + pos.x * 10) * 0.15;
      meshRef.current.scale.setScalar(isSelected ? 1.8 : s);
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.3;
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 - Math.sin(clock.elapsedTime * 1.5) * 0.15;
    }
  });

  return (
    <group position={pos}>
      {/* Pulse ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.025, 0.035, 32]} />
        <meshBasicMaterial color={col} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Node dot */}
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : node); }}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={node.online ? 1 : 0.3} />
      </mesh>

      {/* Hover label */}
      {isSelected && (
        <Html distanceFactor={2.2} style={{ pointerEvents: 'none' }}>
          <div className="bg-eden-950/95 backdrop-blur-xl text-white px-4 py-3 rounded-xl text-sm whitespace-nowrap border border-white/10 shadow-2xl min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{node.name}</span>
              {node.verified && <Shield className="w-3.5 h-3.5 text-eden-400" />}
            </div>
            <div className="text-xs text-gray-400 mb-2">{node.desc}</div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {node.members}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-eden-400" /> {node.rating}
              </span>
              <span className={`flex items-center gap-1 ${node.online ? 'text-eden-400' : 'text-gray-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${node.online ? 'bg-eden-400' : 'bg-gray-600'}`} />
                {node.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Earth({ selectedNode, onSelect }: { selectedNode: NodeType | null; onSelect: (n: NodeType | null) => void }) {
  const earthRef = useRef<THREE.Mesh>(null);

  // Use a procedural earth-like material with NASA-style coloring
  const earthMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color('#1a3a2a'),
      emissive: new THREE.Color('#0a1f14'),
      emissiveIntensity: 0.15,
      shininess: 15,
      specular: new THREE.Color('#1a472a'),
    });
  }, []);

  useFrame(({ clock }) => {
    if (earthRef.current && !selectedNode) {
      earthRef.current.rotation.y = clock.elapsedTime * 0.03;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef} material={earthMaterial} onClick={() => onSelect(null)}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      {/* Atmosphere */}
      <mesh scale={1.08}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Subtle grid */}
      <mesh>
        <sphereGeometry args={[1.003, 72, 36]} />
        <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.06} />
      </mesh>

      {/* Continents hint — second sphere with slight color shift */}
      <mesh>
        <sphereGeometry args={[1.002, 64, 64]} />
        <meshPhongMaterial
          color="#1e5a36"
          transparent
          opacity={0.3}
          emissive="#0d3a20"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Nodes */}
      {NODES.map((node) => (
        <NodeMarker key={node.id} node={node} isSelected={selectedNode?.id === node.id} onSelect={onSelect} />
      ))}
    </group>
  );
}

export default function EarthGlobe() {
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 2.8], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-5, -3, -5]} intensity={0.4} color="#4ade80" />
        <pointLight position={[3, 5, -3]} intensity={0.2} color="#3b9cf6" />

        <Stars radius={80} depth={60} count={1500} factor={3} fade speed={0.5} />

        <Earth selectedNode={selectedNode} onSelect={setSelectedNode} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1.6}
          maxDistance={5}
          autoRotate={!selectedNode}
          autoRotateSpeed={0.3}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 card-glass p-3 text-xs">
        <div className="font-medium text-eden-400 mb-2">Node Types</div>
        <div className="space-y-1.5">
          {[
            { type: 'Land', color: 'bg-eden-500' },
            { type: 'Resources', color: 'bg-sky-500' },
            { type: 'Communities', color: 'bg-purple-500' },
            { type: 'Services', color: 'bg-amber-500' },
          ].map((l) => (
            <div key={l.type} className="flex items-center gap-2 text-gray-400">
              <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span>{l.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active node count */}
      <div className="absolute top-4 right-4 card-glass px-3 py-2 text-sm">
        <span className="text-eden-400 font-bold">{NODES.filter(n => n.online).length}</span>
        <span className="text-gray-500 ml-1">nodes online</span>
      </div>

      {/* Selected node card (outside canvas) */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 w-72 card-glass p-5 animate-slide-up">
          <button onClick={() => setSelectedNode(null)} className="absolute top-3 right-3 text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
          <div className={`badge-${selectedNode.type === 'land' ? 'land' : selectedNode.type === 'resource' ? 'resource' : 'service'} mb-3`}>
            {selectedNode.type === 'land' && <MapPin className="w-3 h-3" />}
            {selectedNode.type === 'resource' && <Leaf className="w-3 h-3" />}
            {selectedNode.type === 'community' && <Users className="w-3 h-3" />}
            {selectedNode.type.toUpperCase()}
          </div>
          <h3 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
            {selectedNode.name}
            {selectedNode.verified && <Shield className="w-4 h-4 text-eden-400" />}
          </h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">{selectedNode.desc}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {selectedNode.members}</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-eden-400 fill-eden-400" /> {selectedNode.rating}</span>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm flex-1 flex items-center justify-center gap-1.5 py-2">
              View <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="btn-secondary text-sm py-2 px-3">Message</button>
          </div>
        </div>
      )}
    </div>
  );
}
