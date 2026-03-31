
"use client";

import { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { AdoptionModal } from '@/components/residents/AdoptionModal';
import { 
  Heart, 
  Wallet, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  GitBranch,
  Trophy,
  BookOpen,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Resident, HealthLogEntry, Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn, getResidentName } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ResidentProfile() {
  const { id } = useParams() as { id: string };
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const birdRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'birds', id);
  }, [firestore, id]);

  const { data: bird, isLoading } = useDoc<Resident>(birdRef);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'));
  }, [firestore]);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'));
  }, [firestore]);

  const { data: expenses } = useCollection<Expense>(expensesQuery);
  const { data: allBirds } = useCollection<Resident>(birdsQuery);

  const careCosts = useMemo(() => {
    if (!expenses || !allBirds || !id) return { monthly: 0 };
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    const monthlyExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const specific = monthlyExpenses.filter(e => e.birdId === id).reduce((s, e) => s + e.cost, 0);
    const shared = monthlyExpenses.filter(e => !e.birdId).reduce((s, e) => s + e.cost, 0);
    const overhead = shared / (allBirds.length || 1);

    return { monthly: specific + overhead };
  }, [expenses, allBirds, id]);

  const galleryImages = useMemo(() => {
    const images = Array.from(new Set([
      bird?.primaryImageUrl,
      ...(bird?.galleryImageUrls || [])
    ])).filter(Boolean) as string[];
    return images;
  }, [bird]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-black uppercase tracking-[0.3em] text-xs text-muted-foreground">Checking Sanctuary Records...</p>
      </div>
    );
  }

  if (!bird && !isLoading) {
    notFound();
  }

  const isFounder = bird?.isFoundingResident || bird?.generation === 0 || bird?.founder;
  const displayBackstory = bird?.backstory || "A cherished resident of the Decent Ducks Sanctuary.";
  const displayName = getResidentName(bird);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 pb-32 animate-in fade-in duration-1000">
        <div className="container mx-auto px-4 pt-12">
          {/* Breadcrumb */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary p-0 h-auto"
          >
            <ArrowLeft className="h-3 w-3 mr-2" /> Back to Flock
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Visuals - Image Carousel */}
            <div className="space-y-6">
              <div className={cn(
                "relative rounded-[2.5rem] overflow-hidden border-2 shadow-2xl group",
                isFounder ? "border-primary/50 glow-primary" : "border-border"
              )}>
                {galleryImages.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {galleryImages.map((url, index) => (
                        <CarouselItem key={index}>
                          <div className="relative aspect-square">
                            <Image
                              src={url}
                              alt={`${displayName} - Photo ${index + 1}`}
                              fill
                              className="object-cover"
                              priority={index === 0}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {galleryImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4 bg-black/40 border-none text-white hover:bg-black/60" />
                        <CarouselNext className="right-4 bg-black/40 border-none text-white hover:bg-black/60" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center text-9xl">🦆</div>
                )}
                
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 pointer-events-none z-10">
                   <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs shadow-lg">
                     {bird?.breed}
                   </Badge>
                   {bird?.color && (
                     <Badge variant="outline" className="bg-background/80 backdrop-blur-md text-foreground font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs shadow-lg">
                       {bird.color}
                     </Badge>
                   )}
                   {isFounder && (
                     <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs flex items-center gap-1.5 shadow-lg">
                       <Trophy className="h-3 w-3" /> G0 Founder
                     </Badge>
                   )}
                </div>
              </div>

              {bird?.liveStatus && (
                <div className="bg-secondary/10 border-2 border-secondary/20 p-6 rounded-3xl animate-in slide-in-from-left-4 duration-700 delay-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-secondary animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Live Sanctuary Vibe</p>
                      <p className="text-xl font-headline font-black uppercase tracking-tight">{bird.liveStatus}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                  <h1 className="text-7xl font-headline font-black text-primary tracking-tighter leading-[0.8] uppercase animate-in slide-in-from-top-4 duration-700">
                    {displayName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">
                     <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-secondary" /> Sanctuary Resident</span>
                     <span className="flex items-center gap-1.5 text-primary"><Wallet className="h-3.5 w-3.5" /> ${careCosts.monthly.toFixed(0)} Monthly Care</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push(`/residents/${bird?.id}/tree`)}
                  className="bg-secondary text-secondary-foreground font-black h-12 rounded-xl px-6 shadow-xl hover:scale-105 transition-transform"
                >
                  <GitBranch className="mr-2 h-4 w-4" /> VIEW LINEAGE
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-card p-8 rounded-3xl border border-border flex flex-col justify-between shadow-xl">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Est. Cost to Care</span>
                  </div>
                  <div>
                    <span className="text-3xl font-headline font-black uppercase tracking-tight text-primary">${careCosts.monthly.toFixed(2)}</span>
                    <span className="text-[10px] font-black block text-muted-foreground mt-1 uppercase tracking-widest">Per Month</span>
                  </div>
                </div>
                <div className="bg-card p-8 rounded-3xl border border-border flex flex-col justify-between shadow-xl">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sanctuary Status</span>
                  </div>
                  <div>
                    <span className="text-3xl font-headline font-black text-secondary uppercase tracking-tight">PROTECTED</span>
                    <span className="text-[10px] font-black block text-muted-foreground mt-1 uppercase tracking-widest">Lifetime Security</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-muted/5 p-8 rounded-3xl border border-border/50">
                <h3 className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Personality Profile
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg italic">
                  "{bird?.personalityTraits}"
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-headline font-black text-sm text-secondary uppercase tracking-[0.3em] flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Rescue Story & Heritage
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {displayBackstory}
                </p>
              </div>

              <div className="pt-6">
                {bird && <AdoptionModal resident={bird as any} />}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
