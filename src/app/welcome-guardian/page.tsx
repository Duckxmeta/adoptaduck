
"use client";

import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Share2, 
  Twitter, 
  Award, 
  Sparkles,
  ShieldCheck,
  Heart,
  PartyPopper,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function WelcomeGuardianContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'A KIND SUPPORTER';
  const birdName = searchParams.get('bird') || 'THE FLOCK';
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/DDSlogo.png?alt=media";

  const handleShare = (platform: 'twitter' | 'tiktok') => {
    const text = `I just became an official Guardian at @Ducksonx! Meet my duck ${birdName} at decentducks.org 🦆✨ #DecentDucks`;
    const url = "https://decentducks.org";

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      // TikTok doesn't support direct URL sharing for captions easily, so we provide the text for copy
      navigator.clipboard.writeText(text);
      alert("Caption copied! Opening TikTok... paste this in your next post!");
      window.open(`https://www.tiktok.com/`, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="space-y-4 no-print">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary glow-primary animate-bounce">
                <PartyPopper className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black text-white uppercase tracking-tighter leading-none">
              THANK YOU, <span className="text-primary">GUARDIAN!</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Your impact starts now. Below is your official certificate of guardianship for the 2026 season.
            </p>
          </div>

          {/* Digital Adoption Certificate */}
          <div className="relative group animate-in zoom-in duration-700 delay-200">
            {/* Gold Glow Effect */}
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <Card className="relative overflow-hidden bg-card border-[8px] border-primary rounded-[3rem] shadow-2xl print:border-black print:shadow-none print:m-0 print:rounded-none">
              <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
              
              <CardContent className="p-10 md:p-20 space-y-12 relative">
                {/* Certificate Background Elements */}
                <Award className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 text-primary/5 -rotate-12 pointer-events-none" />
                
                <div className="space-y-6">
                  <div className="flex justify-center items-center gap-4 mb-2">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                    <span className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground">Official Sanctuary Document</span>
                    <ShieldCheck className="h-10 w-10 text-primary" />
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-[0.1em] border-y-2 border-primary/20 py-6">
                    Guardian Certificate
                  </h2>
                </div>

                <div className="space-y-10 py-4">
                  <p className="text-xl md:text-2xl font-medium text-muted-foreground uppercase tracking-[0.3em]">
                    This certifies that
                  </p>
                  
                  <div className="relative inline-block px-12 py-2 border-b-4 border-primary min-w-[300px]">
                    <span className="text-5xl md:text-7xl font-headline font-black text-foreground uppercase tracking-tighter">
                      {userName}
                    </span>
                    <Sparkles className="absolute -top-6 -right-6 h-10 w-10 text-primary animate-pulse" />
                  </div>

                  <p className="text-xl md:text-3xl font-medium leading-relaxed max-w-2xl mx-auto">
                    is an Official Guardian of <br />
                    <span className="font-headline font-black text-primary text-4xl md:text-6xl tracking-tighter uppercase">{birdName}</span> <br />
                    <span className="text-lg md:text-xl text-muted-foreground uppercase tracking-widest mt-2 block">For the 2026 Sanctuary Season</span>
                  </p>
                </div>

                <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-12 border-t border-border/50">
                  <div className="text-left space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sanctuary Seal</p>
                    <div className="relative w-20 h-20 bg-transparent flex items-center justify-center">
                       <Image src={logoUrl} alt="DDS Logo" fill className="object-contain mix-blend-screen opacity-80" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center italic text-muted-foreground text-sm max-w-sm font-medium">
                    "Every egg counted is a victory for our mission. Your guardianship ensures safety, health, and a forever home for those who cannot fly."
                  </div>

                  <div className="text-right space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issued By</p>
                     <p className="font-headline font-black text-xl text-primary">DECENT DUCKS ORG</p>
                     <p className="text-[9px] font-bold text-muted-foreground uppercase">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 no-print">
            <Button 
              size="lg" 
              onClick={handlePrint}
              className="bg-primary text-primary-foreground font-black h-16 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform text-lg"
            >
              <Download className="mr-2 h-6 w-6" /> DOWNLOAD CERTIFICATE
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleShare('twitter')}
                className="border-primary text-primary font-black h-16 px-8 rounded-2xl hover:bg-primary/10"
              >
                <Twitter className="mr-2 h-6 w-6 fill-current" /> SHARE TO X
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleShare('tiktok')}
                className="border-secondary text-secondary font-black h-16 px-8 rounded-2xl hover:bg-secondary/10"
              >
                <Share2 className="mr-2 h-6 w-6" /> TIKTOK
              </Button>
            </div>
          </div>

          <div className="pt-12 no-print">
            <Button asChild variant="ghost" className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary">
              <Link href="/dashboard">ENTER YOUR DASHBOARD <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

        </div>
      </main>

      <Footer />
      
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-card {
            background-color: white !important;
            border-color: #FFD700 !important;
          }
          nav, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function WelcomeGuardianPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="h-10 w-10 text-primary animate-pulse" />
      </div>
    }>
      <WelcomeGuardianContent />
    </Suspense>
  );
}
