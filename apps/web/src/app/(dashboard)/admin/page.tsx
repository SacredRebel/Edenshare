"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Users, MapPin, Flag, AlertTriangle, CheckCircle, XCircle, Eye, Ban, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'reports' | 'users' | 'listings'>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, listings: 0, communities: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }
    if (!user) return;
    fetchData();
  }, [user, profile, authLoading]);

  const fetchData = async () => {
    const { data: r } = await supabase.from('reports').select('*, profiles!reports_reporter_id_fkey(display_name)').order('created_at', { ascending: false }).limit(50);
    const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    const { data: l } = await supabase.from('listings').select('*, profiles!listings_creator_id_fkey(display_name)').order('created_at', { ascending: false }).limit(100);

    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: listingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
    const { count: communityCount } = await supabase.from('communities').select('*', { count: 'exact', head: true });
    const { count: reportCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    setReports(r || []);
    setUsers(u || []);
    setListings(l || []);
    setStats({ users: userCount || 0, listings: listingCount || 0, communities: communityCount || 0, reports: reportCount || 0 });
    setLoading(false);
  };

  const resolveReport = async (id: string, status: 'resolved' | 'dismissed') => {
    await supabase.from('reports').update({ status }).eq('id', id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const toggleListingStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await supabase.from('listings').update({ status: newStatus }).eq('id', id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const updateUserRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  if (authLoading || loading) return <div className="min-h-screen pt-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;
  if (profile?.role !== 'admin') return null;

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-display text-white mb-2 flex items-center gap-2"><Shield className="w-6 h-6 text-eden-400" /> Admin Panel</h1>
        <p className="text-gray-500 mb-8">Manage users, listings, and reports</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Users', value: stats.users, icon: Users, color: 'eden' },
            { label: 'Listings', value: stats.listings, icon: MapPin, color: 'sky' },
            { label: 'Communities', value: stats.communities, icon: Users, color: 'purple' },
            { label: 'Pending Reports', value: stats.reports, icon: Flag, color: 'amber' },
          ].map(s => (
            <div key={s.label} className="card-glass p-5">
              <s.icon className={`w-5 h-5 mb-2 ${s.color === 'eden' ? 'text-eden-400' : s.color === 'sky' ? 'text-sky-400' : s.color === 'purple' ? 'text-purple-400' : 'text-amber-400'}`} />
              <div className="text-2xl font-display text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 mb-6">
          {(['reports', 'users', 'listings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-eden-500/20 text-eden-400' : 'text-gray-500 hover:text-white'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'reports' && stats.reports > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.reports}</span>}
            </button>
          ))}
        </div>

        {/* Reports */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="card-glass p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : r.status === 'resolved' ? 'bg-eden-500/15 text-eden-400' : 'bg-gray-500/15 text-gray-400'}`}>{r.status}</span>
                      <span className="text-xs text-gray-500 capitalize">{r.type} report</span>
                    </div>
                    <p className="text-sm text-white mb-1">{r.message}</p>
                    <p className="text-xs text-gray-500">By {r.profiles?.display_name || 'Unknown'} · {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => resolveReport(r.id, 'resolved')} className="p-2 bg-eden-500/10 text-eden-400 rounded-lg hover:bg-eden-500/20"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => resolveReport(r.id, 'dismissed')} className="p-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20"><XCircle className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-500 text-center py-12">No reports</p>}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="card-glass overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.04]">
                <th className="text-left text-xs text-gray-500 px-4 py-3">User</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Email</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Role</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Joined</th>
                <th className="text-left text-xs text-gray-500 px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-eden-400/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.display_name || '?')[0]}
                      </div>
                      <span className="text-sm text-white">{u.display_name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <select value={u.role || 'user'} onChange={e => updateUserRole(u.id, e.target.value)}
                        className="text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-gray-300">
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-gray-500 hover:text-red-400"><Ban className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Listings */}
        {tab === 'listings' && (
          <div className="space-y-3">
            {listings.map(l => (
              <div key={l.id} className="card-glass p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.status === 'active' ? 'bg-eden-500/15 text-eden-400' : l.status === 'draft' ? 'bg-gray-500/15 text-gray-400' : 'bg-amber-500/15 text-amber-400'}`}>{l.status}</span>
                    <span className="text-xs text-gray-600 capitalize">{l.type}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white truncate">{l.title}</h3>
                  <p className="text-xs text-gray-500">By {l.profiles?.display_name || 'Unknown'}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleListingStatus(l.id, l.status)} className={`text-xs px-3 py-1.5 rounded-lg ${l.status === 'active' ? 'bg-amber-500/10 text-amber-400' : 'bg-eden-500/10 text-eden-400'}`}>
                    {l.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <a href={`/listings/${l.id}`} className="text-xs px-3 py-1.5 bg-white/[0.04] text-gray-400 rounded-lg hover:text-white"><Eye className="w-4 h-4" /></a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
