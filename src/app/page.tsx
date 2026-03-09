"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ResidentCard } from '@/components/residents/ResidentCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Bird, Egg } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Resident } from '@/lib/types';

export default function Home() {
  const firestore = useFirestore();
  
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const statsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'sanctuaryStats');
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: stats } = useCollection<any>(statsQuery);
  
  const globalStats = stats?.find(s => s.id === 'globalStats');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-110"
            style={{ backgroundImage: `url('https://picsum.photos/seed/duckhero/1920/1080')` }}
            data-ai-hint="bird sanctuary"
          />
          
          <div className="container mx-auto px-4 relative z-20 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-xs font-bold mb-6 glow-purple">
              <Sparkles className="h-3 w-3" />
              COMMUNITY-FIRST SANCTUARY
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black mb-6 leading-tight uppercase">
              DECENT <span className="text-primary">DUCKS</span><br />
              SANCTUARY
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A modern haven for feathered friends. Meet our residents and support their journey through virtual adoption.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground font-bold hover:glow-yellow" asChild>
                <Link href="#residents">MEET THE RESIDENTS</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-secondary text-secondary font-bold hover:bg-secondary/10" asChild>
                <Link href="/about">OUR MISSION</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Live Stats Bar */}
        <section className="bg-secondary/10 border-y border-secondary/20 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               <div className="flex flex-col items-center text-center space-y-2">
                 <Bird className="h-6 w-6 text-primary" />
                 <p className="text-3xl font-headline font-black">{globalStats?.totalBirds || 0}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Residents Safe</p>
               </div>
               <div className="flex flex-col items-center text-center space-y-2">
                 <Egg className="h-6 w-6 text-success" />
                 <p className="text-3xl font-headline font-black animate-pulse">{globalStats?.totalEggsRescuedToday || 0}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rescues Today</p>
               </div>
               <div className="hidden md:flex flex-col items-center text-center space-y-2">
                 <Sparkles className="h-6 w-6 text-secondary" />
                 <p className="text-3xl font-headline font-black">100%</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transparency</p>
               </div>
               <div className="hidden md:flex flex-col items-center text-center space-y-2">
                 <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center font-bold text-black text-xs">P</div>
                 <p className="text-3xl font-headline font-black">LIVE</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sanctuary Feed</p>
               </div>
            </div>
          </div>
        </section>

        {/* Resident Grid */}
        <section id="residents" className="py-24 container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-headline font-bold mb-4 uppercase">OUR RESIDENTS</h2>
              <div className="h-1 w-20 bg-primary" />
              <p className="text-muted-foreground mt-4 max-w-lg">
                Each duck here has a unique story, personality, and a place in our heart. Click to learn more.
              </p>
            </div>
          </div>

          {birdsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-card rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {birds?.map((bird) => (
                <ResidentCard key={bird.id} resident={bird} />
              ))}
              {birds?.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-secondary/20 rounded-2xl">
                  <p className="text-muted-foreground font-bold uppercase tracking-widest">No residents found. Our team is out on rescue missions!</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Call to Action Banner */}
        <section className="py-20 bg-card text-card-foreground">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-4xl font-headline font-black mb-6 uppercase">READY TO MAKE A DIFFERENCE?</h2>
            <p className="text-muted-foreground text-lg mb-10">
              Your support directly funds the care of these birds. Join us in creating the world's most transparent bird sanctuary.
            </p>
            <Button size="lg" className="bg-secondary text-secondary-foreground font-bold hover:glow-purple px-12 h-16 text-lg" asChild>
              <a href="https://www.paypal.com/donate?business=decentducks@example.com" target="_blank" rel="noopener noreferrer">
                DONATE TO SANCTUARY
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}