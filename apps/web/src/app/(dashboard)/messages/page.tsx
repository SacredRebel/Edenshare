"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Send, ArrowLeft, MessageSquare, MapPin, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

function formatDay(date: string): string {
  const d = new Date(date);
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d >= today) return 'Today';
  if (d >= yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [showList, setShowList] = useState(true);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data: parts } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
    if (!parts?.length) { setLoadingConvos(false); return; }

    const ids = parts.map(p => p.conversation_id);
    const { data: convos } = await supabase.from('conversations').select('*').in('id', ids).order('last_message_at', { ascending: false });

    const enriched = await Promise.all((convos || []).map(async c => {
      const { data: ps } = await supabase.from('conversation_participants').select('user_id, profiles(display_name, avatar_url)').eq('conversation_id', c.id).neq('user_id', user.id);
      const { data: last } = await supabase.from('messages').select('content, created_at, sender_id, type').eq('conversation_id', c.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      const { count: unread } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('conversation_id', c.id).neq('sender_id', user.id);
      return { ...c, other: (ps?.[0]?.profiles as any), last, unread: unread || 0 };
    }));

    setConversations(enriched);
    setLoadingConvos(false);
  };

  const selectConvo = async (convo: any) => {
    setSelected(convo);
    setShowList(false);
    const { data } = await supabase.from('messages').select('*, profiles!messages_sender_id_fkey(display_name)').eq('conversation_id', convo.id).order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Real-time
  useEffect(() => {
    if (!selected) return;
    const ch = supabase.channel('chat-' + selected.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected.id}` }, async (payload) => {
        const { data } = await supabase.from('messages').select('*, profiles!messages_sender_id_fkey(display_name)').eq('id', payload.new.id).single();
        if (data) { setMessages(prev => [...prev, data]); setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); }
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || !selected) return;
    const content = newMsg.trim();
    setNewMsg('');
    await supabase.from('messages').insert({ conversation_id: selected.id, sender_id: user.id, content });
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selected.id);
  };

  // Group messages by day
  const groupedMessages: { day: string; msgs: any[] }[] = [];
  let lastDay = '';
  for (const msg of messages) {
    const day = formatDay(msg.created_at);
    if (day !== lastDay) { groupedMessages.push({ day, msgs: [msg] }); lastDay = day; }
    else { groupedMessages[groupedMessages.length - 1].msgs.push(msg); }
  }

  return (
    <div className="flex h-[calc(100vh-48px)] lg:h-screen">
      {/* List */}
      <div className={`w-full lg:w-80 xl:w-96 border-r border-white/[0.04] flex flex-col ${selected && !showList ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/[0.04]">
          <h1 className="text-lg font-display text-white mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search..." className="input-field pl-10 py-2 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
          ) : conversations.length > 0 ? conversations.map(c => (
            <button key={c.id} onClick={() => selectConvo(c)}
              className={`w-full p-4 flex items-center gap-3 active:bg-white/[0.04] text-left transition-colors ${selected?.id === c.id ? 'bg-white/[0.04] border-l-2 border-eden-500' : ''}`}>
              <div className="w-11 h-11 rounded-full bg-eden-500/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                {c.other?.avatar_url ? <img src={c.other.avatar_url} alt="" className="w-full h-full object-cover" /> : (c.other?.display_name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm truncate ${c.unread > 0 ? 'font-semibold text-white' : 'text-gray-300'}`}>{c.other?.display_name || 'User'}</span>
                  <span className="text-[10px] text-gray-600 flex-shrink-0">{c.last?.created_at ? formatDay(c.last.created_at) : ''}</span>
                </div>
                {c.title && <p className="text-[10px] text-eden-400/50 truncate mb-0.5">Re: {c.title}</p>}
                <p className={`text-xs truncate ${c.unread > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                  {c.last?.type === 'system' ? c.last.content : c.last?.content || 'No messages'}
                </p>
              </div>
              {c.unread > 0 && <span className="w-5 h-5 bg-eden-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">{c.unread > 9 ? '9+' : c.unread}</span>}
            </button>
          )) : (
            <div className="p-6 text-center">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-600 mt-1">Message someone from a listing to start</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 flex flex-col ${!selected || showList ? 'hidden lg:flex' : 'flex'}`}>
        {selected ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3">
              <button onClick={() => setShowList(true)} className="lg:hidden p-1 text-gray-400"><ArrowLeft className="w-5 h-5" /></button>
              <div className="w-9 h-9 rounded-full bg-eden-500/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                {selected.other?.avatar_url ? <img src={selected.other.avatar_url} alt="" className="w-full h-full object-cover" /> : (selected.other?.display_name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{selected.other?.display_name || 'User'}</p>
                {selected.title && <p className="text-[10px] text-gray-500 truncate">{selected.title}</p>}
              </div>
              {selected.title && (
                <Link href="/marketplace" className="p-2 text-gray-500 active:text-eden-400 rounded-lg">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Context bar */}
            {selected.title && (
              <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-2">
                <MapPin className="w-3 h-3 text-eden-400" />
                <span className="text-xs text-gray-500">About:</span>
                <span className="text-xs text-eden-400/70 truncate">{selected.title}</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {groupedMessages.map(group => (
                <div key={group.day}>
                  {/* Day separator */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-white/[0.05]" />
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">{group.day}</span>
                    <div className="flex-1 h-px bg-white/[0.05]" />
                  </div>

                  {group.msgs.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    const isSystem = msg.type === 'system';
                    // Group consecutive messages from same sender
                    const prevMsg = i > 0 ? group.msgs[i - 1] : null;
                    const showAvatar = !isMe && !isSystem && (!prevMsg || prevMsg.sender_id !== msg.sender_id || prevMsg.type === 'system');

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-3">
                          <span className="text-[10px] text-gray-600 bg-white/[0.02] px-3 py-1 rounded-full">{msg.content}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : ''}`}>
                        {!isMe && showAvatar && (
                          <div className="w-7 h-7 rounded-full bg-eden-500/20 flex items-center justify-center text-[9px] font-bold text-white mr-2 mt-1 flex-shrink-0 overflow-hidden">
                            {selected.other?.avatar_url ? <img src={selected.other.avatar_url} alt="" className="w-full h-full object-cover" /> : (selected.other?.display_name || '?')[0]}
                          </div>
                        )}
                        {!isMe && !showAvatar && <div className="w-7 mr-2 flex-shrink-0" />}
                        <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMe ? 'bg-eden-600/80 text-white rounded-br-md' : 'bg-white/[0.06] text-gray-200 rounded-bl-md'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-[9px] mt-0.5 ${isMe ? 'text-eden-200/50 text-right' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/[0.04] safe-bottom">
              <div className="flex items-center gap-2">
                <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..."
                  className="input-field flex-1 py-2.5 text-sm" onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage} disabled={!newMsg.trim()}
                  className="w-10 h-10 rounded-xl bg-eden-500 text-white flex items-center justify-center active:bg-eden-400 disabled:opacity-30 transition-colors flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
