"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, Flag, MessageSquare, TrendingUp, Shield, UserPlus, Eye, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, listings: 0, communities: 0, reports: 0, newUsersWeek: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    const fetch = async () => {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const [u, l, c, r, nw] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('communities').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      ]);
      setStats({ users: u.count || 0, listings: l.count || 0, communities: c.count || 0, reports: r.count || 0, newUsersWeek: nw.count || 0 });
      setLoading(false);
    };
    fetch();
  }, [profile]);

  if (profile?.role !== 'admin') return <div className="p-8 text-center"><Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-500">Admin access required</p></div>;
  if (loading) return <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-xl font-display text-white mb-1">Admin Panel</h1>
      <p className="text-sm text-gray-500 mb-6">Platform overview and moderation</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-sky-400 bg-sky-500/10', sub: `+${stats.newUsersWeek} this week` },
          { label: 'Listings', value: stats.listings, icon: Package, color: 'text-eden-400 bg-eden-500/10' },
          { label: 'Communities', value: stats.communities, icon: MessageSquare, color: 'text-purple-400 bg-purple-500/10' },
          { label: 'Pending Reports', value: stats.reports, icon: Flag, color: stats.reports > 0 ? 'text-red-400 bg-red-500/10' : 'text-gray-400 bg-gray-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color.split(' ')[1]}`}>
              <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
            </div>
            <div className="text-2xl font-display text-white">{s.value}</div>
            <div className="text-[11px] text-gray-500">{s.label}</div>
            {s.sub && <div className="text-[10px] text-eden-400 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { href: '/admin/users', label: 'Manage Users', desc: 'Search, edit roles, suspend', icon: Users, color: 'text-sky-400' },
          { href: '/admin/listings', label: 'Moderate Listings', desc: 'Approve, pause, delete', icon: Package, color: 'text-eden-400' },
          { href: '/admin/reports', label: 'Resolve Reports', desc: `${stats.reports} pending`, icon: Flag, color: stats.reports > 0 ? 'text-red-400' : 'text-gray-400' },
        ].map(l => (
          <Link key={l.href} href={l.href}
            className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl active:bg-white/[0.06] transition-colors">
            <l.icon className={`w-6 h-6 ${l.color}`} />
            <div>
              <p className="text-sm font-medium text-white">{l.label}</p>
              <p className="text-xs text-gray-500">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
