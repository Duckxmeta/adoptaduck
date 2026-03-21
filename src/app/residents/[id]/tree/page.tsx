"use client";

import { React, use } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { HeritageTree } from '@/components/residents/HeritageTree';
import { 
  Dna,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LineageTreePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const router = useRouter();

  // Fetch the main resident by ID
  const { data: resident, isLoading: residentLoading } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && id ? doc(firestore, 'birds', id) : null), [firestore, id])
  );

  // Fetch Parents
  const { data: mother } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && resident?.motherId ? doc(firestore, 'birds', resident.motherId) : null), [firestore, resident?.motherId])
  );
  const { data: father } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && resident?.fatherId ? doc(firestore, 'birds', resident.fatherId) : null), [firestore, resident?.fatherId])
  );

  // Fetch Grandparents (Maternal)
  const { data: mGrandma } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && mother?.motherId ? doc(firestore, 'birds', mother.motherId) : null), [firestore, mother?.motherId])
  );
  const { data: mGrandpa } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && mother?.fatherId ? doc(firestore, 'birds', mother.fatherId) : null), [firestore, mother?.fatherId])
  );

  // Fetch Grandparents (Paternal)
  const { data: fGrandma } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && father?.motherId ? doc(firestore, 'birds', father.motherId) : null), [firestore, father?.motherId])
  );
  const { data: fGrandpa } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && father?.fatherId ? doc(firestore, 'birds', father.fatherId) : null), [firestore, father?.fatherId])
  );

  if (residentLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px] text-muted-foreground">Tracing Genetic Markers...</p>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground font-black uppercase tracking-widest mb-4">Resident not found.</p>
        <Button onClick={() => router.push('/flock')} className="bg-primary text-primary-foreground font-black px-8 rounded-xl">Back to Flock</Button>
      </div>
    );
  }

  const familyData = {
    mother,
    father,
    mGrandma,
    mGrandpa,
    fGrandma,
    fGrandpa
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none">
              PEDIGREE <span className="text-primary">EXPLORER</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center justify-center gap-2">
              <Dna className="h-4 w-4 text-secondary" /> SANCTUARY GENETIC LINEAGE
            </p>
          </div>
        </div>

        <HeritageTree rootResident={resident} familyData={familyData} />

        <section className="mt-24 max-w-2xl mx-auto w-full">
           <div className="bg-card border border-border p-10 rounded-[2.5rem] text-center space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="flex justify-center gap-10 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Founder / Rehomed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sanctuary Born</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-headline font-black uppercase flex items-center justify-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> DATA INTEGRITY
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium max-w-lg mx-auto">
                  Heritage tracking allows us to monitor the genetic health of our flock. 
                  "Rehomed" or "Founding" residents serve as the root of their respective lineages within our sanctuary records.
                </p>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
