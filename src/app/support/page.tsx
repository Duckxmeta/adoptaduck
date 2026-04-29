
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
  MessageSquare,
  Dog,
  ShoppingBasket
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
  PACK_MONTHLY: 'price_1TNkoBGyzCRtb3Hx0UPYH362',
  EQUINE_MONTHLY: 'price_1TNkneGyzCRtb3Hx34rLQuwT'
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
              {/* TIER 1: GUARDIAN */}
              <Card id="guardian" className="bg-card border-2 border-primary rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-xl relative scroll-mt-32">
                <div className="space-y-1">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Sanctuary Guardian</h3>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">General Mission Support</p>
                </div>
                <div className="text-4xl font-headline font-black text-foreground">$8.33<span className="text-xs font-medium text-muted-foreground ml-1">/mo</span></div>
                <ul className="flex-1 space-y-3">
                  {['Collaborative Input (Facility Voting)', 'Access to Adopter Discord', 'Daily Resident Photos & Videos', 'Exclusive Member Badge'].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleCheckout(STRIPE_PRICES.GUARDIAN_MONTHLY)}
                  disabled={isRedirecting}
                  className="w-full h-14 bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest rounded-xl shadow-lg"
                >
                  {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "JOIN AS GUARDIAN"}
                </Button>
              </Card>

              {/* TIER 2: THE PACK */}
              <Card id="pack" className="bg-card border-2 border-secondary rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-2xl relative overflow-hidden ring-4 ring-secondary/10 scale-105 z-10 scroll-mt-32">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Dog className="h-20 w-20 text-secondary" /></div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-secondary">The Marina Miracles</h3>
                  <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest">Canine Pack Sponsorship</p>
                </div>
                <div className="text-4xl font-headline font-black text-secondary">$35<span className="text-xs font-medium text-muted-foreground ml-1">/mo</span></div>
                <ul className="flex-1 space-y-3 relative z-10">
                  {[
                    'Support the Entire Canine Pack',
                    'Direct Nutrition & Medical Funding',
                    'Monthly Pack Video Updates',
                    'Verified Adopter Discord Role',
                    'Everything in Guardian Tier'
                  ].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-black text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-secondary" /> {p}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleCheckout(STRIPE_PRICES.PACK_MONTHLY)}
                  disabled={isRedirecting}
                  className="w-full h-14 bg-secondary text-secondary-foreground font-black uppercase text-xs tracking-widest rounded-xl shadow-lg"
                >
                  {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "SPONSOR THE PACK"}
                </Button>
              </Card>

              {/* TIER 3: OTIS */}
              <Card id="equine" className="bg-card border-border border-2 rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-xl scroll-mt-32">
                <div className="space-y-1">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-foreground">Otis the Gentle Giant</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Equine Excellence</p>
                </div>
                <div className="text-4xl font-headline font-black text-foreground">$75<span className="text-xs font-medium text-muted-foreground ml-1">/mo</span></div>
                <ul className="flex-1 space-y-3">
                  {[
                    'Primary Otis Sponsorship',
                    'High-Fidelity Equine Care',
                    'Permanent Ledger Recognition',
                    'Priority Facility Rescue Alerts',
                    'Access to Adopter Discord'
                  ].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <Star className="h-4 w-4 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleCheckout(STRIPE_PRICES.EQUINE_MONTHLY)}
                  disabled={isRedirecting}
                  className="w-full h-14 bg-background border-border text-foreground font-black uppercase text-xs tracking-widest rounded-xl hover:bg-muted/10 transition-colors"
                >
                  {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "SPONSOR OTIS"}
                </Button>
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

        {/* 4. SANCTUARY GEAR - AMAZON & PRINTFUL */}
        <section id="merch" className="container mx-auto px-4 scroll-mt-24 mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-border flex-1" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
              <ShoppingBasket className="h-4 w-4" /> 4. Sanctuary Supplies
            </h2>
            <div className="h-px bg-border flex-1" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="bg-card border-4 border-primary/30 rounded-[2rem] overflow-hidden shadow-2xl relative group">
              <div className="relative aspect-video w-full">
                <Image src={merchSpotlightUrl} alt="Quack Merch" fill className="object-cover" priority />
                <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/20">
                  <Button asChild className="bg-primary text-primary-foreground font-black h-14 px-10 text-lg rounded-xl shadow-2xl hover:scale-105 transition-transform">
                    <a href="https://justduckit-merch.printful.me/" target="_blank" rel="noopener noreferrer">SHOP PRINTFUL STORE</a>
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-[#FF9900]/5 border-4 border-[#FF9900]/30 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl group hover:border-[#FF9900]/50 transition-colors">
              <div className="w-20 h-20 bg-[#FF9900]/20 rounded-2xl flex items-center justify-center border-2 border-[#FF9900]/40">
                <ShoppingBag className="h-10 w-10 text-[#FF9900]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-headline font-black uppercase text-foreground">Amazon Wishlist</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">Buy food, bedding, and supplies directly for the residents.</p>
              </div>
              <Button asChild className="bg-[#FF9900] text-black font-black h-14 px-12 text-lg rounded-xl shadow-xl hover:scale-105 transition-transform">
                <a href="https://www.amazon.com/hz/wishlist/ls/DECENTDUCKS" target="_blank" rel="noopener noreferrer">VISIT STOREFRONT</a>
              </Button>
            </Card>
          </div>
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
