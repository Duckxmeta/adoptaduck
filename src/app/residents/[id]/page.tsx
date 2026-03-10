
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdoptionModal } from '@/components/residents/AdoptionModal';
import { Egg, Heart, History, Info, ShieldCheck, Stethoscope, Sparkles, MapPin, Camera, Lock, CheckCircle2, TreePine, ChevronRight, User } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, where } from 'firebase/firestore';
import { Resident, HealthLogEntry } from '@/lib/types';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import Link from 'next/link';

const COMMUNITY_NAMES = ['Joey', 'Jordie', 'Cutie Pie', 'Huey'];

export default function ResidentProfile() {
  const { id } = useParams() as { id: string };
  const firestore = useFirestore();
  const { user } = useUser();

  const birdRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'birds', id);
  }, [firestore, id]);

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !id || !user) return null;
    return query(collection(firestore, 'birds', id, 'healthLogs'), orderBy('logDate', 'desc'));
  }, [firestore, id, user]);

  const offspringQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return query(
      collection(firestore, 'birds'), 
      where('motherId', '==', id)
    );
  }, [firestore, id]);
  
  const fatherOffspringQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return query(
      collection(firestore, 'birds'), 
      where('fatherId', '==', id)
    );
  }, [firestore, id]);

  const { data: bird, isLoading } = useDoc<Resident>(birdRef);
  const { data: logs } = useCollection<HealthLogEntry>(logsQuery);
  const { data: motherChildren } = useCollection<Resident>(offspringQuery);
  const { data: fatherChildren } = useCollection<Resident>(fatherOffspringQuery);

  const children = [...(motherChildren || []), ...(fatherChildren || [])].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const motherRef = useMemoFirebase(() => {
    if (!firestore || !bird?.motherId) return null;
    return doc(firestore, 'birds', bird.motherId);
  }, [firestore, bird?.motherId]);

  const fatherRef = useMemoFirebase(() => {
    if (!firestore || !bird?.fatherId) return null;
    return doc(firestore, 'birds', bird.fatherId);
  }, [firestore, bird?.fatherId]);

  const { data: mother } = useDoc<Resident>(motherRef);
  const { data: father } = useDoc<Resident>(fatherRef);

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
  const isCommunity = bird ? (COMMUNITY_NAMES.includes(bird.name) || !!bird.isCommunityDuck) : false;
  const isFounding = !bird?.motherId && !bird?.fatherId;

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
                   {isCommunity && (
                     <Badge className="bg-secondary text-secondary-foreground border-none font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs shadow-lg">Community Resident</Badge>
                   )}
                   {isFounding && (
                     <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs">Founding Resident</Badge>
                   )}
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
                <div className="bg-card p-8 rounded-2xl border border-border flex flex-col justify-between">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <History className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Source</span>
                  </div>
                  <span className="text-2xl font-headline font-black uppercase tracking-tight">{bird?.source || 'Founding'}</span>
                </div>
                <div className="bg-card p-8 rounded-2xl border border-border">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <Heart className="h-5 w-5 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sanctuary Status</span>
                  </div>
                  <span className="text-2xl font-headline font-black text-secondary uppercase tracking-tight">Protected</span>
                </div>
              </div>

              {/* Sanctuary Lineage Component */}
              <div className="space-y-4 pt-4">
                <h3 className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <TreePine className="h-4 w-4" /> Sanctuary Lineage
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isFounding ? (
                    <div className="col-span-full">
                       <Badge className="bg-primary/10 text-primary border-primary/20 py-3 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] w-full flex justify-center items-center gap-2 border shadow-lg">
                         <Sparkles className="h-4 w-4" /> Founding Resident
                       </Badge>
                       <p className="text-[9px] text-muted-foreground uppercase font-black text-center mt-3 tracking-widest opacity-60">One of the original Sanctuary Founders</p>
                    </div>
                  ) : (
                    <>
                      {mother ? (
                        <Link href={`/residents/${mother.id}`} className="group p-4 bg-card border border-border rounded-2xl hover:border-primary transition-all shadow-md hover:shadow-primary/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Mother:</span>
                          <span className="font-headline font-black text-lg uppercase group-hover:text-primary transition-colors">{mother.name}</span>
                        </Link>
                      ) : (
                        <div className="p-4 bg-muted/5 border border-dashed border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground italic opacity-50">
                          Mother: Unknown / Original
                        </div>
                      )}
                      
                      {father ? (
                        <Link href={`/residents/${father.id}`} className="group p-4 bg-card border border-border rounded-2xl hover:border-primary transition-all shadow-md hover:shadow-primary/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Father:</span>
                          <span className="font-headline font-black text-lg uppercase group-hover:text-primary transition-colors">{father.name}</span>
                        </Link>
                      ) : (
                        <div className="p-4 bg-muted/5 border border-dashed border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground italic opacity-50">
                          Father: Unknown / Original
                        </div>
                      )}
                    </>
                  )}
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
              </div>
            </div>
          </div>

          <div className="mt-24">
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-10">
                <TabsTrigger value="story" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-4 border-primary rounded-none px-0 py-6 font-headline font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                  <History className="h-4 w-4" /> Rescue Story
                </TabsTrigger>
                <TabsTrigger value="lineage" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-4 border-primary rounded-none px-0 py-6 font-headline font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                   <TreePine className="h-4 w-4" /> Offspring & History
                </TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-4 border-primary rounded-none px-0 py-6 font-headline font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3">
                  <Stethoscope className="h-4 w-4" /> Sanctuary Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="py-16">
                <div className="max-w-3xl space-y-12">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Resident Background</h4>
                    <p className="text-xl leading-relaxed text-muted-foreground font-medium border-l-4 border-primary pl-8 py-4">
                      {bird?.backstory}
                    </p>
                  </div>
                  
                  {bird?.source === 'Rehomed' && (
                    <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Rehoming History</h5>
                      <p className="text-sm text-muted-foreground italic">
                        This resident was rescued and rehomed into our care from a domestic environment where they could no longer be supported.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="lineage" className="py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-10">
                     <div className="space-y-6">
                        <h4 className="font-headline font-black text-xl flex items-center gap-3 text-primary"><ChevronRight className="h-6 w-6" /> SANCTUARY OFFSPRING</h4>
                        {children.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {children.map(child => (
                              <Link key={child.id} href={`/residents/${child.id}`} className="group flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary transition-all shadow-sm">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-primary/20">
                                  <Image src={child.primaryImageUrl} alt={child.name} fill className="object-cover" />
                                </div>
                                <p className="font-headline font-black uppercase text-sm group-hover:text-primary transition-colors truncate">{child.name}</p>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 bg-muted/5 border border-dashed border-border rounded-2xl text-center">
                            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest italic">No sanctuary-born offspring recorded.</p>
                          </div>
                        )}
                     </div>
                   </div>

                   <div className="space-y-8">
                      <Card className="bg-primary/5 border-2 border-primary/20 p-8 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                           <h4 className="font-headline font-black text-2xl tracking-tighter uppercase">Sanctuary Heritage</h4>
                           <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                             {bird?.heritageTree || "Historical records for this resident are verified by the sanctuary medical team. Every resident marks a new chapter in our flock's story."}
                           </p>
                           {isFounding && (
                             <div className="pt-4 flex items-center gap-3">
                               <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-lg"><TreePine className="h-5 w-5" /></div>
                               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Founding Gen Resident</span>
                             </div>
                           )}
                        </div>
                        <Sparkles className="absolute -bottom-10 -right-10 h-32 w-32 text-primary/10 -rotate-12" />
                      </Card>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="py-16">
                <div className="max-w-3xl">
                  {!user ? (
                    <div className="bg-secondary/5 border-2 border-secondary/20 p-10 rounded-3xl flex flex-col justify-center items-center text-center">
                      <Lock className="h-16 w-16 text-secondary mb-6" />
                      <h4 className="font-headline font-black text-2xl mb-3 tracking-tighter uppercase">Member Exclusive</h4>
                      <p className="text-muted-foreground font-medium">Wellness updates are reserved for our Adopters and Sanctuary Viewers.</p>
                    </div>
                  ) : logs && logs.length > 0 ? (
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-secondary before:to-transparent">
                      {logs.map((log) => (
                        <div key={log.id} className="relative flex items-start gap-8 group">
                          <div className="absolute left-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-card border-2 border-primary z-10 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-5 w-5 text-[#14F195]" />
                          </div>
                          <div className="flex-1 bg-card/50 border border-border p-6 rounded-2xl ml-12">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                {format(new Date(log.logDate), 'MMMM dd, yyyy')}
                              </span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                              {log.notes}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground italic font-medium">
                      No health logs available for this resident yet.
                    </div>
                  )}
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
