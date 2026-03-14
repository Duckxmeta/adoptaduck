
"use client";

import { useState, useMemo, Suspense, useEffect } from 'react';
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
  Wallet, 
  ArrowRight,
  Sparkles,
  Loader2,
  Waves,
  Trophy,
  BellRing,
  TrendingUp,
  Activity,
  User,
  ShieldCheck,
  CheckCircle2,
  Users,
  Zap,
  Globe,
  Stethoscope,
  Bird
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { DOTMSpotlight } from '@/components/DOTMSpotlight';
import Link from 'next/link';

const PAYPAL_CLIENT_ID = "AZDfsAZRZTJKjHjNx3LPEpyoRRoBrAJZSooSH3t_bDVU7KdZz09XQZn5BQUYwdI-zWdTtSui-qLMht_e";
const PLAN_MONTHLY = "P-70H86074FR874700TNGZW23I";
const PLAN_YEARLY = "P-620528699F672715MNGZW36Q";

const GOALS = {
  feed: 300,
  medical: 500,
  infrastructure: 1000
};

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const birdParam = searchParams.get('bird');
  
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'yearly'>('monthly');
  const [amount, setAmount] = useState<string>('8.33');
  const [designation, setDesignation] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [donorDisplayName, setDonorDisplayName] = useState('');

  // Live Tracking Queries
  const donationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), orderBy('timestamp', 'desc'), limit(50));
  }, [firestore]);

  const { data: donations } = useCollection(donationsQuery);

  const stats = useMemo(() => {
    if (!donations) return { feed: 0, medical: 0, infrastructure: 0 };
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthly = donations.filter(d => {
      const date = new Date(d.timestamp);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    return {
      feed: monthly.filter(d => d.designation === 'feed').reduce((s, d) => s + d.amount, 0),
      medical: monthly.filter(d => d.designation === 'medical').reduce((s, d) => s + d.amount, 0),
      infrastructure: monthly.filter(d => d.designation === 'infrastructure').reduce((s, d) => s + d.amount, 0)
    };
  }, [donations]);

  const handlePaymentSuccess = async (paypalDetails: any, amountValue: number, isOneTime: boolean) => {
    if (!firestore) return;

    try {
      if (isOneTime) {
        const payer = paypalDetails.payer || {};
        await addDoc(collection(firestore, 'donations'), {
          amount: amountValue,
          designation: designation || 'general',
          timestamp: new Date().toISOString(),
          donorDisplayName: donorDisplayName.trim() || 'A Kind Supporter',
          uid: user?.uid || null
        });
      }

      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          role: 'member',
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      const successName = donorDisplayName.trim() || user?.displayName || 'A Kind Supporter';
      router.push(`/donate/success?name=${encodeURIComponent(successName)}&bird=${encodeURIComponent(birdParam || 'The Flock')}`);
    } catch (e) {
      router.push('/donate/success'); 
    }
  };

  return (
    <PayPalScriptProvider 
      key={frequency === 'one-time' ? 'one-time' : 'subscription'}
      options={{ 
        "clientId": PAYPAL_CLIENT_ID,
        vault: frequency !== 'one-time',
        intent: frequency === 'one-time' ? "capture" : "subscription"
      }}
    >
      <div className="min-h-screen flex flex-col bg-background text-foreground font-body pb-20">
        <Navbar />

        <main className="flex-1 space-y-20 pt-12">
          {/* Page Header */}
          <section className="container mx-auto px-4 text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">Support Hub</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-tight">CHOOSE YOUR <span className="text-primary">IMPACT</span></h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">Your contributions provide food, medicine, and a safe forever home for our residents.</p>
          </section>

          {/* 1. VIRTUAL ADOPTION SECTION */}
          <section id="adopt" className="container mx-auto px-4 scroll-mt-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
                <Bird className="h-4 w-4" /> Virtual Adoption
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <DOTMSpotlight />
            
            <div className="mt-8 text-center">
              <Button asChild variant="ghost" className="text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:text-primary transition-colors">
                <Link href="/flock">Browse all residents to find a friend <ArrowRight className="ml-2 h-3 w-3" /></Link>
              </Button>
            </div>
          </section>

          {/* 2. ONE-TIME DONATION SECTION */}
          <section id="donate" className="container mx-auto px-4 scroll-mt-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-secondary shrink-0 flex items-center gap-2">
                <Waves className="h-4 w-4" /> One-Time Support
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>

            <Card className="max-w-3xl mx-auto bg-card border-border rounded-[2rem] p-8 md:p-12 shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Make a Splash</h3>
                <p className="text-sm text-muted-foreground font-medium">Select a gift level to provide immediate care items.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { val: '5', label: 'The Treat Fund' },
                  { val: '10', label: 'The Snack Pack' },
                  { val: '20', label: 'Bedding Refresh' }
                ].map((tier) => (
                  <Button 
                    key={tier.val}
                    variant="outline"
                    onClick={() => { setFrequency('one-time'); setAmount(tier.val); }}
                    className={cn(
                      "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                      frequency === 'one-time' && amount === tier.val ? "border-secondary bg-secondary/10 text-secondary scale-105" : "border-border hover:border-secondary/40"
                    )}
                  >
                    <span className="font-headline font-black text-2xl">${tier.val}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{tier.label}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Designation</Label>
                    <Select value={designation} onValueChange={setDesignation}>
                      <SelectTrigger className="h-14 rounded-xl border-2 border-border bg-background/50 font-black uppercase text-[10px] tracking-widest">
                        <SelectValue placeholder="Where should funds go?" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="feed">Flock Feed</SelectItem>
                        <SelectItem value="medical">Medical & Wellness</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Custom Amount</Label>
                    <div className="relative">
                      <Input 
                        placeholder="0.00" 
                        type="number"
                        value={['5', '10', '20'].includes(amount) && frequency === 'one-time' ? '' : amount}
                        onChange={(e) => { setFrequency('one-time'); setAmount(e.target.value); }}
                        className="h-14 rounded-xl border-2 border-border font-headline font-black text-xl pl-10"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xl">$</span>
                    </div>
                  </div>
                </div>

                {frequency === 'one-time' && designation && (
                  <div className="pt-4 flex justify-center">
                    <div className="w-full max-w-sm">
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect", label: "donate", color: "gold" }}
                        createOrder={(data, actions) => actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{ amount: { currency_code: "USD", value: amount || "5" }, description: `Support: ${designation}` }]
                        })}
                        onApprove={async (data, actions) => {
                          const details = await actions.order?.capture();
                          handlePaymentSuccess(details, Number(amount || 5), true);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* 3. MEMBERSHIP TIERS SECTION */}
          <section id="membership" className="container mx-auto px-4 scroll-mt-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Sanctuary Membership
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <Card className="bg-card border-border rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-xl opacity-80">
                <div className="space-y-1">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight">Flock Member</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Digital Access Only</p>
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

              {/* Premium Tier */}
              <Card className="bg-card border-2 border-primary rounded-[2.5rem] p-8 flex flex-col space-y-6 shadow-2xl relative overflow-hidden ring-4 ring-primary/10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Heart className="h-20 w-20 text-primary fill-primary" />
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-2xl font-headline font-black uppercase tracking-tight text-primary">Sanctuary Member</h3>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Adopt-a-Duck Experience</p>
                </div>
                <div className="text-4xl font-headline font-black text-primary relative z-10">$8.33<span className="text-xs font-medium text-muted-foreground ml-1">/mo</span></div>
                <ul className="flex-1 space-y-3 relative z-10">
                  {[
                    'Official Virtual Adoption',
                    'Naming Rights for Rescues',
                    'Detailed Lineage Trees',
                    'Exclusive Member Badge',
                    'Direct Care Updates'
                  ].map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-black text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  <PayPalButtons 
                    style={{ layout: "vertical", shape: "rect", label: "subscribe", color: "gold" }}
                    createSubscription={(data, actions) => actions.subscription.create({ plan_id: frequency === 'monthly' ? PLAN_MONTHLY : PLAN_YEARLY })}
                    onApprove={async (data, actions) => handlePaymentSuccess(data, 8.33, false)}
                  />
                </div>
              </Card>
            </div>
          </section>

          {/* 4. COMMUNITY IMPACT ACCESS */}
          <section id="community" className="container mx-auto px-4 scroll-mt-24">
            <Card className="max-w-4xl mx-auto bg-primary/5 border-2 border-primary/20 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Users className="h-40 w-40 text-primary" />
              </div>
              
              <div className="space-y-8 relative z-10 text-center">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">Sponsored Access</Badge>
                  <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">Classroom & <span className="text-primary">Community</span></h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">We provide Full Membership Access at no cost for organizations focused on learning, growth, and care.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  {[
                    { t: "Formal Education", d: "K-12 schools & programs", i: <ShieldCheck className="h-4 w-4" /> },
                    { t: "Home Learning", d: "Homeschool & 4-H clubs", i: <Users className="h-4 w-4" /> },
                    { t: "Discovery", d: "Museums & preserves", i: <Globe className="h-4 w-4" /> },
                    { t: "Therapeutic", d: "Care & nursing centers", i: <Stethoscope className="h-4 w-4" /> }
                  ].map((g, i) => (
                    <div key={i} className="p-4 bg-background/40 rounded-2xl border border-border flex gap-3 items-start">
                      <div className="mt-1 text-primary">{g.i}</div>
                      <div>
                        <h4 className="font-headline font-black text-[10px] uppercase tracking-widest">{g.t}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium">{g.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground font-black px-12 h-16 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                    <a href="mailto:decentducksorg@gmail.com?subject=Community Access Request&body=Name: %0AOrganization: %0AMission: ">
                      REQUEST SPONSORED ACCESS <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </PayPalScriptProvider>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <SupportContent />
    </Suspense>
  );
}
