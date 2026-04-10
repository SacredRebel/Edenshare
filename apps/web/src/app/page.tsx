"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, MapPin, Users, Leaf, Shield, Star, Zap, X,
  Globe as GlobeIcon, MessageSquare, CheckCircle, Heart,
  TreePine, Sprout, HandHeart, TrendingUp, Award
} from 'lucide-react';

const EarthGlobe = dynamic(() => import('./components/globe/EarthGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-2 border-eden-500/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="w-8 h-8 text-eden-500 animate-float" />
        </div>
      </div>
    </div>
  ),
});

const STATS = [
  { value: '2,400+', label: 'Active Nodes', icon: MapPin },
  { value: '18K+', label: 'Community Members', icon: Users },
  { value: '850+', label: 'Land Listings', icon: TreePine },
  { value: '96%', label: 'Trust Rating', icon: Shield },
];

const FEATURES = [
  {
    icon: GlobeIcon,
    title: 'Interactive World Map',
    desc: 'Discover communities as nodes on a living globe. Zoom, rotate, and click to explore regenerative projects worldwide.',
    color: 'eden',
  },
  {
    icon: Shield,
    title: 'Trust & Verification',
    desc: 'ID verification, double-sided reviews that can\'t be deleted, background checks, and transparent safety ratings.',
    color: 'sky',
  },
  {
    icon: HandHeart,
    title: 'Flexible Exchange',
    desc: 'Free sharing, work-exchange, trade, or paid — choose the model that works. Built-in agreements protect both sides.',
    color: 'purple',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Messaging',
    desc: 'Coordinate directly with hosts and seekers. Request threads, group chats, and community announcements.',
    color: 'amber',
  },
  {
    icon: Sprout,
    title: 'Land Intelligence',
    desc: 'Detailed parcel data — soil type, water access, climate zone, zoning. Know before you go.',
    color: 'eden',
  },
  {
    icon: Award,
    title: 'Reputation System',
    desc: 'Earn badges, build trust scores, and unlock opportunities. Your reputation travels with you across communities.',
    color: 'sky',
  },
];

const PAIN_POINTS = [
  { problem: 'Empty platforms with no nearby listings', solution: 'Curated, quality-first supply — we manually onboard initial communities per region' },
  { problem: 'Fake or misleading host descriptions', solution: 'Verified listings with real photos, mandatory details, and honest reviews' },
  { problem: 'Censored negative reviews', solution: 'Reviews are permanent and double-sided — no deletions, no retaliation' },
  { problem: 'No safety or identity checks', solution: 'ID verification, video calls, background checks, and community references' },
  { problem: 'Unclear work expectations', solution: 'Structured agreements with hours, tasks, accommodations, and fair compensation terms' },
];

const TESTIMONIALS = [
  {
    quote: 'Finally a platform that takes trust seriously. The verification process gave me confidence to list my farm.',
    name: 'Sarah M.',
    role: 'Permaculture Farm Owner',
    location: 'Ojai, CA',
    rating: 5,
  },
  {
    quote: 'I found three collaborators within my first week. The globe map makes it so easy to discover communities near me.',
    name: 'Marcus T.',
    role: 'Urban Gardener',
    location: 'Brooklyn, NY',
    rating: 5,
  },
  {
    quote: 'The agreement templates saved us from the awkward "what are the expectations" conversation. Everything is clear upfront.',
    name: 'Elena K.',
    role: 'Eco-Village Coordinator',
    location: 'Ashland, OR',
    rating: 5,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-eden-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-sky-500/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 pt-24 pb-8 flex-1 flex flex-col lg:flex-row items-center gap-8">
          {/* Left: Copy */}
          <div className="flex-1 max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eden-500/10 border border-eden-500/20 text-eden-400 text-sm mb-6">
                <Sprout className="w-4 h-4" />
                <span>Join 18,000+ regenerators worldwide</span>
              </div>
            </motion.div>

            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-5xl md:text-6xl lg:text-7xl font-display text-white mb-6 leading-[1.1] tracking-tight"
            >
              Share Land.{' '}
              <span className="gradient-text">Grow Together.</span>
            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-xl text-gray-400 leading-relaxed mb-8 max-w-lg"
            >
              The trusted network connecting communities, landowners, and seekers.
              Find land, share resources, and build regenerative projects — anywhere on Earth.
            </motion.p>

            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/explore" className="btn-primary text-base flex items-center justify-center gap-2">
                Explore the Globe
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register" className="btn-secondary text-base flex items-center justify-center gap-2">
                List Your Land
              </Link>
            </motion.div>

            {/* Mini trust signals */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={4}
              className="flex items-center gap-6 mt-8 text-sm text-gray-500"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-eden-500" />
                <span>ID Verified Hosts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-eden-500" />
                <span>Honest Reviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-eden-500" />
                <span>Free to Join</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full max-w-2xl h-[500px] md:h-[600px]"
          >
            <EarthGlobe />
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────── */}
      <section className="relative border-y border-white/[0.04] bg-white/[0.01]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-5 h-5 text-eden-500 mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-display text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">How EdenShare Works</h2>
          <p className="section-subtitle mx-auto">Three steps to join the global regenerative network</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Create Your Profile', desc: 'Sign up, verify your identity, and tell the community what you offer or seek.', icon: Users },
            { step: '02', title: 'Discover & Connect', desc: 'Browse the globe, find communities near you, and send requests to hosts.', icon: GlobeIcon },
            { step: '03', title: 'Collaborate & Grow', desc: 'Sign agreements, exchange resources, leave reviews, and build your reputation.', icon: Sprout },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="card-glass p-8 h-full">
                <div className="text-eden-500/30 text-6xl font-display absolute top-4 right-6">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-eden-500/10 border border-eden-500/20 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-eden-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────── */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Built for Trust, Designed for Action</h2>
          <p className="section-subtitle mx-auto">Every feature addresses real problems from real communities</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-glass-hover p-7 group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                f.color === 'eden' ? 'bg-eden-500/10 text-eden-400' :
                f.color === 'sky' ? 'bg-sky-500/10 text-sky-400' :
                f.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-eden-400 transition-colors">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS → SOLUTIONS ──────────────── */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">We Listened to the Community</h2>
          <p className="section-subtitle mx-auto">Real problems from Reddit, Discord, and forums — solved in EdenShare</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {PAIN_POINTS.map((pp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-glass p-6 flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-red-400/80 text-sm font-medium mb-1">
                  <X className="w-4 h-4" />
                  <span>Problem</span>
                </div>
                <p className="text-gray-300">{pp.problem}</p>
              </div>
              <div className="hidden md:block w-px bg-white/[0.06]" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-eden-400 text-sm font-medium mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>EdenShare Solution</span>
                </div>
                <p className="text-gray-300">{pp.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">Trusted by Regenerators</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-glass p-7"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-eden-400 fill-eden-400" />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eden-400/30 to-sky-400/30 flex items-center justify-center text-sm font-bold text-white">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role} · {t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────── */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-eden-900/50 via-eden-950/80 to-eden-950 border border-eden-500/10 p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-eden-500/[0.08] via-transparent to-transparent" />
          <div className="relative max-w-2xl mx-auto">
            <Leaf className="w-12 h-12 text-eden-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
              Ready to Join the Network?
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Whether you have land to share, skills to offer, or are seeking your next regenerative project —
              EdenShare is where it starts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="btn-primary text-base px-8 flex items-center justify-center gap-2">
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/explore" className="btn-secondary text-base px-8 flex items-center justify-center gap-2">
                <GlobeIcon className="w-4 h-4" />
                Explore First
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eden-400 to-eden-600 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">EdenShare</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                A coordination layer for regenerative communities. Part of the Edverse ecosystem.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Explore', 'Communities', 'Listings', 'Map View'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Safety', 'Guidelines'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-medium text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 hover:text-eden-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.04] pt-8 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} EdenShare · Part of the Edverse Ecosystem
          </div>
        </div>
      </footer>
    </main>
  );
}
