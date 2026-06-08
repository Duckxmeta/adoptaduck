"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCollection, useFirestore, useMemoFirebase, useStorage } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bird, Zap, Loader2, Sparkles, ArrowRight, ShieldCheck, Trophy, GitBranch, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { StoryModal } from '@/components/residents/StoryModal';
import { cn, getResidentName } from '@/lib/utils';
import { ref, getDownloadURL } from 'firebase/storage';

const RESIDENT_IMAGE_MAP: Record<string, string> = {};

export default function BrowseFlock() {
  const firestore = useFirestore();

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'));
  }, [firestore]);

  const { data: birds, isLoading } = useCollection<Resident>(birdsQuery);

  const activeBirds = birds
    ? [...birds]
        .filter(b => ['bandit', 'moxie'].includes(b.name?.toLowerCase().trim()))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
    : [];

  const foundingMembers = activeBirds.filter(b => b.isFoundingResident || b.generation === 0 || b.founder) || [];
  const standardResidents = activeBirds.filter(b => !b.isFoundingResident && b.generation !== 0 && !b.founder) || [];

  const BirdCard = ({ bird }: { bird: Resident }) => {
    const storage = useStorage();
    const [resolvedImage, setResolvedImage] = useState<string | null>(null);
    const isFounder = bird.isFoundingResident || bird.generation === 0 || bird.founder;
    const isCommunity = bird.isCommunityDuck;
    const displayName = getResidentName(bird);

    useEffect(() => {
      async function resolve() {
        if (RESIDENT_IMAGE_MAP[bird.name]) {
          setResolvedImage(RESIDENT_IMAGE_MAP[bird.name]);
          return;
        }

        const url = bird.primaryImageUrl;
        if (!url) return;
        if (url.startsWith('http')) {
          setResolvedImage(url);
          return;
        }
        try {
          const imageRef = ref(storage, `resident-photos/${url}`);
          const downloadUrl = await getDownloadURL(imageRef);
          setResolvedImage(downloadUrl);
        } catch (e) {}
      }
      resolve();
    }, [bird.primaryImageUrl, bird.name, storage]);

    return (
      <Card 
        key={bird.id} 
        className={cn(
          "group bg-card border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-500",
          isFounder ? "border-primary/50 shadow-primary/10 glow-primary ring-1 ring-primary/20" : 
          isCommunity ? "border-secondary/50 shadow-secondary/20 glow-purple ring-1 ring-secondary/20" : "hover:glow-purple"
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
          {resolvedImage ? (
            <Image 
              src={resolvedImage} 
              alt={`${displayName} - ${bird.breed}`} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🦆</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className="w-fit bg-background/90 backdrop-blur-md text-foreground border-border font-black text-[10px] uppercase tracking-wider px-3 py-1">
              {bird.breed}
            </Badge>
          </div>

          <div className="absolute top-4 right-4">
            {bird.generation === 0 || (bird.generation === undefined && isFounder) ? (
              <Badge className="bg-primary text-primary-foreground border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-lg flex items-center gap-1.5">
                <Trophy className="h-3 w-3" /> G0 FOUNDER
              </Badge>
            ) : bird.generation && bird.generation > 0 ? (
              <Badge className="bg-secondary text-secondary-foreground border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-lg">
                G{bird.generation}
              </Badge>
            ) : null}
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-3xl font-headline font-black text-white uppercase tracking-tighter leading-none mb-2">{displayName}</h3>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{bird.sex === 'female' ? 'Hen' : 'Drake'}</p>
          </div>
        </div>
        <CardContent className="p-8 flex-1 flex flex-col space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-secondary" /> Institutional Roster
            </h4>
            <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">
              "{bird.personalityTraits}"
            </p>
          </div>
          
          <div className="pt-4 mt-auto flex flex-col gap-3">
            <Button asChild className="w-full bg-primary text-black font-black h-14 rounded-xl shadow-lg hover:scale-105 transition-transform uppercase text-xs tracking-widest">
              <Link href="/support">
                <Zap className="mr-2 h-4 w-4 fill-current" /> VIEW MISSION TIERS
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest border-secondary/20 text-secondary hover:bg-secondary/5 h-12 rounded-xl">
              <Link href={`/residents/${bird.id}/tree`}>
                <GitBranch className="mr-2 h-4 w-4" /> VIEW HERITAGE TREE
              </Link>
            </Button>

            <Button asChild variant="secondary" className="w-full text-[10px] font-black uppercase tracking-widest h-12 rounded-xl shadow-md hover:scale-105 transition-transform">
              <Link href={`/residents/${bird.id}`}>
                <User className="mr-2 h-4 w-4" /> VIEW FULL PROFILE
              </Link>
            </Button>

            <StoryModal 
              resident={bird}
              trigger={
                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  View Mission Context <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              }
            />
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
            The Sanctuary Flock
          </Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-tight">
            THE FLOCK <span className="text-primary">ROSTER</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Explore the lineage and mission roles of our feathered residents. Membership funds foundational infrastructure and high-fidelity care.
          </p>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-24">
            {foundingMembers.length > 0 && (
              <section className="space-y-12">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-border flex-1" />
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0">Mission Mascots (Founding)</h2>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {foundingMembers.map((bird) => (
                    <BirdCard key={bird.id} bird={bird} />
                  ))}
                </div>
              </section>
            )}

            {standardResidents.length > 0 && (
              <section className="space-y-12">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-border flex-1" />
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground shrink-0">Sanctuary Residents</h2>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {standardResidents.map((bird) => (
                    <BirdCard key={bird.id} bird={bird} />
                  ))}
                </div>
              </section>
            )}

            {birds?.length === 0 && (
              <p className="text-center text-muted-foreground py-12 italic">Synchronizing roster records...</p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
