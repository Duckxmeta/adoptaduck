
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Gavel, Scale, FileText, Info } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-20 max-w-4xl">
        <div className="space-y-16 animate-in fade-in duration-700">
          
          <header className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Gavel className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none">
              Terms of <span className="text-primary">Service</span>
            </h1>
            <div className="max-w-2xl mx-auto p-8 bg-card border border-border rounded-3xl italic font-medium text-muted-foreground shadow-2xl">
              "By accessing the Decent Ducks Sanctuary (Virtual Sanctuary) platform, you agree to these terms. This platform is a digital extension of our 501(c)(3) mission to rescue and educate."
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-4 hover:border-primary/30 transition-colors group shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">User Conduct</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The Member Dashboard is for personal, non-commercial use by sanctuary partners and supporters. Any attempt to scrape or interfere with the sanctuary's bird data is strictly prohibited.
              </p>
            </div>

            <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-4 hover:border-secondary/30 transition-colors group shadow-lg">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">Digital Assets & History</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Images of the birds (including Jasmine and the G0 Founders) and their rescue histories/lineage data are the intellectual property of Decent Ducks Sanctuary. Sharing is encouraged for advocacy, but commercial sale is prohibited.
              </p>
            </div>
          </div>

          <section className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-headline font-black uppercase tracking-tight text-center">Liability & Data Accuracy</h2>
            <div className="p-10 bg-secondary/5 border-2 border-secondary/10 rounded-[3rem] text-center space-y-4 shadow-2xl">
              <div className="flex justify-center mb-2">
                 <Info className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg text-foreground/80 font-medium leading-relaxed">
                Provided <span className="text-primary font-black uppercase">'As-Is'</span> During Development
              </p>
              <p className="text-sm text-muted-foreground">
                While we strive for 100% data accuracy in the 'Ledger' and 'Lineage', the platform is provided 'as-is' during this development phase. We are not liable for any temporary technical discrepancies.
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
