"use client";

import { useEffect, useState } from 'react';
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
  Zap
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

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const featuredBirdQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), where('isFeatured', '==', true), limit(1));
  }, [firestore]);

  const { data: birds } = useCollection<Resident>(birdsQuery);
  const { data: featuredBirds } = useCollection<Resident>(featuredBirdQuery);

  const featuredDuck = featuredBirds && featuredBirds.length > 0 ? featuredBirds[0] : null;

  useEffect(() => {
    if (!auth || !firestore || !mounted) return;

    configureAuthPersistence(auth);

    const checkRedirect = async () => {
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
            description: `Welcome to the sanctuary, ${result.user.displayName || 'Friend'}.`,
          });
          
          router.push('/admin'); 
        }
      } catch (error: any) {
        console.error("Auth Error:", error);
      } finally {
        setIsVerifying(false);
      }
    };

    checkRedirect();
  }, [auth, firestore, toast, router, mounted]);

  const heroImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_4297.jpeg?alt=media";
  const domesticImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_8640.jpg?alt=media";
  const wildImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/wildmallards.png?alt=media";

  if (!mounted) return null;

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary space-y-4">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Verifying Sanctuary Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-in fade-in duration-1000">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] hover:scale-110"
            style={{ backgroundImage: `url('${heroImageUrl}')` }}
          />
          
          <div className="container mx-auto px-4 relative z-20 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest mb-6 uppercase border border-secondary/50 glow-purple shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              Virtual Sanctuary
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black mb-6 leading-[0.9] tracking-tighter text-foreground uppercase text-center">
              VIRTUAL <span className="text-primary">SANCTUARY</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Providing a quiet, high-quality home for our flock. We prioritize stress-free environments and dedicated daily care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="border-primary text-primary font-black hover:bg-primary/10 h-14 px-10 text-lg rounded-xl" asChild>
                <Link href="/flock">VISIT THE FLOCK</Link>
              </Button>
              <Button size="lg" className="bg-primary text-primary-foreground font-black hover:scale-105 transition-transform h-14 px-10 text-lg rounded-xl shadow-2xl" asChild>
                <Link href="/login">MEMBER DASHBOARD</Link>
              </Button>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-20">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-white">
                Residents: <span className="text-primary text-sm ml-1">{birds?.length || 0}</span> 
              </p>
            </div>
          </div>
        </section>

        {/* Featured Resident Spotlight */}
        {featuredDuck && (
          <section className="bg-primary/5 border-y border-primary/10 py-24 relative overflow-hidden">
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
                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="bg-primary text-primary-foreground font-black h-14 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                        <Link href="/flock">LEARN MORE <ArrowRight className="h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Educational Section */}
        <section className="py-32 bg-card/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-widest">WHY WE EXIST</Badge>
              <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none">Domestic <span className="text-primary">vs.</span> Wildlife</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-background border-2 border-secondary/30 rounded-3xl overflow-hidden group hover:glow-purple transition-all duration-500 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-square">
                    <Image src={domesticImageUrl} alt="Domestic" fill className="object-cover" />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center space-y-4">
                    <h3 className="text-2xl font-headline font-black text-primary">Domestic Ducks</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Breeds like Pekins are bred for human care. They <strong>cannot fly</strong> or survive in the wild. They face certain predation without a safe sanctuary home.
                    </p>
                  </CardContent>
                </div>
              </Card>

              <Card className="bg-background border-2 border-secondary/30 rounded-3xl overflow-hidden group hover:glow-purple transition-all duration-500 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-square">
                    <Image src={wildImageUrl} alt="Wild" fill className="object-cover" />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center space-y-4">
                    <h3 className="text-2xl font-headline font-black text-secondary">Wildlife Ducks</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Wild Mallards are self-sufficient aviators. They need <strong>nature and space</strong> to migrate and thrive independently. They belong in the wild.
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {mounted && !user && (
          <section className="py-24 bg-secondary/5 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
              <div className="max-w-5xl mx-auto bg-card border-2 border-secondary/20 rounded-[3rem] p-10 md:p-20 shadow-2xl">
                <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none">Join the <span className="text-secondary">Flock</span></h2>
                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mt-4">Get real-time updates from the sanctuary and follow every rescue story.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground font-black h-16 px-12 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
                    <Link href="/signup">CREATE ACCOUNT</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-secondary text-secondary font-black h-16 px-12 text-lg rounded-2xl hover:bg-secondary/10">
                    <Link href="/login">MEMBER LOGIN</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
