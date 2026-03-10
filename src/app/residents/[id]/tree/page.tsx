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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  TreePine, 
  Sparkles, 
  Loader2, 
  Dna,
  Heart,
  ShieldCheck
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

  // --- Generation Logic ---
  // G0 is always the oldest known ancestors in the current view
  const hasGrandparents = mGrandma || mGrandpa || fGrandma || fGrandpa;
  const hasParents = mother || father;

  let grandparentTierLabel = "G0";
  let parentTierLabel = "G1";
  let residentTierLabel = "G2";

  if (!hasGrandparents) {
    grandparentTierLabel = "";
    parentTierLabel = "G0";
    residentTierLabel = "G1";
  }

  if (!hasParents && !hasGrandparents) {
    parentTierLabel = "";
    residentTierLabel = "G0";
  }

  const TreeCard = ({ bird, label, genLabel, className }: { bird: Resident | null, label: string, genLabel?: string, className?: string }) => {
    if (!bird) return null;

    const isG0 = !bird.motherId && !bird.fatherId;

    return (
      <Link href={`/residents/${bird.id}`} className={cn("w-32 md:w-40 group relative shrink-0", className)}>
        <div className={cn(
          "aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-card shadow-xl transition-all duration-300 group-hover:scale-105",
          isG0 ? "border-primary glow-primary shadow-primary/20" : "border-border group-hover:border-primary"
        )}>
          <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Generation Tag */}
          {genLabel && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-none text-[7px] font-black px-1.5 py-0.5">
                {genLabel}
              </Badge>
            </div>
          )}

          <div className="absolute bottom-2 left-2 right-2 text-white">
            <span className="text-[7px] font-black uppercase tracking-widest text-primary/80 mb-0.5 block">{label}</span>
            <p className="font-headline font-black text-xs md:text-sm uppercase tracking-tight truncate">{bird.name}</p>
          </div>

          {isG0 && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary text-primary-foreground border-none text-[6px] font-black px-1.5 py-0.5 rounded-sm shadow-lg animate-pulse">
                ROOT ANCESTOR
              </Badge>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body overflow-x-hidden">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col">
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
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

        {/* Tree Container with Horizontal Scroll Support */}
        <ScrollArea className="w-full whitespace-nowrap pb-12">
          <div className="relative min-w-fit mx-auto py-12 px-8 flex flex-col items-center gap-24">
            
            {/* SVG Connector Lines Layer (Simplified for vertical flow) */}
            <div className="absolute inset-0 pointer-events-none z-0">
               <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="tree-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.1 }} />
                      <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.6 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Lines from Grandparents to Parents */}
                  {hasGrandparents && hasParents && (
                    <>
                      {/* Maternal */}
                      <path d="M 25% 15% L 25% 40%" stroke="url(#tree-grad)" strokeWidth="1" fill="none" className="opacity-30" />
                      {/* Paternal */}
                      <path d="M 75% 15% L 75% 40%" stroke="url(#tree-grad)" strokeWidth="1" fill="none" className="opacity-30" />
                    </>
                  )}

                  {/* Lines from Parents to Hatchling */}
                  {hasParents && (
                    <path d="M 25% 55% L 50% 85% M 75% 55% L 50% 85%" stroke="url(#tree-grad)" strokeWidth="2" fill="none" />
                  )}
               </svg>
            </div>

            {/* Tier 1: Grandparents (G0) */}
            {hasGrandparents && (
              <div className="flex flex-col items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{grandparentTierLabel} • ELDERS</span>
                <div className="flex justify-center gap-8 md:gap-12">
                  <div className="flex gap-4">
                    <TreeCard bird={mGrandma} label="M-Grandmother" genLabel={grandparentTierLabel} />
                    <TreeCard bird={mGrandpa} label="M-Grandfather" genLabel={grandparentTierLabel} />
                  </div>
                  <div className="flex gap-4">
                    <TreeCard bird={fGrandma} label="P-Grandmother" genLabel={grandparentTierLabel} />
                    <TreeCard bird={fGrandpa} label="P-Grandfather" genLabel={grandparentTierLabel} />
                  </div>
                </div>
              </div>
            )}

            {/* Tier 2: Parents (G1 or G0) */}
            {hasParents && (
              <div className="flex flex-col items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{parentTierLabel} • SECOND GENERATION</span>
                <div className="flex justify-center gap-12 md:gap-32">
                  <TreeCard bird={mother} label="Mother" genLabel={parentTierLabel} />
                  <TreeCard bird={father} label="Father" genLabel={parentTierLabel} />
                </div>
              </div>
            )}

            {/* Tier 3: The Hatchling */}
            <div className="flex flex-col items-center gap-6 pt-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">{residentTierLabel} • CURRENT GENERATION</span>
              <div className="relative">
                <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-full opacity-50 animate-pulse" />
                <TreeCard 
                  bird={resident} 
                  label="Resident" 
                  genLabel={residentTierLabel}
                  className="w-48 md:w-56 scale-110 shadow-2xl border-primary" 
                />
              </div>
            </div>

          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Info Legend */}
        <section className="mt-24 max-w-2xl mx-auto w-full">
           <div className="bg-card border border-border p-8 rounded-[2rem] text-center space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="flex justify-center gap-8 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary glow-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Root Ancestor (G0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Direct Lineage</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-headline font-black uppercase flex items-center justify-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> VERIFIED LINEAGE
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Generations are calculated relative to the founding residents of the Decent Ducks Sanctuary. 
                  G0 residents represent the original rescues whose prior history remains unrecorded in the wild or domestic collections.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
