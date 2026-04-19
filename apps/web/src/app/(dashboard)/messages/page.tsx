"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Send, ArrowLeft, Shield, Paperclip, MoreVertical, CheckCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showList, setShowList] = useState(true);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!user) return;
    fetchConversations();
  }, [user, authLoading]);

  const fetchConversations = async () => {
    if (!user) return;
    // Get conversations the user participates in
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (!parts || parts.length === 0) { setLoadingConvos(false); return; }

    const convoIds = parts.map(p => p.conversation_id);
    const { data: convos } = await supabase
      .from('conversations')
      .select('*')
      .in('id', convoIds)
      .order('last_message_at', { ascending: false });

    // For each conversation, get the other participant and last message
    const enriched = await Promise.all((convos || []).map(async (c) => {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id, profiles(display_name, avatar_url)')
        .eq('conversation_id', c.id)
        .neq('user_id', user.id);

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', c.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const other = participants?.[0]?.profiles as any;
      return { ...c, other_user: other, last_message: lastMsg };
    }));

    setConversations(enriched);
    setLoadingConvos(false);
  };

  const selectConversation = async (convo: any) => {
    setSelectedConvo(convo);
    setShowList(false);

    // Fetch messages
    const { data } = await supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(display_name, avatar_url)')
      .eq('conversation_id', convo.id)
      .order('created_at', { ascending: true });

    setMessages(data || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Realtime subscription
  useEffect(() => {
    if (!selectedConvo) return;

    const channel = supabase
      .channel(`messages:${selectedConvo.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConvo.id}`,
      }, async (payload) => {
        // Fetch full message with profile
        const { data } = await supabase
          .from('messages')
          .select('*, profiles!messages_sender_id_fkey(display_name, avatar_url)')
          .eq('id', payload.new.id)
          .single();
        if (data) {
          setMessages(prev => [...prev, data]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConvo]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConvo) return;
    const content = newMessage.trim();
    setNewMessage('');

    await supabase.from('messages').insert({
      conversation_id: selectedConvo.id,
      sender_id: user.id,
      content,
    });

    // Update conversation last_message_at
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selectedConvo.id);
  };

  if (authLoading) return <div className="min-h-screen pt-16 flex items-center justify-center"><div className="w-8 h-8 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="h-screen pt-16 flex">
      {/* Conversation List */}
      <div className={`w-full md:w-96 border-r border-white/[0.04] flex flex-col bg-eden-950/50 ${selectedConvo && !showList ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/[0.04]">
          <h1 className="text-lg font-display text-white mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search conversations..." className="input-field pl-10 py-2.5 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-eden-500/30 border-t-eden-500 rounded-full animate-spin" /></div>
          ) : conversations.length > 0 ? (
            conversations.map(c => (
              <button key={c.id} onClick={() => selectConversation(c)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-white/[0.03] transition-colors text-left ${selectedConvo?.id === c.id ? 'bg-white/[0.04] border-l-2 border-eden-500' : ''}`}>
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-eden-400/20 to-sky-400/20 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden">
                  {c.other_user?.avatar_url ? <img src={c.other_user.avatar_url} alt="" className="w-full h-full object-cover" /> : (c.other_user?.display_name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-white truncate">{c.other_user?.display_name || 'User'}</span>
                    <span className="text-[10px] text-gray-500">{c.last_message?.created_at ? new Date(c.last_message.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  {c.title && <div className="text-[10px] text-eden-400/60 mb-0.5">Re: {c.title}</div>}
                  <p className="text-xs text-gray-500 truncate">{c.last_message?.content || 'No messages yet'}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              No conversations yet. Send a message from a listing to start chatting.
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 flex flex-col ${!selectedConvo || showList ? 'hidden md:flex' : 'flex'}`}>
        {selectedConvo ? (
          <>
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3 bg-eden-950/50">
              <button onClick={() => setShowList(true)} className="md:hidden p-1 text-gray-400"><ArrowLeft className="w-5 h-5" /></button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eden-400/20 to-sky-400/20 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                {selectedConvo.other_user?.avatar_url ? <img src={selectedConvo.other_user.avatar_url} alt="" className="w-full h-full object-cover" /> : (selectedConvo.other_user?.display_name || '?')[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{selectedConvo.other_user?.display_name || 'User'}</div>
                {selectedConvo.title && <div className="text-[10px] text-gray-500">{selectedConvo.title}</div>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender_id === user.id ? 'bg-eden-600/80 text-white rounded-br-md' : 'bg-white/[0.06] text-gray-200 rounded-bl-md'
                  }`}>
                    <p>{msg.content}</p>
                    <div className={`text-[10px] mt-1 ${msg.sender_id === user.id ? 'text-eden-200/60 text-right' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/[0.04] bg-eden-950/50">
              <div className="flex items-center gap-2">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..."
                  className="input-field flex-1 py-2.5" onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage} disabled={!newMessage.trim()} className="w-10 h-10 rounded-xl bg-eden-500 text-white flex items-center justify-center hover:bg-eden-400 transition-colors disabled:opacity-30">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
