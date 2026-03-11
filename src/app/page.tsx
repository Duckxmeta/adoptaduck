
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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, useAuth, useUser } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Resident } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { initiateGoogleSignIn, handleGoogleRedirectResult, configureAuthPersistence } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ADMIN_EMAILS = ['decentducksorg@gmail.com', 'flowmarket1@gmail.com'];

export default function Home() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<{code: string, message: string} | null>(null);
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";
  
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);

  useEffect(() => {
    if (!auth || !firestore) return;

    // Configure persistence for mobile stability
    configureAuthPersistence(auth);

    // Check for redirect result on mount
    const checkRedirect = async () => {
      try {
        setIsVerifying(true);
        const result = await handleGoogleRedirectResult(auth);
        
        if (result && result.user) {
          const userRef = doc(firestore, 'users', result.user.uid);
          
          try {
            await setDoc(userRef, {
              uid: result.user.uid,
              email: result.user.email,
              my_flock: [], 
              role: 'member',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });

            toast({
              title: "Account Verified",
              description: `Welcome to the sanctuary, ${result.user.displayName || 'Friend'}.`,
            });
            
            // Smart Redirect
            if (ADMIN_EMAILS.includes(result.user.email || '')) {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          } catch (dbError: any) {
            console.error("Profile Setup Error:", dbError);
            setAuthError({ 
              code: dbError.code || 'firestore/permission-denied', 
              message: "Auth succeeded but profile creation failed." 
            });
          }
        }
      } catch (error: any) {
        console.error("Auth Redirect Error:", error);
        setAuthError({ 
          code: error.code, 
          message: error.message 
        });
        
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-closure-redirect') {
           toast({
            variant: "destructive",
            title: "Verification Failed",
            description: `Error: ${error.code}. Please try again or use another method.`,
          });
        }
      } finally {
        setIsVerifying(false);
      }
    };

    checkRedirect();
  }, [auth, firestore, toast, router]);
  
  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setAuthError(null);
    try {
      await initiateGoogleSignIn(auth);
    } catch (error: any) {
      setAuthError({ code: error.code, message: error.message });
      toast({
        variant: "destructive",
        title: "Sign-in Error",
        description: `Could not initiate: ${error.code}`,
      });
    }
  };

  const heroImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_4297.jpeg?alt=media";
  const domesticImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_8640.jpg?alt=media";
  const wildImageUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/wildmallards.png?alt=media";

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary space-y-4">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-xs">Entering the Sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1">
        {authError && (
          <div className="container mx-auto px-4 pt-8">
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error: {authError.code}</AlertTitle>
              <AlertDescription>
                {authError.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <section className="bg-primary/5 border-b border-primary/20 py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">
              <ShieldCheck className="h-4 w-4" /> VIRTUAL SANCTUARY MISSION
            </div>
            <h2 className="text-7xl md:text-9xl font-headline font-black text-primary tracking-tighter glow-primary animate-subtle-pulse leading-none">
              {birds?.length || 0}
            </h2>
            <p className="text-xl md:text-2xl font-headline font-bold uppercase tracking-widest text-foreground">
              Ducks in Our Care
            </p>
            
            {!user && (
              <button 
                onClick={handleGoogleSignIn}
                className="block mx-auto text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors mt-8 border-b border-primary/20 pb-1"
              >
                Join the community to see daily sanctuary progress and member-only stats.
              </button>
            )}
          </div>
        </section>

        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
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
              A real-time window into our rescue mission. Track our residents, monitor their health, and see the daily impact of your support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary text-primary-foreground font-black hover:scale-105 transition-transform h-14 px-10 text-lg rounded-xl shadow-2xl" asChild>
                <Link href="/flock">MEET THE RESIDENTS</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary font-black hover:bg-primary/10 h-14 px-10 text-lg rounded-xl" asChild>
                <a href={donateUrl} target="_blank" rel="noopener noreferrer">SUPPORT THE MISSION</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-32 bg-card/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="text-primary border-primary px-4 py-1 font-black text-[10px] tracking-widest">WHY WE EXIST</Badge>
              <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none text-center">Domestic <span className="text-primary">vs.</span> Wildlife</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                Domestic ducks like Pekins or Rouens cannot fly or survive in the wild. Our sanctuary exists to save these abandoned pets.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-background border-2 border-secondary/30 rounded-3xl overflow-hidden group hover:glow-purple transition-all duration-500 shadow-2xl shadow-secondary/10">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-square">
                    <Image 
                      src={domesticImageUrl} 
                      alt="Domestic Duck" 
                      fill 
                      className="object-cover transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 right-4">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Domestic: Reliant on Human Care</p>
                    </div>
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center space-y-4">
                    <h3 className="text-2xl font-headline font-black text-primary">Domestic Ducks</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Breeds like Pekins are selectively bred for human care. They <strong>cannot fly</strong> or survive in the wild. They face certain predation without a safe sanctuary home.
                    </p>
                  </CardContent>
                </div>
              </Card>

              <Card className="bg-background border-2 border-secondary/30 rounded-3xl overflow-hidden group hover:glow-purple transition-all duration-500 shadow-2xl shadow-secondary/10">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-square">
                    <Image 
                      src={wildImageUrl} 
                      alt="Wild Mallard Duck - Natural Survivor" 
                      fill 
                      className="object-cover transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 right-4">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Wild: Natural Survivors</p>
                    </div>
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center space-y-4">
                    <h3 className="text-2xl font-headline font-black text-secondary">Wildlife Ducks</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Wild Mallards are self-sufficient aviators. They need <strong>nature and space</strong> to migrate and thrive independently. They belong in the wild, not as pets.
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </section>

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
                  <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none text-center">
                    Join the <span className="text-secondary">Flock</span>
                  </h2>
                  <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                    Get real-time updates from the sanctuary, explore the heritage of our residents, and follow every rescue story.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto py-8">
                  <div className="space-y-2">
                    <p className="font-headline font-black text-primary uppercase text-xs">Dashboard</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Live Sanctuary Dashboard</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-headline font-black text-primary uppercase text-xs">Heritage</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Interactive Family Trees</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-headline font-black text-primary uppercase text-xs">Logs</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Daily Care Logs & Updates</p>
                  </div>
                </div>

                <Button 
                  asChild
                  size="lg" 
                  className="bg-primary text-primary-foreground font-black h-16 px-12 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
                >
                  <Link href="/login"><Users className="mr-3 h-5 w-5" /> JOIN THE SANCTUARY</Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
