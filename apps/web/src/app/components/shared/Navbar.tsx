"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, Users, MapPin, MessageSquare, Leaf, LogOut, User, Settings, Plus, ChevronDown, LayoutDashboard, Heart, Shield } from 'lucide-react';
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
    setMobileOpen(false);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-[#071f13]/85 backdrop-blur-xl border-b border-white/[0.06]" />
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-eden-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">Eden<span className="text-eden-400">Share</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors">
                <l.icon className="w-4 h-4" /><span>{l.label}</span>
              </Link>
            ))}
            {user && (
              <Link href="/messages" className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors">
                <MessageSquare className="w-4 h-4" /><span>Messages</span>
              </Link>
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-2">
            {!loading && user ? (
              <>
                <Link href="/listings/new" className="btn-primary py-2 px-3 flex items-center gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> New Listing
                </Link>
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-white/[0.05] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-eden-500/30 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile?.display_name || 'U')[0]}
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                          className="absolute right-0 mt-1 w-52 card-glass p-1.5 shadow-2xl z-50">
                          <div className="px-3 py-2 mb-1">
                            <p className="text-sm font-medium text-white truncate">{profile?.display_name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                          </div>
                          <div className="border-t border-white/[0.06] pt-1">
                            {[
                              { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                              { href: '/profile', icon: User, label: 'Profile' },
                              { href: '/saved', icon: Heart, label: 'Saved' },
                              { href: '/settings', icon: Settings, label: 'Settings' },
                            ].map(item => (
                              <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg">
                                <item.icon className="w-4 h-4" /> {item.label}
                              </Link>
                            ))}
                            {profile?.role === 'admin' && (
                              <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-amber-400 hover:bg-white/[0.05] rounded-lg">
                                <Shield className="w-4 h-4" /> Admin
                              </Link>
                            )}
                          </div>
                          <div className="border-t border-white/[0.06] pt-1 mt-1">
                            <button onClick={handleSignOut} className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-white/[0.05] rounded-lg w-full">
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : !loading ? (
              <>
                <Link href="/login" className="btn-ghost text-sm py-2">Sign In</Link>
                <Link href="/register" className="btn-primary py-2 text-sm">Get Started</Link>
              </>
            ) : null}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 -mr-2 text-gray-400 active:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — full screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 top-14 bg-[#071f13]/98 backdrop-blur-2xl z-50 overflow-y-auto safe-bottom"
          >
            <div className="container mx-auto px-4 py-4">
              {/* User info */}
              {user && profile && (
                <div className="flex items-center gap-3 p-3 mb-4 bg-white/[0.03] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-eden-500/30 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.display_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{profile.display_name}</p>
                    <p className="text-[11px] text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Nav links — large touch targets */}
              <div className="space-y-1 mb-4">
                {NAV_LINKS.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-200 active:bg-white/[0.05] rounded-xl transition-colors">
                    <l.icon className="w-5 h-5 text-eden-400" /><span className="text-sm">{l.label}</span>
                  </Link>
                ))}
              </div>

              {user && (
                <>
                  <div className="border-t border-white/[0.06] pt-3 mb-3">
                    {[
                      { href: '/messages', icon: MessageSquare, label: 'Messages' },
                      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                      { href: '/profile', icon: User, label: 'Profile' },
                      { href: '/saved', icon: Heart, label: 'Saved Listings' },
                      { href: '/listings/new', icon: Plus, label: 'Create Listing' },
                      { href: '/settings', icon: Settings, label: 'Settings' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-gray-300 active:bg-white/[0.05] rounded-xl">
                        <item.icon className="w-5 h-5 text-gray-500" /><span className="text-sm">{item.label}</span>
                      </Link>
                    ))}
                    {profile?.role === 'admin' && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-amber-400 active:bg-white/[0.05] rounded-xl">
                        <Shield className="w-5 h-5" /><span className="text-sm">Admin Panel</span>
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-white/[0.06] pt-3">
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3.5 text-red-400 active:bg-white/[0.05] rounded-xl w-full">
                      <LogOut className="w-5 h-5" /><span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </>
              )}

              {!user && !loading && (
                <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full text-center block py-3">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center block py-3">Get Started Free</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
