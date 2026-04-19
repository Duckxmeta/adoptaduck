
"use client";

import { useState, Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Heart, 
  ArrowRight,
  Loader2,
  Waves,
  Trophy,
  CheckCircle2,
  Star,
  ShoppingBag,
  ExternalLink,
  Ticket,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PromoCodeInput } from '@/components/shared/PromoCodeInput';
import { UserProfile } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const STRIPE_PRICES = {
  SPLASH_5: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPLASH_5 || 'price_1THAi9GyzCRtb3HxMeGKzCeh',
  SPLASH_10: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPLASH_10 || 'price_1THAidGyzCRtb3HxaeBUkg33',
  SPLASH_25: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPLASH_25 || 'price_1THAj9GyzCRtb3HxxjI9L4Yg',
  SPLASH_CUSTOM: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPLASH_CUSTOM || 'price_1THAmlGyzCRtb3HxiD9YcrR5',
  GUARDIAN_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_GUARDIAN_MONTHLY || 'price_1THAffGyzCRtb3Hx7RHfIdqC',
  GUARDIAN_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_GUARDIAN_YEARLY || 'price_1THAccGyzCRtb3HxwQ1njXlS'
};

function SupportContent() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [selectedSplashPrice, setSelectedSplashPrice] = useState<string>(STRIPE_PRICES.SPLASH_10);
  const [splashAmountLabel, setSplashAmountLabel] = useState<string>('10');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  const isGuardian = userProfile?.role === 'guardian' || userProfile?.role === 'admin';

  const handleCheckout = async (priceId: string) => {
    setIsRedirecting(true);
    try {
      const body: any = {
        priceId,
        userId: user?.uid,
        userEmail: user?.email
      };

      if (priceId === STRIPE_PRICES.SPLASH_CUSTOM) {
        const amt = parseFloat(customAmount);
        if (isNaN(amt) || amt < 1) throw new Error("Min donation: $1");
        body.amount = amt;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.url) window.location.assign(data.url);
      else throw new Error('Checkout failure');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Checkout Unavailable",
        description: error.message || "Financial system error.",
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  const merchSpotlightUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/QuackMerch.jpg?alt=media";

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
                  { price: STRIPE_PRICES.SPLASH_5, val: '5', label: 'The Treat Fund' },
                  { price: STRIPE_PRICES.SPLASH_10, val: '10', label: 'The Snack Pack' },
                  { price: STRIPE_PRICES.SPLASH_25, val: '25', label: 'Bedding Refresh' }
                ].map((tier) => (
                  <button 
                    key={tier.val}
                    type="button"
                    onClick={() => {
                      setSelectedSplashPrice(tier.price);
                      setSplashAmountLabel(tier.val);
                      setCustomAmount('');
                    }}
                    className={cn(
                      "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                      selectedSplashPrice === tier.price && !customAmount ? "border-secondary bg-secondary/10 text-secondary scale-105" : "border-border hover:border-secondary/40"
                    )}
                  >
                    <span className="font-headline font-black text-2xl">${tier.val}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{tier.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-border/50">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Or Enter Custom Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className={cn("font-black text-lg transition-colors", selectedSplashPrice === STRIPE_PRICES.SPLASH_CUSTOM ? "text-secondary" : "text-muted-foreground")}>$</span>
                  </div>
                  <input 
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedSplashPrice(STRIPE_PRICES.SPLASH_CUSTOM);
                      setSplashAmountLabel(e.target.value || 'Custom');
                    }}
                    className={cn(
                      "flex h-14 w-full pl-10 bg-background border-2 font-black text-lg rounded-xl transition-all outline-none",
                      selectedSplashPrice === STRIPE_PRICES.SPLASH_CUSTOM ? "border-secondary ring-2 ring-secondary/10" : "border-border"
                    )}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button 
                  onClick={() => handleCheckout(selectedSplashPrice)}
                  disabled={isRedirecting}
                  className="w-full max-w-sm h-16 bg-primary text-primary-foreground font-black text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  {isRedirecting ? <Loader2 className="h-6 w-6 animate-spin" /> : <>SUPPORT WITH ${splashAmountLabel} <Heart className="ml-2 h-5 w-5 fill-current" /></>}
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* 2. SANCTUARY SUBSCRIPTIONS */}
        <section id="membership" className="py-24 scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> 2. Sanctuary Subscriptions
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
                  {['Virtual Sanctuary Portal', 'Live Daily Care Logs', 'Real-Time Egg Counter', 'Live Vibe Board'].map((p, i) => (
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
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Sanctuary Guardian</h3>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">General Mission Support</p>
                </div>
                <div className="space-y-1 relative z-10">
                  <div className="text-4xl font-headline font-black text-primary">$8.33<span className="text-xs font-medium text-muted-foreground ml-1">/mo</span></div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">($.27 a day)</p>
                </div>
                <ul className="flex-1 space-y-3 relative z-10">
                  {[
                    'Collaborative Input (Facility Voting)',
                    'Access to Adopter Discord',
                    'Daily Resident Photos & Videos',
                    'Exclusive Member Badge',
                    'Direct Care Updates'
                  ].map((p, i) => (
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
                      onClick={() => handleCheckout(STRIPE_PRICES.GUARDIAN_MONTHLY)}
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
                  <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest">Sustainability Impact</p>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-headline font-black text-secondary">$75<span className="text-xs font-medium text-muted-foreground ml-1">/yr</span></div>
                  <p className="text-[10px] font-black text-secondary uppercase tracking-widest">($.20 a day)</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {[
                    'Everything in Guardian',
                    'Name on Physical Ledger',
                    'Permanent Sanctuary Recognition',
                    'Founding Member Seal',
                    'Priority Rescue Alerts',
                    'Access to Adopter Discord'
                  ].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <Star className="h-4 w-4" /> {p}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  {isGuardian ? (
                    <div className="bg-secondary/10 border-2 border-primary/20 rounded-xl p-4 text-center space-y-2">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Benefit Unlocked</p>
                      <p className="font-headline font-black text-lg text-secondary uppercase">Founding Access</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleCheckout(STRIPE_PRICES.GUARDIAN_YEARLY)}
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
        <section className="container mx-auto px-4 mb-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-border flex-1" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground shrink-0 flex items-center gap-2">
              <Ticket className="h-4 w-4" /> 3. Promo Code Gate
            </h2>
            <div className="h-px bg-border flex-1" />
          </div>
          <div className="max-w-md mx-auto">
            <PromoCodeInput />
          </div>
        </section>

        {/* 4. SANCTUARY GEAR - QUACK MERCH SPOTLIGHT */}
        <section id="merch" className="container mx-auto px-4 scroll-mt-24 mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-border flex-1" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> 4. Sanctuary Gear
            </h2>
            <div className="h-px bg-border flex-1" />
          </div>
          
          <div className="max-w-5xl mx-auto space-y-4">
            <Card className="bg-card border-4 border-primary/30 rounded-[2rem] overflow-hidden shadow-2xl relative group">
              <div className="relative aspect-video w-full">
                <Image 
                  src={merchSpotlightUrl} 
                  alt="Quack Merch - JustDuckit" 
                  fill 
                  className="object-cover"
                  priority
                />
                {/* Clean Centered Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <Button 
                    asChild
                    className="bg-primary text-primary-foreground font-black h-11 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg rounded-xl shadow-2xl hover:scale-105 transition-transform w-full max-w-[200px] sm:max-w-xs"
                  >
                    <a href="https://justduckit-merch.printful.me/" target="_blank" rel="noopener noreferrer">
                      SHOP THE QUICK STORE
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
              Proceeds support sanctuary residents. Purchases are processed directly by Printful.me
            </p>
          </div>
        </section>

        {/* 5. EXCLUSIVE BOUTIQUE */}
        <section id="boutique" className="container mx-auto px-4 scroll-mt-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-primary/20 flex-1" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
              <Star className="h-4 w-4" /> 5. Exclusive Boutique
            </h2>
            <div className="h-px bg-primary/20 flex-1" />
          </div>

          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-card to-background border-4 border-primary/30 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Star className="h-40 w-40 text-primary" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-primary/20 shadow-2xl">
                <Image 
                  src="https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/duckshit.png?alt=media&token=e8969995-9299-4c43-9cf3-9095fe85903e" 
                  alt="Premium Duck Decor" 
                  fill 
                  className="object-cover transition-transform duration-10000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <Badge className="absolute bottom-6 left-6 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-4 py-2">Collector's Edition</Badge>
              </div>

              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">Limited Release</Badge>
                  <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-tight">Decent Duck <span className="text-primary">Premium Decor</span></h2>
                  <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                    Elevate your space with the 'Decent Duck Premium Duck Desk Decor Jars'. A high-end artisan collaboration for the most dedicated sanctuary supporters.
                  </p>
                </div>

                <div className="pt-4">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform w-full sm:w-auto">
                    <a href="https://app.exclusivo.one/duck" target="_blank" rel="noopener noreferrer">
                      EXPLORE THE VAULT <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
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
