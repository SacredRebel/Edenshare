"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Shield, Users, MoreVertical, UserX, UserCheck, Eye, ArrowLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-amber-500/15 text-amber-400',
  moderator: 'bg-purple-500/15 text-purple-400',
  user: 'bg-gray-500/15 text-gray-400',
};

const TYPE_COLORS: Record<string, string> = {
  producer: 'bg-eden-500/15 text-eden-400',
  seeker: 'bg-sky-500/15 text-sky-400',
  community_leader: 'bg-purple-500/15 text-purple-400',
};

export default function AdminUsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
      setUsers(data || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const changeRole = async (userId: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    setMenuOpen(null);
  };

  const changeUserType = async (userId: string, user_type: string) => {
    await supabase.from('profiles').update({ user_type }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, user_type } : u));
  };

  const filtered = users.filter(u =>
    !search || u.display_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (profile?.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-500 active:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Admin
      </Link>

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-display text-white">Users</h1>
        <span className="text-sm text-gray-500">{users.length} total</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 py-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/[0.05] text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            <span className="col-span-4">User</span>
            <span className="col-span-2">Type</span>
            <span className="col-span-2">Role</span>
            <span className="col-span-2">Joined</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          {filtered.map((u, i) => (
            <div key={u.id} className={`flex md:grid md:grid-cols-12 gap-2 px-4 py-3 items-center ${i < filtered.length - 1 ? 'border-b border-white/[0.03]' : ''}`}>
              {/* User info */}
              <div className="col-span-4 flex items-center gap-3 flex-1 md:flex-none min-w-0">
                <div className="w-9 h-9 rounded-full bg-eden-500/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.display_name || '?')[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{u.display_name || 'Unnamed'}</p>
                  <p className="text-[10px] text-gray-600 truncate">{u.email}</p>
                </div>
              </div>

              {/* Type */}
              <div className="col-span-2 hidden md:block">
                <select value={u.user_type || 'seeker'} onChange={e => changeUserType(u.id, e.target.value)}
                  className="text-[10px] bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-gray-400 appearance-none">
                  <option value="seeker">Seeker</option>
                  <option value="producer">Producer</option>
                  <option value="community_leader">Leader</option>
                </select>
              </div>

              {/* Role */}
              <div className="col-span-2 hidden md:block">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>
                  {u.role || 'user'}
                </span>
              </div>

              {/* Joined */}
              <div className="col-span-2 hidden md:block">
                <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end relative">
                <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)} className="p-2 text-gray-500 active:text-white rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen === u.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-0 top-10 w-40 bg-[#142e1e] border border-white/[0.08] rounded-xl shadow-2xl z-50 py-1">
                      <Link href={`/profile/${u.id}`} onClick={() => setMenuOpen(null)} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/[0.05]">
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </Link>
                      {u.role !== 'admin' && (
                        <button onClick={() => changeRole(u.id, 'admin')} className="flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-white/[0.05] w-full text-left">
                          <Shield className="w-3.5 h-3.5" /> Make Admin
                        </button>
                      )}
                      {u.role === 'admin' && (
                        <button onClick={() => changeRole(u.id, 'user')} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/[0.05] w-full text-left">
                          <UserX className="w-3.5 h-3.5" /> Remove Admin
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
