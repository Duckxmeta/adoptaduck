
"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Heart, 
  ShieldCheck, 
  History, 
  Wallet, 
  Camera, 
  Sprout, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
  Coffee
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function MembershipPage() {
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";
  
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'yearly'>('monthly');
  const [amount, setAmount] = useState<string>('25');
  const [designation, setDesignation] = useState<string>('most-needed');

  const handleDonate = () => {
    window.open(donateUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Hero Section */}
        <section className="relative py-32 bg-secondary/5 border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
              Guardianship Program
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

        {/* Unified Donation Form */}
        <section className="py-24 container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-border shadow-xl space-y-8">
                <div className="flex items-center gap-3 text-primary">
                   <Zap className="h-6 w-6" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em]">Direct Support Form</span>
                </div>
                
                <div className="space-y-10">
                  {/* Frequency Toggle */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Donation Frequency</Label>
                    <RadioGroup 
                      value={frequency} 
                      onValueChange={(v) => setFrequency(v as any)}
                      className="grid grid-cols-3 gap-3"
                    >
                      {['one-time', 'monthly', 'yearly'].map((f) => (
                        <div key={f} className="relative">
                          <RadioGroupItem value={f} id={`freq-${f}`} className="sr-only" />
                          <Label 
                            htmlFor={`freq-${f}`}
                            className={cn(
                              "flex items-center justify-center h-12 rounded-xl border-2 transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest",
                              frequency === f ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"
                            )}
                          >
                            {f.replace('-', ' ')}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Amount</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['10', '25', '50'].map((amt) => (
                        <Button 
                          key={amt}
                          variant="outline"
                          onClick={() => setAmount(amt)}
                          className={cn(
                            "h-14 rounded-xl border-2 font-headline font-black text-lg",
                            amount === amt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/20"
                          )}
                        >
                          ${amt}
                        </Button>
                      ))}
                      <div className="relative">
                        <Input 
                          placeholder="Custom" 
                          type="number"
                          value={amount === '10' || amount === '25' || amount === '50' ? '' : amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-14 rounded-xl border-2 border-border font-headline font-black text-lg pl-8"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black">$</span>
                      </div>
                    </div>
                  </div>

                  {/* Designation */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Where should we allocate this?</Label>
                    <Select value={designation} onValueChange={setDesignation}>
                      <SelectTrigger className="h-14 rounded-xl border-2 border-border bg-background/50 font-black uppercase text-[10px] tracking-widest">
                        <SelectValue placeholder="Select Designation" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="most-needed">Where it's needed most</SelectItem>
                        <SelectItem value="feed">Flock Feed & Nutrition</SelectItem>
                        <SelectItem value="medical">Medical Emergencies & Vet Care</SelectItem>
                        <SelectItem value="upgrades">Sanctuary Infrastructure</SelectItem>
                        <SelectItem value="adopt">Adopt a Specific Resident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={handleDonate}
                      className="w-full bg-primary text-primary-foreground font-black h-20 text-xl rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform"
                    >
                      DONATE ${amount || '0'} NOW <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                    <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-4">
                      Direct donations allow us to allocate funds exactly where they are needed most.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* Adopt a Duck Tier Highlight */}
              <Card className="bg-primary/5 border-2 border-primary/20 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                  <Badge className="bg-primary text-black font-black uppercase text-[9px] tracking-widest">Featured Guardian Tier</Badge>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
                      <Heart className="h-6 w-6 text-primary fill-primary" /> ADOPT A DUCK
                    </h3>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Complete Life Support</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-background/50 rounded-2xl border border-primary/20">
                      <p className="text-2xl font-headline font-black text-primary">$25<span className="text-[10px] text-muted-foreground">/mo</span></p>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                        <Coffee className="h-3 w-3" /> $0.83 PER DAY
                      </div>
                    </div>
                    <div className="p-4 bg-background/50 rounded-2xl border border-primary/20">
                      <p className="text-2xl font-headline font-black text-primary">$250<span className="text-[10px] text-muted-foreground">/yr</span></p>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                        <Coffee className="h-3 w-3" /> $0.68 PER DAY
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">
                    "Provide a forever home for one resident for less than the price of a cup of coffee. This tier fully covers one bird's share of food, medical, and housing."
                  </p>
                  
                  <Button variant="outline" className="w-full border-primary text-primary font-black h-12 rounded-xl hover:bg-primary/10" onClick={() => { setAmount('25'); setFrequency('monthly'); setDesignation('adopt'); }}>
                    SELECT ADOPTION TIER
                  </Button>
                </div>
                <div className="absolute -bottom-6 -right-6 text-primary/10 rotate-12 group-hover:scale-110 transition-transform">
                  <Heart className="h-32 w-32 fill-current" />
                </div>
              </Card>

              {/* Status Note */}
              <Card className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl">
                 <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-[#14F195]/10 rounded-xl flex items-center justify-center shrink-0">
                       <ShieldCheck className="h-5 w-5 text-[#14F195]" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Automatic Guardian Unlock</h4>
                       <p className="text-xs text-muted-foreground leading-relaxed">
                         Any donation—one-time or recurring—grants official **Guardian Status**. Use your donation email to log in and unlock your Member Dashboard instantly.
                       </p>
                    </div>
                 </div>
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
                <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">THE <span className="text-primary">IMPACT</span> OF DIRECT GIVING</h2>
                <p className="text-muted-foreground font-medium italic">"100% of proceeds fund food & medical care."</p>
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
                    <Button onClick={handleDonate} size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                       SUPPORT THE MISSION
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
