
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, ArrowRight, ShieldCheck, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WelcomeGuardian() {
  const heroImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_4297.jpeg?alt=media";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="relative aspect-video w-full rounded-[3rem] overflow-hidden border-4 border-primary shadow-2xl shadow-primary/20 group">
             <Image 
                src={heroImageUrl} 
                alt="The Sanctuary Flock" 
                fill 
                className="object-cover transition-transform duration-10000 scale-110 group-hover:scale-100"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
             <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                <div className="text-left">
                   <h1 className="text-5xl md:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-none">
                     THANK YOU, <span className="text-primary">GUARDIAN!</span>
                   </h1>
                   <p className="text-primary font-black uppercase tracking-[0.4em] text-xs mt-2">FLOCK VERIFIED SUPPORTER</p>
                </div>
                <PartyPopper className="h-16 w-16 text-primary animate-bounce hidden md:block" />
             </div>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-border p-10 rounded-[3rem] space-y-8 shadow-xl">
             <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                   <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
             </div>
             
             <div className="space-y-4">
                <h2 className="text-3xl font-headline font-black uppercase">Your Impact Starts Now</h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                   Your contribution ensures every duck in our care receives the nutrition, medical support, and protection they deserve. Your status has been upgraded to **Guardian**, unlocking your personal sanctuary dashboard.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-4 bg-background/50 rounded-2xl border border-border">
                   <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Heritage Trees</p>
                </div>
                <div className="p-4 bg-background/50 rounded-2xl border border-border">
                   <Heart className="h-5 w-5 text-secondary mx-auto mb-2" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Care Logs</p>
                </div>
                <div className="p-4 bg-background/50 rounded-2xl border border-border">
                   <ShieldCheck className="h-5 w-5 text-[#14F195] mx-auto mb-2" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Live Ledger</p>
                </div>
             </div>

             <div className="pt-6">
                <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                   <Link href="/dashboard">ENTER YOUR DASHBOARD <ArrowRight className="ml-3 h-5 w-5" /></Link>
                </Button>
             </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
             A confirmation email has been sent to your donation address.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
