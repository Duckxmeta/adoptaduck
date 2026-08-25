
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bird, ArrowLeft, Loader2, Sparkles, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initiateGoogleSignIn, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { UserProfile } from '@/lib/types';

const ADMIN_EMAILS = ['decentducksorg@gmail.com', 'flowmarket1@gmail.com'];

export default function MemberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && !isUserLoading && mounted && userProfile) {
      const isAdmin = ADMIN_EMAILS.includes(user.email || '');
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, isUserLoading, mounted, router, userProfile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "Entering the sanctuary...",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!auth) return;
    setLoading(true);
    try {
      initiateGoogleSignIn(auth);
    } catch (error: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Google Sign-in Failed",
        description: error.message,
      });
    }
  };

  const handleGuestLogin = () => {
    if (!auth) return;
    setLoading(true);
    try {
      initiateAnonymousSignIn(auth);
      toast({
        title: "Guest Access Granted",
        description: "Entering the sanctuary pulse...",
      });
    } catch (error: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Guest Access Failed",
        description: error.message,
      });
    }
  };

  if (!mounted || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background selection:bg-primary selection:text-primary-foreground animate-in fade-in duration-700">
      <Link href="/" className="mb-8 flex items-center gap-2 text-primary hover:underline font-bold text-[10px] tracking-[0.3em] uppercase">
        <ArrowLeft className="h-3 w-3" /> BACK TO SANCTUARY
      </Link>
      
      <Card className="w-full max-w-md bg-card border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        <CardHeader className="text-center space-y-2 pt-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Bird className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-headline font-black uppercase tracking-tight">MEMBER LOGIN</h1>
          <CardDescription className="text-muted-foreground font-medium">Access your dashboard to follow the flock.</CardDescription>
        </CardHeader>
        <CardContent className="pb-10 space-y-6">
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-xl border-border font-black text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-primary/5 transition-all"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              SIGN IN WITH GOOGLE
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-12 rounded-xl text-muted-foreground font-black text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-muted/5 transition-all"
              onClick={handleGuestLogin}
              disabled={loading}
            >
              <UserCircle className="h-4 w-4" /> BROWSE AS GUEST
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-card px-4 text-muted-foreground">Or Email Access</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border h-12 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" id="password-label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border h-12 rounded-xl"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-black h-14 text-lg rounded-xl shadow-lg hover:scale-[1.02] transition-transform" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ENTER THE SANCTUARY'}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
              New to the sanctuary? <Link href="/signup" className="text-primary hover:underline">Create Account</Link>
            </p>
          </div>
        </CardContent>
     </Card>
    </main>
  );
}
