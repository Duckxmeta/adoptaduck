
"use client";

import { useMemo, use } from 'react';
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
  ArrowLeft,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Resident, Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn, getResidentName } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from 'next/link';

export default function ResidentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  // Fetch the main resident by direct UID from the BIRDS collection
  const birdRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'birds', id) : null), [firestore, id]);
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
    // Tier Gating: Only Flock Members (Logged In) see the financial engine data
    if (!user) {
      return { monthly: null };
    }

    // Hardened Defense: Check existence and type of required data
    if (!expenses || !Array.isArray(expenses) || !allBirds || !id) {
      return { monthly: 0 };
    }

    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    const monthlyExpenses = expenses.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    // Ensure numeric summation to prevent NaN propagation
    const specific = monthlyExpenses
      .filter(e => e.birdId === id)
      .reduce((s, e) => s + (Number(e.cost) || 0), 0);
      
    const shared = monthlyExpenses
      .filter(e => !e.birdId)
      .reduce((s, e) => s + (Number(e.cost) || 0), 0);
      
    const birdCount = allBirds.length || 1;
    const overhead = shared / birdCount;

    const total = (specific + overhead) || 0;
    
    return { monthly: total };
  }, [expenses, allBirds, id, user]);

  const galleryImages = useMemo(() => {
    if (!bird) return [];
    const images = Array.from(new Set([
      bird.primaryImageUrl,
      ...(bird.galleryImageUrls || [])
    ])).filter(Boolean) as string[];
    return images;
  }, [bird]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-black uppercase tracking-[0.3em] text-xs text-muted-foreground">Checking Sanctuary Records...</p>
      </div>
    );
  }

  // Security Gate: Handle Not Found state gracefully
  if (!bird && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border-border border-2 rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center border-2 border-destructive/20">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-headline font-black uppercase tracking-tight">RESIDENT NOT FOUND</h1>
              <p className="text-muted-foreground font-medium">The record for <strong>{id}</strong> could not be located in our sanctuary logs.</p>
            </div>
            <Button asChild className="w-full bg-primary text-primary-foreground font-black h-14 rounded-xl shadow-lg">
              <Link href="/flock">RETURN TO THE FLOCK</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isFounder = bird?.isFoundingResident || bird?.generation === 0 || bird?.founder;
  const displayName = getResidentName(bird);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />
      
      <main className="flex-1 pb-32 animate-in fade-in duration-1000">
        <div className="container mx-auto px-4 pt-12">
          {/* Breadcrumb */}
          <Button 
            asChild
            variant="ghost" 
            className="mb-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary p-0 h-auto"
          >
            <Link href="/flock">
              <ArrowLeft className="h-3 w-3 mr-2" /> Back to Flock
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Visuals - Image Carousel (Hero) */}
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
                     <span className="flex items-center gap-1.5 text-primary">
                       <Wallet className="h-3.5 w-3.5" /> 
                       {careCosts.monthly !== null ? `$${Number(careCosts.monthly || 0).toFixed(0)} Monthly Care` : 'Member Gated'}
                     </span>
                  </div>
                </div>
                <Button 
                  asChild
                  className="bg-secondary text-secondary-foreground font-black h-12 rounded-xl px-6 shadow-xl hover:scale-105 transition-transform"
                >
                  <Link href={`/residents/${id}/tree`}>
                    <GitBranch className="mr-2 h-4 w-4" /> VIEW LINEAGE
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-card p-8 rounded-3xl border border-border flex flex-col justify-between shadow-xl">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Est. Cost to Care</span>
                  </div>
                  <div>
                    {user ? (
                      <>
                        <span className="text-3xl font-headline font-black uppercase tracking-tight text-primary">
                          ${Number(careCosts.monthly || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black block text-muted-foreground mt-1 uppercase tracking-widest">Per Month</span>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm uppercase tracking-tighter">FLOCK MEMBERS ONLY</span>
                        </div>
                        <Link href="/signup" className="text-[9px] font-black text-secondary hover:underline uppercase tracking-widest block">
                          JOIN FREE →
                        </Link>
                      </div>
                    )}
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

              {/* Personality Profile Mapping */}
              <div className="space-y-4 bg-muted/5 p-8 rounded-3xl border border-border/50">
                <h3 className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Personality Profile
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg italic">
                  "{bird?.personalityTraits || "A curious and friendly sanctuary resident."}"
                </p>
              </div>

              {/* Rescue Story Mapping */}
              <div className="space-y-4">
                <h3 className="font-headline font-black text-sm text-secondary uppercase tracking-[0.3em] flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Rescue Story & Heritage
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {bird?.backstory || "A cherished resident of the Decent Ducks Sanctuary."}
                </p>
              </div>

              <div className="pt-6">
                {bird && <AdoptionModal resident={bird} />}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
