"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bird, Heart, Loader2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AdoptionModal } from '@/components/residents/AdoptionModal';
import { cn } from '@/lib/utils';

const COMMUNITY_NAMES = ['Joey', 'Jordie', 'Cutie Pie', 'Huey'];
const PARTNER_MAP: Record<string, string> = {
  'Joey': 'Solana Strays',
  'Jordie': 'Quakk',
  'Cutie Pie': 'Quakey',
  'Huey': 'Gods'
};

export default function BrowseFlock() {
  const firestore = useFirestore();

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: birds, isLoading } = useCollection<Resident>(birdsQuery);

  const communityBirds = birds?.filter(b => {
    const name = b.name?.trim().toLowerCase().replace(/\s+/g, '');
    const isNamedCommunity = COMMUNITY_NAMES.some(cn => cn.toLowerCase().replace(/\s+/g, '') === name);
    return isNamedCommunity || b.isCommunityDuck;
  }) || [];
  
  const individualBirds = birds?.filter(b => {
    const name = b.name?.trim().toLowerCase().replace(/\s+/g, '');
    const isNamedCommunity = COMMUNITY_NAMES.some(cn => cn.toLowerCase().replace(/\s+/g, '') === name);
    return !isNamedCommunity && !b.isCommunityDuck;
  }) || [];

  const BirdCard = ({ bird }: { bird: Resident }) => {
    const nameNorm = bird.name?.trim().toLowerCase().replace(/\s+/g, '');
    const isCommunity = COMMUNITY_NAMES.some(cn => cn.toLowerCase().replace(/\s+/g, '') === nameNorm) || !!bird.isCommunityDuck;
    
    // Find partner name by normalized match
    const partnerKey = COMMUNITY_NAMES.find(cn => cn.toLowerCase().replace(/\s+/g, '') === nameNorm);
    const partnerName = partnerKey ? PARTNER_MAP[partnerKey] : null;

    return (
      <Card 
        key={bird.id} 
        className={cn(
          "group bg-card border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-500",
          isCommunity ? "border-secondary/50 shadow-secondary/20 glow-purple ring-1 ring-secondary/20" : "hover:glow-purple"
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image 
            src={bird.primaryImageUrl} 
            alt={bird.name} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className="w-fit bg-background/90 backdrop-blur-md text-foreground border-border font-black text-[10px] uppercase tracking-wider px-3 py-1">
              {bird.breed}
            </Badge>
            {isCommunity && (
              <Badge className="w-fit bg-secondary text-secondary-foreground border-none font-black text-[10px] uppercase tracking-wider px-3 py-1 shadow-lg flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> {partnerName ? `ADOPTED BY ${partnerName.toUpperCase()}` : 'PARTNER ADOPTION'}
              </Badge>
            )}
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-3xl font-headline font-black text-white uppercase tracking-tighter leading-none mb-2">{bird.name}</h3>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{bird.sex === 'female' ? 'Hen' : 'Drake'}</p>
          </div>
        </div>
        <CardContent className="p-8 flex-1 flex flex-col space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-secondary" /> Personality Profile
            </h4>
            <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">
              "{bird.personalityTraits}"
            </p>
          </div>
          
          <div className="pt-4 mt-auto flex flex-col gap-3">
            {isCommunity ? (
              <AdoptionModal 
                resident={bird} 
                trigger={
                  <Button variant="outline" className="w-full border-secondary/40 text-secondary font-black h-14 rounded-xl hover:bg-secondary/10 transition-all uppercase text-xs tracking-widest shadow-sm">
                    <Sparkles className="mr-2 h-4 w-4" /> COMMUNITY RESIDENT
                  </Button>
                }
              />
            ) : (
              <AdoptionModal 
                resident={bird} 
                trigger={
                  <Button className="w-full bg-primary text-primary-foreground font-black h-14 rounded-xl shadow-lg hover:scale-105 transition-transform uppercase text-xs tracking-widest">
                    <Heart className="mr-2 h-4 w-4 fill-current" /> Adopt {bird.name}
                  </Button>
                }
              />
            )}
            <Button variant="ghost" asChild className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
              <Link href={`/residents/${bird.id}`}>View Full Rescue Story <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-20 space-y-24">
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
            Meet the Residents
          </Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-tight">
            THE <span className="text-primary">SANCTUARY</span> FLOCK
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Every duck here has a story. Browse our residents and find a friend to support through our virtual adoption program.
          </p>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-24">
            {/* Community Residents Section */}
            {communityBirds.length > 0 && (
              <section className="space-y-12">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-border flex-1" />
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-secondary shrink-0">Community Residents</h2>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {communityBirds.map((bird) => (
                    <BirdCard key={bird.id} bird={bird} />
                  ))}
                </div>
              </section>
            )}

            {/* Individual Adoptions Section */}
            <section className="space-y-12">
              <div className="flex items-center gap-4">
                <div className="h-px bg-border flex-1" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0">Individual Adoptions</h2>
                <div className="h-px bg-border flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {individualBirds.map((bird) => (
                  <BirdCard key={bird.id} bird={bird} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
