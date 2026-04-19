"use client";

import Link from 'next/link';
import { Bell, Leaf } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AppHeader() {
  const { user, profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchCount();
  }, [user]);

  return (
    <header className="lg:hidden sticky top-0 z-40 h-12 bg-[#0a1a10]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4">
      <Link href="/feed" className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-md bg-eden-500 flex items-center justify-center">
          <Leaf className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-white">Eden<span className="text-eden-400">Share</span></span>
      </Link>

      <div className="flex items-center gap-2">
        <Link href="/notifications" className="relative p-2 text-gray-400 active:text-white">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/profile" className="flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-eden-500/30 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.display_name || 'U')[0]
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
