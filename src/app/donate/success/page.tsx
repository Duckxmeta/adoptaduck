
"use client";

import { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Twitter, 
  CheckCircle2, 
  Award, 
  Sparkles,
  ShieldCheck,
  Heart,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialName = searchParams.get('name') || '';
  const birdName = searchParams.get('bird') || 'a resident';
  const [adopterName, setAdopterName] = useState(initialName);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 60000); // Extended for Discord onboarding
    return () => clearTimeout(timer);
  }, [router]);

  const handleShare = (platform: 'twitter' | 'generic') => {
    const text = `I just virtually adopted a resident at Decent Ducks Sanctuary! Check out their mission:`;
    const url = window.location.origin;

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (navigator.share) {
      navigator.share({
        title: 'Decent Ducks Sanctuary',
        text: text,
        url: url,
      }).catch(() => {});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-12">
          
          {/* Success Header */}
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary glow-primary mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-none">
              THANK YOU, <span className="text-primary">HERO!</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Your contribution has been received. You are now officially part of the Decent Ducks Sanctuary family.
            </p>
          </div>

          {/* Discord CTA - PROMINENT ONBOARDING */}
          <div className="max-w-2xl mx-auto w-full animate-in zoom-in duration-700 delay-300 no-print">
            <Card className="bg-[#5865F2]/10 border-2 border-[#5865F2]/40 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageSquare className="h-20 w-20 text-[#5865F2]" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex flex-col items-center gap-2">
                   <Badge className="bg-[#5865F2] text-white font-black uppercase text-[10px] tracking-widest px-4 py-1">Inner Circle Access</Badge>
                   <h3 className="text-3xl font-headline font-black uppercase tracking-tight leading-none">Enter the Adopter Discord</h3>
                   <p className="text-base text-muted-foreground font-medium max-w-md mx-auto">
                     Get instant access to the daily resident pulse. Photos, videos, and facility updates happen here first.
                   </p>
                </div>
                <Button asChild size="lg" className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-black h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                   <a href="https://discord.gg/ERegmyNdcG" target="_blank" rel="noopener noreferrer">
                     JOIN THE COMMUNITY <MessageSquare className="ml-2 h-6 w-6 fill-current" />
                   </a>
                </Button>
              </div>
            </Card>
          </div>

          {/* Certificate Customizer */}
          {!initialName && (
            <Card className="max-w-md mx-auto bg-card/50 border-border backdrop-blur-sm p-6 rounded-2xl animate-in fade-in duration-1000 delay-300 no-print">
              <div className="space-y-4">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Enter Name for Certificate</Label>
                <div className="flex gap-2">
                  <Input 
                    id="name"
                    placeholder="Your Name" 
                    value={adopterName}
                    onChange={(e) => setAdopterName(e.target.value)}
                    className="bg-background border-border h-12 rounded-xl"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Adoption Certificate */}
          <div 
            ref={certificateRef}
            className="relative group animate-in zoom-in duration-700 delay-200"
          >
            {/* Purple Glow Effect */}
            <div className="absolute -inset-4 bg-secondary/20 blur-3xl rounded-[3rem] opacity-50 group-hover:opacity-80 transition-opacity" />
            
            <Card className="relative overflow-hidden bg-card border-[6px] border-primary rounded-[2.5rem] shadow-2xl print:border-black print:shadow-none">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              
              <CardContent className="p-8 md:p-16 space-y-10 relative">
                {/* Certificate Background Elements */}
                <Award className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 text-primary/5 -rotate-12 pointer-events-none" />
                
                <div className="space-y-6">
                  <div className="flex justify-center items-center gap-4 mb-2">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Official Sanctuary Document</span>
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-headline font-black uppercase tracking-[0.1em] border-y border-border py-4">
                    Digital Adoption Certificate
                  </h2>
                </div>

                <div className="space-y-8 py-4">
                  <p className="text-lg md:text-xl font-medium text-muted-foreground uppercase tracking-widest">
                    This certifies that
                  </p>
                  
                  <div className="relative inline-block px-8 py-2 border-b-2 border-primary min-w-[200px]">
                    <span className="text-4xl md:text-6xl font-headline font-black text-foreground uppercase tracking-tighter">
                      {adopterName || 'A SUPPORTER'}
                    </span>
                    <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-primary animate-pulse" />
                  </div>

                  <p className="text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto">
                    has virtually adopted <span className="text-primary font-black uppercase">{birdName}</span> of <br />
                    <span className="font-headline font-black text-primary text-2xl tracking-tighter uppercase">Decent Ducks Sanctuary</span>
                  </p>
                </div>

                <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-border/50">
                  <div className="text-left space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sanctuary Seal</p>
                    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center font-black text-primary text-xl shadow-lg">
                      DDS
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center italic text-muted-foreground text-sm max-w-sm">
                    "Your kindness ensures our feathered friends have a safe, loving forever home. Every egg counted is a victory for our mission."
                  </div>

                  <div className="text-right space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Issued</p>
                     <p className="font-headline font-bold text-lg">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 no-print animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button 
              size="lg" 
              onClick={handlePrint}
              className="bg-primary text-primary-foreground font-black h-14 px-8 rounded-xl shadow-xl hover:scale-105 transition-transform"
            >
              <Download className="mr-2 h-5 w-5" /> DOWNLOAD CERTIFICATE
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleShare('twitter')}
                className="border-primary text-primary font-black h-14 px-6 rounded-xl hover:bg-primary/10"
              >
                <Twitter className="mr-2 h-5 w-5 fill-current" /> SHARE TO X
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => handleShare('generic')}
                className="border-secondary text-secondary font-black h-14 px-6 rounded-xl hover:bg-secondary/10"
              >
                <Share2 className="mr-2 h-5 w-5" /> SHARE
              </Button>
            </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pt-12 no-print">
            Returning to Sanctuary in 60 seconds...
          </p>

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
          }
          .bg-card {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DonationSuccessPage() {
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
