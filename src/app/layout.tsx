import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Analytics } from "@vercel/analytics/next";
import React from 'react';

export const metadata: Metadata = {
  title: 'Decent Ducks | Virtual Adoption & Sanctuary Support',
  description: 'Virtual adoption sanctuary for ducks and animals. Physical care and intake handled by our grounds partner, Broken Fence Farms in DeKalb Co, TN. Support, adopt, or report found animals.',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Decent Ducks Sanctuary",
              "url": "https://adoptaduck.org",
              "description": "Virtual adoption program with physical animal care by grounds partner Broken Fence Farms in DeKalb Co, TN.",
              "areaServed": "DeKalb County, Tennessee",
              "sameAs": ["https://www.facebook.com/share/18N75G8YJm/?mibextid=wwXIfr"]
            })
          }}
        />
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
