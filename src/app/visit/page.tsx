"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Visit Page Redirect.
 * Decommissioned to prioritize facility privacy and resident security.
 * Redirects all traffic to the homepage.
 */

export default function VisitRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecting to home to maintain security protocol
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
      <Loader2 className="h-10 w-10 animate-spin mb-4" />
      <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Prioritizing Resident Privacy...</p>
    </div>
  );
}
