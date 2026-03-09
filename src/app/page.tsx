"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ResidentCard } from '@/components/residents/ResidentCard';
import { Button } from '@/components/ui/button';
import { Sparkles, Bird, Egg, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Resident, SanctuaryStatistic } from '@/lib/types';

export default function Home() {
  const firestore = useFirestore();
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";
  
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const statsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'sanctuaryStats');
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: stats } = useCollection<SanctuaryStatistic>(statsRef);
  
  const globalStats = stats?.find(s => s.id === 'globalStats');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
            style={{ backgroundImage: `url('https://picsum.photos/seed/duckhero/1920/1080')` }}
            data-ai-hint="bird sanctuary"
          />
          
          <div className="container mx-auto px-4 relative z-20 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest mb-6 uppercase border border-secondary/50 glow-purple shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              Dedicated Bird Sanctuary
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black mb-6 leading-[0.9] tracking-tighter">
              DECENT <span className="text-primary">DUCKS</span><br />
              SANCTUARY
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium">
              A haven for feathered friends. Meet our residents and support their journey through direct sanctuary donation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground font-black hover:scale-105 transition-transform h-14 px-10 text-lg rounded-xl shadow-2xl" asChild>
                <Link href="#residents">MEET THE RESIDENTS</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary font-black hover:bg-primary/10 h-14 px-10 text-lg rounded-xl" asChild>
                <a href={donateUrl} target="_blank" rel="noopener noreferrer">DONATE TO MISSION</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Live Stats Bar */}
        <section className="bg-card/50 backdrop-blur-sm border-y border-border py-12 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
               <div className="flex flex-col items-center text-center space-y-3">
                 <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <Bird className="h-8 w-8 text-primary" />
                 </div>
                 <div>
                    <p className="text-4xl font-headline font-black">{globalStats?.totalBirds || birds?.length || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Residents</p>
                 </div>
               </div>
               <div className="flex flex-col items-center text-center space-y-3">
                 <div className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20">
                    <Egg className="h-8 w-8 text-secondary" />
                 </div>
                 <div>
                    <p className="text-4xl font-headline font-black text-secondary animate-pulse">{globalStats?.totalEggsRescuedToday || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rescues Today</p>
                 </div>
               </div>
               <div className="hidden md:flex flex-col items-center text-center space-y-3">
                 <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <Heart className="h-8 w-8 text-primary" />
                 </div>
                 <div>
                    <p className="text-4xl font-headline font-black">100%</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Direct Support</p>
                 </div>
               </div>
               <div className="hidden md:flex flex-col items-center text-center space-y-3">
                 <div className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20">
                    <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center font-black text-white text-[10px] animate-ping">LIVE</div>
                 </div>
                 <div>
                    <p className="text-4xl font-headline font-black">ACTIVE</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sanctuary Monitor</p>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Resident Grid */}
        <section id="residents" className="py-32 container mx-auto px-4">
          <div className="mb-20 text-center">
            <h2 className="text-5xl font-headline font-black mb-4 tracking-tighter">OUR RESIDENTS</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto" />
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto text-lg font-medium">
              Every resident has a name, a unique personality, and a place here. Click to explore their stories.
            </p>
          </div>

          {birdsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-card rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {birds?.map((bird) => (
                <ResidentCard key={bird.id} resident={bird} />
              ))}
              {(!birds || birds.length === 0) && (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-3xl">
                  <Bird className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest">No residents found in sanctuary database.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
            <h2 className="text-5xl md:text-6xl font-headline font-black mb-6 tracking-tighter leading-none">HELP US PROVIDE A FOREVER HOME</h2>
            <p className="text-primary-foreground/90 text-xl mb-12 font-bold uppercase tracking-tight">
              Your donation directly funds the housing, nutrition, and medical care of every sanctuary resident.
            </p>
            <Button size="lg" className="bg-background text-foreground font-black hover:scale-110 transition-transform px-16 h-16 text-xl rounded-2xl shadow-2xl" asChild>
              <a href={donateUrl} target="_blank" rel="noopener noreferrer">
                DONATE VIA PAYPAL
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}