import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Food Orders',
  description: 'Role-based food ordering system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f8fafc] text-[#1e293b] min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
