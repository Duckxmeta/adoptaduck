"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Search, 
  Box, 
  Phone, 
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function FoundADuckPage() {
  const brokenFenceLogo = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/partners%2Fbrokenfencefarms.jpg?alt=media";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Emergency Header */}
        <section className="bg-destructive/10 border-b border-destructive/20 py-20">
          <div className="container mx-auto px-4 text-center space-y-6">
            <div className="flex justify-center">
               <div className="p-4 bg-destructive/20 rounded-full border-2 border-destructive animate-pulse">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
               </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-none text-white">
              I FOUND A <span className="text-destructive">DUCK</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Immediate identification and rescue protocol. Time is critical for domestic ducks in the wild.
            </p>
          </div>
        </section>

        {/* 3-STEP PROTOCOL */}
        <section className="py-24 container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-24">
            
            {/* STEP 1: Identify */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
               <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-black font-black flex items-center justify-center text-xl shadow-lg">1</div>
                  <div className="h-full w-px bg-border mt-4 hidden md:block" />
               </div>
               <div className="md:col-span-11 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight">IDENTIFY THE <span className="text-primary">SPECIES</span></h2>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                      Determining if the duck is domestic or wild is the first priority.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="bg-card border-2 border-primary/20 rounded-3xl p-8 space-y-4">
                      <div className="flex items-center gap-3 text-primary">
                        <CheckCircle2 className="h-6 w-6" />
                        <h3 className="font-headline font-black uppercase">Domestic (Rescue Needed)</h3>
                      </div>
                      <ul className="space-y-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        <li>• Large body (White/Pekin)</li>
                        <li>• Colorful, upright (Runner)</li>
                        <li>• Friendly or approached humans</li>
                        <li>• <span className="text-primary">Cannot fly to escape</span></li>
                      </ul>
                    </Card>
                    <Card className="bg-muted/10 border-2 border-border rounded-3xl p-8 space-y-4">
                      <div className="flex items-center gap-3 text-muted-foreground opacity-50">
                        <XCircle className="h-6 w-6" />
                        <h3 className="font-headline font-black uppercase">Wild (Do Not Disturb)</h3>
                      </div>
                      <ul className="space-y-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        <li>• Smaller, streamlined body</li>
                        <li>• Mallard markings</li>
                        <li>• Flies away when approached</li>
                        <li>• Alert and avoiding people</li>
                      </ul>
                    </Card>
                  </div>
               </div>
            </div>

            {/* STEP 2: Contain */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
               <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-black font-black flex items-center justify-center text-xl shadow-lg">2</div>
                  <div className="h-full w-px bg-border mt-4 hidden md:block" />
               </div>
               <div className="md:col-span-11 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight">SECURE & <span className="text-primary">CONTAIN</span></h2>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                      Domestic ducks have no defense against predators. Containing them safely is the best way to ensure their survival.
                    </p>
                  </div>
                  
                  <div className="bg-primary/5 border-l-8 border-primary p-10 rounded-r-3xl space-y-6 shadow-2xl">
                     <div className="flex items-center gap-4 text-primary">
                        <Box className="h-8 w-8" />
                        <span className="font-headline font-black text-xl uppercase">Safety Box Setup</span>
                     </div>
                     <p className="text-foreground/80 leading-relaxed font-medium">
                        Use a large cardboard box with air holes or a dog crate. Line the bottom with a towel. If the bird is stressed, cover the box with a light sheet to keep it dark and quiet.
                     </p>
                     <div className="flex flex-wrap gap-4 pt-2">
                        <Badge variant="outline" className="border-primary/30 text-primary uppercase font-black text-[10px]">NO FOOD</Badge>
                        <Badge variant="outline" className="border-primary/30 text-primary uppercase font-black text-[10px]">NO WATER (In Box)</Badge>
                        <Badge variant="outline" className="border-primary/30 text-primary uppercase font-black text-[10px]">DARK & QUIET</Badge>
                     </div>
                  </div>
               </div>
            </div>

            {/* STEP 3: Intake Partner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
               <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-black font-black flex items-center justify-center text-xl shadow-lg">3</div>
               </div>
               <div className="md:col-span-11 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight">CONTACT OUR <span className="text-primary">INTAKE PARTNER</span></h2>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                      Broken Fence Farms is our primary facility for new arrivals. We accept abandoned or unwanted Ducks, Chickens, Turkeys, and Peafowl.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                     <div className="space-y-4">
                        <Button size="lg" className="h-20 w-full bg-primary text-primary-foreground font-black text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform" asChild>
                           <a href="https://www.facebook.com/share/18N75G8YJm/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                              CONTACT FOR INTAKE <ArrowRight className="ml-2 h-6 w-6" />
                           </a>
                        </Button>
                        <Button variant="ghost" className="w-full text-muted-foreground font-black text-[10px] tracking-widest uppercase" asChild>
                           <a href="mailto:decentducksorg@gmail.com">EMAIL SANCTUARY COORDINATOR</a>
                        </Button>
                     </div>
                     
                     <Card className="bg-card border-2 border-primary/20 rounded-3xl p-6 flex items-center gap-6 overflow-hidden group hover:border-primary transition-colors">
                        <div className="relative w-20 h-20 shrink-0 grayscale group-hover:grayscale-0 transition-all">
                           <Image 
                              src={brokenFenceLogo} 
                              alt="Broken Fence Farms" 
                              fill 
                              className="object-contain"
                           />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intake Hub</p>
                           <h4 className="font-headline font-black uppercase text-lg leading-none">Broken Fence Farms</h4>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase">Middle Tennessee Region</p>
                        </div>
                     </Card>
                  </div>

                  <div className="p-8 bg-card border border-border rounded-3xl text-center italic text-muted-foreground text-sm font-medium">
                    "Helping one bird might not change the world, but it changes the world for that one bird."
                  </div>
               </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
