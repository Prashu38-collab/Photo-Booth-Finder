import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SnapSpot Nepal — Kathmandu Photo Booth Finder',
  description:
    'Discover real photo booths in Kathmandu district, compare prices and features, and find the best spot for your next memory. Verified listings at Civil Mall, City Centre, and beyond.',
  keywords: [
    'Photo Booth Kathmandu',
    'Korean 4 Cut Nepal',
    'Civil Mall Photo Booth',
    'City Centre Photo Booth',
    'Banhan Studio Nepal',
    'Kathmandu Photo Booth Finder',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900`}>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
