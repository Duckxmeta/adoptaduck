
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
  Bug, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function OurStoryPage() {
  const storyDiscoveryUrl = "https://picsum.photos/seed/hatchling/800/600";
  const storyLakeUrl = "https://picsum.photos/seed/lake/800/600";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
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
              The story of how one imprinted duckling changed the mission for domestic ducks in Tennessee.
            </p>
          </div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />
        </section>

        {/* The Discovery */}
        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-video lg:aspect-square rounded-[3rem] overflow-hidden border-2 border-border shadow-2xl">
              <Image 
                src={storyDiscoveryUrl} 
                alt="The Discovery" 
                fill 
                className="object-cover"
                data-ai-hint="duckling hatching"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                 <Badge className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-4 py-2">The Beginning</Badge>
              </div>
            </div>
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-secondary">
                 <Search className="h-6 w-6" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Discovery</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tight leading-none">
                A "Half-In, Half-Out" <span className="text-secondary">Encounter</span>
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  It started with a single egg found abandoned—a duckling struggling between two worlds, half-in and half-out of its shell. 
                </p>
                <p>
                  Ducks are precocial; they are born ready to run, but they are also wired to bond. Because this specific duckling's eyes opened to a human first, the imprinting process began instantly. This wasn't just a rescue; it was a lifelong commitment that exposed a massive gap in our local ecosystem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Aha Moment */}
        <section className="py-24 bg-card/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 space-y-8">
                <div className="flex items-center gap-3 text-primary">
                   <Lightbulb className="h-6 w-6" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Realization</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tight leading-none">
                  THE "AHA" <span className="text-primary">MOMENT</span>
                </h2>
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Visits to local marinas and lakes across Tennessee revealed a heartbreaking pattern. What most people thought were "wild" ducks were actually abandoned domestic pets.
                  </p>
                  <p>
                    Without the ability to fly or migrate, these Pekins and Rouens have a survival rate of less than 10% in the wild. They are defenseless against predators and the elements.
                  </p>
                </div>
                <div className="p-8 bg-destructive/10 border-2 border-destructive/20 rounded-3xl relative overflow-hidden group">
                   <div className="relative z-10 space-y-2">
                      <p className="text-destructive font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Crucial Fact
                      </p>
                      <p className="text-xl font-headline font-black uppercase italic tracking-tight text-foreground">
                        Domestic ducks cannot migrate. When they are dumped, they are defenseless.
                      </p>
                   </div>
                   <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="h-32 w-32 text-destructive" />
                   </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative aspect-video lg:aspect-square rounded-[3rem] overflow-hidden border-2 border-border shadow-2xl">
                <Image 
                  src={storyLakeUrl} 
                  alt="Abandoned Ducks" 
                  fill 
                  className="object-cover"
                  data-ai-hint="ducks lake"
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
            <Card className="bg-card border-border rounded-[2.5rem] p-10 space-y-6 hover:glow-purple transition-all group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Rescue</h3>
              <p className="text-muted-foreground leading-relaxed">
                Providing a forever home for abandoned pets that were never meant to survive in the wild. We offer safety, food, and medical care for the "un-flyable."
              </p>
            </Card>

            <Card className="bg-card border-border rounded-[2.5rem] p-10 space-y-6 hover:glow-purple transition-all group">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Education</h3>
              <p className="text-muted-foreground leading-relaxed">
                Teaching the public what it actually takes to raise ducks. From housing to nutrition, we ensure potential owners know if ducks are right for their lifestyle.
              </p>
            </Card>

            <Card className="bg-card border-border rounded-[2.5rem] p-10 space-y-6 hover:glow-purple transition-all group">
              <div className="w-16 h-16 bg-[#14F195]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sprout className="h-8 w-8 text-[#14F195]" />
              </div>
              <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Ecology</h3>
              <p className="text-muted-foreground leading-relaxed">
                Showcasing their vital role—from organic pest control (eating bugs) to producing "Liquid Gold" fertilization that fuels our local plant life.
              </p>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-4">
           <div className="bg-primary/5 border-2 border-primary/20 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                 <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
                   HELP US WRITE THE <span className="text-primary">NEXT CHAPTER</span>
                 </h2>
                 <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                   Your support directly funds the rescue and rehabilitation of abandoned domestic ducks across the region.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                       <Link href="/flock">MEET THE FLOCK</Link>
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

import { Button } from '@/components/ui/button';
