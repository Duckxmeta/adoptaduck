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
  Users, 
  ArrowRight,
  Loader2,
  Tv,
  GraduationCap,
  Globe,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { collection, query, doc, setDoc, serverTimestamp, where, limit } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { handleGoogleRedirectResult, configureAuthPersistence } from '@/firebase/non-blocking-login';

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stapleMerch, setStapleMerch] = useState<any[]>([]);
  const [merchLoading, setMerchLoading] = useState(true);
  
  useEffect(() => {
    setMounted(true);
    async function fetchStaples() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) return;
        const data = await res.json();
        // Homepage Mirror: Ensure ONLY the 3 Staple IDs appear on the homepage
        setStapleMerch(data.filter((m: any) => m.tier === 1).slice(0, 3));
      } catch (e) {
        console.error("Home merch fetch failed");
      } finally {
        setMerchLoading(false);
      }
    }
    fetchStaples();
  }, []);

  const featuredBirdQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), where('isFeatured', '==', true), limit(1));
  }, [firestore]);

  const { data: featuredBirds } = useCollection<Resident>(featuredBirdQuery);

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
                  Join our virtual adoption program and get instant access to the Guardian Dashboard. Dive into every update, photo, and story from our residents like Bandit and Cocoa. Forget the standard pet—adopt a feathered resident as your digital companion.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Formal Education", desc: "K-12 & School Programs", icon: GraduationCap },
                  { title: "Home & Community Learning", desc: "Homeschooling, 4-H, Libraries", icon: Users },
                  { title: "Public Discovery", desc: "Museums, Nature Centers", icon: Globe },
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

        {/* SANCTUARY STAPLES (Curated Merch Mirror) */}
        {stapleMerch.length > 0 && (
          <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">Sanctuary <span className="text-primary">Staples</span></h2>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Official Mission Gear</p>
                </div>
                <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary">
                  <Link href="/support#merch">View All Gear <ArrowRight className="ml-2 h-3 w-3" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {stapleMerch.map(product => (
                  <Card key={product.id} className="bg-card border-border rounded-2xl overflow-hidden group hover:glow-primary transition-all duration-500 cursor-pointer" onClick={() => window.open(product.redirectUrl, '_blank')}>
                    <div className="relative aspect-square">
                      <Image src={product.thumbnailUrl} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button variant="outline" className="border-primary text-primary font-black rounded-full h-12 w-12 p-0">
                          <ExternalLink className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <h4 className="font-headline font-black text-[10px] uppercase tracking-widest line-clamp-1">{product.name}</h4>
                      <div className="flex items-center justify-between">
                        <p className="font-headline font-black text-primary">${Number(product.minPrice).toFixed(2)}</p>
                        <Button className="bg-secondary text-white font-black h-8 px-4 text-[8px] uppercase tracking-widest rounded-lg">BUY</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

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
