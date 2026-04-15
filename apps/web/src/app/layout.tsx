import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from './components/shared/Navbar';
import { AuthProvider } from '../lib/auth-context';

export const metadata: Metadata = {
  title: 'EdenShare — Connect Communities, Share Land, Build Together',
  description: 'A global network connecting communities, landowners, and seekers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
