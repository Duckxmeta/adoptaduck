"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Bird, 
  Heart, 
  Users, 
  ArrowRight,
  Loader2,
  Tv,
  GraduationCap,
  Globe,
  ShoppingBag,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { handleGoogleRedirectResult, configureAuthPersistence } from '@/firebase/non-blocking-login';
import { FeaturedResident } from '@/components/home/FeaturedResident';

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
        router.push('/admin'); 
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
    } finally {
      setIsVerifying(false);
    }
  }, [auth, firestore, router]);

  useEffect(() => {
    if (!auth || !mounted) return;
    configureAuthPersistence(auth);
    checkRedirect();
  }, [auth, mounted, checkRedirect]);

  const domesticImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_8640.jpg?alt=media";
  const wildImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/wildmallards.png?alt=media";
  const merchSpotlightUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/QuackMerch.jpg?alt=media";

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
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden w-full bg-[#1A1A1A]">
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
              Adopt a Friend
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black mb-6 leading-[0.9] tracking-tighter uppercase text-center">
              VIRTUAL <span className="text-primary">SANCTUARY</span>
            </h1>
            <div className="max-w-3xl mx-auto mb-10 space-y-4">
              <p className="text-xl md:text-2xl text-white font-bold uppercase tracking-tight">
                A modern, transparent, and stress-free sanctuary for ducks and animals alike.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed px-4">
                Providing a peaceful, high-quality home where every creature deserves a safe spot to chill and thrive.
              </p>
            </div>
            
            {/* CHOICE ARCHITECTURE: TIERED HERO CTA GRID */}
            <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Button size="lg" className="bg-primary text-primary-foreground font-black hover:scale-105 transition-transform h-16 w-full text-lg rounded-2xl shadow-xl uppercase tracking-tight" asChild>
                  <Link href="/support">GENERAL SUPPORT</Link>
                </Button>
                <Button size="lg" className="bg-primary text-primary-foreground font-black hover:scale-105 transition-transform h-16 w-full text-lg rounded-2xl shadow-xl uppercase tracking-tight" asChild>
                  <Link href="/adopt">ADOPT A FRIEND</Link>
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button variant="destructive" size="sm" className="font-black hover:scale-105 transition-transform h-10 px-6 text-[10px] tracking-widest uppercase rounded-xl shadow-lg flex items-center gap-2" asChild>
                  <Link href="/found-a-duck"><AlertTriangle className="h-3.5 w-3.5" /> I FOUND A DUCK</Link>
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white/80 font-black hover:bg-white/10 hover:text-white h-10 px-8 text-[10px] tracking-widest uppercase rounded-xl" asChild>
                  <Link href="/our-story">OUR STORY</Link>
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white/80 font-black hover:bg-white/10 hover:text-white h-10 px-8 text-[10px] tracking-widest uppercase rounded-xl" asChild>
                  <Link href="/adopt">MEET THE RESIDENTS</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* MISSION NARRATIVE SECTION */}
        <section className="py-24 bg-card/30 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-20">
              <div className="text-center space-y-8">
                <div className="inline-block p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-2">
                  <Bird className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-tight">
                  The Digital Flock: <span className="text-primary">No Pond Required 🦆</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                  Join our virtual adoption program and get instant access to the Guardian Dashboard. Dive into every update, photo, and story from our residents like Bandit and Moxie. Forget the standard pet—adopt a feathered resident as your digital companion.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Formal Education", desc: "K-12 & School Programs", icon: GraduationCap },
                  { title: "Home & Community Learning", desc: "Homeschooling, 4-H, Libraries", icon: Users },
                  { title: "Public Discovery", desc: "Museums, Youth Centers, Nature Preserves", icon: Globe },
                  { title: "Therapeutic Environments", desc: "Nursing Homes, Memory Care", icon: Heart },
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
            </div>
          </div>
        </section>

        {/* RESIDENT OF THE MONTH SPOTLIGHT */}
        <section className="py-24 bg-background border-b border-border">
          <div className="container mx-auto px-4 flex flex-col items-center gap-12">
            <FeaturedResident />
            <Button asChild variant="outline" size="lg" className="border-primary text-primary font-black h-16 px-10 rounded-2xl hover:bg-primary/10 transition-transform hover:scale-105 shadow-xl uppercase text-xs tracking-widest">
              <Link href="/adopt">Meet the Rest of the Residents <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* SANCTUARY GEAR - QUACK MERCH SPOTLIGHT */}
        <section className="py-24 bg-card/20 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">Sanctuary <span className="text-primary">Gear</span></h2>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Official Mission Shop</p>
              </div>
              <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary">
                <Link href="/support#merch">View Spotlight <ArrowRight className="ml-2 h-3 w-3" /></Link>
              </Button>
            </div>
            
            <div className="max-w-5xl mx-auto space-y-4">
              <Card className="bg-card border-4 border-primary/30 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                <div className="relative aspect-video w-full">
                  <Image 
                    src={merchSpotlightUrl} 
                    alt="Quack Merch - JustDuckit" 
                    fill 
                    className="object-cover"
                  />
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
          </div>
        </section>

        {/* DuckTV: Public Teaser */}
        <section className="py-16 bg-card/50 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-secondary/5 border-2 border-dashed border-secondary/30 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left shadow-2xl relative overflow-hidden group">
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
        <section className="py-32 container mx-auto px-4 border-b border-border">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        {/* Partners of the Sanctuary */}
        <section className="py-24 container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">OUR SUPPORTIVE ECOSYSTEM</h3>
            <h2 className="text-3xl font-headline font-black uppercase tracking-tight">Partners of the Sanctuary</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            <Link href="/partners" className="group">
              <div className="flex flex-col items-center gap-3 transition-all duration-300 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">
                <Zap className="h-12 w-12 text-secondary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Solana Strays</span>
              </div>
            </Link>
            <Link href="/partners" className="group">
              <div className="flex flex-col items-center gap-3 transition-all duration-300 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">
                <Bird className="h-12 w-12 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Quakk</span>
              </div>
            </Link>
            <Link href="/partners" className="group">
              <div className="flex flex-col items-center gap-3 transition-all duration-300 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">
                <Globe className="h-12 w-12 text-[#14F195]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">TN Waterfowl Collective</span>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
