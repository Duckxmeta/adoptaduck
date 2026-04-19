
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  History, 
  Search, 
  Lightbulb, 
  ShieldCheck, 
  BookOpen, 
  Sprout, 
  Heart, 
  ArrowRight,
  Sparkles,
  Compass,
  Baby,
  Briefcase
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OurStoryPage() {
  const BUCKET = "studio-7482167027-804c1.firebasestorage.app";
  const getStorageUrl = (filename: string) => `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/our-story%2F${filename}?alt=media`;

  const imgHatch = getStorageUrl("Jasminehatch.png");
  const imgBaby1 = getStorageUrl("jasminebaby.png");
  const imgBaby2 = getStorageUrl("Jasminebaby1.png");
  const imgKayak = getStorageUrl("Jasminekayak.png");
  const imgPublic = getStorageUrl("Jasminepublic.png");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Hero Section */}
        <section className="relative py-32 bg-secondary/5 border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
              Our Origin
            </Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-none max-w-4xl mx-auto">
              FROM ONE EGG TO A <span className="text-primary">SANCTUARY</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              The story of Jasmine, the imprinted duckling who gave a founder a new purpose and exposed a hidden crisis in Tennessee.
            </p>
          </div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />
        </section>

        {/* A New Direction */}
        <section className="py-24 container mx-auto px-4 border-b border-border/50">
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full border-2 border-primary/20">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tight leading-none">
              A NEW <span className="text-primary">DIRECTION</span>
            </h2>
            <div className="space-y-6 text-muted-foreground text-xl leading-relaxed font-medium">
              <p>
                The sanctuary didn’t start with a grand plan. It started during a period of intense personal change. I had spent years building a career and a specific vision for my life and family, only to see it all disappear suddenly.
              </p>
              <p className="text-foreground">
                In that low point, when my own future felt uncertain, I found Jasmine. Giving her a second chance at life ultimately gave me a new sense of purpose.
              </p>
            </div>
          </div>
        </section>

        {/* The Discovery */}
        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden border-2 border-border shadow-2xl group">
              <Image 
                src={imgHatch} 
                alt="Jasmine hatching half-in, half-out" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                 <Badge className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-4 py-2">The Discovery</Badge>
              </div>
            </div>
            <div className="space-y-8 bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-border shadow-xl">
              <div className="flex items-center gap-3 text-secondary">
                 <Search className="h-6 w-6" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Discovery</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tight leading-none">
                A "Half-In, Half-Out" <span className="text-secondary">Encounter</span>
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed italic">
                <p>
                  "The moment that changed everything."
                </p>
                <p className="not-italic text-foreground/80">
                  It started with a single egg found abandoned—a duckling struggling between two worlds, half-in and half-out of its shell. 
                </p>
                <p className="not-italic text-foreground/80">
                  Ducks are precocial; they are born ready to run, but they are also wired to bond. Because Jasmine's eyes opened to a human first, the imprinting process began instantly. This wasn't just a rescue; it was a lifelong commitment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Imprint */}
        <section className="py-24 bg-card/20 border-y border-border overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1 bg-card/60 backdrop-blur-md p-10 rounded-[3rem] border border-border/50 shadow-2xl">
                <div className="flex items-center gap-3 text-primary">
                   <Baby className="h-6 w-6" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Imprint</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tight leading-none">
                  MOTHER BY <span className="text-primary">BOND</span>
                </h2>
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Jasmine didn't just survive; she thrived. In those early days, the bond was absolute. She treated me as her mother, following every step and seeking protection in a world she wasn't built for alone.
                  </p>
                  <p>
                    Watching her grow from a fragile baby into a social, energetic soul made one thing clear: domestic ducks possess a profound capacity for connection, yet they are entirely reliant on human stewardship for their safety.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 order-1 lg:order-2">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-2 border-border shadow-xl group">
                  <Image src={imgBaby1} alt="Jasmine as a duckling" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-2 border-border shadow-xl mt-8 group">
                  <Image src={imgBaby2} alt="Jasmine growing up" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Reality on the Water */}
        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden border-2 border-border shadow-2xl group">
              <Image 
                src={imgKayak} 
                alt="Jasmine on a kayak trip" 
                fill 
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="space-y-8 bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-border shadow-xl">
              <div className="flex items-center gap-3 text-secondary">
                 <Compass className="h-6 w-6" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">A Mission Defined</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tight leading-none">
                THE REALITY <span className="text-secondary">ON THE WATER</span>
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Our trips to local marinas and lakes across Tennessee—often with Jasmine on the kayak—revealed a heartbreaking pattern. What most people thought were "wild" ducks were actually abandoned domestic pets.
                </p>
                <div className="p-8 bg-destructive/10 border-2 border-destructive/20 rounded-3xl relative overflow-hidden group">
                   <div className="relative z-10 space-y-2">
                      <p className="text-destructive font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Crucial Fact
                      </p>
                      <p className="text-xl font-headline font-black uppercase italic tracking-tight text-foreground">
                        Domestic ducks cannot migrate. Without the ability to fly, they have a survival rate of less than 10% in the wild.
                      </p>
                   </div>
                </div>
                <p>
                  They are defenseless against predators and the elements. Without human intervention, these Pekins and Rouens are essentially waiting for a death sentence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Sanctuary Birth */}
        <section className="py-24 bg-primary/5 border-y border-primary/10 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 space-y-8 bg-card/60 backdrop-blur-md p-10 rounded-[3rem] border border-primary/20 shadow-2xl">
                <div className="flex items-center gap-3 text-primary">
                   <Sparkles className="h-6 w-6" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">A Second Chance</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tight leading-none text-primary">
                  A SECOND CHANCE <span className="text-foreground">FOR THE FORGOTTEN</span>
                </h2>
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Transitioning from saving one life to building a refuge for many, Decent Ducks Sanctuary was born from a realization that individual rescues weren't enough. We needed a system of education, protection, and advocacy for animals that had been forgotten or simply needed another opportunity to thrive.
                  </p>
                  <p>
                    Jasmine's legacy is the safety of every resident who now calls our sanctuary home. She showed us the gap; now we fill it every day.
                  </p>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative aspect-square rounded-[3rem] overflow-hidden border-4 border-primary shadow-2xl group">
                <Image 
                  src={imgPublic} 
                  alt="Jasmine and the mission" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* The Mission Pillars */}
        <section className="py-32 container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
              Our Foundation
            </Badge>
            <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter">THE THREE <span className="text-secondary">PILLARS</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-border rounded-[2.5rem] p-10 space-y-6 hover:glow-purple transition-all group shadow-xl">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Rescue</h3>
              <p className="text-muted-foreground leading-relaxed">
                Providing a forever home for abandoned pets that were never meant to survive in the wild. We offer safety, food, and medical care for the "un-flyable."
              </p>
            </Card>

            <Card className="bg-card border-border rounded-[2.5rem] p-10 space-y-6 hover:glow-purple transition-all group shadow-xl">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Education</h3>
              <p className="text-muted-foreground leading-relaxed">
                Teaching the public what it actually takes to raise ducks. From housing to nutrition, we ensure potential owners know if ducks are right for their lifestyle.
              </p>
            </Card>

            <Card className="bg-card border-border rounded-[2.5rem] p-10 space-y-6 hover:glow-purple transition-all group shadow-xl">
              <div className="w-16 h-16 bg-[#14F195]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sprout className="h-8 w-8 text-[#14F195]" />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Ecology</h3>
              <p className="text-muted-foreground leading-relaxed">
                Showcasing their vital role—from organic pest control to producing "Liquid Gold" fertilization that fuels our local plant life.
              </p>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-4">
           <div className="bg-primary/5 border-2 border-primary/20 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-6">
                 <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
                   HELP US WRITE THE <span className="text-primary">NEXT CHAPTER</span>
                 </h2>
                 <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                   Your support directly funds the rescue and rehabilitation of abandoned domestic animals across the region.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                       <Link href="/adopt">MEET THE RESIDENTS</Link>
                    </Button>
                    <Button variant="outline" size="lg" className="border-primary text-primary font-black h-16 px-12 text-lg rounded-2xl hover:bg-primary/10" asChild>
                       <a href="https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8" target="_blank" rel="noopener noreferrer">DONATE NOW</a>
                    </Button>
                 </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] pointer-events-none" />
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
