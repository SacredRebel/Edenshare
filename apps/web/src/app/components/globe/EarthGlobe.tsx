"use client";

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { MapPin, Users, Leaf, Star, Shield, X, Wrench, ExternalLink } from 'lucide-react';

const NODES = [
  { id: '1', name: 'Permaculture Oasis', lat: 34.05, lng: -118.24, type: 'land' as const, members: 156, rating: 4.8, online: true, desc: 'Established food forest in Southern California seeking seasonal collaborators.', verified: true },
  { id: '2', name: 'Brooklyn Urban Gardens', lat: 40.71, lng: -74.01, type: 'resource' as const, members: 342, rating: 4.9, online: true, desc: 'Tool library and seed exchange for NYC urban growers.', verified: true },
  { id: '3', name: 'Findhorn Eco Village', lat: 57.65, lng: -3.62, type: 'community' as const, members: 89, rating: 4.7, online: true, desc: "One of the world's oldest intentional eco-communities.", verified: true },
  { id: '4', name: 'Blue Mountains Homestead', lat: -33.72, lng: 150.31, type: 'land' as const, members: 23, rating: 4.6, online: true, desc: 'Off-grid homestead with regenerative agriculture practices.', verified: false },
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

const TYPE_COLORS: Record<string, string> = { land: '#3ec878', resource: '#60b9fa', community: '#c084fc', service: '#fbbf24' };

function latLngToVec3(lat: number, lng: number, r = 1.005): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

// ─── NODE ───────────────────────────────────────────────────────────────────

function NodeMarker({ node, isSelected, onSelect }: { node: NodeType; isSelected: boolean; onSelect: (n: NodeType | null) => void }) {
  const pos = useMemo(() => latLngToVec3(node.lat, node.lng), [node.lat, node.lng]);
  const col = TYPE_COLORS[node.type];
  const dotRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const off = node.lat * 0.1 + node.lng * 0.05;
    if (dotRef.current) {
      dotRef.current.scale.setScalar(isSelected ? 2.5 : 1 + Math.sin(t * 2.5 + off) * 0.25);
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 1.5 + off) * 0.4;
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        (0.4 - Math.sin(t * 1.5 + off) * 0.2) * (node.online ? 1 : 0.3);
    }
  });

  return (
    <group position={pos}>
      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.022, 0.03, 32]} />
        <meshBasicMaterial color={col} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Core dot */}
      <mesh
        ref={dotRef}
        onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : node); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[0.013, 16, 16]} />
        <meshStandardMaterial
          color={col}
          emissive={col}
          emissiveIntensity={node.online ? 1.5 : 0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Glow sprite */}
      <sprite scale={[0.09, 0.09, 1]}>
        <spriteMaterial color={col} transparent opacity={node.online ? 0.15 : 0.04} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* Tooltip */}
      {isSelected && (
        <Html distanceFactor={2.5} center style={{ pointerEvents: 'none', transform: 'translate(0, -60px)' }}>
          <div className="bg-eden-950/95 backdrop-blur-2xl text-white rounded-2xl border border-white/[0.08] shadow-2xl min-w-[240px] overflow-hidden">
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${col}, transparent)` }} />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{node.name}</span>
                {node.verified && <Shield className="w-3.5 h-3.5 text-eden-400" />}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">{node.desc}</p>
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {node.members}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-eden-400 text-eden-400" /> {node.rating}</span>
                <span className={`flex items-center gap-1 ${node.online ? 'text-eden-400' : 'text-gray-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${node.online ? 'bg-eden-400' : 'bg-gray-600'}`} />
                  {node.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── EARTH ──────────────────────────────────────────────────────────────────

function EarthSphere({ selectedNode, onSelect }: { selectedNode: NodeType | null; onSelect: (n: NodeType | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && !selectedNode) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core earth */}
      <mesh onClick={() => onSelect(null)}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#143d28"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Ocean layer */}
      <mesh>
        <sphereGeometry args={[1.001, 64, 64]} />
        <meshStandardMaterial
          color="#0c2d4a"
          transparent
          opacity={0.4}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Subtle latitude lines */}
      <mesh>
        <sphereGeometry args={[1.003, 72, 36]} />
        <meshBasicMaterial color="#4ade80" wireframe transparent opacity={0.04} />
      </mesh>

      {/* Atmosphere inner glow */}
      <mesh scale={1.02}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.03} />
      </mesh>

      {/* Atmosphere outer glow */}
      <mesh scale={1.12}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Second atmosphere ring */}
      <mesh scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.025} side={THREE.BackSide} />
      </mesh>

      {/* Nodes */}
      {NODES.map((node) => (
        <NodeMarker
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

export default function EarthGlobe() {
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden">
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(4,40,24,0.6) 100%)' }}
      />

      <Canvas
        camera={{ position: [0, 0.3, 2.8], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 4]} intensity={1.5} color="#fff8f0" />
        <directionalLight position={[-3, -1, -4]} intensity={0.2} color="#4ade80" />
        <pointLight position={[0, 4, 0]} intensity={0.15} color="#60b9fa" />

        <Stars radius={200} depth={100} count={3000} factor={3} saturation={0.2} fade speed={0.3} />

        <EarthSphere selectedNode={selectedNode} onSelect={setSelectedNode} />

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={1.4}
          maxDistance={4.5}
          autoRotate={!selectedNode}
          autoRotateSpeed={0.25}
          enableDamping
          dampingFactor={0.04}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-eden-950/70 backdrop-blur-2xl rounded-xl p-3.5 text-xs border border-white/[0.06]">
        <div className="font-medium text-eden-400/80 mb-2.5 text-[10px] uppercase tracking-wider">Network Nodes</div>
        <div className="space-y-2">
          {[
            { type: 'Land', color: '#3ec878', icon: MapPin },
            { type: 'Resources', color: '#60b9fa', icon: Leaf },
            { type: 'Communities', color: '#c084fc', icon: Users },
            { type: 'Services', color: '#fbbf24', icon: Wrench },
          ].map((l) => (
            <div key={l.type} className="flex items-center gap-2.5 text-gray-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}40` }} />
              <l.icon className="w-3 h-3 text-gray-500" />
              <span>{l.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Online count */}
      <div className="absolute top-4 right-4 z-20 bg-eden-950/70 backdrop-blur-2xl rounded-xl px-4 py-2.5 text-sm border border-white/[0.06] flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eden-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-eden-400" />
        </span>
        <span className="text-eden-400 font-bold">{NODES.filter(n => n.online).length}</span>
        <span className="text-gray-500">nodes online</span>
      </div>

      {/* Detail card */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 z-20 w-80 animate-slide-up">
          <div className="bg-eden-950/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/40">
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${TYPE_COLORS[selectedNode.type]}, transparent)` }} />
            <div className="p-5 relative">
              <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <span
                className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full inline-block mb-2"
                style={{
                  backgroundColor: `${TYPE_COLORS[selectedNode.type]}18`,
                  color: TYPE_COLORS[selectedNode.type],
                  border: `1px solid ${TYPE_COLORS[selectedNode.type]}30`,
                }}
              >
                {selectedNode.type}
              </span>
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                {selectedNode.name}
                {selectedNode.verified && <Shield className="w-4 h-4 text-eden-400" />}
              </h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">{selectedNode.desc}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedNode.members}</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-eden-400 fill-eden-400" /> {selectedNode.rating}</span>
                <span className={`flex items-center gap-1.5 ${selectedNode.online ? 'text-eden-400' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${selectedNode.online ? 'bg-eden-400' : 'bg-gray-600'}`} />
                  {selectedNode.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex gap-2 mt-5">
                <button className="btn-primary text-sm flex-1 flex items-center justify-center gap-1.5 py-2.5">
                  View Details <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button className="btn-secondary text-sm py-2.5 px-4">Message</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
