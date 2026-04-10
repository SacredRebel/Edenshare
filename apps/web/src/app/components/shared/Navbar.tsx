"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Globe, MapPin, Users, Leaf, LogIn, UserPlus,
  Bell, MessageSquare, Search, ChevronDown, Compass, Shield,
  LayoutDashboard
} from 'lucide-react';

const navLinks = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/listings', label: 'Listings', icon: MapPin },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn] = useState(false); // Toggle for demo

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-eden-950/70 backdrop-blur-2xl border-b border-white/[0.04]" />
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eden-400 to-eden-600 flex items-center justify-center shadow-lg shadow-eden-500/20 group-hover:shadow-eden-500/40 transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-none tracking-tight">
                Eden<span className="text-eden-400">Share</span>
              </span>
              <span className="text-[10px] text-gray-500 leading-none tracking-widest uppercase">by Edverse</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all duration-200"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <button className="btn-ghost relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">3</span>
                </button>
                <Link href="/dashboard" className="btn-ghost">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <Link href="/profile" className="ml-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eden-400 to-sky-400 ring-2 ring-eden-500/20 hover:ring-eden-500/40 transition-all" />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm flex items-center gap-2">
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-eden-950/95 backdrop-blur-2xl border-b border-white/[0.04]"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
                >
                  <link.icon className="w-5 h-5 text-eden-500" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsOpen(false)} className="btn-secondary text-center">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center">
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
