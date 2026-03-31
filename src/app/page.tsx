
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
  Megaphone,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, useAuth, useUser } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, serverTimestamp, where, limit, onSnapshot } from 'firebase/firestore';
import { Resident, BulletinEntry } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { handleGoogleRedirectResult, configureAuthPersistence } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bulletins, setBulletins] = useState<BulletinEntry[]>([]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Bulletins (3 Most Recent)
  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'bulletin'), orderBy('timestamp', 'desc'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BulletinEntry[];
      setBulletins(docs);
    });
    return () => unsubscribe();
  }, [firestore]);

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

  const heroImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_4297.jpeg?alt=media";
  const domesticImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_8640.jpg?alt=media";
  const wildImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/wildmallards.png?alt=media";

  if (!mounted) return null;

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary space-y-4">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Entering Sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-in fade-in duration-1000">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[30000ms] scale-110"
            style={{ backgroundImage: `url('${heroImageUrl}')` }}
          />
          
          <div className="container mx-auto px-4 relative z-20 text-center">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest mb-6 uppercase border border-secondary/50 glow-purple">
              <Sparkles className="h-3.5 w-3.5" />
              Virtual Sanctuary
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-black mb-6 leading-[0.9] tracking-tighter uppercase text-center">
              VIRTUAL <span className="text-primary">SANCTUARY</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium leading-relaxed px-4">
              A modern, high-transparency home for domestic ducks. Providing a quiet, high-quality home for our flock.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-primary text-primary-foreground font-black hover:scale-105 transition-transform h-16 w-full sm:w-auto px-12 text-lg rounded-2xl shadow-2xl" asChild>
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

        {/* Latest from the Sanctuary - Bulletin Grid */}
        {bulletins.length > 0 && (
          <section className="py-24 container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-border flex-1" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary shrink-0 flex items-center gap-2">
                <Megaphone className="h-4 w-4" /> Latest Updates
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {bulletins.map((b) => (
                <Card key={b.id} className="bg-card border-2 border-border/50 rounded-3xl overflow-hidden shadow-xl hover:border-primary/30 transition-all group flex flex-col h-full">
                  {b.imageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden border-b border-border">
                      <Image src={b.imageUrl} alt={b.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-1">
                      <h3 className="text-lg font-headline font-black text-primary uppercase leading-tight line-clamp-2">{b.title}</h3>
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {b.timestamp?.toDate ? formatDistanceToNow(b.timestamp.toDate()) : 'Recent'} ago
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-medium">
                      {b.content}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

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
                    <Button asChild size="lg" className="bg-primary text-primary-foreground font-black h-14 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                      <Link href={`/residents/${featuredDuck.id}`}>LEARN MORE <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Support Section */}
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
