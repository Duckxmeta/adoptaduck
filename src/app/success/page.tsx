
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Trophy, ArrowRight, Heart, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function SuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'supporter';
  const isGuardian = type === 'guardian';
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/DDSlogo.png?alt=media";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      
      <main className="flex-1 py-20 px-4 flex flex-col items-center justify-center">
        <div className="container mx-auto max-w-4xl text-center space-y-12">
          
          {/* Header Section */}
          <div className="space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary glow-primary animate-bounce">
                {isGuardian ? <Trophy className="h-12 w-12 text-primary" /> : <Heart className="h-12 w-12 text-primary fill-primary" />}
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-headline font-black uppercase tracking-tighter leading-none">
              {isGuardian ? (
                <>WELCOME TO THE <span className="text-primary">FLOCK!</span></>
              ) : (
                <>THANK YOU FOR YOUR <span className="text-primary">SUPPORT!</span></>
              )}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
              {isGuardian 
                ? "Welcome to the Family, Guardian! Your support provides a high-quality home for our rescued birds."
                : "Your contribution has been received. You've helped ensure our residents have everything they need today."}
            </p>
          </div>

          {/* Branded Achievement Anchor */}
          <div className="relative group animate-in zoom-in duration-700 delay-300">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <Card className="relative overflow-hidden bg-card border-[6px] border-primary rounded-[3rem] shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
              <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                <div className="w-full md:w-1/2 bg-[#1A1A1A] relative flex items-center justify-center p-12 min-h-[400px] border-b md:border-b-0 md:border-r border-border/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                  <div className="relative z-10 space-y-8 flex flex-col items-center">
                    <div className="relative w-32 h-32 md:w-40 md:h-40">
                      <Image 
                        src={logoUrl} 
                        alt="Decent Ducks Logo" 
                        fill 
                        className="object-contain mix-blend-screen"
                      />
                    </div>
                    <div className="relative">
                      <div className="bg-[#14F195]/20 p-4 rounded-full border-2 border-[#14F195] shadow-[0_0_20px_rgba(20,241,149,0.3)] animate-pulse">
                        <CheckCircle2 className="h-12 w-12 text-[#14F195]" />
                      </div>
                      <Star className="absolute -top-4 -right-4 h-8 w-8 text-primary fill-primary animate-spin-slow" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Achievement Unlocked</p>
                  </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-6">
                  <div className="space-y-2">
                    <span className="text-primary font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> {isGuardian ? "Guardian Activated" : "Supporter Confirmed"}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter leading-none">
                      THE <span className="text-primary">FLOCK</span>
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed italic">
                    "Every egg counted is a victory. Your support ensures our residents live in safety and comfort."
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
      
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function StripeSuccessPage() {
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
