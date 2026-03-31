
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bird, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

/**
 * @fileOverview Stripe Cancel Page.
 * A polite exit page that maintains sanctuary vibes and encourages future support.
 */

export default function StripeCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full space-y-12 text-center animate-in fade-in duration-700">
          
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center border-2 border-secondary/20">
              <Bird className="h-10 w-10 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
              NO <span className="text-secondary">WORRIES!</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-medium">
              Cocoa and Puff will be here if you change your mind.
            </p>
          </div>

          <Card className="bg-card border-border border-2 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <CardContent className="p-0 space-y-8">
              <div className="space-y-4">
                <p className="text-foreground/80 leading-relaxed font-medium">
                  We understand! Whether you're ready to join the flock today or simply want to browse, we're glad you're here.
                </p>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl italic text-sm text-muted-foreground">
                  "A modern, transparent sanctuary providing a peaceful, high-quality home for domestic ducks."
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="h-14 px-8 border-border font-black uppercase text-xs tracking-widest rounded-xl hover:bg-muted/10">
                  <Link href="/flock"><Bird className="mr-2 h-4 w-4" /> BROWSE RESIDENTS</Link>
                </Button>
                <Button asChild className="h-14 px-8 bg-secondary text-secondary-foreground font-black uppercase text-xs tracking-widest rounded-xl shadow-lg hover:scale-105 transition-transform">
                  <Link href="/support">BACK TO SUPPORT <ArrowLeft className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50">
            Decent Ducks Sanctuary • Virtual Rescue Operation 2026
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
