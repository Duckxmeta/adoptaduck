"use client";

import { useMemo, use, useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Zap, 
  Trophy,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  GitBranch,
  ShieldCheck
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

const RESIDENT_IMAGE_MAP: Record<string, string> = {};

export default function ResidentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();

  const [isSearching, setIsSearching] = useState(true);

  const birdRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'birds', id) : null), [firestore, id]);
  const { data: bird, isLoading } = useDoc<Resident>(birdRef);

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isGuardian = userProfile?.role === 'guardian' || userProfile?.role === 'admin';

  useEffect(() => {
    if (!isLoading) {
      setIsSearching(false);
    }
  }, [isLoading]);

  const [resolvedImages, setResolvedImages] = useState<string[]>([]);

  useEffect(() => {
    async function resolveAll() {
      if (!bird) return;
      
      if (RESIDENT_IMAGE_MAP[bird.name]) {
        setResolvedImages([RESIDENT_IMAGE_MAP[bird.name]]);
        return;
      }

      if (bird.imageUrl && bird.imageUrl.startsWith('http')) {
        setResolvedImages([bird.imageUrl, ...(bird.galleryImageUrls || [])]);
        return;
      }

      const urls: string[] = [];
      const primaryPath = bird.primaryImageUrl || bird.image;
      
      if (primaryPath) {
        if (primaryPath.startsWith('http')) {
          urls.push(primaryPath);
        } else {
          try {
            const imageRefInstance = ref(storage, `resident-photos/${primaryPath}`);
            const downloadUrl = await getDownloadURL(imageRefInstance);
            urls.push(downloadUrl);
          } catch (e) {}
        }
      }

      const gallery = bird.galleryImageUrls || [];
      for (const p of gallery) {
        if (p.startsWith('http')) {
          urls.push(p);
        } else {
          try {
            const imageRefInstance = ref(storage, `resident-photos/${p}`);
            const downloadUrl = await getDownloadURL(imageRefInstance);
            urls.push(downloadUrl);
          } catch (e) {}
        }
      }

      setResolvedImages(urls.filter(Boolean));
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

  const isValidBird = !!bird;

  if (!isValidBird && !isLoading && !isSearching) {
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
              <Link href="/adopt">RETURN TO THE SANCTUARY</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = getResidentName(bird!);
  const isFounder = bird?.isFoundingResident || bird?.generation === 0 || bird?.founder;
  const isDuck = true;
  const isLegend = ['Bandit', 'Moxie'].includes(bird?.name || '');

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
            <Link href="/adopt">
              <ArrowLeft className="h-3 w-3 mr-2" /> Back to Roster
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            <div className="space-y-6">
              <div className={cn(
                "relative rounded-[2.5rem] overflow-hidden border-2 shadow-2xl group bg-[#1a1a1a]",
                isFounder ? "border-primary/50 glow-primary" : "border-border",
                isLegend && "border-primary ring-2 ring-primary/20"
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
                   {isLegend ? (
                     <Badge className="bg-primary text-black font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs shadow-lg flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4" /> MISSION MASCOT | LEGEND
                     </Badge>
                   ) : (
                     <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs shadow-lg">
                       {bird?.breed}
                     </Badge>
                   )}
                   {isFounder && !isLegend && (
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
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">
                     <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-secondary" /> Sanctuary Resident</span>
                     {bird?.category && (
                       <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase">
                         {bird.category}
                       </Badge>
                     )}
                  </div>
                </div>
                {isGuardian && isDuck && !isLegend && (
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
                  <Sparkles className="h-4 w-4" /> Institutional Record
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg italic">
                  {bird?.personalityTraits ? `"${bird.personalityTraits}"` : ""}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-headline font-black text-sm text-secondary uppercase tracking-[0.3em] flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Rescue Story & Mission Context
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {bird?.bio || bird?.backstory || ""}
                </p>
              </div>

              <div className="pt-6">
                <Button asChild size="lg" className="w-full bg-primary text-black font-black h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                  <Link href="/support">
                    <Zap className="mr-3 h-6 w-6 fill-current" /> VIEW MISSION TIERS
                  </Link>
                </Button>
                <p className="text-[10px] text-center font-black uppercase tracking-[0.4em] text-muted-foreground mt-4">
                  Proceeds support sanctuary-wide infrastructure and high-fidelity care initiatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
