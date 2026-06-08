"use client";

import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useFirestore } from '@/firebase';
import { Resident } from '@/lib/types';
import { fetchAllSanctuaryResidents } from '@/lib/residents';
import { ResidentCard } from '@/components/residents/ResidentCard';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Bird } from 'lucide-react';

/**
 * @fileOverview The Sanctuary Roster.
 * Refactored from 'Adoption Hub' to 'Institutional Roster' to support mission tiers.
 */

export default function AdoptionPage() {
  const firestore = useFirestore();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!firestore) return;
      const data = await fetchAllSanctuaryResidents(firestore);
      setResidents(data);
      setLoading(false);
    }
    load();
  }, [firestore]);

  const ducks = useMemo(() => residents, [residents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Syncing Sanctuary Pulse...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-20 space-y-32">
        {/* Header Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
            Institutional Roster
          </Badge>
          <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-none">
            THE SANCTUARY <span className="text-primary">ROSTER</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Browse our residents and explore our mission tiers. Your membership directly funds foundational infrastructure, rescue operations, and high-fidelity care.
          </p>
        </section>

        {/* SECTION 1: THE FLOCK (DUCKS) */}
        <section className="space-y-12">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Bird className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-headline font-black uppercase tracking-tight leading-none">The Flock</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Domestic Waterfowl Residents</p>
            </div>
            <div className="h-px bg-border flex-1 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {ducks.map((duck) => (
              <ResidentCard key={duck.id} resident={duck} />
            ))}
          </div>
          
          {ducks.length === 0 && (
            <div className="p-20 text-center bg-card/50 border-2 border-dashed border-border rounded-[3rem]">
              <p className="text-muted-foreground font-medium italic">Synchronizing legacy flock records...</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
