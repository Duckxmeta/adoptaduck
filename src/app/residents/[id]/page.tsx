"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdoptionModal } from '@/components/residents/AdoptionModal';
import { Egg, Heart, History, Info, ShieldCheck, Stethoscope, Sparkles } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Resident } from '@/lib/types';

export default function ResidentProfile() {
  const { id } = useParams() as { id: string };
  const firestore = useFirestore();

  const birdRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'birds', id);
  }, [firestore, id]);

  const { data: bird, isLoading } = useDoc<Resident>(birdRef);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-bold uppercase tracking-widest animate-pulse">Loading Resident...</div>;
  }

  if (!bird && !isLoading) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pb-24">
        {/* Header Section */}
        <div className="container mx-auto px-4 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-secondary/20 glow-purple">
                <Image
                  src={bird?.image_url || 'https://picsum.photos/seed/bird/600/600'}
                  alt={bird?.name || 'Bird'}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                   <Badge className="bg-black/60 text-white backdrop-blur-md uppercase tracking-wider">{bird?.breed}</Badge>
                   <Badge className="bg-black/60 text-white backdrop-blur-md uppercase tracking-wider">{bird?.sex}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                    <Image
                      src={`https://picsum.photos/seed/bird${i}${bird?.id}/200/200`}
                      alt={`${bird?.name} gallery ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-8">
              <div>
                <h1 className="text-6xl font-headline font-black text-primary mb-2 uppercase">{bird?.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground font-medium uppercase tracking-widest">
                  <span>{bird?.breed}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span>{bird?.sex}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card text-card-foreground p-6 rounded-xl border-l-4 border-primary">
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <Egg className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Egg Counter</span>
                  </div>
                  <span className="text-4xl font-headline font-black">{bird?.egg_counter || 0}</span>
                </div>
                <div className="bg-card text-card-foreground p-6 rounded-xl border-l-4 border-secondary">
                  <div className="flex items-center gap-3 text-muted-foreground mb-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Status</span>
                  </div>
                  <span className="text-xl font-headline font-black text-secondary uppercase">Safe Resident</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-headline font-bold text-lg text-primary uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Personality Traits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bird?.personality_traits?.map((trait, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm py-1.5 px-4 border-secondary text-secondary bg-secondary/5">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                {bird && <AdoptionModal resident={bird} />}
                <p className="text-[10px] mt-3 text-center text-muted-foreground uppercase tracking-widest font-bold">
                  100% of proceeds directly fund {bird?.name}'s rescue & care
                </p>
              </div>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="mt-20">
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="bg-transparent border-b border-secondary/20 w-full justify-start rounded-none h-auto p-0 gap-8">
                <TabsTrigger value="story" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 border-primary rounded-none px-0 py-4 font-headline font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                  <History className="h-4 w-4" /> Rescue Story
                </TabsTrigger>
                <TabsTrigger value="lineage" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 border-primary rounded-none px-0 py-4 font-headline font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                   <Info className="h-4 w-4" /> Lineage
                </TabsTrigger>
                <TabsTrigger value="health" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 border-primary rounded-none px-0 py-4 font-headline font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                   <Stethoscope className="h-4 w-4" /> Health Record
                </TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="py-12">
                <div className="max-w-3xl prose prose-invert">
                  <p className="text-lg leading-relaxed text-muted-foreground italic border-l-4 border-primary pl-6 py-2">
                    {bird?.backstory}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="lineage" className="py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-card text-card-foreground p-8 rounded-2xl">
                     <h4 className="font-headline font-bold text-xl mb-6 flex items-center gap-2"><History className="text-primary h-5 w-5" /> Heritage Records</h4>
                     <ul className="space-y-4">
                        {bird?.heritage_tree?.map((ancestor, i) => (
                          <li key={i} className="flex items-center gap-4 border-b border-background pb-3 last:border-0">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="font-bold">{ancestor}</span>
                          </li>
                        ))}
                        {(!bird?.heritage_tree || bird?.heritage_tree.length === 0) && (
                          <p className="text-muted-foreground italic">Lineage records are currently restricted to authorized personnel only.</p>
                        )}
                     </ul>
                   </div>
                   <div className="bg-secondary/5 border border-secondary/20 p-8 rounded-2xl flex flex-col justify-center items-center text-center">
                      <ShieldCheck className="h-12 w-12 text-secondary mb-4" />
                      <h4 className="font-headline font-bold text-xl mb-2">Verified Resident</h4>
                      <p className="text-sm text-muted-foreground">This bird is a verified resident of the Decent Ducks Sanctuary. Transparency records updated daily.</p>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="health" className="py-12">
                 <div className="bg-card text-card-foreground p-8 rounded-2xl overflow-hidden">
                    <h4 className="font-headline font-bold text-xl mb-6 uppercase tracking-wider">Medical History</h4>
                    <div className="space-y-6">
                      {bird?.health_notes?.map((note, idx) => (
                        <div key={idx} className="flex gap-6">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-primary mb-2" />
                            <div className="w-0.5 flex-1 bg-secondary/20" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary mb-1">{note.date}</p>
                            <p className="text-muted-foreground">{note.note}</p>
                          </div>
                        </div>
                      ))}
                      {(!bird?.health_notes || bird?.health_notes.length === 0) && (
                        <p className="text-muted-foreground italic">No medical events recorded recently. {bird?.name} is thriving!</p>
                      )}
                    </div>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}