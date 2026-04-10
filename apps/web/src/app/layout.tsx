import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from './components/shared/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'EdenShare — Connect Communities, Share Land, Build Together',
  description: 'A global network connecting communities, landowners, and seekers. Discover land, share resources, and build regenerative communities.',
  keywords: ['land sharing', 'community', 'permaculture', 'regenerative', 'farming', 'resources'],
  openGraph: {
    title: 'EdenShare',
    description: 'Connect Communities, Share Land, Build Together',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Navbar />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(4, 40, 24, 0.95)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  );
}
