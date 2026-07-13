import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Atlas AI — AI Copilot for Location Intelligence',
  description: 'Transform complex geospatial intelligence into actionable business decisions. Compare sites, run simulations, and analyze location feasibility with federal source verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-[#050505] text-[#FAFAFA] antialiased min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
