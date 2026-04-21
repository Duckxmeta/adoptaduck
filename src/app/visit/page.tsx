"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  GraduationCap, 
  ShieldCheck, 
  Send,
  Calendar,
  Clock,
  Map,
  Compass
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function VisitPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate inquiry
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Inquiry Sent!",
        description: "Kyle will review your request and reach out shortly.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Visit Header */}
        <section className="relative py-32 bg-primary/5 border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
              Sanctuary Access
            </Badge>
            <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-none max-w-4xl mx-auto">
              VISIT THE <span className="text-primary">SANCTUARY</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Experience the mission first-hand. Our sanctuary operates across two sites to balance animal rehabilitation with community education.
            </p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] pointer-events-none" />
        </section>

        {/* LOCATION CARDS */}
        <section className="py-24 container mx-auto px-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              
              <Card className="bg-card border-border border-2 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
                 <div className="h-64 bg-primary/10 flex items-center justify-center relative">
                    <Compass className="h-24 w-24 text-primary opacity-20" />
                    <div className="absolute bottom-6 left-8">
                       <Badge className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-4 py-1">Main Hub</Badge>
                    </div>
                 </div>
                 <CardContent className="p-10 space-y-6 flex-1">
                    <div className="space-y-2">
                       <h2 className="text-3xl font-headline font-black uppercase tracking-tight">The <span className="text-primary">Rehab Center</span></h2>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-primary" /> Middle Tennessee Location
                       </p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                       Our primary facility dedicated to intensive care, quarantine, and the long-term recovery of the "un-flyable" rescues. This site is optimized for resident safety and minimal stress.
                    </p>
                    <div className="pt-4 border-t border-border/50">
                       <p className="text-[9px] font-black uppercase tracking-widest text-primary">Best For</p>
                       <p className="text-sm font-bold">Deep Mission Discovery & Resident Care Observation</p>
                    </div>
                 </CardContent>
              </Card>

              <Card className="bg-card border-border border-2 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
                 <div className="h-64 bg-secondary/10 flex items-center justify-center relative">
                    <GraduationCap className="h-24 w-24 text-secondary opacity-20" />
                    <div className="absolute bottom-6 left-8">
                       <Badge className="bg-secondary text-white font-black uppercase text-[10px] tracking-widest px-4 py-1">Partner Site</Badge>
                    </div>
                 </div>
                 <CardContent className="p-10 space-y-6 flex-1">
                    <div className="space-y-2">
                       <h2 className="text-3xl font-headline font-black uppercase tracking-tight">The <span className="text-secondary">Education Site</span></h2>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-secondary" /> Local Community Annex
                       </p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                       A public-facing collaborative site designed for K-12 education, local workshops, and community-led ecology projects. Here, we showcase the vital role ducks play in local plant life.
                    </p>
                    <div className="pt-4 border-t border-border/50">
                       <p className="text-[9px] font-black uppercase tracking-widest text-secondary">Best For</p>
                       <p className="text-sm font-bold">Groups, Students & Sustainable Farming Insights</p>
                    </div>
                 </CardContent>
              </Card>

           </div>
        </section>

        {/* INQUIRY FORM */}
        <section className="py-24 bg-card/30 border-y border-border">
          <div className="container mx-auto px-4">
             <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                   <h2 className="text-4xl font-headline font-black uppercase tracking-tight">REQUEST A <span className="text-primary">VISIT</span></h2>
                   <p className="text-muted-foreground font-medium">
                      Fill out the inquiry form below to coordinate a visit with Kyle.
                   </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-background p-10 rounded-[2.5rem] border border-border shadow-2xl">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Name</Label>
                         <Input id="name" placeholder="John Doe" className="bg-card border-border h-12 rounded-xl" required />
                      </div>
                      <div className="space-y-2">
                         <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                         <Input id="email" type="email" placeholder="john@example.com" className="bg-card border-border h-12 rounded-xl" required />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visit Type</Label>
                      <select id="type" className="flex h-12 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                         <option>General Tour</option>
                         <option>Educational Group</option>
                         <option>Photography Session</option>
                         <option>Institutional Partnership</option>
                      </select>
                   </div>

                   <div className="space-y-2">
                      <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Inquiry Details</Label>
                      <Textarea id="message" placeholder="Tell us about your interest in visiting..." className="bg-card border-border min-h-[120px] rounded-xl resize-none" required />
                   </div>

                   <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground font-black h-16 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                      {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <>SEND INQUIRY <Send className="ml-2 h-5 w-5" /></>}
                   </Button>

                   <p className="text-[9px] text-center text-muted-foreground uppercase font-black tracking-[0.2em]">
                      <ShieldCheck className="h-3 w-3 text-secondary inline mr-1.5" /> SECURE SANCTUARY LOGISTICS
                   </p>
                </form>
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
