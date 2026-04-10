"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, ArrowLeft, Shield, MapPin, Paperclip, MoreVertical, Phone, Video, CheckCheck } from 'lucide-react';

const CONVERSATIONS = [
  { id: '1', name: 'Sarah M.', lastMsg: 'Sure, you can arrive on April 5th! I\'ll prepare the barn studio.', time: '2h ago', unread: 2, online: true, verified: true, listing: '5-Acre Permaculture Farm' },
  { id: '2', name: 'Marcus T.', lastMsg: 'Thanks for the tools! I\'ll return the tiller on Friday.', time: '5h ago', unread: 0, online: true, verified: true, listing: 'Tool Library Access' },
  { id: '3', name: 'Elena K.', lastMsg: 'Would love to discuss the eco-village expansion plans.', time: '1d ago', unread: 0, online: false, verified: true, listing: null },
  { id: '4', name: 'James W.', lastMsg: 'The permaculture design for your plot is ready for review.', time: '2d ago', unread: 1, online: false, verified: false, listing: 'Design Consultation' },
];

const MESSAGES = [
  { id: '1', sender: 'them', content: 'Hi! I saw your listing for the permaculture farm. I\'m very interested in the work-exchange program.', time: '10:23 AM', read: true },
  { id: '2', sender: 'me', content: 'Hello! Thanks for reaching out. Tell me a bit about yourself and your experience with farming.', time: '10:45 AM', read: true },
  { id: '3', sender: 'them', content: 'I\'ve been doing urban gardening for 3 years in Brooklyn, and I completed a PDC last year. I\'m looking to get hands-on experience with food forests.', time: '11:02 AM', read: true },
  { id: '4', sender: 'me', content: 'That sounds great! We have a lot of food forest work planned for April-May. Would you be available for a 4-week stay?', time: '11:15 AM', read: true },
  { id: '5', sender: 'them', content: 'Absolutely! I can be there from April 5th through May 3rd. What should I bring?', time: '11:30 AM', read: true },
  { id: '6', sender: 'me', content: 'Perfect timing. Bring work clothes, rain gear, and any personal tools you like. We provide everything else. I\'ll send you the address and arrival details.', time: '11:48 AM', read: true },
  { id: '7', sender: 'them', content: 'Sure, you can arrive on April 5th! I\'ll prepare the barn studio.', time: '12:01 PM', read: false },
];

export default function MessagesPage() {
  const [selectedConvo, setSelectedConvo] = useState(CONVERSATIONS[0]);
  const [message, setMessage] = useState('');
  const [showList, setShowList] = useState(true);

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
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedConvo(c); setShowList(false); }}
              className={`w-full p-4 flex items-start gap-3 hover:bg-white/[0.03] transition-colors text-left ${
                selectedConvo?.id === c.id ? 'bg-white/[0.04] border-l-2 border-eden-500' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-eden-400/20 to-sky-400/20 flex items-center justify-center text-sm font-bold text-white">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-eden-500 rounded-full border-2 border-eden-950" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-white flex items-center gap-1">
                    {c.name} {c.verified && <Shield className="w-3 h-3 text-eden-400" />}
                  </span>
                  <span className="text-[10px] text-gray-500">{c.time}</span>
                </div>
                {c.listing && <div className="text-[10px] text-eden-400/60 mb-0.5">Re: {c.listing}</div>}
                <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 bg-eden-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 mt-1">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className={`flex-1 flex flex-col ${!selectedConvo || showList ? 'hidden md:flex' : 'flex'}`}>
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3 bg-eden-950/50">
              <button onClick={() => setShowList(true)} className="md:hidden p-1 text-gray-400">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-eden-400/20 to-sky-400/20 flex items-center justify-center text-sm font-bold text-white">
                {selectedConvo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white flex items-center gap-1">
                  {selectedConvo.name} {selectedConvo.verified && <Shield className="w-3 h-3 text-eden-400" />}
                </div>
                <div className="text-[10px] text-gray-500">{selectedConvo.online ? 'Online' : 'Last seen recently'}</div>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn-ghost p-2"><Phone className="w-4 h-4" /></button>
                <button className="btn-ghost p-2"><Video className="w-4 h-4" /></button>
                <button className="btn-ghost p-2"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedConvo.listing && (
                <div className="mx-auto card-glass px-4 py-2 text-xs text-gray-500 flex items-center gap-2 w-fit">
                  <MapPin className="w-3 h-3 text-eden-400" />
                  Conversation about: <span className="text-eden-400">{selectedConvo.listing}</span>
                </div>
              )}
              {MESSAGES.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'me'
                      ? 'bg-eden-600/80 text-white rounded-br-md'
                      : 'bg-white/[0.06] text-gray-200 rounded-bl-md'
                  }`}>
                    <p>{msg.content}</p>
                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.sender === 'me' ? 'text-eden-200/60 justify-end' : 'text-gray-500'}`}>
                      {msg.time}
                      {msg.sender === 'me' && <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-eden-300' : 'text-eden-200/40'}`} />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/[0.04] bg-eden-950/50">
              <div className="flex items-center gap-2">
                <button className="btn-ghost p-2.5"><Paperclip className="w-5 h-5" /></button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1 py-2.5"
                  onKeyDown={(e) => e.key === 'Enter' && setMessage('')}
                />
                <button className="w-10 h-10 rounded-xl bg-eden-500 text-white flex items-center justify-center hover:bg-eden-400 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
