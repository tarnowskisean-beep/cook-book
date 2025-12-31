import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Everybody & Their Mother's Cookbook",
  description: 'Manage cookbook projects and social automation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
