"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Handshake, 
  Sparkles, 
  Globe, 
  Bird, 
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PartnersPage() {
  const partners = [
    {
      name: "Solana Strays",
      role: "Ecosystem Partner",
      desc: "Building a bridge between decentralized finance and animal rescue operations.",
      icon: <Zap className="h-10 w-10 text-secondary" />,
      color: "border-secondary/20"
    },
    {
      name: "Quakk",
      role: "Strategic Collaborator",
      desc: "Providing high-fidelity tracking tools and platform support for waterfowl enthusiasts.",
      icon: <Bird className="h-10 w-10 text-primary" />,
      color: "border-primary/20"
    },
    {
      name: "Tennessee Waterfowl Collective",
      role: "Local Host Partner",
      desc: "Our primary regional partner for large-scale rescue logistics and habitat protection.",
      icon: <Globe className="h-10 w-10 text-[#14F195]" />,
      color: "border-[#14F195]/20"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Partners Header */}
        <section className="relative py-32 bg-card/40 border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
              The Ecosystem
            </Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-none max-w-4xl mx-auto">
              OFFICIAL <span className="text-primary">PARTNERS</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              We collaborate with mission-aligned organizations to scale our impact across rescue, education, and ecology.
            </p>
          </div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        </section>

        {/* PARTNER GRID */}
        <section className="py-24 container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {partners.map((p, i) => (
                <Card key={i} className={`bg-card border-2 ${p.color} rounded-[2.5rem] p-10 space-y-6 shadow-2xl hover:glow-primary transition-all group`}>
                   <div className="p-4 bg-background rounded-2xl border border-border inline-block group-hover:scale-110 transition-transform">
                      {p.icon}
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">{p.role}</p>
                      <h3 className="text-3xl font-headline font-black uppercase tracking-tight">{p.name}</h3>
                   </div>
                   <p className="text-muted-foreground font-medium leading-relaxed">
                      {p.desc}
                   </p>
                </Card>
              ))}
           </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pt-12">
           <div className="max-w-4xl mx-auto bg-primary/5 border-2 border-dashed border-primary/20 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl">
              <div className="space-y-4">
                 <Handshake className="h-12 w-12 text-primary mx-auto" />
                 <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">BECOME A <span className="text-primary">COLLABORATOR</span></h2>
                 <p className="text-muted-foreground text-lg font-medium">
                    Interested in supporting the sanctuary through your organization or brand? Let's talk mission strategy.
                 </p>
              </div>
              <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                 <Link href="/visit">GET IN TOUCH <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
