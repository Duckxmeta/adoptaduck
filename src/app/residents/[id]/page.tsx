
"use client";

import { useMemo, use, useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { AdoptionModal } from '@/components/residents/AdoptionModal';
import { 
  Heart, 
  MapPin, 
  Zap, 
  Trophy,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  GitBranch
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useStorage } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Resident, UserProfile } from '@/lib/types';
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
import { ref, getDownloadURL } from 'firebase/storage';

const RESIDENT_IMAGE_MAP: Record<string, string> = {
  'Cassidy': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FCassidy.jpeg?alt=media&token=f66f2e79-86e3-4ba3-8f3c-9aff47227075',
  'Echo': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FEcho.jpeg?alt=media&token=6375ff79-0b14-4611-b789-a640017ffc9f',
  'Cracker': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FCracker.jpeg?alt=media&token=94b6629c-43d4-4721-9fd7-c50dd215d7b8',
  'Coffee': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FCoffee.jpeg?alt=media&token=08099fb8-2362-44ff-bb72-324b14ecc099',
  'Jade': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FJade.jpeg?alt=media&token=f89ea02f-f805-49df-a649-bad6524faa9d',
  'River': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FRiver.jpeg?alt=media&token=af080dc3-3a5a-42ad-b1cd-08a50e336fe1',
  'SweetPea': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FSweetPea.jpeg?alt=media&token=330a41bc-26c1-405c-ac1c-2f0fda3794ae',
  'sweet pea': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FSweetPea.jpeg?alt=media&token=330a41bc-26c1-405c-ac1c-2f0fda3794ae',
  'Sweet Pea': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FSweetPea.jpeg?alt=media&token=330a41bc-26c1-405c-ac1c-2f0fda3794ae',
  'Leela': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FLeela.jpeg?alt=media&token=f8c89eea-cf96-437a-b0de-e1263fe23254',
  'Whiskey': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FWhiskey.jpeg?alt=media&token=073b8dc6-a2ee-4ed8-8425-ce31505e2efc',
  'Pepper': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FPepper.jpeg?alt=media&token=8138ef48-61e1-428d-987e-c3da61eec7ee',
  'Otis': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FOtis.jpeg?alt=media&token=e765d331-774d-4bd3-bb73-75a143af24f1',
};

export default function ResidentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();

  // Profile Discovery State
  const [activeCollection, setActiveCollection] = useState<'birds' | 'residents'>('birds');
  const [isSearching, setIsSearching] = useState(true);

  const birdRef = useMemoFirebase(() => (firestore && id ? doc(firestore, activeCollection, id) : null), [firestore, id, activeCollection]);
  const { data: bird, isLoading } = useDoc<Resident>(birdRef);

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isGuardian = userProfile?.role === 'guardian' || userProfile?.role === 'admin';

  // Fallback Discovery Logic
  useEffect(() => {
    if (!isLoading) {
      if (!bird && activeCollection === 'birds') {
        // Not in birds, immediately fall back to residents
        setActiveCollection('residents');
      } else {
        // Found it or tried both
        setIsSearching(false);
      }
    }
  }, [isLoading, bird, activeCollection]);

  // Resolved images state
  const [resolvedImages, setResolvedImages] = useState<string[]>([]);

  useEffect(() => {
    async function resolveAll() {
      if (!bird) return;
      
      const rawUrls = Array.from(new Set([
        bird.primaryImageUrl,
        ...(bird.galleryImageUrls || [])
      ])).filter(Boolean) as string[];

      const resolved = await Promise.all(rawUrls.map(async (url) => {
        // 1. PRIORITY: Check for Direct Link Injection via Resident Name for primary photo
        if (url === bird.primaryImageUrl && RESIDENT_IMAGE_MAP[bird.name]) {
          return RESIDENT_IMAGE_MAP[bird.name];
        }

        if (url.startsWith('http')) return url;
        try {
          // Unified Path: Exclusively resident-photos/
          const imageRef = ref(storage, `resident-photos/${url}`);
          return await getDownloadURL(imageRef);
        } catch (e) {
          return null;
        }
      }));
      setResolvedImages(resolved.filter(Boolean) as string[]);
    }
    resolveAll();
  }, [bird, storage]);

  if (isLoading || isSearching) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-black uppercase tracking-[0.3em] text-xs text-muted-foreground">Syncing Sanctuary Identity...</p>
      </div>
    );
  }

  if (!bird && !isLoading && !isSearching) {
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
              <p className="text-muted-foreground font-medium">The record for <strong>{id}</strong> could not be located in our archives.</p>
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
  const isDuck = activeCollection === 'birds';
  const displayName = getResidentName(bird);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />
      
      <main className="flex-1 pb-32 animate-in fade-in duration-1000">
        <div className="container mx-auto px-4 pt-12">
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
            
            <div className="space-y-6">
              <div className={cn(
                "relative rounded-[2.5rem] overflow-hidden border-2 shadow-2xl group bg-[#1a1a1a]",
                isFounder ? "border-primary/50 glow-primary" : "border-border"
              )}>
                {resolvedImages.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {resolvedImages.map((url, index) => (
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
                    {resolvedImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4 bg-black/40 border-none text-white hover:bg-black/60" />
                        <CarouselNext className="right-4 bg-black/40 border-none text-white hover:bg-black/60" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <div className="aspect-square flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                  </div>
                )}
                
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 pointer-events-none z-10">
                   <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs shadow-lg">
                     {bird?.breed}
                   </Badge>
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

            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                  <h1 className="text-7xl font-headline font-black text-primary tracking-tighter leading-[0.8] uppercase animate-in slide-in-from-top-4 duration-700">
                    {displayName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">
                     <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-secondary" /> Sanctuary Resident</span>
                     {bird?.species && <Badge variant="outline" className="border-border text-muted-foreground font-black uppercase">{bird.species}</Badge>}
                  </div>
                </div>
                {isGuardian && isDuck && (
                  <Button 
                    asChild
                    className="bg-secondary text-secondary-foreground font-black h-12 rounded-xl px-6 shadow-xl hover:scale-105 transition-transform"
                  >
                    <Link href={`/residents/${id}/tree`}>
                      <GitBranch className="mr-2 h-4 w-4" /> VIEW LINEAGE
                    </Link>
                  </Button>
                )}
              </div>

              <div className="space-y-4 bg-muted/5 p-8 rounded-3xl border border-border/50">
                <h3 className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Personality Profile
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg italic">
                  "{bird?.personalityTraits || "A curious and friendly sanctuary resident."}"
                </p>
              </div>

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
