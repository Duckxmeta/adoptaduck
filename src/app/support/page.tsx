
"use client";

import { useState, useEffect, Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Heart, 
  ArrowRight,
  Sparkles,
  Loader2,
  Waves,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Users,
  Globe,
  Stethoscope,
  Star,
  ShoppingBag,
  ExternalLink,
  Ticket
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PromoCodeInput } from '@/components/shared/PromoCodeInput';
import { UserProfile } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

const STRIPE_IDS = {
  GUARDIAN: 'prod_UFfyopJ1UUtWvC',
  SPLASH: 'prod_UFg401BhNEqMsY'
};

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [amount, setAmount] = useState<string>('10');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  const isGuardian = userProfile?.role === 'guardian' || userProfile?.role === 'admin';

  const [merch, setMerch] = useState<any[]>([]);
  const [merchLoading, setMerchLoading] = useState(true);

  useEffect(() => {
    async function fetchMerch() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) {
          setMerch(data);
        }
      } catch (e) {
        console.error("Failed to load merch", e);
      } finally {
        setMerchLoading(false);
      }
    }
    fetchMerch();
  }, []);

  const handleCheckout = async (priceId: string) => {
    setIsRedirecting(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user?.uid,
          userEmail: user?.email
        }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body pb-32">
      <Navbar />

      <main className="flex-1 pt-12">
        <section className="container mx-auto px-4 text-center space-y-4 mb-20">
          <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">Support Hub</Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-tight">CHOOSE YOUR <span className="text-primary">IMPACT</span></h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">Your contributions provide food, medicine, and a safe forever home for our residents.</p>
        </section>

        {/* 1. MAKE A SPLASH */}
        <section id="donate" className="py-24 bg-secondary/5 border-y border-secondary/10 scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-secondary/20 flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-secondary shrink-0 flex items-center gap-2">
                <Waves className="h-4 w-4" /> 1. Make a Splash
              </h2>
              <div className="h-px bg-secondary/20 flex-1" />
            </div>

            <Card className="max-w-3xl mx-auto bg-card border-border rounded-[2rem] p-8 md:p-12 shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tight">One-Time Gifts</h3>
                <p className="text-sm text-muted-foreground font-medium">Select a gift level to provide immediate care items.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { val: '5', label: 'The Treat Fund' },
                  { val: '10', label: 'The Snack Pack' },
                  { val: '25', label: 'Bedding Refresh' }
                ].map((tier) => (
                  <Button 
                    key={tier.val}
                    variant="outline"
                    onClick={() => setAmount(tier.val)}
                    className={cn(
                      "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                      amount === tier.val ? "border-secondary bg-secondary/10 text-secondary scale-105" : "border-border hover:border-secondary/40"
                    )}
                  >
                    <span className="font-headline font-black text-2xl">${tier.val}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{tier.label}</span>
                  </Button>
                ))}
              </div>

              <div className="pt-4 flex justify-center">
                <Button 
                  onClick={() => handleCheckout(STRIPE_IDS.SPLASH)}
                  disabled={isRedirecting}
                  className="w-full max-w-sm h-16 bg-primary text-primary-foreground font-black text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  {isRedirecting ? <Loader2 className="h-6 w-6 animate-spin" /> : <>SUPPORT WITH ${amount} <Heart className="ml-2 h-5 w-5 fill-current" /></>}
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* 2. GUARDIAN SUBSCRIPTIONS */}
        <section id="membership" className="py-24 scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> 2. Guardian Subscriptions
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="bg-card border-border rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-xl opacity-90 border-t-4 border-t-muted">
                <div className="space-y-1">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Flock Member</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Digital Observer</p>
                </div>
                <div className="text-4xl font-headline font-black text-foreground">$0</div>
                <ul className="flex-1 space-y-3">
                  {['Virtual Sanctuary Portal', 'Live Daily Care Logs', 'Real-Time Cog Counter', 'Live Vibe Board'].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" /> {p}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full h-14 rounded-xl border-border font-black uppercase text-xs tracking-widest">
                  <Link href="/signup">JOIN FREE</Link>
                </Button>
              </Card>

              <Card className="bg-card border-2 border-primary rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-2xl relative overflow-hidden ring-4 ring-primary/10 scale-105 z-10 border-t-8 border-t-primary">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Heart className="h-20 w-20 text-primary fill-primary" /></div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Guardian</h3>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Adopt-a-Duck Experience</p>
                </div>
                <div className="space-y-1 relative z-10">
                  <div className="text-4xl font-headline font-black text-primary">$8.33<span className="text-xs font-medium text-muted-foreground ml-1">/mo</span></div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">($.27 a day)</p>
                </div>
                <ul className="flex-1 space-y-3 relative z-10">
                  {['Official Virtual Adoption', 'Naming Rights for Rescues', 'Detailed Lineage Trees', 'Exclusive Member Badge', 'Direct Care Updates'].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-black text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  {isGuardian ? (
                    <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-4 text-center space-y-2">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Benefit Unlocked</p>
                      <p className="font-headline font-black text-lg text-primary uppercase">Active Guardian</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleCheckout(STRIPE_IDS.GUARDIAN)}
                      disabled={isRedirecting}
                      className="w-full h-14 bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest rounded-xl shadow-lg"
                    >
                      {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "JOIN AS GUARDIAN"}
                    </Button>
                  )}
                </div>
              </Card>

              <Card className="bg-card border-border rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-xl border-t-4 border-t-secondary">
                <div className="space-y-1">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-secondary">Founding Member</h3>
                  <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest">Lifetime Impact</p>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-headline font-black text-secondary">$75<span className="text-xs font-medium text-muted-foreground ml-1">/yr</span></div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest">($.20 a day)</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {['Everything in Guardian', 'Name on Physical Ledger', 'Annual Impact Report', 'Founding Member Seal', 'Priority Rescue Alerts'].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <Star className="h-4 w-4 text-secondary" /> {p}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  {isGuardian ? (
                    <div className="bg-secondary/10 border-2 border-secondary/20 rounded-xl p-4 text-center space-y-2">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Benefit Unlocked</p>
                      <p className="font-headline font-black text-lg text-secondary uppercase">Founding Access</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleCheckout(STRIPE_IDS.GUARDIAN)}
                      disabled={isRedirecting}
                      className="w-full h-14 bg-secondary text-secondary-foreground font-black uppercase text-xs tracking-widest rounded-xl shadow-lg"
                    >
                      {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "JOIN FOR $75/YR"}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. PROMO CODE GATE */}
        <section className="container mx-auto px-4 mb-32"><div className="flex items-center gap-4 mb-8"><div className="h-px bg-border flex-1" /><h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground shrink-0 flex items-center gap-2"><Ticket className="h-4 w-4" /> 3. Promo Code Gate</h2><div className="h-px bg-border flex-1" /></div><div className="max-w-md mx-auto"><PromoCodeInput /></div></section>

        {/* 4. EDUCATIONAL OUTREACH */}
        <section id="community" className="container mx-auto px-4 scroll-mt-24 mb-32">
          <div className="flex items-center gap-4 mb-12"><div className="h-px bg-border flex-1" /><h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2"><Globe className="h-4 w-4" /> 4. Educational Outreach</h2><div className="h-px bg-border flex-1" /></div>
          <Card className="max-w-4xl mx-auto bg-primary/5 border-2 border-primary/20 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><Users className="h-40 w-40 text-primary" /></div>
            <div className="space-y-10 relative z-10 text-center">
              <div className="space-y-4">
                <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">Sponsored Access</Badge>
                <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">Bringing the Sanctuary to Your Classroom & <span className="text-primary">Community</span></h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">We provide Full Membership Access at no cost for organizations focused on learning, growth, and care.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                <div className="p-6 bg-background/40 rounded-[2rem] border border-border space-y-2"><div className="flex items-center gap-3 text-primary mb-2"><ShieldCheck className="h-5 w-5" /><h4 className="font-headline font-black text-xs uppercase tracking-widest">Formal Education</h4></div><p className="text-sm text-muted-foreground leading-relaxed font-medium">Traditional K-12 classrooms and school programs looking to integrate live sanctuary logs.</p></div>
                <div className="p-6 bg-background/40 rounded-[2rem] border border-border space-y-2"><div className="flex items-center gap-3 text-primary mb-2"><Users className="h-5 w-5" /><h4 className="font-headline font-black text-xs uppercase tracking-widest">Home & Community</h4></div><p className="text-sm text-muted-foreground leading-relaxed font-medium">Homeschooling collectives, after-school clubs, and 4-H initiatives focused on stewardship.</p></div>
              </div>
              <div className="pt-8">
                <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"><a href="mailto:decentducksorg@gmail.com?subject=Community Access Request">REQUEST SPONSORED ACCESS <ArrowRight className="ml-2 h-5 w-5" /></a></Button>
              </div>
            </div>
          </Card>
        </section>

        {/* 5. SANCTUARY GEAR */}
        <section id="merch" className="container mx-auto px-4 scroll-mt-24">
          <div className="flex items-center gap-4 mb-8"><div className="h-px bg-border flex-1" /><h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> 5. Sanctuary Gear</h2><div className="h-px bg-border flex-1" /></div>
          <div className="text-center mb-12"><h3 className="text-3xl font-headline font-black uppercase tracking-tight mb-2">Wear the Mission</h3><p className="text-muted-foreground max-w-xl mx-auto font-medium">Proceeds from every order go directly to the sanctuary feed and medical fund.</p></div>
          {merchLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Merch Catalog...</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {merch.map((product) => (
                <Card key={product.id} className="bg-card border-border rounded-2xl overflow-hidden group hover:glow-primary transition-all duration-500">
                  <div className="relative aspect-square bg-muted">
                    {product.thumbnail_url ? <Image src={product.thumbnail_url} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><ShoppingBag className="h-12 w-12" /></div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Button asChild variant="outline" className="border-primary text-primary font-black rounded-full h-12 w-12 p-0"><a href={`https://decent-ducks.printful.me/product/${product.id}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-5 w-5" /></a></Button></div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1"><h4 className="font-headline font-black text-xs uppercase tracking-tight line-clamp-1">{product.name}</h4><p className="text-lg font-headline font-black text-primary">{product.minPrice !== undefined ? (product.minPrice === product.maxPrice ? `$${product.minPrice.toFixed(2)}` : `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`) : "$24.99"}</p></div>
                    <Button asChild className="w-full bg-secondary text-secondary-foreground font-black h-10 text-[10px] uppercase tracking-widest rounded-xl"><a href={`https://decent-ducks.printful.me/product/${product.id}`} target="_blank" rel="noopener noreferrer">VIEW PRODUCT</a></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <SupportContent />
    </Suspense>
  );
}
