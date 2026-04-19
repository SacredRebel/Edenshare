"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, MapPin, Users, Leaf, Shield, Star, X,
  Globe as GlobeIcon, MessageSquare, CheckCircle,
  TreePine, Sprout, HandHeart, Award
} from 'lucide-react';

const EarthGlobe = dynamic(() => import('@/components/globe/EarthGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border-2 border-eden-500/20 animate-pulse flex items-center justify-center">
        <Leaf className="w-6 h-6 text-eden-500" />
      </div>
    </div>
  ),
});

const STATS = [
  { value: '2,400+', label: 'Active Nodes', icon: MapPin },
  { value: '18K+', label: 'Members', icon: Users },
  { value: '850+', label: 'Listings', icon: TreePine },
  { value: '96%', label: 'Trust Rating', icon: Shield },
];

const FEATURES = [
  { icon: GlobeIcon, title: 'Interactive World Map', desc: 'Discover communities on a living globe. Zoom, rotate, and explore regenerative projects worldwide.', color: 'eden' },
  { icon: Shield, title: 'Trust & Verification', desc: 'ID verification, honest reviews, background checks, and transparent safety ratings.', color: 'sky' },
  { icon: HandHeart, title: 'Flexible Exchange', desc: 'Free sharing, work-exchange, trade, or paid — choose what works. Agreements protect both sides.', color: 'purple' },
  { icon: MessageSquare, title: 'Real-Time Messaging', desc: 'Coordinate directly with hosts and seekers. Request threads and community announcements.', color: 'amber' },
  { icon: Sprout, title: 'Land Intelligence', desc: 'Detailed parcel data — soil type, water access, climate zone, zoning. Know before you go.', color: 'eden' },
  { icon: Award, title: 'Reputation System', desc: 'Earn badges, build trust scores, and unlock opportunities across communities.', color: 'sky' },
];

const PAIN_POINTS = [
  { problem: 'Empty platforms with no nearby listings', solution: 'Quality-first supply — we manually onboard initial communities per region' },
  { problem: 'Fake or misleading host descriptions', solution: 'Verified listings with real photos and honest reviews' },
  { problem: 'Censored negative reviews', solution: 'Reviews are permanent and double-sided — no deletions' },
  { problem: 'No safety or identity checks', solution: 'ID verification, video calls, and community references' },
  { problem: 'Unclear work expectations', solution: 'Structured agreements with hours, tasks, and fair terms' },
];

const TESTIMONIALS = [
  { quote: 'Finally a platform that takes trust seriously. The verification gave me confidence to list my farm.', name: 'Sarah M.', role: 'Farm Owner', location: 'Ojai, CA', rating: 5 },
  { quote: 'Found three collaborators in my first week. The globe map makes it easy to discover nearby communities.', name: 'Marcus T.', role: 'Urban Gardener', location: 'Brooklyn, NY', rating: 5 },
  { quote: 'The agreement templates saved us from awkward conversations. Everything is clear upfront.', name: 'Elena K.', role: 'Eco-Village Coordinator', location: 'Ashland, OR', rating: 5 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* ── HERO ───────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col">
        <div className="relative container mx-auto px-4 pt-20 md:pt-24 pb-6 flex-1 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          {/* Copy */}
          <div className="flex-1 max-w-xl text-center lg:text-left">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-eden-500/10 border border-eden-500/20 text-eden-400 text-xs mb-5">
                <Sprout className="w-3.5 h-3.5" />
                <span>Join 18,000+ regenerators worldwide</span>
              </div>
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display text-white mb-4 leading-[1.15] tracking-tight">
              Share Land.{' '}
              <span className="gradient-text">Grow Together.</span>
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-base md:text-lg text-gray-300 leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
              The trusted network connecting communities, landowners, and seekers.
              Find land, share resources, and build regenerative projects.
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/explore" className="btn-primary text-base py-3 flex items-center justify-center gap-2">
                Explore the Globe <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register" className="btn-secondary text-base py-3 flex items-center justify-center gap-2">
                List Your Land
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
              className="flex items-center justify-center lg:justify-start gap-4 mt-6 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-eden-500" /> Verified Hosts</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-eden-500" /> Honest Reviews</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-eden-500" /> Free</span>
            </motion.div>
          </div>

          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex-1 w-full max-w-xl h-[320px] sm:h-[400px] md:h-[500px] lg:h-[550px]"
          >
            <EarthGlobe />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────── */}
      <section className="border-y border-white/[0.05] bg-white/[0.02]">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center">
                <stat.icon className="w-4 h-4 text-eden-500 mx-auto mb-1.5" />
                <div className="text-2xl md:text-3xl font-display text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">How EdenShare Works</h2>
          <p className="section-subtitle mx-auto">Three steps to join the regenerative network</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { step: '01', title: 'Create Your Profile', desc: 'Sign up, verify your identity, and share what you offer or seek.', icon: Users },
            { step: '02', title: 'Discover & Connect', desc: 'Browse the globe, find communities near you, and send requests.', icon: GlobeIcon },
            { step: '03', title: 'Collaborate & Grow', desc: 'Sign agreements, exchange resources, leave reviews, and build reputation.', icon: Sprout },
          ].map((item, i) => (
            <motion.div key={item.step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="card-glass p-6 h-full relative">
                <span className="text-eden-500/20 text-5xl font-display absolute top-3 right-4">{item.step}</span>
                <div className="w-10 h-10 rounded-lg bg-eden-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-eden-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Built for Trust, Designed for Action</h2>
          <p className="section-subtitle mx-auto">Every feature solves a real problem from real communities</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="card-glass p-5 group">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                f.color === 'eden' ? 'bg-eden-500/10 text-eden-400' :
                f.color === 'sky' ? 'bg-sky-500/10 text-sky-400' :
                f.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                <f.icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ────────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">We Listened to the Community</h2>
          <p className="section-subtitle mx-auto">Real problems from Reddit, Discord, and forums — solved</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {PAIN_POINTS.map((pp, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card-glass p-4 md:p-5">
              <div className="flex items-start gap-3 mb-2">
                <X className="w-4 h-4 text-red-400/70 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">{pp.problem}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-eden-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white">{pp.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="section-title">Trusted by Regenerators</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card-glass p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-eden-400 fill-eden-400" />)}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-eden-400/20 flex items-center justify-center text-xs font-bold text-white">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{t.name}</div>
                  <div className="text-[11px] text-gray-500">{t.role} · {t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl bg-eden-900/40 border border-eden-500/10 p-8 md:p-12 text-center">
          <Leaf className="w-10 h-10 text-eden-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-display text-white mb-3">Ready to Join?</h2>
          <p className="text-gray-400 text-sm md:text-base mb-6 max-w-md mx-auto leading-relaxed">
            Whether you have land to share, skills to offer, or are seeking your next project —
            EdenShare is where it starts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary py-3 px-6 flex items-center justify-center gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/explore" className="btn-secondary py-3 px-6 flex items-center justify-center gap-2">
              <GlobeIcon className="w-4 h-4" /> Explore First
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-eden-500 flex items-center justify-center"><Leaf className="w-4 h-4 text-white" /></div>
                <span className="font-bold text-white text-sm">EdenShare</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">A coordination layer for regenerative communities. Part of the Edverse ecosystem.</p>
            </div>
            {[
              { title: 'Platform', links: ['Explore', 'Communities', 'Listings'] },
              { title: 'Company', links: ['About', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Safety'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">{col.links.map(link => <li key={link}><a href="#" className="text-xs text-gray-500 hover:text-eden-400">{link}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.05] pt-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} EdenShare · Edverse Ecosystem
          </div>
        </div>
      </footer>
    </main>
  );
}
