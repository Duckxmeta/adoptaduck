
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Lock, EyeOff, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-20 max-w-4xl">
        <div className="space-y-16 animate-in fade-in duration-700">
          
          <header className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none">
              Privacy & <span className="text-primary">Data Security</span>
            </h1>
            <div className="max-w-2xl mx-auto p-8 bg-card border border-border rounded-3xl italic font-medium text-muted-foreground shadow-2xl">
              "At Decent Ducks Sanctuary, we believe in total transparency. We do not sell, trade, or rent any user data to third parties. Your information is used strictly to enhance your experience with the flock."
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-4 hover:border-primary/30 transition-colors group shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">Account Info</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We only store what is necessary for you to access the Member Dashboard. This is typically limited to your email and name provided during authentication.
              </p>
            </div>

            <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-4 hover:border-secondary/30 transition-colors group shadow-lg">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">Partnerships</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Information regarding partner status or community codes is used solely to provide access to exclusive sanctuary content and community duck records.
              </p>
            </div>

            <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-4 hover:border-[#14F195]/30 transition-colors group shadow-lg">
              <div className="w-12 h-12 bg-[#14F195]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <EyeOff className="h-6 w-6 text-[#14F195]" />
              </div>
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">No Tracking</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We do not use invasive tracking or third-party advertising cookies. Our mission is built on trust and bird welfare, not on selling user habits.
              </p>
            </div>
          </div>

          <section className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-headline font-black uppercase tracking-tight text-center">Infrastructure & Security</h2>
            <div className="p-10 bg-secondary/5 border-2 border-secondary/10 rounded-[3rem] text-center space-y-4 shadow-2xl">
              <p className="text-lg text-foreground/80 font-medium leading-relaxed">
                All data is handled via <span className="text-primary font-black uppercase">Google Firebase</span> using industry-standard encryption.
              </p>
              <p className="text-sm text-muted-foreground">
                This ensures your account, profile, and virtual adoption data are protected by world-class security infrastructure, preventing unauthorized access or data breaches.
              </p>
            </div>
          </section>

          <footer className="pt-16 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            <p>Decent Ducks Sanctuary Org</p>
            <p className="text-primary/60">Last Updated: March 10, 2026</p>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
}
