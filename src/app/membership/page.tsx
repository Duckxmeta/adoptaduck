
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
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
  Coffee,
  Loader2,
  Waves,
  Utensils,
  Stethoscope,
  TreePine
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const PAYPAL_CLIENT_ID = "AZDfsAZRZTJKjHjNx3LPEpyoRRoBrAJZSooSH3t_bDVU7KdZz09XQZn5BQUYwdI-zWdTtSui-qLMht_e";
const PLAN_MONTHLY = "P-06W06412XR994193YNGYLYTI";
const PLAN_YEARLY = "P-7K507415GG316890YNGYLZNQ";

export default function MembershipPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'yearly'>('monthly');
  const [amount, setAmount] = useState<string>('25');
  const [designation, setDesignation] = useState<string>('most-needed');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = async (details: any) => {
    if (user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          role: 'guardian',
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: 'guardian',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          my_flock: [],
          community_codes: []
        }, { merge: true });
      }
    }
    router.push('/welcome-guardian');
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

          {/* Support Options */}
          <section className="py-24 container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              <div className="lg:col-span-7 space-y-12">
                {/* Adopt a Duck / Recurring Section */}
                <div className="bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-border shadow-xl space-y-8">
                  <div className="flex items-center gap-3 text-primary">
                     <Heart className="h-6 w-6 fill-primary" />
                     <h2 className="text-2xl font-headline font-black uppercase tracking-tight">Become a Guardian</h2>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Full adoption provides 100% of the food, bedding, and medical care for a resident of your choice. It is the most direct way to sustain our mission.
                  </p>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Commitment Level</Label>
                      <RadioGroup 
                        value={frequency} 
                        onValueChange={(v) => {
                          const val = v as any;
                          setFrequency(val);
                          if (val === 'monthly') setAmount('25');
                          if (val === 'yearly') setAmount('250');
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="relative">
                          <RadioGroupItem value="monthly" id="freq-monthly" className="sr-only" />
                          <Label 
                            htmlFor="freq-monthly"
                            className={cn(
                              "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer",
                              frequency === 'monthly' ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"
                            )}
                          >
                            <span className="font-black text-xs uppercase tracking-widest">Monthly Guardian</span>
                            <span className="text-3xl font-headline font-black mt-1">$25</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem value="yearly" id="freq-yearly" className="sr-only" />
                          <Label 
                            htmlFor="freq-yearly"
                            className={cn(
                              "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer",
                              frequency === 'yearly' ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"
                            )}
                          >
                            <span className="font-black text-xs uppercase tracking-widest">Yearly Guardian</span>
                            <span className="text-3xl font-headline font-black mt-1">$250</span>
                          </Label>
                          {frequency === 'yearly' && (
                            <div className="absolute -bottom-6 left-0 right-0 text-center animate-in fade-in slide-in-from-top-1">
                              <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-background px-3 py-1 rounded-full border border-primary/20">Best Value: $0.68 per day</span>
                            </div>
                          )}
                        </div>
                      </RadioGroup>
                    </div>

                    {frequency !== 'one-time' && (
                      <div className="pt-4 flex flex-col items-center gap-4">
                        {isProcessing ? (
                          <div className="flex flex-col items-center gap-4 py-8">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="font-black uppercase tracking-widest text-[10px]">Processing Guardianship...</p>
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
                                handlePaymentSuccess(data);
                              }}
                              className="w-full flex justify-center"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* One-Time Section */}
                <div className="bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-border shadow-xl space-y-8">
                  <div className="flex items-center gap-3 text-secondary">
                     <Waves className="h-6 w-6" />
                     <h2 className="text-2xl font-headline font-black uppercase tracking-tight">Make a Splash</h2>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Support Level</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onClick={() => { setFrequency('one-time'); setAmount('50'); }}
                          className={cn(
                            "h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1",
                            frequency === 'one-time' && amount === '50' ? "border-secondary bg-secondary/10 text-secondary" : "border-border hover:border-secondary/20"
                          )}
                        >
                          <span className="font-headline font-black text-xl">$50</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">The Wellness Check</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custom Support & Designation</Label>
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Input 
                            placeholder="Amount" 
                            type="number"
                            value={amount === '10' || amount === '50' || frequency !== 'one-time' ? '' : amount}
                            onChange={(e) => { setFrequency('one-time'); setAmount(e.target.value); }}
                            className="h-14 rounded-xl border-2 border-border font-headline font-black text-lg pl-8"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black">$</span>
                        </div>
                        <Select value={designation} onValueChange={setDesignation}>
                          <SelectTrigger className="h-14 rounded-xl border-2 border-border bg-background/50 font-black uppercase text-[10px] tracking-widest flex-1">
                            <SelectValue placeholder="Designation" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border text-foreground">
                            <SelectItem value="most-needed">Where it's needed most</SelectItem>
                            <SelectItem value="feed">Flock Feed & Nutrition</SelectItem>
                            <SelectItem value="medical">Medical & Vet Care</SelectItem>
                            <SelectItem value="upgrades">Infrastructure</SelectItem>
                            <SelectItem value="adopt">Adopt a Specific Resident</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {frequency === 'one-time' && (
                      <div className="pt-4 flex flex-col items-center gap-4">
                        <div className="w-full max-w-sm mx-auto">
                          <PayPalButtons 
                            key={`one-time-${amount}`}
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
                                    value: amount || "10"
                                  },
                                  description: `Sanctuary Donation: ${designation}`
                                }]
                              });
                            }}
                            onApprove={async (data, actions) => {
                              setIsProcessing(true);
                              const details = await actions.order?.capture();
                              handlePaymentSuccess(details);
                            }}
                            className="w-full flex justify-center"
                          />
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
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Guardian Benefits</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { 
                        title: "Heritage Trees", 
                        desc: "Explore the full lineage of the sanctuary residents through interactive pedigree charts.", 
                        icon: <TreePine className="h-6 w-6 text-primary" />,
                        color: "primary"
                      },
                      { 
                        title: "The Ledger", 
                        desc: "View our real-time 501(c)(3) spending and see exactly how every dollar is allocated to the flock.", 
                        icon: <Wallet className="h-6 w-6 text-secondary" />,
                        color: "secondary"
                      },
                      { 
                        title: "Early Access", 
                        desc: "See new rescue reveals and 'Ducklopedia' updates before they hit public social media channels.", 
                        icon: <Sparkles className="h-6 w-6 text-[#14F195]" />,
                        color: "[#14F195]"
                      }
                    ].map((benefit, i) => (
                      <Card key={i} className="bg-card border-border rounded-3xl p-6 space-y-4 hover:border-primary/20 transition-all shadow-xl group">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", `bg-${benefit.color}/10`)}>
                          {benefit.icon}
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

                {/* Status Note */}
                <Card className="bg-primary/5 border-2 border-primary/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                   <div className="relative z-10 flex items-start gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                         <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-[10px] font-black uppercase tracking-widest">Instant Guardian Status</h4>
                         <p className="text-xs text-muted-foreground leading-relaxed">
                           Any donation grants official **Guardian Status**. Log in with your donation email to unlock your Member Dashboard instantly.
                         </p>
                      </div>
                   </div>
                </Card>
              </div>
            </div>
          </section>

          {/* FAQ / Impact Section */}
          <section className="py-24 bg-card/20 border-y border-border">
             <div className="container mx-auto px-4 max-w-4xl space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">Impact of Direct Giving</h2>
                  <p className="text-muted-foreground font-medium italic">"100% of proceeds fund food & medical care."</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="p-8 bg-card/60 border border-border rounded-3xl text-center space-y-4 shadow-lg">
                      <div className="flex justify-center text-primary"><Utensils className="h-8 w-8" /></div>
                      <div className="text-3xl font-headline font-black text-primary">$10</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">The Snack Pack</p>
                      <p className="text-xs font-medium leading-relaxed">Covers a week of high-nutrition treats and mealworm snacks for one resident.</p>
                   </div>
                   <div className="p-8 bg-card/60 border-2 border-primary/20 rounded-3xl text-center space-y-4 shadow-lg scale-105">
                      <div className="flex justify-center text-primary"><Coffee className="h-8 w-8" /></div>
                      <div className="text-3xl font-headline font-black text-primary">$25</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Guardian</p>
                      <p className="text-xs font-medium leading-relaxed">Fully sustains one resident's food, water filtration, and maintenance costs.</p>
                   </div>
                   <div className="p-8 bg-card/60 border border-border rounded-3xl text-center space-y-4 shadow-lg">
                      <div className="flex justify-center text-primary"><Stethoscope className="h-8 w-8" /></div>
                      <div className="text-3xl font-headline font-black text-primary">$50</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">The Wellness Check</p>
                      <p className="text-xs font-medium leading-relaxed">Covers a comprehensive basic veterinary wellness exam for a rescue bird.</p>
                   </div>
                </div>
             </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 mt-12">
             <div className="bg-secondary/5 border-2 border-secondary/20 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-6">
                   <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
                     READY TO JOIN THE <span className="text-secondary">FLOCK?</span>
                   </h2>
                   <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                     Already supported us? Sign in to access your unique member benefits and explore the lineage.
                   </p>
                   <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Button size="lg" className="bg-secondary text-secondary-foreground font-black h-16 px-12 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform" asChild>
                         <Link href="/login"><Lock className="mr-3 h-5 w-5" /> MEMBER LOGIN</Link>
                      </Button>
                   </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-secondary/5 blur-[150px] pointer-events-none" />
             </div>
          </section>
        </main>

        <Footer />
      </div>
    </PayPalScriptProvider>
  );
}
