
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ResidentCard } from '@/components/residents/ResidentCard';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Bird, 
  Egg, 
  Heart, 
  Crown, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  Users, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, useAuth, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Resident, SanctuaryStatistic } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { cn } from '@/lib/utils';

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";
  
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  
  // Calculate Total Eggs Rescued from all residents in real-time
  const totalEggsRescued = birds?.reduce((sum, bird) => sum + (bird.eggCounter || 0), 0) || 0;

  // Identify Top Producer (Highest current egg counter)
  const topProducer = birds && birds.length > 0 
    ? [...birds].filter(b => b.sex === 'female').sort((a, b) => (b.eggCounter || 0) - (a.eggCounter || 0))[0] 
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1">
        {/* Sanctuary Impact Ticker */}
        <section className="bg-primary/5 border-b border-primary/20 py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">
              <ShieldCheck className="h-4 w-4" /> SANCTUARY MISSION
            </div>
            <h2 className="text-6xl md:text-8xl font-headline font-black text-primary tracking-tighter glow-primary animate-subtle-pulse leading-none">
              {birds?.length || 0}
            </h2>
            <p className="text-xl md:text-2xl font-headline font-bold uppercase tracking-widest text-foreground">
              Ducks in Our Care
            </p>
            
            {!user ? (
              <button 
                onClick={() => initiateGoogleSignIn(auth!)}
                className="block mx-auto text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors mt-6 border-b border-primary/20 pb-1"
              >
                Sign up for free to see our daily sanctuary progress and member-only stats.
              </button>
            ) : (
              <div className="pt-8 mt-8 border-t border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-xs mx-auto">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">MEMBER ACCESS: DAILY IMPACT</p>
                 <div className="flex items-center justify-center gap-3">
                    <Egg className="h-5 w-5 text-primary" />
                    <p className="text-4xl font-headline font-black text-foreground">
                      {totalEggsRescued.toLocaleString()}
                    </p>
                 </div>
                 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Total Eggs Saved to Date</p>
              </div>
            )}
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full" />
        </section>

        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
            style={{ backgroundImage: `url('https://picsum.photos/seed/duckhero/1920/1080')` }}
            data-ai-hint="bird sanctuary"
          />
          
          <div className="container mx-auto px-4 relative z-20 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest mb-6 uppercase border border-secondary/50 glow-purple shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              Dedicated Bird Sanctuary
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black mb-6 leading-[0.9] tracking-tighter">
              DECENT <span className="text-primary">DUCKS</span><br />
              SANCTUARY
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium">
              A haven for feathered friends. Meet our residents and support their journey through direct sanctuary donation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground font-black hover:scale-105 transition-transform h-14 px-10 text-lg rounded-xl shadow-2xl" asChild>
                <Link href="#residents">MEET THE RESIDENTS</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary font-black hover:bg-primary/10 h-14 px-10 text-lg rounded-xl" asChild>
                <a href={donateUrl} target="_blank" rel="noopener noreferrer">DONATE TO MISSION</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Educational Section: Domestic vs. Wildlife */}
        <section className="py-32 bg-card/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-widest">WHY WE EXIST</Badge>
              <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none">Domestic <span className="text-primary">vs.</span> Wildlife</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                Understanding the difference is the first step in protecting these abandoned creatures.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Domestic Ducks */}
              <Card className="bg-background border-border rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-500 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-square">
                    <Image src="https://picsum.photos/seed/domestic/600/600" alt="Domestic Duck" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center space-y-4">
                    <h3 className="text-2xl font-headline font-black text-primary">Domestic Ducks</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Breeds like Pekins or Rouens are selectively bred for human care. They <strong>cannot fly</strong> or survive in the wild. When abandoned at ponds, they face certain starvation or predation.
                    </p>
                    <div className="pt-4 border-t border-border">
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest">The Reality</p>
                      <p className="text-xs italic text-muted-foreground">Abandoned pets needing permanent human guardianship.</p>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Wildlife Ducks */}
              <Card className="bg-background border-border rounded-3xl overflow-hidden group hover:border-secondary/50 transition-all duration-500 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-square">
                    <Image src="https://picsum.photos/seed/wildlife/600/600" alt="Wild Mallard" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center space-y-4">
                    <h3 className="text-2xl font-headline font-black text-secondary">Wildlife Ducks</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Wild Mallards and native species are self-sufficient aviators. They need <strong>nature and space</strong> to migrate and thrive independently. They belong in the wild, not in sanctuaries.
                    </p>
                    <div className="pt-4 border-t border-border">
                      <p className="text-[10px] font-black uppercase text-secondary tracking-widest">The Balance</p>
                      <p className="text-xs italic text-muted-foreground">Wild beings that require conservation and respect, not rescue.</p>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Viewer CTA Section */}
        {!user && (
          <section className="py-24 bg-secondary/5 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-5xl mx-auto bg-card border-2 border-secondary/20 rounded-[3rem] p-10 md:p-20 text-center space-y-8 shadow-2xl">
                <div className="flex justify-center">
                   <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                     <Users className="h-8 w-8 text-secondary" />
                   </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none">
                    Become a <span className="text-secondary">Sanctuary Viewer</span> – It’s Free!
                  </h2>
                  <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                    Join our community to unlock real-time access to the sanctuary dashboard, detailed heritage trees, and the live egg ticker.
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                   <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/70">
                     <CheckCircle2 className="h-4 w-4 text-secondary" /> Real-time Dashboard
                   </div>
                   <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/70">
                     <CheckCircle2 className="h-4 w-4 text-secondary" /> Heritage Lineage
                   </div>
                   <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/70">
                     <CheckCircle2 className="h-4 w-4 text-secondary" /> Priority Updates
                   </div>
                </div>

                <Button 
                  onClick={() => initiateGoogleSignIn(auth!)}
                  size="lg" 
                  className="bg-primary text-primary-foreground font-black h-16 px-12 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  <Users className="mr-3 h-5 w-5" /> SIGN UP WITH GOOGLE
                </Button>
                
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Secure access for sanctuary supporters.
                </p>
              </div>
            </div>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          </section>
        )}

        {/* Daily Production Widget */}
        {topProducer && (
          <section className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Card className="bg-card border-2 border-primary/30 rounded-[2rem] overflow-hidden shadow-2xl relative">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative aspect-square md:aspect-auto h-full min-h-[300px]">
                      <Image 
                        src={topProducer.primaryImageUrl} 
                        alt={topProducer.name} 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card hidden md:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent md:hidden" />
                    </div>
                    <CardContent className="p-10 flex flex-col justify-center items-start space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-xs">
                          <TrendingUp className="h-4 w-4" /> DAILY PRODUCTION LEADER
                        </div>
                        <h2 className="text-5xl font-headline font-black tracking-tighter leading-none">{topProducer.name}</h2>
                      </div>
                      
                      {user && (
                        <Badge className="bg-primary text-primary-foreground font-black px-6 py-2.5 rounded-xl uppercase tracking-widest text-xs animate-subtle-pulse shadow-[0_0_20px_rgba(255,215,0,0.4)] border-none">
                          <Crown className="h-4 w-4 mr-2" /> Top Producer of the Day!
                        </Badge>
                      )}
                      
                      <p className="text-muted-foreground text-lg leading-relaxed italic">
                        "{topProducer.personalityTraits.split(',')[0]} and highly protective! {topProducer.name} has been instrumental in today's sanctuary success."
                      </p>
                      
                      {user ? (
                        <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-border w-full">
                           <div className="p-3 bg-primary/10 rounded-xl">
                              <Egg className="h-6 w-6 text-primary" />
                           </div>
                           <div>
                              <p className="text-2xl font-headline font-black">{topProducer.eggCounter}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Lifetime Rescues</p>
                           </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-dashed border-primary/20 w-full opacity-60">
                           <Lock className="h-5 w-5 text-muted-foreground" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Production stats restricted to members</p>
                        </div>
                      )}
                      
                      <Button variant="link" className="p-0 text-primary font-black uppercase tracking-widest text-xs group" asChild>
                        <Link href={`/residents/${topProducer.id}`}>
                          VIEW FULL PROFILE <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Resident Grid */}
        <section id="residents" className="py-32 container mx-auto px-4">
          <div className="mb-20 text-center">
            <h2 className="text-5xl font-headline font-black mb-4 tracking-tighter">OUR RESIDENTS</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto" />
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto text-lg font-medium">
              Every resident has a name, a unique personality, and a place here. Click to explore their stories.
            </p>
          </div>

          {birdsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-card rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {birds?.map((bird) => (
                <ResidentCard key={bird.id} resident={bird} />
              ))}
              {(!birds || birds.length === 0) && (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-3xl">
                  <Bird className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest">No residents found in sanctuary database.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Support Our Mission: Donation Perks */}
        <section className="py-32 bg-card border-y border-border relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest border-none">100% DONOR FUNDED</Badge>
                  <h2 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-none">Support Our <br/><span className="text-primary">Mission</span></h2>
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                    As a non-profit initiative, we rely entirely on the generosity of our community. Your contribution ensures every resident has the nutrition, shelter, and medical care they deserve.
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="font-headline font-black text-xs text-primary uppercase tracking-[0.4em]">Supporter Perks</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 bg-background/50 p-5 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform"><CheckCircle2 className="h-5 w-5" /></div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">Digital Adoption Certificate</p>
                        <p className="text-xs text-muted-foreground">Receive a personalized certificate with every donation to commemorate your support.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 bg-background/50 p-5 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform"><Egg className="h-5 w-5" /></div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">Name an Egg</p>
                        <p className="text-xs text-muted-foreground">Donors of $20+ get to name a rescued egg in our real-time tracking system.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 bg-background/50 p-5 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform"><Sparkles className="h-5 w-5" /></div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">Exclusive Updates</p>
                        <p className="text-xs text-muted-foreground">Get early access to new rescue stories, gallery updates, and health milestones.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <Button size="lg" className="bg-primary text-primary-foreground font-black h-16 px-16 text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all w-full md:w-auto" asChild>
                  <a href={donateUrl} target="_blank" rel="noopener noreferrer">DONATE VIA PAYPAL</a>
                </Button>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full" />
                <Card className="relative overflow-hidden border-2 border-primary/20 rounded-[3rem] shadow-2xl bg-card/50 backdrop-blur-sm">
                   <div className="relative aspect-[3/4] group">
                      <Image 
                        src="https://picsum.photos/seed/sanctuary-life/800/1000" 
                        alt="Sanctuary Life" 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-10 left-10 right-10">
                         <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                           <Heart className="h-4 w-4 fill-primary" /> LATEST RESCUE
                         </div>
                         <h4 className="text-4xl font-headline font-black text-white uppercase tracking-tighter">Your Help, Their Home.</h4>
                      </div>
                   </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
