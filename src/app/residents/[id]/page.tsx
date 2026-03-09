"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdoptionModal } from '@/components/residents/AdoptionModal';
import { Egg, Heart, History, Info, ShieldCheck, Stethoscope, Sparkles, MapPin, Camera } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ResidentProfile() {
  const { id } = useParams() as { id: string };
  const firestore = useFirestore();

  const birdRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'birds', id);
  }, [firestore, id]);

  const { data: bird, isLoading } = useDoc<Resident>(birdRef);

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

  const isHen = bird?.sex === 'female';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 pb-32">
        <div className="container mx-auto px-4 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Image Section */}
            <div className="space-y-6">
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-border shadow-2xl group">
                <Image
                  src={bird?.primaryImageUrl || 'https://picsum.photos/seed/bird/800/800'}
                  alt={bird?.name || 'Resident'}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                   <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs">{bird?.breed}</Badge>
                   <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs">{bird?.sex}</Badge>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-10">
              <div>
                <h1 className="text-7xl font-headline font-black text-primary tracking-tighter leading-[0.8] mb-4 uppercase">{bird?.name}</h1>
                <div className="flex items-center gap-6 text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">
                   <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-secondary" /> Main Aviary</span>
                   <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Verified Resident</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {isHen ? (
                  <div className="bg-card p-8 rounded-2xl border border-border glow-primary">
                    <div className="flex items-center gap-3 text-muted-foreground mb-4">
                      <Egg className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Rescued Eggs</span>
                    </div>
                    <span className="text-5xl font-headline font-black">{bird?.eggCounter || 0}</span>
                  </div>
                ) : (
                  <div className="bg-card p-8 rounded-2xl border border-border opacity-50">
                    <div className="flex items-center gap-3 text-muted-foreground mb-4">
                      <Bird className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Identity</span>
                    </div>
                    <span className="text-2xl font-headline font-black uppercase">Guardian</span>
                  </div>
                )}
                <div className="bg-card p-8 rounded-2xl border border-border">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <Heart className="h-5 w-5 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sanctuary Status</span>
                  </div>
                  <span className="text-2xl font-headline font-black text-secondary uppercase tracking-tight">Protected</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Personality Profile
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg italic">
                  "{bird?.personalityTraits}"
                </p>
              </div>

              <div className="pt-6">
                {bird && <AdoptionModal resident={bird as any} />}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">
                    100% of proceeds fund sanctuary operations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Life at the Sanctuary Gallery */}
          <div className="mt-24 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
               <h2 className="font-headline font-black text-2xl uppercase tracking-tight flex items-center gap-3">
                 <Camera className="h-6 w-6 text-primary" /> Life at the Sanctuary
               </h2>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Gallery Updates</span>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-6 p-1">
                {bird?.galleryImageUrls && bird.galleryImageUrls.length > 0 ? (
                  bird.galleryImageUrls.map((url, i) => (
                    <div key={i} className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden border border-border group">
                      <Image
                        src={url}
                        alt={`${bird.name} Gallery ${i}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map(i => (
                    <div key={i} className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden border border-border bg-card/50 flex items-center justify-center opacity-40 italic font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mb-2 block mx-auto opacity-20" />
                        Awaiting Updates
                      </div>
                    </div>
                  ))
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="mt-24">
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-10">
                <TabsTrigger value="story" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-4 border-primary rounded-none px-0 py-6 font-headline font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                  <History className="h-4 w-4" /> Rescue Story
                </TabsTrigger>
                <TabsTrigger value="lineage" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-4 border-primary rounded-none px-0 py-6 font-headline font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                   <Info className="h-4 w-4" /> Heritage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="py-16">
                <div className="max-w-3xl">
                  <p className="text-xl leading-relaxed text-muted-foreground font-medium border-l-4 border-primary pl-8 py-4">
                    {bird?.backstory}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="lineage" className="py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="bg-card p-10 rounded-3xl border border-border">
                     <h4 className="font-headline font-black text-xl mb-8 flex items-center gap-3"><History className="text-primary h-6 w-6" /> LINEAGE RECORDS</h4>
                     <p className="text-muted-foreground text-lg leading-relaxed">
                       {bird?.heritageTree || "Historical data for this resident is currently being archived by sanctuary staff."}
                     </p>
                   </div>
                   <div className="bg-secondary/5 border-2 border-secondary/20 p-10 rounded-3xl flex flex-col justify-center items-center text-center">
                      <ShieldCheck className="h-16 w-16 text-secondary mb-6" />
                      <h4 className="font-headline font-black text-2xl mb-3 tracking-tighter">VERIFIED RECORD</h4>
                      <p className="text-muted-foreground font-medium">This profile is managed and verified by the Decent Ducks Sanctuary medical team.</p>
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
