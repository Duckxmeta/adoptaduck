"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  ShieldCheck, 
  History, 
  Wallet, 
  Camera, 
  Sprout, 
  ShoppingCart, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function MembershipPage() {
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";
  const amazonUrl = "https://www.amazon.com/hz/wishlist/ls/1A6X5M2C8O4T?ref_=wl_share";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Hero Section */}
        <section className="relative py-32 bg-secondary/5 border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
              Sanctuary Support
            </Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-none max-w-4xl mx-auto">
              BECOME A <span className="text-primary">GUARDIAN</span> OF THE FLOCK
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Your support directly funds the rescue, rehabilitation, and lifelong care of abandoned domestic ducks.
            </p>
          </div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />
        </section>

        {/* How It Works */}
        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-border shadow-xl">
              <div className="flex items-center gap-3 text-secondary">
                 <CheckCircle2 className="h-6 w-6" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Support Model</span>
              </div>
              <h2 className="text-4xl font-headline font-black uppercase tracking-tight leading-none">
                HOW <span className="text-secondary">MEMBERSHIP</span> WORKS
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-medium">
                <p>
                  Membership is granted to anyone who supports the sanctuary mission. We believe in transparency over paywalls—your support is an investment in bird welfare.
                </p>
                <div className="space-y-4 pt-4 border-t border-border/50">
                   <div className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-[10px] font-black text-primary">1</span>
                      </div>
                      <p className="text-sm">Donate via our official channels (Amazon Storefront or Direct Donation) to help cover costs.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-[10px] font-black text-primary">2</span>
                      </div>
                      <p className="text-sm">Create an account using the same email address used for your support.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-[10px] font-black text-primary">3</span>
                      </div>
                      <p className="text-sm">Once confirmed, your account is upgraded to Member Status, unlocking the full sanctuary dashboard.</p>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-primary/5 border-primary/20 p-8 rounded-[2.5rem] space-y-4 shadow-2xl">
                <h3 className="text-xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" /> Amazon Storefront
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Send items directly to the ducks. From specialized feed to new pool infrastructure, you can see exactly what the flock needs right now."
                </p>
                <Button asChild className="w-full bg-primary text-primary-foreground font-black h-12 rounded-xl">
                   <a href={amazonUrl} target="_blank" rel="noopener noreferrer">VIEW WISHLIST</a>
                </Button>
              </Card>

              <Card className="bg-secondary/5 border-secondary/20 p-8 rounded-[2.5rem] space-y-4 shadow-2xl">
                <h3 className="text-xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
                  <Heart className="h-5 w-5 text-secondary" /> Direct Donation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Funds go directly into the sanctuary ledger to cover medical emergencies, vet bills, and daily overhead shared by all residents."
                </p>
                <Button asChild variant="outline" className="w-full border-secondary text-secondary font-black h-12 rounded-xl hover:bg-secondary/10">
                   <a href={donateUrl} target="_blank" rel="noopener noreferrer">DONATE VIA PAYPAL</a>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-card/20 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">Member Access</Badge>
              <h2 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter">GUARDIAN <span className="text-secondary">BENEFITS</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  title: "Heritage Access", 
                  desc: "Explore the interactive family trees of G0, G1, and G2 generations to see the sanctuary's lineage.", 
                  icon: <History className="h-8 w-8 text-primary" />,
                  color: "primary"
                },
                { 
                  title: "Transparency Ledger", 
                  desc: "View the live sanctuary spend. See every dollar spent on feed, bedding, and medical care in real-time.", 
                  icon: <Wallet className="h-8 w-8 text-secondary" />,
                  color: "secondary"
                },
                { 
                  title: "Daily Care Logs", 
                  desc: "Read internal wellness updates and clinical notes that aren't shared on public social media.", 
                  icon: <ShieldCheck className="h-8 w-8 text-[#14F195]" />,
                  color: "[#14F195]"
                },
                { 
                  title: "Exclusive Gallery", 
                  desc: "Access high-res photos and 'behind the scenes' videos of our residents in their daily routines.", 
                  icon: <Camera className="h-8 w-8 text-primary" />,
                  color: "primary"
                }
              ].map((benefit, i) => (
                <Card key={i} className="bg-card border-border rounded-[2.5rem] p-10 space-y-6 hover:glow-purple transition-all group shadow-xl">
                  <div className={`w-16 h-16 bg-${benefit.color}/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-headline font-black uppercase tracking-tight">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {benefit.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-24 container mx-auto px-4">
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">YOUR <span className="text-primary">IMPACT</span></h2>
                <p className="text-muted-foreground font-medium italic">"Where your contribution goes."</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="p-8 bg-card/60 border border-border rounded-3xl text-center space-y-4 shadow-lg">
                    <div className="text-4xl font-headline font-black text-primary">$10</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1 Week of Feed</p>
                    <p className="text-xs font-medium leading-relaxed">Covers the core nutritional needs of a single sanctuary resident for 7 days.</p>
                 </div>
                 <div className="p-8 bg-card/60 border border-border rounded-3xl text-center space-y-4 shadow-lg scale-105 ring-2 ring-primary/20">
                    <div className="text-4xl font-headline font-black text-primary">$25</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Flock Wellness Pack</p>
                    <p className="text-xs font-medium leading-relaxed">Funds water filtration maintenance and fresh bedding for the entire community.</p>
                 </div>
                 <div className="p-8 bg-card/60 border border-border rounded-3xl text-center space-y-4 shadow-lg">
                    <div className="text-4xl font-headline font-black text-primary">$50</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Vet Wellness Check</p>
                    <p className="text-xs font-medium leading-relaxed">Provides a comprehensive clinical exam for a resident including diagnostic markers.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 mt-12">
           <div className="bg-primary/5 border-2 border-primary/20 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-6">
                 <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
                   READY TO JOIN THE <span className="text-primary">FLOCK?</span>
                 </h2>
                 <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                   Join us in providing a safe, forever home for abandoned domestic pets. Your guardianship starts here.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                       <a href={donateUrl} target="_blank" rel="noopener noreferrer">SUPPORT THE MISSION</a>
                    </Button>
                    <Button variant="outline" size="lg" className="border-border text-foreground font-black h-16 px-12 text-lg rounded-2xl hover:bg-muted/10" asChild>
                       <Link href="/login"><Lock className="mr-2 h-5 w-5" /> MEMBER LOGIN</Link>
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
