
"use client";

import { useState, useMemo, Suspense } from 'react';
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
  TreePine,
  TrendingUp,
  Activity,
  User,
  ShieldCheck,
  CheckCircle2,
  Users,
  BookOpen,
  Zap
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

function MembershipContent() {
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
          donorPrivateName: `${payer.name?.given_name || ''} ${payer.name?.surname || ''}`.trim(),
          donorPrivateEmail: payer.email_address || '',
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
      router.push(`/membership/success?name=${encodeURIComponent(successName)}&bird=${encodeURIComponent(birdParam || 'The Flock')}`);
    } catch (e) {
      console.error("Post-payment error:", e);
      router.push('/membership/success'); 
    }
  };

  return (
    <PayPalScriptProvider options={{ 
      "clientId": PAYPAL_CLIENT_ID,
      vault: true,
      intent: frequency === 'one-time' ? "capture" : "subscription"
    }}>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
        <Navbar />

        <main className="flex-1 pb-32">
          {/* Hero Section */}
          <section className="relative pt-24 pb-12 bg-secondary/5 border-b border-border overflow-hidden">
            <div className="container mx-auto px-4 text-center space-y-6 relative z-10">
              <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
                Sanctuary Program
              </Badge>
              <h1 className="text-5xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-none max-w-4xl mx-auto">
                BECOME A <span className="text-primary">MEMBER</span> OF THE FLOCK
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                Your support directly funds the rescue, rehabilitation, and lifelong care of abandoned domestic ducks.
              </p>
            </div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />
          </section>

          {/* Duck of the Month Spotlight */}
          <section className="py-12 container mx-auto px-4">
            <DOTMSpotlight />
          </section>

          {/* Tiered Perks Comparison Section */}
          <section className="py-24 container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <Badge className="bg-secondary/20 text-secondary border-none px-4 py-1 font-black text-[10px] tracking-[0.4em] uppercase">
                  Program Comparison
                </Badge>
                <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter">Choose Your <span className="text-primary">Impact</span></h2>
                <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                  Whether you're following the journey or providing direct care, every member of the flock matters.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Tier 1: Flock Member */}
                <Card className="bg-card border-border border-2 rounded-[3rem] p-8 md:p-12 flex flex-col space-y-8 shadow-xl relative overflow-hidden group hover:border-secondary/30 transition-all duration-500">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-headline font-black uppercase tracking-tight">Flock Member</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Community Access</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-headline font-black">$0</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Free Forever</p>
                      </div>
                    </div>
                    <div className="h-px bg-border w-full" />
                  </div>

                  <div className="flex-1 space-y-6">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Stay connected with the sanctuary pulse and follow every rescue story as it happens.
                    </p>
                    <ul className="space-y-4">
                      {[
                        { text: "Virtual Sanctuary Portal", icon: <Users className="h-4 w-4" /> },
                        { text: "Live Daily Care Logs", icon: <Activity className="h-4 w-4" /> },
                        { text: "Real-Time Egg Counter", icon: <Trophy className="h-4 w-4" /> },
                        { text: "Live Vibe Board Access", icon: <Zap className="h-4 w-4" /> },
                        { text: "Community Shoutouts", icon: <Heart className="h-4 w-4" /> }
                      ].map((perk, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                            {perk.icon}
                          </div>
                          {perk.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button asChild variant="outline" className="w-full h-16 rounded-2xl border-border font-black uppercase tracking-widest text-xs hover:bg-secondary/10 group-hover:border-secondary/50 transition-all">
                    <Link href="/signup">JOIN THE FLOCK (FREE)</Link>
                  </Button>
                </Card>

                {/* Tier 2: Sanctuary Member (Premium) */}
                <Card className="bg-card border-primary border-4 rounded-[3.5rem] p-8 md:p-12 flex flex-col space-y-8 shadow-2xl relative overflow-hidden scale-105 z-10">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <Trophy className="h-40 w-40 text-primary" />
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-3xl font-headline font-black uppercase tracking-tight">Sanctuary Member</h3>
                          <Badge className="bg-primary text-black font-black text-[8px] uppercase tracking-widest">MOST IMPACTFUL</Badge>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Adopt-a-Duck Experience</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-headline font-black text-primary">$8.33</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Per Month</p>
                        <p className="text-[9px] font-bold italic text-primary/80 mt-0.5">(Only $0.27 a day!)</p>
                      </div>
                    </div>
                    <div className="h-px bg-primary/20 w-full" />
                  </div>

                  <div className="flex-1 space-y-6 relative z-10">
                    <p className="text-sm font-medium text-foreground leading-relaxed font-bold">
                      Directly fund the food, health, and housing for our residents. Unlock the deepest sanctuary secrets.
                    </p>
                    <ul className="space-y-4">
                      {[
                        { text: "Official Virtual Adoption", icon: <Heart className="h-4 w-4 fill-current" /> },
                        { text: "Naming Rights for New Arrivals", icon: <Sparkles className="h-4 w-4" /> },
                        { text: "Unlock the 'Ducklopedia'", icon: <BookOpen className="h-4 w-4" /> },
                        { text: "Interactive Lineage Trees", icon: <TreePine className="h-4 w-4" /> },
                        { text: "Exclusive Member Recognition", icon: <ShieldCheck className="h-4 w-4" /> },
                        { text: "Digital Adoption Certificate", icon: <CheckCircle2 className="h-4 w-4" /> }
                      ].map((perk, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-black text-foreground">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            {perk.icon}
                          </div>
                          {perk.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={() => {
                      const element = document.getElementById('support-options');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                  >
                    UPGRADE TO MEMBER
                  </Button>
                </Card>
              </div>
            </div>
          </section>

          {/* Community Impact Tracking */}
          <section className="py-16 container mx-auto px-4">
             <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                   <h2 className="text-3xl font-headline font-black uppercase tracking-tight flex items-center justify-center gap-3">
                     <TrendingUp className="h-6 w-6 text-primary" /> COMMUNITY IMPACT
                   </h2>
                   <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Live Sanctuary Sustainment Goals</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {[
                     { label: "Flock Feed", key: "feed", icon: "🌾", goal: GOALS.feed },
                     { label: "Medical Reserve", key: "medical", icon: "🏥", goal: GOALS.medical },
                     { label: "Infrastructure", key: "infrastructure", icon: "🔨", goal: GOALS.infrastructure }
                   ].map((item) => (
                     <Card key={item.key} className="bg-card border-border rounded-3xl p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center">
                           <span className="text-2xl">{item.icon}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary">${Math.round(stats[item.key as keyof typeof stats])} / ${item.goal}</span>
                        </div>
                        <div className="space-y-2">
                           <p className="text-xs font-black uppercase tracking-tight">{item.label}</p>
                           <Progress value={(stats[item.key as keyof typeof stats] / item.goal) * 100} className="h-3" />
                        </div>
                     </Card>
                   ))}
                </div>

                {donations && donations.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 overflow-hidden relative">
                     <div className="flex items-center gap-4 animate-in fade-in duration-1000">
                        <Activity className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex gap-8 whitespace-nowrap overflow-hidden">
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                             LATEST ACTIVITY: {donations[0].donorDisplayName} just donated ${donations[0].amount} to {donations[0].designation}!
                           </p>
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </section>

          {/* Support Options */}
          <section id="support-options" className="py-24 container mx-auto px-4 border-t border-border/50">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              <div className="lg:col-span-7 space-y-12">
                {/* Membership Selection Section */}
                <div className="bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-primary/20 shadow-2xl space-y-8 relative overflow-hidden">
                  {birdParam && (
                    <div className="bg-primary/10 border-2 border-primary/30 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-primary fill-primary" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest">Adopting <span className="text-primary">{birdParam}</span></p>
                      </div>
                      <Badge className="bg-primary text-black text-[8px] font-black">PENDING</Badge>
                    </div>
                  )}

                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Trophy className="h-32 w-32 text-primary" />
                  </div>
                  
                  <div className="flex items-center gap-3 text-primary relative z-10">
                     <Heart className="h-6 w-6 fill-primary" />
                     <h2 className="text-2xl font-headline font-black uppercase tracking-tight">Select Membership Plan</h2>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <p className="text-sm text-foreground/90 leading-relaxed font-bold">
                      Sanctuary Membership provides 100% of the food, bedding, and medical care for a resident of your choice.
                    </p>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Commitment Level</Label>
                      <RadioGroup 
                        value={frequency} 
                        onValueChange={(v) => {
                          const val = v as any;
                          setFrequency(val);
                          if (val === 'monthly') setAmount('8.33');
                          if (val === 'yearly') setAmount('75.00');
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="relative">
                          <RadioGroupItem value="monthly" id="freq-monthly" className="sr-only" />
                          <Label 
                            htmlFor="freq-monthly"
                            className={cn(
                              "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer h-full",
                              frequency === 'monthly' ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"
                            )}
                          >
                            <span className="font-black text-xs uppercase tracking-widest">Monthly Plan</span>
                            <span className="text-3xl font-headline font-black mt-1">$8.33</span>
                            <span className="text-[10px] font-bold italic opacity-80 mt-1 text-center">(Only $0.27 a day!)</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem value="yearly" id="freq-yearly" className="sr-only" />
                          <Label 
                            htmlFor="freq-yearly"
                            className={cn(
                              "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer h-full",
                              frequency === 'yearly' ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"
                            )}
                          >
                            <span className="font-black text-xs uppercase tracking-widest">Yearly Plan</span>
                            <span className="text-3xl font-headline font-black mt-1">$75.00</span>
                            <span className="text-[10px] font-bold italic opacity-80 mt-1 text-center">(~$0.20 a day!)</span>
                          </Label>
                          {frequency === 'yearly' && (
                            <div className="absolute -bottom-6 left-0 right-0 text-center animate-in fade-in slide-in-from-top-1">
                              <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-background px-3 py-1 rounded-full border border-primary/20">Best Value: Save $25 / Year</span>
                            </div>
                          )}
                        </div>
                      </RadioGroup>
                    </div>

                    {frequency !== 'one-time' && (
                      <div className="pt-4 space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="guardian-recognition" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <User className="h-3.5 w-3.5" /> Recognition Name (Optional)
                          </Label>
                          <Input 
                            id="guardian-recognition"
                            placeholder="e.g. The Smith Family"
                            value={donorDisplayName}
                            onChange={(e) => setDonorDisplayName(e.target.value)}
                            className="h-12 rounded-xl border-2 border-border bg-background/50"
                          />
                        </div>

                        <div className="flex flex-col items-center gap-4">
                          {isProcessing ? (
                            <div className="flex flex-col items-center gap-4 py-8">
                              <Loader2 className="h-10 w-10 animate-spin text-primary" />
                              <p className="font-black uppercase tracking-widest text-[10px]">Configuring Membership...</p>
                            </div>
                          ) : (
                            <div className="w-full max-w-sm mx-auto">
                              <PayPalButtons 
                                key={`${frequency}-${amount}`}
                                style={{ 
                                  layout: "vertical",
                                  shape: "rect",
                                  label: "subscribe",
                                  color: "gold"
                                }}
                                createSubscription={(data, actions) => {
                                  return actions.subscription.create({
                                    plan_id: frequency === 'monthly' ? PLAN_MONTHLY : PLAN_YEARLY
                                  });
                                }}
                                onApprove={async (data, actions) => {
                                  setIsProcessing(true);
                                  handlePaymentSuccess(data, Number(amount), false);
                                }}
                                className="w-full flex justify-center"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* One-Time Support Section */}
                <div className="bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-border shadow-xl space-y-8">
                  <div className="flex items-center gap-3 text-secondary">
                     <Waves className="h-6 w-6" />
                     <h2 className="text-2xl font-headline font-black uppercase tracking-tight">One-Time Support</h2>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Make a splash! One-time gifts provide immediate resources for the flock and unlock standard member features.
                  </p>

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Support Level</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                          variant="outline"
                          onClick={() => { setFrequency('one-time'); setAmount('5'); }}
                          className={cn(
                            "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1",
                            frequency === 'one-time' && amount === '5' ? "border-secondary bg-secondary/10 text-secondary" : "border-border hover:border-secondary/20"
                          )}
                        >
                          <span className="font-headline font-black text-xl">$5</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">The Treat Fund</span>
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => { setFrequency('one-time'); setAmount('10'); }}
                          className={cn(
                            "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1",
                            frequency === 'one-time' && amount === '10' ? "border-secondary bg-secondary/10 text-secondary" : "border-border hover:border-secondary/20"
                          )}
                        >
                          <span className="font-headline font-black text-xl">$10</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">The Snack Pack</span>
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => { setFrequency('one-time'); setAmount('20'); }}
                          className={cn(
                            "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1",
                            frequency === 'one-time' && amount === '20' ? "border-secondary bg-secondary/10 text-secondary" : "border-border hover:border-secondary/20"
                          )}
                        >
                          <span className="font-headline font-black text-xl">$20</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">The Bedding Refresh</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Required Designation & Custom Amount</Label>
                        <div className="flex flex-col md:flex-row gap-4">
                          <Select value={designation} onValueChange={setDesignation}>
                            <SelectTrigger className="h-14 rounded-xl border-2 border-border bg-background/50 font-black uppercase text-[10px] tracking-widest flex-1">
                              <SelectValue placeholder="Where should funds go?" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                              <SelectItem value="feed">Flock Feed & Nutrition</SelectItem>
                              <SelectItem value="medical">Medical & Wellness</SelectItem>
                              <SelectItem value="infrastructure">Infrastructure & Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative flex-1">
                            <Input 
                              placeholder="Custom Amount" 
                              type="number"
                              value={['5', '10', '20'].includes(amount) || frequency !== 'one-time' ? '' : amount}
                              onChange={(e) => { setFrequency('one-time'); setAmount(e.target.value); }}
                              className="h-14 rounded-xl border-2 border-border font-headline font-black text-lg pl-8"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black">$</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="one-time-recognition" className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                          <User className="h-3.5 w-3.5" /> Recognition Name (Optional)
                        </Label>
                        <Input 
                          id="one-time-recognition"
                          placeholder="e.g. Anonymously or For the Ducks"
                          value={donorDisplayName}
                          onChange={(e) => setDonorDisplayName(e.target.value)}
                          className="h-12 rounded-xl border-2 border-border bg-background/50"
                        />
                      </div>
                    </div>

                    {frequency === 'one-time' && (
                      <div className="pt-4 flex flex-col items-center gap-4">
                        <div className="w-full max-w-sm mx-auto">
                          {!designation ? (
                            <div className="p-4 bg-muted/20 border border-dashed border-border rounded-xl text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Please select a designation to enable donation</p>
                            </div>
                          ) : (
                            <PayPalButtons 
                              key={`one-time-${amount}-${designation}`}
                              style={{ 
                                layout: "vertical",
                                shape: "rect",
                                label: "donate",
                                color: "gold"
                              }}
                              createOrder={(data, actions) => {
                                return actions.order.create({
                                  intent: "CAPTURE",
                                  purchase_units: [{
                                    amount: {
                                      currency_code: "USD",
                                      value: amount || "5"
                                    },
                                    description: `Sanctuary Support: ${designation}`
                                  }]
                                });
                              }}
                              onApprove={async (data, actions) => {
                                setIsProcessing(true);
                                const details = await actions.order?.capture();
                                handlePaymentSuccess(details, Number(amount || 5), true);
                              }}
                              className="w-full flex justify-center"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-8">
                {/* Benefits Perk Grid */}
                <div className="space-y-6">
                  <div className="space-y-2 text-center lg:text-left">
                    <h3 className="text-3xl font-headline font-black uppercase tracking-tight">What You Unlock</h3>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Member Benefits</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { 
                        title: "Name a Resident", 
                        desc: "Recurring Members unlock the honor of naming the next bird to enter the sanctuary archives.", 
                        icon: <Sparkles className="h-6 w-6 text-primary" />,
                        color: "primary",
                        exclusive: true
                      },
                      { 
                        title: "Direct Care Logs", 
                        desc: "Receive real-time personal updates from the staff regarding your specific adopted resident.", 
                        icon: <BellRing className="h-6 w-6 text-primary" />,
                        color: "primary",
                        exclusive: true
                      },
                      { 
                        title: "Heritage Trees", 
                        desc: "Explore interactive pedigree charts for all G1 and G2 sanctuary residents.", 
                        icon: <TreePine className="h-6 w-6 text-secondary" />,
                        color: "secondary"
                      },
                      { 
                        title: "The Ledger", 
                        desc: "Live access to our 501(c)(3) financial allocation and spending transparency.", 
                        icon: <Wallet className="h-6 w-6 text-[#14F195]" />,
                        color: "[#14F195]"
                      }
                    ].map((benefit, i) => (
                      <Card key={i} className={cn(
                        "bg-card border-border rounded-3xl p-6 space-y-4 hover:border-primary/20 transition-all shadow-xl group",
                        benefit.exclusive && "border-primary/20 bg-primary/5"
                      )}>
                        <div className="flex items-start justify-between">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", `bg-${benefit.color}/10`)}>
                            {benefit.icon}
                          </div>
                          {benefit.exclusive && (
                            <Badge className="bg-primary text-black text-[8px] font-black uppercase tracking-widest">Member Exclusive</Badge>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-headline font-black uppercase tracking-tight">{benefit.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium mt-1">
                            {benefit.desc}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Note on Exclusive access */}
                <div className="p-6 bg-muted/20 rounded-2xl border border-border italic text-[10px] text-muted-foreground leading-relaxed">
                  *Please note: Naming Rights and Direct Duck Updates are reserved for our recurring Monthly and Yearly Members. One-time gifts grant full access to the Standard Member Dashboard features including the Ledger and Heritage Trees.
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PayPalScriptProvider>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <MembershipContent />
    </Suspense>
  );
}
