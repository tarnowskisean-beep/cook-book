import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' });
const lato = Lato({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-body' });

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
      <body className={`${playfair.variable} ${lato.variable}`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
