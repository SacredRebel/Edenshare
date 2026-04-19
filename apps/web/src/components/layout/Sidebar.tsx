"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Compass, ShoppingBag, Users, MessageSquare, Bell, Heart,
  ClipboardList, BarChart3, Settings, Shield, LogOut, ChevronLeft,
  ChevronRight as ChevronRightIcon, Plus, Star, Package, Store,
  Leaf, FileText, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: number;
  roles?: string[]; // only show for these user_types
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: string[];
}

export default function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  // Fetch badge counts
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadNotifs(notifCount || 0);

      // Count pending requests on user's listings
      if (profile?.user_type === 'producer') {
        const { data: myListings } = await supabase
          .from('listings')
          .select('id')
          .eq('creator_id', user.id);
        if (myListings && myListings.length > 0) {
          const { count } = await supabase
            .from('requests')
            .select('*', { count: 'exact', head: true })
            .in('listing_id', myListings.map(l => l.id))
            .eq('status', 'pending');
          setPendingRequests(count || 0);
        }
      }
    };

    fetchCounts();

    // Real-time subscription for badge updates
    const channel = supabase
      .channel('sidebar-badges-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => setUnreadNotifs(prev => prev + 1))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, profile]);

  const isProducer = profile?.user_type === 'producer' || profile?.user_type === 'community_leader';
  const isAdmin = profile?.role === 'admin';

  const sections: NavSection[] = [
    {
      title: 'Discover',
      items: [
        { href: '/feed', label: 'Feed', icon: Home },
        { href: '/explore', label: 'Explore', icon: Compass },
        { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
        { href: '/communities', label: 'Communities', icon: Users },
      ],
    },
    {
      title: 'My Shop',
      roles: ['producer', 'community_leader'],
      items: [
        { href: '/shop', label: 'Shop Dashboard', icon: Store },
        { href: '/shop/listings', label: 'My Listings', icon: Package },
        { href: '/shop/requests', label: 'Requests', icon: ClipboardList, badge: pendingRequests },
        { href: '/shop/reviews', label: 'Reviews', icon: Star },
        { href: '/shop/analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Personal',
      items: [
        { href: '/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
        { href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs },
        { href: '/saved', label: 'Saved', icon: Heart },
        { href: '/requests', label: 'My Requests', icon: FileText },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/feed' && pathname === '/feed') return true;
    if (href !== '/feed' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/[0.06] bg-[#0c1f14] transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center h-14 px-4 border-b border-white/[0.06] ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-eden-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Eden<span className="text-eden-400">Share</span></span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-eden-500 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
        )}
        <button onClick={toggleCollapsed} className="p-1 text-gray-500 hover:text-white rounded transition-colors">
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {sections.map((section) => {
          // Role filtering
          if (section.roles && !section.roles.includes(profile?.user_type || 'seeker')) return null;

          return (
            <div key={section.title} className="mb-4">
              {!collapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group relative ${
                      active
                        ? 'bg-eden-500/10 text-eden-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-eden-500 rounded-r-full" />}
                    <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-eden-400' : ''}`} />
                    {!collapsed && <span className="text-sm flex-1">{item.label}</span>}
                    {!collapsed && item.badge && item.badge > 0 ? (
                      <span className="min-w-[20px] h-5 bg-eden-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    ) : null}
                    {collapsed && item.badge && item.badge > 0 ? (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-eden-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          );
        })}

        {/* Settings + Admin */}
        <div className="border-t border-white/[0.06] pt-3 mt-2">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all ${
              isActive('/settings') ? 'bg-eden-500/10 text-eden-400' : ''
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Settings className="w-[18px] h-[18px]" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/5 transition-all ${
                isActive('/admin') ? 'bg-amber-500/10 text-amber-400' : ''
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Shield className="w-[18px] h-[18px]" />
              {!collapsed && <span className="text-sm">Admin</span>}
            </Link>
          )}
        </div>
      </nav>

      {/* User Card */}
      <div className={`border-t border-white/[0.06] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-eden-500/30 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile?.display_name || 'U')[0]}
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-eden-500/30 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : (profile?.display_name || 'U')[0]}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.display_name || 'User'}</p>
              <p className="text-[11px] text-gray-500 truncate capitalize">{profile?.user_type || 'seeker'}{profile?.city ? ` · ${profile.city}` : ''}</p>
            </div>
            <button onClick={() => signOut()} className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
