
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  TreePine, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  Dna,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LineageTreePage() {
  const { id } = useParams() as { id: string };
  const firestore = useFirestore();
  const router = useRouter();

  // --- Fetch Target Resident ---
  const { data: resident, isLoading: residentLoading } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && id ? doc(firestore, 'birds', id) : null), [firestore, id])
  );

  // --- Fetch Parents ---
  const { data: mother } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && resident?.motherId ? doc(firestore, 'birds', resident.motherId) : null), [firestore, resident?.motherId])
  );
  const { data: father } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && resident?.fatherId ? doc(firestore, 'birds', resident.fatherId) : null), [firestore, resident?.fatherId])
  );

  // --- Fetch Grandparents (Maternal) ---
  const { data: mGrandma } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && mother?.motherId ? doc(firestore, 'birds', mother.motherId) : null), [firestore, mother?.motherId])
  );
  const { data: mGrandpa } = useDoc<Resident>(
    useMemoFirebase(() => (firestore && mother?.fatherId ? doc(firestore, 'birds', mother.fatherId) : null), [firestore, mother?.fatherId])
  );

  // --- Fetch Grandparents (Paternal) ---
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

  const TreeCard = ({ bird, label, className }: { bird: Resident | null, label: string, className?: string }) => {
    if (!bird) {
      return (
        <div className={cn("w-32 md:w-40 aspect-[3/4] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-4 text-center bg-muted/5 opacity-40", className)}>
          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</span>
          <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-[7px] font-black uppercase text-muted-foreground tracking-tighter">Record Unknown</p>
        </div>
      );
    }

    const isFounding = !bird.motherId && !bird.fatherId;

    return (
      <Link href={`/residents/${bird.id}`} className={cn("w-32 md:w-40 group relative", className)}>
        <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-border bg-card shadow-xl transition-all duration-300 group-hover:border-primary group-hover:scale-105 group-hover:glow-primary">
          <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 text-white">
            <span className="text-[7px] font-black uppercase tracking-widest text-primary/80 mb-0.5 block">{label}</span>
            <p className="font-headline font-black text-xs md:text-sm uppercase tracking-tight truncate">{bird.name}</p>
          </div>
          {isFounding && (
            <Badge className="absolute top-2 left-2 bg-[#FFD700] text-black border-none text-[6px] font-black px-1.5 py-0.5 rounded-sm shadow-lg animate-pulse">
              FOUNDING
            </Badge>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center space-y-6 mb-20">
          <Button variant="ghost" onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3 mr-2" /> Back to Profile
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none">
              PEDIGREE <span className="text-primary">EXPLORER</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center justify-center gap-2">
              <Dna className="h-4 w-4 text-secondary" /> SANCTUARY GENETIC LINEAGE
            </p>
          </div>
        </div>

        {/* Tree Container */}
        <div className="relative max-w-5xl mx-auto py-20 px-4">
          
          {/* SVG Connector Lines Layer */}
          <div className="absolute inset-0 pointer-events-none z-0">
             <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                   <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
                   </linearGradient>
                </defs>
                
                {/* Grandparent to Parent Connectors (L) */}
                {(mGrandma || mGrandpa) && (
                   <path d="M 25% 15% L 25% 30% M 12.5% 15% L 25% 30% M 37.5% 15% L 25% 30%" stroke="url(#grad)" strokeWidth="1" fill="none" opacity="0.3" />
                )}
                {/* Grandparent to Parent Connectors (R) */}
                {(fGrandma || fGrandpa) && (
                   <path d="M 75% 15% L 75% 30% M 62.5% 15% L 75% 30% M 87.5% 15% L 75% 30%" stroke="url(#grad)" strokeWidth="1" fill="none" opacity="0.3" />
                )}

                {/* Parent to Hatchling Connectors */}
                {(mother || father) && (
                   <path d="M 25% 50% L 50% 75% M 75% 50% L 50% 75%" stroke="url(#grad)" strokeWidth="2" fill="none" />
                )}
             </svg>
          </div>

          <div className="relative z-10 space-y-24">
            
            {/* Grandparents Row (Tier 3) */}
            <div className="flex justify-between md:justify-around gap-2 md:gap-4 overflow-x-auto pb-4 md:overflow-visible no-scrollbar">
              <div className="flex gap-2 md:gap-4 shrink-0">
                <TreeCard bird={mGrandma} label="M-Grandmother" />
                <TreeCard bird={mGrandpa} label="M-Grandfather" />
              </div>
              <div className="flex gap-2 md:gap-4 shrink-0">
                <TreeCard bird={fGrandma} label="P-Grandmother" />
                <TreeCard bird={fGrandpa} label="P-Grandfather" />
              </div>
            </div>

            {/* Parents Row (Tier 2) */}
            <div className="flex justify-around gap-8 md:gap-0">
               <TreeCard bird={mother} label="Mother" className="md:translate-x-[-15%]" />
               <TreeCard bird={father} label="Father" className="md:translate-x-[15%]" />
            </div>

            {/* Hatchling (Target) (Tier 1) */}
            <div className="flex justify-center pt-8">
               <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-50 animate-pulse" />
                  <TreeCard bird={resident} label="The Hatchling" className="w-48 md:w-56 scale-110 shadow-2xl border-primary" />
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <Badge className="bg-primary text-primary-foreground font-black uppercase text-[8px] tracking-[0.3em] px-4 py-1.5 shadow-xl">CURRENT GENERATION</Badge>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Info Card */}
        <section className="mt-40 max-w-2xl mx-auto">
           <div className="bg-card border-2 border-border p-10 rounded-[3rem] text-center space-y-4 shadow-2xl relative overflow-hidden">
              <TreePine className="h-10 w-10 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-headline font-black uppercase">Genetic Verification</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                This pedigree is derived from verified sanctuary arrival data and breeding logs. Residents marked as "Founding" represent the original lineages whose prior history remains in the wild or unrecorded domestic collections.
              </p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
