
"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, ArrowRight, Heart, Zap, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Resident } from '@/lib/types';

export function DOTMSpotlight() {
  const router = useRouter();
  const firestore = useFirestore();

  // Dynamic Fetch: Find the resident marked as 'isFeatured' (Duck of the Month)
  const featuredQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), where('isFeatured', '==', true), limit(1));
  }, [firestore]);

  const { data: featuredBirds, isLoading } = useCollection<Resident>(featuredQuery);
  const featuredBird = featuredBirds?.[0];

  // HARD CONTENT FALLBACK: BANDIT (The original profile)
  const defaultData = {
    id: 'bandit-id', 
    name: 'Bandit',
    breed: 'Silver Appleyard',
    title: 'April Duck of the Month',
    bio: 'Meet Bandit, the undisputed king of the pond. Whether he’s leading the morning zoomies or acting as the sanctuary’s official greeter, his personality is the heart of Decent Ducks. Bandit was one of our first residents and continues to set the vibe for the whole flock.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_4297.jpeg?alt=media&token=6bf819bf-3329-4dea-8fe4-e715d60978c7',
    liveStatus: 'King of the Pond 👑'
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Resolve dynamic duck data vs fallback logic
  const duck = featuredBird ? {
    id: featuredBird.id,
    name: featuredBird.name,
    breed: featuredBird.breed,
    title: 'April Duck of the Month',
    // Dynamic bio from backstory or personality, fallback to original Bandit snippet if empty
    bio: featuredBird.backstory || featuredBird.personalityTraits || defaultData.bio,
    imageUrl: featuredBird.primaryImageUrl || defaultData.imageUrl,
    liveStatus: featuredBird.liveStatus || 'Spotlight Star 🌟'
  } : defaultData;

  const handleSupportClick = () => {
    router.push(`/support?bird=${encodeURIComponent(duck.name)}#membership`);
  };

  return (
    <Card className="relative w-full max-w-5xl overflow-hidden bg-card border-4 border-primary/50 shadow-2xl shadow-primary/10 rounded-[2.5rem] group animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Trophy className="h-32 w-32 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
        {/* Left Side: Photo (Dynamically populated from duck.imageUrl) */}
        <div className="md:col-span-5 relative aspect-square md:aspect-auto min-h-[350px] overflow-hidden bg-muted">
          <Image 
            src={duck.imageUrl} 
            alt={duck.name} 
            fill 
            className="object-cover transition-transform duration-10000 group-hover:scale-110" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:hidden" />
        </div>

        {/* Right Side: Details */}
        <div className="md:col-span-7 p-8 md:p-12 space-y-6 relative z-10 flex flex-col justify-center">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] px-4 py-1 shadow-lg flex items-center w-fit gap-2">
                <Trophy className="h-3.5 w-3.5" /> {duck.title.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-secondary/50 text-secondary font-black text-[10px] uppercase tracking-[0.3em] px-4 py-1 bg-secondary/5">
                <Zap className="h-3 w-3 mr-1.5" /> {duck.liveStatus}
              </Badge>
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
              Meet <span className="text-primary">{duck.name}</span>
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">{duck.breed}</p>
          </div>

          <div className="space-y-4">
            <p className="text-lg md:text-xl font-medium text-foreground/90 italic leading-relaxed">
              "{duck.bio}"
            </p>
            
            <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-2xl space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> Monthly Mission
              </p>
              <p className="text-sm font-bold text-foreground/80 leading-relaxed">
                Support our featured resident, {duck.name}, this month and join the digital flock to follow his daily adventures.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSupportClick}
              className="bg-primary text-primary-foreground font-black h-14 px-8 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 group/btn flex-1"
            >
              <Heart className="h-5 w-5 fill-current" />
              SUPPORT {duck.name.toUpperCase()}
            </Button>
            <Button asChild variant="outline" className="border-primary text-primary font-black h-14 px-8 rounded-2xl hover:bg-primary/10 flex-1 flex items-center justify-center gap-2">
              <Link href={duck.id === 'bandit-id' ? '/flock' : `/residents/${duck.id}`}>
                VIEW PROFILE <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
