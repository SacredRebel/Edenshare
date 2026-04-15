"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Leaf, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-eden-400 to-eden-600 flex items-center justify-center"><Leaf className="w-7 h-7 text-white" /></div>
            <span className="text-2xl font-bold text-white">EdenShare</span>
          </Link>
        </div>
        <div className="card-glass p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-eden-500/20 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-eden-400" /></div>
              <h1 className="text-xl font-display text-white mb-2">Check your email</h1>
              <p className="text-gray-400 text-sm">We sent a password reset link to <strong className="text-white">{email}</strong></p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-display text-white mb-2">Reset your password</h1>
              <p className="text-gray-400 text-sm mb-6">Enter your email and we&apos;ll send a reset link.</p>
              {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="relative mb-4">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-10" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center mt-6"><Link href="/login" className="text-sm text-gray-500 hover:text-eden-400 flex items-center justify-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Sign In</Link></p>
      </motion.div>
    </div>
  );
}
