"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, Plus, MessageSquare, Menu, X, Package, FileText, Heart, Bell, Users, Settings, Shield, LogOut, Store, User, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const TABS = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '__create__', label: 'Create', icon: Plus },
  { href: '/messages', label: 'Chat', icon: MessageSquare },
  { href: '__menu__', label: 'Menu', icon: Menu },
];

export default function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    return pathname.startsWith(href);
  };

  const isProducer = profile?.user_type === 'producer' || profile?.user_type === 'community_leader';

  return (
    <>
      {/* Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a1a10]/95 backdrop-blur-xl border-t border-white/[0.06] safe-bottom">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {TABS.map((tab) => {
            if (tab.href === '__create__') {
              return (
                <button key="create" onClick={() => { setShowCreate(true); setShowMenu(false); }}
                  className="relative -mt-5">
                  <div className="w-12 h-12 rounded-full bg-eden-500 flex items-center justify-center shadow-lg shadow-eden-500/30 active:scale-90 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </button>
              );
            }
            if (tab.href === '__menu__') {
              return (
                <button key="menu" onClick={() => { setShowMenu(!showMenu); setShowCreate(false); }}
                  className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px]">
                  <Menu className={`w-5 h-5 ${showMenu ? 'text-eden-400' : 'text-gray-500'}`} />
                  <span className={`text-[10px] ${showMenu ? 'text-eden-400' : 'text-gray-500'}`}>Menu</span>
                </button>
              );
            }
            const active = isActive(tab.href);
            return (
              <Link key={tab.href} href={tab.href} onClick={() => { setShowMenu(false); setShowCreate(false); }}
                className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px]">
                <tab.icon className={`w-5 h-5 transition-colors ${active ? 'text-eden-400' : 'text-gray-500'}`} />
                <span className={`text-[10px] transition-colors ${active ? 'text-eden-400 font-medium' : 'text-gray-500'}`}>{tab.label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-eden-400 -mt-0.5" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Create Sheet */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setShowCreate(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f2318] rounded-t-3xl border-t border-white/[0.08] p-6 safe-bottom"
            >
              <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5" />
              <h3 className="text-lg font-semibold text-white mb-4">Create</h3>
              <div className="space-y-2">
                <button onClick={() => { router.push('/listings/new'); setShowCreate(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] active:bg-white/[0.08] text-left">
                  <div className="w-10 h-10 rounded-xl bg-eden-500/10 flex items-center justify-center"><Package className="w-5 h-5 text-eden-400" /></div>
                  <div><p className="text-sm font-medium text-white">New Listing</p><p className="text-xs text-gray-500">Share land, produce, or services</p></div>
                </button>
                <button onClick={() => { router.push('/communities/new'); setShowCreate(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] active:bg-white/[0.08] text-left">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-purple-400" /></div>
                  <div><p className="text-sm font-medium text-white">New Community</p><p className="text-xs text-gray-500">Start a group or network</p></div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Menu Sheet */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setShowMenu(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f2318] rounded-t-3xl border-t border-white/[0.08] safe-bottom max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#0f2318] pt-4 pb-2 px-6">
                <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-4" />
              </div>

              <div className="px-4 pb-6">
                {/* User card */}
                {profile && (
                  <div className="flex items-center gap-3 p-3 mb-4 bg-white/[0.03] rounded-xl">
                    <div className="w-11 h-11 rounded-full bg-eden-500/30 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile.display_name || 'U')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{profile.display_name}</p>
                      <p className="text-[11px] text-gray-500 capitalize">{profile.user_type || 'seeker'}{profile.city ? ` · ${profile.city}` : ''}</p>
                    </div>
                  </div>
                )}

                {/* Quick links */}
                <div className="space-y-0.5">
                  {[
                    { href: '/profile', icon: User, label: 'Profile', color: 'text-gray-400' },
                    { href: '/marketplace', icon: Store, label: 'Marketplace', color: 'text-gray-400' },
                    ...(isProducer ? [
                      { href: '/shop', icon: Store, label: 'Shop Dashboard', color: 'text-eden-400' },
                      { href: '/shop/listings', icon: Package, label: 'My Listings', color: 'text-eden-400' },
                      { href: '/shop/analytics', icon: BarChart3, label: 'Analytics', color: 'text-eden-400' },
                    ] : []),
                    { href: '/notifications', icon: Bell, label: 'Notifications', color: 'text-gray-400' },
                    { href: '/saved', icon: Heart, label: 'Saved', color: 'text-gray-400' },
                    { href: '/requests', icon: FileText, label: 'My Requests', color: 'text-gray-400' },
                    { href: '/communities', icon: Users, label: 'Communities', color: 'text-gray-400' },
                    { href: '/settings', icon: Settings, label: 'Settings', color: 'text-gray-400' },
                    ...(profile?.role === 'admin' ? [{ href: '/admin', icon: Shield, label: 'Admin Panel', color: 'text-amber-400' }] : []),
                  ].map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-gray-300 active:bg-white/[0.05]">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] mt-3 pt-3">
                  <button onClick={async () => { await signOut(); setShowMenu(false); }}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-red-400 active:bg-white/[0.05] w-full">
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
