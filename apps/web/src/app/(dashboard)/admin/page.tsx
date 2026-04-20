"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, Flag, MessageSquare, Shield, BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

function MiniBarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md transition-all" style={{ height: `${maxVal > 0 ? (d.value / maxVal) * 80 : 4}px`, backgroundColor: d.color, minHeight: 4 }} />
          <span className="text-[8px] text-gray-600 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, listings: 0, communities: 0, reports: 0, newUsersWeek: 0 });
  const [signupsByDay, setSignupsByDay] = useState<{ label: string; value: number; color: string }[]>([]);
  const [listingsByType, setListingsByType] = useState<{ label: string; value: number; color: string }[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    const fetch = async () => {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const [u, l, c, r, nw] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).neq('status', 'archived'),
        supabase.from('communities').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      ]);
      setStats({ users: u.count || 0, listings: l.count || 0, communities: c.count || 0, reports: r.count || 0, newUsersWeek: nw.count || 0 });

      // Signups by day (last 7 days)
      const { data: allUsers } = await supabase.from('profiles').select('created_at').gte('created_at', weekAgo.toISOString()).order('created_at', { ascending: true });
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
      }
      (allUsers || []).forEach(u => {
        const day = new Date(u.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        if (days[day] !== undefined) days[day]++;
      });
      setSignupsByDay(Object.entries(days).map(([label, value]) => ({ label, value, color: '#3ec878' })));

      // Listings by type
      const { data: allListings } = await supabase.from('listings').select('type').neq('status', 'archived');
      const types: Record<string, number> = {};
      (allListings || []).forEach(l => { types[l.type] = (types[l.type] || 0) + 1; });
      const typeColors: Record<string, string> = { land: '#3ec878', resource: '#60b9fa', service: '#c084fc' };
      setListingsByType(Object.entries(types).map(([label, value]) => ({ label, value, color: typeColors[label] || '#6b7280' })));

      // Recent signups
      const { data: recent } = await supabase.from('profiles').select('id, display_name, avatar_url, created_at, user_type').order('created_at', { ascending: false }).limit(5);
      setRecentUsers(recent || []);

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

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-eden-400" /> Signups (7 days)</h2>
            <span className="text-xs text-gray-500">+{stats.newUsersWeek} total</span>
          </div>
          <MiniBarChart data={signupsByDay} maxVal={Math.max(...signupsByDay.map(d => d.value), 1)} />
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-sky-400" /> Listings by Type</h2>
          </div>
          <MiniBarChart data={listingsByType} maxVal={Math.max(...listingsByType.map(d => d.value), 1)} />
        </div>
      </div>

      {/* Recent users + quick links */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent signups */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-eden-400">View all</Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {recentUsers.map(u => (
              <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 p-3 active:bg-white/[0.04]">
                <div className="w-8 h-8 rounded-full bg-eden-500/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.display_name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.display_name || 'Unnamed'}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{u.user_type || 'seeker'}</p>
                </div>
                <span className="text-[10px] text-gray-600">{new Date(u.created_at).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          {[
            { href: '/admin/users', label: 'Manage Users', desc: `${stats.users} total users`, icon: Users, color: 'text-sky-400' },
            { href: '/admin/listings', label: 'Moderate Listings', desc: `${stats.listings} listings`, icon: Package, color: 'text-eden-400' },
            { href: '/admin/reports', label: 'Resolve Reports', desc: `${stats.reports} pending`, icon: Flag, color: stats.reports > 0 ? 'text-red-400' : 'text-gray-400' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl active:bg-white/[0.06] transition-colors">
              <l.icon className={`w-5 h-5 ${l.color}`} />
              <div><p className="text-sm font-medium text-white">{l.label}</p><p className="text-xs text-gray-500">{l.desc}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
