"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, Users, MapPin, MessageSquare, LogIn, Bell, LayoutDashboard, Leaf, LogOut, User, Settings, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/listings', label: 'Listings', icon: MapPin },
];

export default function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-eden-950/70 backdrop-blur-2xl border-b border-white/[0.04]" />
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eden-400 to-eden-600 flex items-center justify-center shadow-lg shadow-eden-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-none tracking-tight">Eden<span className="text-eden-400">Share</span></span>
              <span className="text-[10px] text-gray-500 leading-none tracking-widest uppercase">by Edverse</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all">
                <l.icon className="w-4 h-4" /><span>{l.label}</span>
              </Link>
            ))}
            {user && (
              <Link href="/messages" className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all">
                <MessageSquare className="w-4 h-4" /><span>Messages</span>
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-2">
            {!loading && user ? (
              <>
                <Link href="/listings/new" className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4">
                  <Plus className="w-4 h-4" /> New Listing
                </Link>
                <Link href="/dashboard" className="btn-ghost p-2"><LayoutDashboard className="w-5 h-5" /></Link>
                <button className="btn-ghost p-2 relative">
                  <Bell className="w-5 h-5" />
                </button>
                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 ml-1 hover:opacity-80 transition-opacity">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-eden-500/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eden-400 to-sky-400 ring-2 ring-eden-500/20" />
                    )}
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 mt-2 w-56 card-glass p-2 shadow-2xl"
                      >
                        <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                          <p className="text-sm font-medium text-white truncate">{profile?.display_name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg"><User className="w-4 h-4" /> Profile</Link>
                        <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg"><Settings className="w-4 h-4" /> Settings</Link>
                        <div className="border-t border-white/[0.06] mt-1 pt-1">
                          <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.05] rounded-lg w-full">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : !loading ? (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link href="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            ) : null}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-400">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-eden-950/95 backdrop-blur-2xl border-b border-white/[0.04]">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-xl">
                  <l.icon className="w-5 h-5 text-eden-500" /><span>{l.label}</span>
                </Link>
              ))}
              {user && (
                <>
                  <Link href="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-xl">
                    <MessageSquare className="w-5 h-5 text-eden-500" /><span>Messages</span>
                  </Link>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-xl">
                    <LayoutDashboard className="w-5 h-5 text-eden-500" /><span>Dashboard</span>
                  </Link>
                </>
              )}
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-col gap-2">
                {user ? (
                  <button onClick={async () => { await signOut(); setMobileOpen(false); }} className="btn-secondary text-center text-red-400">Sign Out</button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-center">Sign In</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-center">Get Started Free</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
