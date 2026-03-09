import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ResidentCard } from '@/components/residents/ResidentCard';
import { MOCK_RESIDENTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const residents = MOCK_RESIDENTS;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-110"
            style={{ backgroundImage: `url('https://picsum.photos/seed/duckhero/1920/1080')` }}
            data-ai-hint="duck sanctuary"
          />
          
          <div className="container mx-auto px-4 relative z-20 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-xs font-bold mb-6 glow-purple">
              <Sparkles className="h-3 w-3" />
              SOLANA-POWERED SANCTUARY
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black mb-6 leading-tight">
              DECENT <span className="text-primary">DUCKS</span><br />
              SANCTUARY
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A modern haven for feathered friends. Meet our residents and support their journey through virtual adoption.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground font-bold hover:glow-yellow" asChild>
                <Link href="#residents">MEET THE RESIDENTS</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-secondary text-secondary font-bold hover:bg-secondary/10" asChild>
                <Link href="/about">OUR MISSION</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Resident Grid */}
        <section id="residents" className="py-24 container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-headline font-bold mb-4">OUR RESIDENTS</h2>
              <div className="h-1 w-20 bg-primary" />
              <p className="text-muted-foreground mt-4 max-w-lg">
                Each duck here has a unique story, personality, and a place in our heart. Click to learn more.
              </p>
            </div>
            <Button variant="link" className="text-primary font-bold gap-2 group p-0">
              VIEW ALL RESIDENTS <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {residents.map((resident) => (
              <ResidentCard key={resident.id} resident={resident} />
            ))}
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-20 bg-card text-card-foreground">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-4xl font-headline font-black mb-6">READY TO MAKE A DIFFERENCE?</h2>
            <p className="text-muted-foreground text-lg mb-10">
              Your support directly funds the care of these ducks. Join us in creating the world's most transparent bird sanctuary.
            </p>
            <Button size="lg" className="bg-secondary text-secondary-foreground font-bold hover:glow-purple px-12 h-16 text-lg" asChild>
              <a href="https://www.paypal.com/donate?business=decentducks@example.com" target="_blank" rel="noopener noreferrer">
                GENERAL SANCTUARY SUPPORT
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}