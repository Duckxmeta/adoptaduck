"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Sparkles,
  ShieldCheck,
  Trophy,
  ArrowRight,
  PartyPopper,
  Zap,
  CheckCircle2,
  TreePine
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function SuccessContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'NEW MEMBER';
  const birdName = searchParams.get('bird') || 'THE FLOCK';
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/DDSlogo.png?alt=media";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      
      <main className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-12">
          
          {/* Header Animation */}
          <div className="space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary glow-primary animate-bounce">
                <PartyPopper className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-none">
              WELCOME TO THE <span className="text-primary">FAMILY!</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Congratulations, {userName.toUpperCase()}! You are now an official Sanctuary Member. Your contribution directly ensures the safety and happiness of our residents.
            </p>
          </div>

          {/* Virtual Member Card */}
          <div className="relative group animate-in zoom-in duration-700 delay-300">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <Card className="relative overflow-hidden bg-card border-[6px] border-primary rounded-[3rem] shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
              <CardContent className="p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 text-left relative overflow-hidden">
                <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 text-primary/5 -rotate-12 pointer-events-none" />
                
                <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-[2rem] overflow-hidden border-4 border-primary shadow-xl">
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <Zap className="h-20 w-20 text-primary animate-pulse" />
                  </div>
                  <Image 
                    src={logoUrl} 
                    alt="Sanctuary Logo" 
                    fill 
                    className="object-contain p-8 mix-blend-screen"
                  />
                </div>

                <div className="space-y-6 flex-1 text-center md:text-left">
                  <div className="space-y-1">
                    <Badge className="bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] px-4 py-1">Verified Member</Badge>
                    <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">{userName}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Impact Tier</p>
                      <p className="font-headline font-black text-primary uppercase">Sanctuary Support</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Adopted Bird</p>
                      <p className="font-headline font-black text-secondary uppercase">{birdName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                    <CheckCircle2 className="h-4 w-4" /> Account Status: Premium Unlocked
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Card className="bg-card border-border rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-headline font-black text-sm uppercase">Access Dashboard</h3>
              <p className="text-xs text-muted-foreground font-medium">Explore live logs and the full sanctuary ledger.</p>
              <Button asChild variant="outline" className="w-full h-10 rounded-xl text-[10px] font-black tracking-widest uppercase">
                <Link href="/dashboard">Enter Portal</Link>
              </Button>
            </Card>

            <Card className="bg-card border-border rounded-2xl p-6 space-y-4 hover:border-secondary/30 transition-colors">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <TreePine className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-headline font-black text-sm uppercase">View Lineage</h3>
              <p className="text-xs text-muted-foreground font-medium">Trace the heritage of your adopted resident.</p>
              <Button asChild variant="outline" className="w-full h-10 rounded-xl text-[10px] font-black tracking-widest uppercase">
                <Link href="/flock">Explore Flock</Link>
              </Button>
            </Card>

            <Card className="bg-card border-border rounded-2xl p-6 space-y-4 hover:border-[#14F195]/30 transition-colors">
              <div className="w-12 h-12 bg-[#14F195]/10 rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-[#14F195]" />
              </div>
              <h3 className="font-headline font-black text-sm uppercase">Member Rights</h3>
              <p className="text-xs text-muted-foreground font-medium">Unlock exclusive naming rights for rescues.</p>
              <Button asChild variant="outline" className="w-full h-10 rounded-xl text-[10px] font-black tracking-widest uppercase">
                <Link href="/our-story">Read Mission</Link>
              </Button>
            </Card>
          </div>

          <div className="pt-8">
            <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
              <Link href="/dashboard">TAKE ME TO MY DASHBOARD <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MembershipSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="h-10 w-10 text-primary animate-pulse" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
