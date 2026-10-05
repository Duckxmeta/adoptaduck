import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Analytics } from "@vercel/analytics/next";
import React from 'react';

export const metadata: Metadata = {
  title: 'Virtual Sanctuary | Decent Ducks',
  description: 'A modern, virtual adoption sanctuary for birds.',
  authors: [{ name: 'Kyle Kinkin', url: 'https://www.justduckit.xyz/work' }],
  creator: 'Kyle Kinkin (https://www.justduckit.xyz/work)',
  publisher: 'Kyle Kinkin',
  other: {
    'developer': 'Kyle Kinkin',
    'developer-url': 'https://www.justduckit.xyz/work',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
