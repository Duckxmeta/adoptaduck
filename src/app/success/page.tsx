
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Trophy, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * @fileOverview High-contrast Stripe Success Page.
 * Celebrates new Guardians using the ArchitectUX 8-point grid.
 */

export default function StripeSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      
      <main className="flex-1 py-20 px-4 flex flex-col items-center justify-center">
        <div className="container mx-auto max-w-4xl text-center space-y-12">
          
          {/* Header Section */}
          <div className="space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary glow-primary animate-bounce">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-none">
              WELCOME TO THE <span className="text-primary">FLOCK!</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Welcome to the Flock, Guardian! Your support provides a high-quality home for our rescued birds.
            </p>
          </div>

          {/* G0 Founder Visual Anchor */}
          <div className="relative group animate-in zoom-in duration-700 delay-300">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <Card className="relative overflow-hidden bg-card border-[6px] border-primary rounded-[3rem] shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
              <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto min-h-[400px]">
                  <Image 
                    src="https://picsum.photos/seed/cocoapuff/800/600" 
                    alt="Cocoa and Puff" 
                    fill 
                    className="object-cover"
                    priority
                    data-ai-hint="cocoa puff ducks"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-card" />
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-6">
                  <div className="space-y-2">
                    <span className="text-primary font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Guardian Activated
                    </span>
                    <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter leading-none">
                      COCOA & <span className="text-primary">PUFF</span>
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed italic">
                    "Every egg counted is a victory. Your support ensures our inaugural G0 founders and the entire flock live in safety and comfort."
                  </p>
                  <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-10 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform w-full md:w-auto">
                    <Link href="/dashboard">ENTER DASHBOARD <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
              A modern, transparent sanctuary providing a peaceful, high-quality home for domestic ducks.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
