"use client";

import { useState, Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Heart, 
  Loader2,
  Waves,
  Trophy,
  CheckCircle2,
  Star,
  ShoppingBag,
  Ticket,
  MessageSquare,
  ShoppingBasket,
  Zap,
  Bird,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PromoCodeInput } from '@/components/shared/PromoCodeInput';
import { UserProfile } from '@/lib/types';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const SolanaCheckout = dynamic(
  () => import('@/components/web3/SolanaCheckout').then((mod) => mod.SolanaCheckout),
  { ssr: false }
);

const STRIPE_PRICES = {
  SPLASH_5: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPLASH_5 || 'price_1THAi9GyzCRtb3HxMeGKzCeh',
  SPLASH_10: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPLASH_10 || 'price_1THAidGyzCRtb3HxaeBUkg33',
  SPLASH_25: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPLASH_25 || 'price_1THAj9GyzCRtb3HxxjI9L4Yg',
  SPLASH_CUSTOM: process.env.NEXT_PUBLIC_STRIPE_PRICE_SPLASH_CUSTOM || 'price_1THAmlGyzCRtb3HxiD9YcrR5',
  GUARDIAN_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_GUARDIAN_MONTHLY || 'price_1THAffGyzCRtb3Hx7RHfIdqC',
  PROTECTOR_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROTECTOR_MONTHLY || 'price_1Ttbd4GyzCRtb3Hx0ssNQrJM',
};

const STRIPE_PRODUCTS = {
  PROTECTOR: 'prod_UFfyopJ1UUtWvC',
};
const AMAZON_STOREFRONT_URL = 'https://www.amazon.com/shop/justtduckit/list/D8RL88I4288F?ref_=aip_sf_list_spv_ofs_m_lspvrd&ccs_id=ac2d438b-2c26-4bbb-8c7c-2d8eb617bb29';
const DISCORD_INVITE = 'https://discord.gg/ERegmyNdcG';

// Helper component for interactive click-to-copy functionality
function CryptoAddressBlock({ label, address }: { label: string; address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="bg-muted/50 p-5 rounded-2xl border flex flex-col justify-between space-y-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        <code className="text-xs font-mono break-all bg-background p-3 rounded-lg block border border-border select-all">
          {address}
        </code>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleCopy}
        className="w-full h-10 font-black text-[10px] tracking-widest uppercase border-primary/20 hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-green-500" /> COPIED!
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" /> COPY ADDRESS
          </>
        )}
      </Button>
    </div>
  );
}

function SupportContent() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [selectedSplashPrice, setSelectedSplashPrice] = useState<string>(STRIPE_PRICES.SPLASH_10);
  const [splashAmountLabel, setSplashAmountLabel] = useState<string>('10');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [cryptoTab, setCryptoTab] = useState<'checkout' | 'addresses'>('checkout');

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

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

      <main id="main-content" className="flex-1 pt-12">
        <section className="container mx-auto px-4 text-center space-y-6 mb-20">
          <div className="flex flex-col items-center gap-3">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">Membership Hub</Badge>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1">
                  <Ticket className="h-3 w-3" /> Redeem Code
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border-none bg-transparent shadow-2xl" side="bottom" align="center">
                <PromoCodeInput />
              </PopoverContent>
            </Popover>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-tight">INVEST IN THE <span className="text-primary">MISSION</span></h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">Your membership directly funds foundational infrastructure, rescue operations, and sanctuary technology.</p>
        </section>

        {/* 1. SANCTUARY MEMBERSHIPS - 3-TIER FUNNEL (PRIORITY) */}
        <section id="membership" className="py-12 scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> 1. Infrastructure Tiers
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              
              {/* TIER 1: THE SANCTUARY INSIDER (FREE) */}
              <Card className="bg-card border-2 border-border rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-xl relative">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-foreground">The Insider</h3>
                    <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Community Access</p>
                </div>
                <div className="text-4xl font-headline font-black text-foreground">FREE</div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest">Get the inside view:</p>
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">"Join the Discord for daily raw content, resident logs, and real-time updates directly from the ground."</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {['Daily Raw Ground Content', 'Real-time Resident Logs', 'Public Discord Entry', 'Mission Update Feed'].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild
                  className="w-full min-h-[4rem] bg-background border-2 border-border text-foreground font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center rounded-xl shadow-lg hover:scale-[1.02] transition-transform whitespace-normal text-center px-4 leading-tight"
                >
                  <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
                    JOIN THE COMMUNITY
                  </a>
                </Button>
              </Card>

              {/* TIER 2: DUCK GUARDIAN ($8.33/mo) - FEATURED */}
              <Card id="guardian" className="bg-card border-[3px] border-primary rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-2xl relative overflow-hidden ring-8 ring-primary/5 scale-105 z-10">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Bird className="h-20 w-20 text-primary" /></div>
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Duck Guardian</h3>
                    <Star className="h-6 w-6 text-primary fill-primary" />
                  </div>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Foundation Support</p>
                </div>
                <div className="text-4xl font-headline font-black text-foreground relative z-10">$8.33<span className="text-xs font-medium text-muted-foreground ml-1">/mo</span></div>
                <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest">Protect the flock:</p>
                  <p className="text-xs font-black text-foreground leading-relaxed italic">"Directly fuels infrastructure, security, and high-quality nutrition for the birds."</p>
                </div>
                <ul className="flex-1 space-y-3 relative z-10">
                  {['Flock Infrastructure (Fencing)', 'High-Quality Nutrition Funding', 'Sanctuary Security Initiatives', 'Inner Circle Discord Role', 'Digital Support Achievement'].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-black text-foreground">
                      <Zap className="h-4 w-4 text-primary fill-primary" /> {p}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleCheckout(STRIPE_PRICES.GUARDIAN_MONTHLY)}
                  disabled={isRedirecting}
                  className="w-full min-h-[4rem] bg-primary text-primary-foreground font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center rounded-xl shadow-xl hover:scale-[1.05] transition-transform whitespace-normal text-center px-4 leading-tight relative z-10"
                >
                  {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "JOIN THE FLOCK"}
                </Button>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
              </Card>

              {/* TIER 3: FLOCK PROTECTOR ($35/mo) */}
              <Card id="pack" className="bg-card border-2 border-secondary rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-xl relative overflow-hidden">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-secondary">Flock Protector</h3>
                    <Bird className="h-6 w-6 text-secondary/40" />
                  </div>
                  <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest">Scale the Mission</p>
                </div>
                <div className="text-4xl font-headline font-black text-secondary">$35<span className="text-xs font-medium text-muted-foreground ml-1">/mo</span></div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-secondary tracking-widest">Operational support:</p>
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">"Operational support for the full waterfowl rescue squad, including our ducks, geese, and turkeys."</p>
                </div>
                <ul className="flex-1 space-y-3">
                  {[
                    'Full Waterfowl Operations',
                    'Specialized Avian Medical Care',
                    'Habitat Expansion Funding',
                    'Permanent Ledger Recognition',
                    'Everything in Guardian Tier'
                  ].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-secondary" /> {p}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleCheckout(STRIPE_PRICES.PROTECTOR_MONTHLY)}
                  disabled={isRedirecting}
                  className="w-full min-h-[4rem] bg-secondary text-secondary-foreground font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center rounded-xl shadow-lg hover:scale-[1.02] transition-transform whitespace-normal text-center px-4 leading-tight"
                >
                  {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "PROTECT THE PACK"}
                </Button>
              </Card>

            </div>
          </div>
        </section>

        {/* 2. MAKE A SPLASH */}
        <section id="donate" className="py-24 bg-secondary/5 border-y border-secondary/10 scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-secondary/20 flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-secondary shrink-0 flex items-center gap-2">
                <Waves className="h-4 w-4" /> 2. One-Time Mission Support
              </h2>
              <div className="h-px bg-secondary/20 flex-1" />
            </div>

            <Card className="max-w-3xl mx-auto bg-card border-border rounded-[2rem] p-8 md:p-12 shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Make a Splash</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto">
                  From snacks and bedding to high-tech infrastructure like Duck TV, your one-time support fuels the immediate needs and future goals of the sanctuary. Every splash counts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { price: STRIPE_PRICES.SPLASH_5, val: '5', label: '4lbs of Peas' },
                  { price: STRIPE_PRICES.SPLASH_10, val: '10', label: '2 Watermelons / Pumpkins' },
                  { price: STRIPE_PRICES.SPLASH_25, val: '25', label: '1 Bag of Flock Feed' }
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Or Enter Custom Mission Amount</Label>
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

              <div className="pt-4 flex flex-col items-center gap-6">
                <Button 
                  onClick={() => handleCheckout(selectedSplashPrice)}
                  disabled={isRedirecting}
                  className="w-full max-w-sm h-16 bg-primary text-primary-foreground font-black text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  {isRedirecting ? <Loader2 className="h-6 w-6 animate-spin" /> : <>SUPPORT MISSION WITH ${splashAmountLabel} <Heart className="ml-2 h-5 w-5 fill-current" /></>}
                </Button>
                
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center px-8">
                  For major gifts or specific infrastructure inquiries, please contact us directly via Discord.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* CRYPTO DONATION SECTION */}
        <section className="container mx-auto px-4 py-12 scroll-mt-24">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Inner Sub-tab Switcher for Web3 vs standard address */}
            <div className="flex justify-center">
              <div className="flex bg-card border border-border p-1.5 rounded-2xl shadow-lg">
                <button
                  onClick={() => setCryptoTab('checkout')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    cryptoTab === 'checkout'
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Interactive Checkout
                </button>
                <button
                  onClick={() => setCryptoTab('addresses')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    cryptoTab === 'addresses'
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Standard Addresses
                </button>
              </div>
            </div>

            {cryptoTab === 'checkout' ? (
              <SolanaCheckout />
            ) : (
              <div className="bg-card border-2 border-primary rounded-[2rem] p-8 md:p-10 shadow-xl">
                <div className="text-center space-y-6">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Direct Crypto Support</h3>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <CryptoAddressBlock 
                      label="Solana (SOL)" 
                      address="AKkgD4kg8bq7sPUXhqWLqNPBcvtXXhevx3TQCkuxpUQY" 
                    />
                    <CryptoAddressBlock 
                      label="Ethereum (ETH)" 
                      address="0x30B52ee50E3C4176071E4fF6D010c28e54164788" 
                    />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Please ensure you are sending on the correct network.
                  </p>

                  <div className="border-t border-border pt-6 mt-6 text-left">
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary fill-primary/10" />
                          <h4 className="text-lg font-headline font-black uppercase tracking-tight text-foreground">Decent Ducks v2</h4>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium max-w-md">
                          Support our mission directly with a digital asset receipt that only ever gains value.
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                        <Button 
                          asChild 
                          className="w-full md:w-auto h-12 px-6 bg-primary text-primary-foreground font-black text-xs tracking-widest uppercase rounded-xl hover:scale-105 transition-transform"
                        >
                          <a 
                            href="https://justduckeggs.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Support via Decent Ducks
                          </a>
                        </Button>
                        <a 
                          href="https://duckxmeta.github.io/Ducklopedia/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all mt-1"
                        >
                          Ducklopedia
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* 3. SANCTUARY GEAR - AMAZON & PRINTFUL */}
        <section id="merch" className="container mx-auto px-4 scroll-mt-24 py-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-border flex-1" />
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
              <ShoppingBasket className="h-4 w-4" /> 3. Physical Supplies
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
                <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">Purchase nutrition and bedding directly for sanctuary use.</p>
              </div>
              <Button asChild className="bg-[#FF9900] text-black font-black h-14 px-12 text-lg rounded-xl shadow-xl hover:scale-105 transition-transform">
                <a href={AMAZON_STOREFRONT_URL} target="_blank" rel="noopener noreferrer">VISIT STOREFRONT</a>
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
