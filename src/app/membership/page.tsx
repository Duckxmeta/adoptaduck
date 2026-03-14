
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirecting to the centralized /support page to ensure consistent pathing
 * and mobile-first logic.
 */
export default function MembershipRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/support');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
      <Loader2 className="h-10 w-10 animate-spin mb-4" />
      <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Navigating to Support Hub...</p>
    </div>
  );
}
