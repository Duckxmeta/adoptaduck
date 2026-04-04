
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Bird, 
  Heart, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Loader2,
  Trophy,
  Zap,
  Radio,
  Tv,
  GraduationCap,
  Globe,
  Home as HomeIcon,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, useAuth, useUser } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, serverTimestamp, where, limit } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { handleGoogleRedirectResult, configureAuthPersistence } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Decent Ducks Sanctuary Home Page.
 * DuckTV Teaser implemented: Moving towards a public-only live feature.
 * Maintains strict content lock on mission and $75/yr pricing.
 */

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const featuredBirdQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), where('isFeatured', '==', true), limit(1));
  }, [firestore]);

  const { data: featuredBirds } = useCollection<Resident>(featuredBirdQuery);
  const featuredDuck = featuredBirds && featuredBirds.length > 0 ? featuredBirds[0] : null;

  const checkRedirect = useCallback(async () => {
    if (!auth || !firestore) return;

    try {
      setIsVerifying(true);
      const result = await handleGoogleRedirectResult(auth);
      
      if (result && result.user) {
        if (!result.user.isAnonymous) {
          const userRef = doc(firestore, 'users', result.user.uid);
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }

        toast({
          title: "Access Verified",
          description: `Welcome back!`,
        });
        
        router.push('/admin'); 
      }
    } catch (error: any) {
      if (error.message?.includes('JSON')) {
        console.warn("Auth redirect state was empty or malformed.");
      } else {
        console.error("Auth Error:", error);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [auth, firestore, router, toast]);

  useEffect(() => {
    if (!auth || !mounted) return;
    configureAuthPersistence(auth);
    checkRedirect();
  }, [auth, mounted, checkRedirect]);

  const domesticImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_8640.jpg?alt=media";
  const wildImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/wildmallards.png?alt=media";

  if (!mounted) return null;

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Entering Sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-in fade-in duration-1000">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden w-full bg-[#1A1A1A]">
          <Image 
            src="https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_4297.jpeg?alt=media&token=6bf819bf-3329-4dea-8fe4-e715d60978c7" 
            alt="Sanctuary Hero" 
            fill 
            priority 
            className="object-cover brightness-50" 
            unoptimized 
          />
          <div className="container mx-auto px-4 relative z-20 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest mb-6 uppercase border border-secondary/50 glow-purple">
              <Sparkles className="h-3.5 w-3.5" />
              Adopt a Duck
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black mb-6 leading-[0.9] tracking-tighter uppercase text-center">
              VIRTUAL <span className="text-primary">SANCTUARY</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium leading-relaxed px-4">
              A modern, transparent sanctuary providing a peaceful, high-quality home for domestic ducks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-primary text-primary-foreground font-black hover:scale-105 transition-transform h-16 w-full sm:w-auto px-12 text-lg rounded-2xl shadow-xl" asChild>
                <Link href="/support#adopt">ADOPT A RESIDENT</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white font-black backdrop-blur-md hover:bg-white/10 h-16 w-full sm:w-auto px-12 text-lg rounded-2xl" asChild>
                <Link href="/flock">MEET THE FLOCK</Link>
              </Button>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
            <div className="flex flex-col items-center gap-2 opacity-50">
              <span className="text-[8px] font-black uppercase tracking-widest">Scroll to Explore</span>
              <div className="w-0.5 h-10 bg-primary/50" />
            </div>
          </div>
        </section>

        {/* MISSION NARRATIVE SECTION */}
        <section className="py-24 bg-card/30 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-20">
              {/* Section 1: The Digital Flock */}
              <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-block p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-2">
                  <Bird className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-tight">
                  The Digital Flock: <span className="text-primary">No Pond Required 🦆</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                  Just landing at the Decent Ducks Sanctuary? There is always room for one more in the pond! Join our virtual adoption program and get instant access to the Guardian Dashboard. Dive into every update, photo, and story from our residents like Bandit and Cocoa. Forget the standard pet—adopt a feathered resident as your digital companion. No coop to build, no grain to buy. Your donation-based adoption provides the 'wings' we need to rescue and rehome even more birds.
                </p>
              </div>

              {/* Section 2: Sponsored Access */}
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-tight text-secondary">
                    Bringing the Sanctuary to You (For Free!)
                  </h3>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Community & Educational Outreach</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Formal Education", desc: "K-12 & School Programs", icon: GraduationCap },
                    { title: "Home & Community Learning", desc: "Homeschooling, 4-H, Libraries", icon: Users },
                    { title: "Public Discovery", desc: "Museums, Youth Centers, Nature Preserves", icon: Globe },
                    { title: "Therapeutic Environments", desc: "Nursing Homes, Memory Care Units", icon: Heart },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-5 p-6 bg-background/50 border border-border rounded-2xl group hover:border-primary/30 transition-colors">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-headline font-black text-sm uppercase tracking-tight">{item.title}</h4>
                        <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-4">
                  <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary">
                    <Link href="/support#community">Learn More About Sponsored Access <ArrowRight className="ml-2 h-3 w-3" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Resident Spotlight */}
        {featuredDuck && (
          <section className="bg-primary/5 border-y border-primary/10 py-24">
            <div className="container mx-auto px-4">
              <Card className="bg-card border-2 border-primary/30 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                  <div className="md:col-span-5 relative aspect-square md:aspect-auto md:h-[450px] overflow-hidden bg-muted flex items-center justify-center">
                    {featuredDuck.primaryImageUrl ? (
                      <Image src={featuredDuck.primaryImageUrl} alt={featuredDuck.name} fill className="object-cover" />
                    ) : (
                      <span className="text-9xl">🦆</span>
                    )}
                  </div>
                  <div className="md:col-span-7 p-8 md:p-12 space-y-6">
                    <div className="space-y-2">
                      <Badge className="bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] px-4 py-1 flex items-center w-fit gap-2">
                        <Trophy className="h-3.5 w-3.5" /> DUCK OF THE MONTH
                      </Badge>
                      <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
                        Meet <span className="text-primary">{featuredDuck.name}</span>
                      </h2>
                    </div>
                    <p className="text-lg md:text-xl font-medium text-foreground/90 italic leading-relaxed">
                      "{featuredDuck.personalityTraits.split('.')[0]}."
                    </p>
                    <div className="flex items-center gap-2 bg-background/50 p-3 rounded-xl border border-primary/10 w-fit">
                      <Zap className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-primary">{featuredDuck.liveStatus || 'Chilling 🌿'}</span>
                    </div>
                    <Button asChild size="lg" className="bg-primary text-primary-foreground font-black h-14 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                      <Link href={`/residents/${featuredDuck.id}`}>LEARN MORE <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Support CTA */}
        <section className="py-24 bg-card/50 border-y border-border">
          <div className="container mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter">Support the <span className="text-primary">Mission</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From emergency rescues to daily layers, your contributions keep the sanctuary running.</p>
            <div className="flex flex-col items-center gap-4">
              <Button asChild size="lg" className="bg-secondary text-secondary-foreground font-black h-16 px-12 text-xl rounded-2xl shadow-xl hover:scale-105 transition-transform">
                <Link href="/support#donate">SUPPORT THE FLOCK <Heart className="ml-2 h-5 w-5 fill-current" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary font-black h-8 px-6 text-xs rounded-xl hover:bg-primary/10">
                <Link href="/our-story">OUR STORY</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* DuckTV: Public Teaser */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-secondary/5 border-2 border-dashed border-secondary/30 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-secondary/5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-20 h-20 bg-secondary/20 rounded-2xl flex items-center justify-center border-2 border-secondary/40 animate-pulse">
                <Tv className="h-10 w-10 text-secondary" />
              </div>
              <div className="relative z-10 space-y-2">
                <h3 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-tighter text-white">DuckTV: Coming Soon 🦆</h3>
                <p className="text-muted-foreground text-lg font-medium max-w-md leading-relaxed">The 24/7 live window into the Decent Ducks Sanctuary.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Educational Section */}
        <section className="py-32 container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-widest">WHY WE EXIST</Badge>
            <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none">Domestic <span className="text-primary">vs.</span> Wildlife</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-background border-2 border-secondary/30 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-square">
                  <Image src={domesticImageUrl} alt="Domestic" fill className="object-cover" />
                </div>
                <CardContent className="p-8 flex flex-col justify-center space-y-4">
                  <h3 className="text-2xl font-headline font-black text-primary">Domestic Ducks</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed font-medium">
                    Bred for human care, they <strong>cannot fly</strong> or survive in the wild. Without a sanctuary, they face certain predation.
                  </p>
                </CardContent>
              </div>
            </Card>

            <Card className="bg-background border-2 border-secondary/30 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-square">
                  <Image src={wildImageUrl} alt="Wild" fill className="object-cover" />
                </div>
                <CardContent className="p-8 flex flex-col justify-center space-y-4">
                  <h3 className="text-2xl font-headline font-black text-secondary">Wildlife Ducks</h3>
                  <p className="text-foreground/80 text-sm leading-relaxed font-medium">
                    Wild Mallards are independent aviators. They need <strong>space to migrate</strong> and thrive without human intervention.
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
