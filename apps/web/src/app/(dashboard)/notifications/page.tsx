"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, XCircle, MessageSquare, Star, Users, MapPin, Package, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const TYPE_ICONS: Record<string, any> = {
  request_received: Package,
  request_accepted: CheckCircle,
  request_rejected: XCircle,
  new_message: MessageSquare,
  new_review: Star,
  community_invite: Users,
  listing_nearby: MapPin,
  listing_approved: CheckCircle,
  system: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  request_received: 'text-amber-400 bg-amber-500/10',
  request_accepted: 'text-eden-400 bg-eden-500/10',
  request_rejected: 'text-red-400 bg-red-500/10',
  new_message: 'text-sky-400 bg-sky-500/10',
  new_review: 'text-eden-400 bg-eden-500/10',
  community_invite: 'text-purple-400 bg-purple-500/10',
  listing_nearby: 'text-eden-400 bg-eden-500/10',
  listing_approved: 'text-eden-400 bg-eden-500/10',
  system: 'text-gray-400 bg-gray-500/10',
};

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifs-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications(prev => [payload.new as any, ...prev]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Group by time
  const today = new Date(); today.setHours(0,0,0,0);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const groups = [
    { label: 'Today', items: notifications.filter(n => new Date(n.created_at) >= today) },
    { label: 'This Week', items: notifications.filter(n => { const d = new Date(n.created_at); return d < today && d >= weekAgo; }) },
    { label: 'Earlier', items: notifications.filter(n => new Date(n.created_at) < weekAgo) },
  ].filter(g => g.items.length > 0);

  if (loading) return <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && <span className="bg-eden-500/20 text-eden-400 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-eden-400 active:text-eden-300 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.label}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">{group.label}</h2>
              <div className="space-y-1">
                {group.items.map(notif => {
                  const Icon = TYPE_ICONS[notif.type] || Bell;
                  const colorClass = TYPE_COLORS[notif.type] || TYPE_COLORS.system;
                  const [iconColor, iconBg] = colorClass.split(' ');
                  return (
                    <motion.div key={notif.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Link href={notif.action_url || '#'} onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                          notif.is_read ? 'opacity-60' : 'bg-white/[0.02]'
                        } active:bg-white/[0.05]`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                          <Icon className={`w-4 h-4 ${iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</p>
                          {notif.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.body}</p>}
                          <p className="text-[10px] text-gray-600 mt-1">{timeAgo(notif.created_at)}</p>
                        </div>
                        {!notif.is_read && <div className="w-2 h-2 rounded-full bg-eden-400 mt-2 flex-shrink-0" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No notifications yet</h3>
          <p className="text-sm text-gray-500">When something happens, you&apos;ll see it here.</p>
        </div>
      )}
    </div>
  );
}
