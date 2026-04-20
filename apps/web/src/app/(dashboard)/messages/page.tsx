"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Send, ArrowLeft, MessageSquare, MapPin, ExternalLink, Image as ImageIcon, X, CheckCheck, Check as CheckIcon } from 'lucide-react';
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

function timeAgo(date: string): string {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [showList, setShowList] = useState(true);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data: parts } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
    if (!parts?.length) { setLoadingConvos(false); return; }

    const ids = parts.map(p => p.conversation_id);
    const { data: convos } = await supabase.from('conversations').select('*').in('id', ids).order('last_message_at', { ascending: false });

    const enriched = await Promise.all((convos || []).map(async c => {
      const { data: ps } = await supabase.from('conversation_participants').select('user_id, profiles(display_name, avatar_url, last_seen_at)').eq('conversation_id', c.id).neq('user_id', user.id);
      const { data: last } = await supabase.from('messages').select('content, created_at, sender_id, type, image_url').eq('conversation_id', c.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      const otherProfile = ps?.[0]?.profiles as any;
      const isOnline = otherProfile?.last_seen_at && (Date.now() - new Date(otherProfile.last_seen_at).getTime()) < 300000; // 5 min
      return { ...c, other: otherProfile, otherId: ps?.[0]?.user_id, last, isOnline };
    }));

    setConversations(enriched);
    setLoadingConvos(false);
  };

  const selectConvo = async (convo: any) => {
    setSelected(convo);
    setShowList(false);
    setOtherTyping(false);
    const { data } = await supabase.from('messages').select('*, profiles!messages_sender_id_fkey(display_name)').eq('conversation_id', convo.id).order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    // Mark messages as read
    if (user) {
      await supabase.from('messages').update({ is_read: true }).eq('conversation_id', convo.id).neq('sender_id', user.id).eq('is_read', false);
    }
  };

  // Real-time messages + typing
  useEffect(() => {
    if (!selected) return;
    const ch = supabase.channel('chat-' + selected.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected.id}` }, async (payload) => {
        const { data } = await supabase.from('messages').select('*, profiles!messages_sender_id_fkey(display_name)').eq('id', payload.new.id).single();
        if (data) {
          setMessages(prev => [...prev, data]);
          setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          // Mark as read if from other
          if (data.sender_id !== user?.id) {
            await supabase.from('messages').update({ is_read: true }).eq('id', data.id);
          }
        }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.user_id !== user?.id) {
          setOtherTyping(true);
          setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected, user]);

  // Update own presence
  useEffect(() => {
    if (!user) return;
    const updatePresence = () => supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id);
    updatePresence();
    const interval = setInterval(updatePresence, 60000); // every minute
    return () => clearInterval(interval);
  }, [user]);

  const handleTyping = () => {
    if (!selected) return;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    supabase.channel('chat-' + selected.id).send({ type: 'broadcast', event: 'typing', payload: { user_id: user?.id } });
    typingTimeout.current = setTimeout(() => {}, 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if ((!newMsg.trim() && !imageFile) || !user || !selected) return;
    const content = newMsg.trim();
    setNewMsg('');

    let image_url = null;
    if (imageFile) {
      setUploading(true);
      const path = `messages/${selected.id}/${Date.now()}-${imageFile.name}`;
      const { error } = await supabase.storage.from('chat-images').upload(path, imageFile);
      if (!error) {
        const { data } = supabase.storage.from('chat-images').getPublicUrl(path);
        image_url = data.publicUrl;
      }
      setImageFile(null);
      setImagePreview('');
      setUploading(false);
    }

    await supabase.from('messages').insert({
      conversation_id: selected.id, sender_id: user.id,
      content: content || (image_url ? '📷 Photo' : ''),
      image_url, is_read: false,
    });
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

  const filteredConvos = conversations.filter(c =>
    !searchQuery || c.other?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-48px)] lg:h-screen">
      {/* Conversation List */}
      <div className={`w-full lg:w-80 xl:w-96 border-r border-white/[0.04] flex flex-col ${selected && !showList ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/[0.04]">
          <h1 className="text-lg font-display text-white mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field pl-10 py-2 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
          ) : filteredConvos.length > 0 ? filteredConvos.map(c => (
            <button key={c.id} onClick={() => selectConvo(c)}
              className={`w-full p-4 flex items-center gap-3 active:bg-white/[0.04] text-left transition-colors ${selected?.id === c.id ? 'bg-white/[0.04] border-l-2 border-eden-500' : ''}`}>
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-eden-500/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                  {c.other?.avatar_url ? <img src={c.other.avatar_url} alt="" className="w-full h-full object-cover" /> : (c.other?.display_name || '?')[0]}
                </div>
                {/* Online dot */}
                {c.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-eden-400 rounded-full border-2 border-[#0a1a10]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm truncate text-gray-300 font-medium">{c.other?.display_name || 'User'}</span>
                  <span className="text-[10px] text-gray-600 flex-shrink-0">{c.last?.created_at ? timeAgo(c.last.created_at) : ''}</span>
                </div>
                {c.title && <p className="text-[10px] text-eden-400/40 truncate mb-0.5">Re: {c.title}</p>}
                <p className="text-xs truncate text-gray-500">
                  {c.last?.sender_id === user?.id && <span className="text-gray-600">You: </span>}
                  {c.last?.image_url ? '📷 Photo' : c.last?.type === 'system' ? c.last.content : c.last?.content || 'No messages'}
                </p>
              </div>
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

      {/* Chat View */}
      <div className={`flex-1 flex flex-col ${!selected || showList ? 'hidden lg:flex' : 'flex'}`}>
        {selected ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3">
              <button onClick={() => setShowList(true)} className="lg:hidden p-1 text-gray-400"><ArrowLeft className="w-5 h-5" /></button>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-eden-500/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                  {selected.other?.avatar_url ? <img src={selected.other.avatar_url} alt="" className="w-full h-full object-cover" /> : (selected.other?.display_name || '?')[0]}
                </div>
                {selected.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-eden-400 rounded-full border-2 border-[#0a1a10]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{selected.other?.display_name || 'User'}</p>
                <p className="text-[10px] text-gray-500">
                  {otherTyping ? <span className="text-eden-400">typing...</span> : selected.isOnline ? <span className="text-eden-400/60">online</span> : selected.title || 'offline'}
                </p>
              </div>
              {selected.otherId && (
                <Link href={`/profile/${selected.otherId}`} className="p-2 text-gray-500 active:text-white rounded-lg">
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
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Start the conversation</p>
                </div>
              )}
              {groupedMessages.map(group => (
                <div key={group.day}>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-white/[0.05]" />
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">{group.day}</span>
                    <div className="flex-1 h-px bg-white/[0.05]" />
                  </div>
                  {group.msgs.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    const isSystem = msg.type === 'system';
                    const prevMsg = i > 0 ? group.msgs[i - 1] : null;
                    const showAvatar = !isMe && !isSystem && (!prevMsg || prevMsg.sender_id !== msg.sender_id || prevMsg.type === 'system');

                    if (isSystem) {
                      return <div key={msg.id} className="text-center my-3"><span className="text-[10px] text-gray-600 bg-white/[0.02] px-3 py-1 rounded-full">{msg.content}</span></div>;
                    }

                    return (
                      <div key={msg.id} className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : ''}`}>
                        {!isMe && showAvatar && (
                          <div className="w-7 h-7 rounded-full bg-eden-500/20 flex items-center justify-center text-[9px] font-bold text-white mr-2 mt-1 flex-shrink-0 overflow-hidden">
                            {selected.other?.avatar_url ? <img src={selected.other.avatar_url} alt="" className="w-full h-full object-cover" /> : (selected.other?.display_name || '?')[0]}
                          </div>
                        )}
                        {!isMe && !showAvatar && <div className="w-7 mr-2 flex-shrink-0" />}
                        <div className={`max-w-[78%] ${msg.image_url ? '' : `px-3.5 py-2 rounded-2xl ${isMe ? 'bg-eden-600/80 text-white rounded-br-md' : 'bg-white/[0.06] text-gray-200 rounded-bl-md'}`}`}>
                          {msg.image_url && (
                            <div className={`rounded-2xl overflow-hidden mb-1 max-w-[240px] ${isMe ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                              <img src={msg.image_url} alt="" className="w-full rounded-2xl cursor-pointer" onClick={() => window.open(msg.image_url, '_blank')} />
                            </div>
                          )}
                          {msg.content && msg.content !== '📷 Photo' && <p className={`text-sm leading-relaxed ${msg.image_url ? `px-3.5 py-2 rounded-2xl ${isMe ? 'bg-eden-600/80 text-white rounded-br-md' : 'bg-white/[0.06] text-gray-200 rounded-bl-md'}` : ''}`}>{msg.content}</p>}
                          <div className={`flex items-center gap-1 mt-0.5 ${msg.image_url ? 'px-1' : ''} ${isMe ? 'justify-end' : ''}`}>
                            <span className={`text-[9px] ${isMe ? 'text-eden-200/50' : 'text-gray-600'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              msg.is_read
                                ? <CheckCheck className="w-3 h-3 text-eden-300/60" />
                                : <CheckIcon className="w-3 h-3 text-eden-200/30" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Typing indicator */}
              {otherTyping && (
                <div className="flex items-center gap-2 mt-2 ml-9">
                  <div className="bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="px-4 py-2 border-t border-white/[0.04]">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="" className="h-20 rounded-xl" />
                  <button onClick={() => { setImageFile(null); setImagePreview(''); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/[0.04] safe-bottom">
              <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 active:text-eden-400 rounded-lg flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <input type="text" value={newMsg} onChange={e => { setNewMsg(e.target.value); handleTyping(); }} placeholder="Type a message..."
                  className="input-field flex-1 py-2.5 text-sm" onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage} disabled={(!newMsg.trim() && !imageFile) || uploading}
                  className="w-10 h-10 rounded-xl bg-eden-500 text-white flex items-center justify-center active:bg-eden-400 disabled:opacity-30 transition-colors flex-shrink-0">
                  {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" /><p className="text-sm text-gray-500">Select a conversation</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
