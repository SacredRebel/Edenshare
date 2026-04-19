import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Simple marketing navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#071f13]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-eden-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">Eden<span className="text-eden-400">Share</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary text-sm py-2">Get Started</Link>
          </div>
        </div>
      </nav>
      <main className="pt-14">{children}</main>
    </>
  );
}
