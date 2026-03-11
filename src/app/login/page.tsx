
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bird, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';

const ADMIN_EMAILS = ['decentducksorg@gmail.com', 'flowmarket1@gmail.com'];

export default function MemberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) {
      if (ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, isUserLoading, router]);

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

  const handleGoogleLogin = async () => {
    if (!auth) return;
    try {
      await initiateGoogleSignIn(auth);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-in Failed",
        description: error.message,
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Link href="/" className="mb-8 flex items-center gap-2 text-primary hover:underline font-bold text-xs tracking-widest uppercase">
        <ArrowLeft className="h-4 w-4" /> BACK TO SANCTUARY
      </Link>
      
      <Card className="w-full max-w-md bg-card border-none rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
        <CardHeader className="text-center space-y-2 pt-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Bird className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tight">MEMBER LOGIN</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Access your dashboard to follow the flock and view the lineage.</CardDescription>
        </CardHeader>
        <CardContent className="pb-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
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
              <Label htmlFor="password">Password</Label>
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 rounded-xl border-border font-black text-xs tracking-widest"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            SIGN IN WITH GOOGLE
          </Button>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
              New to the sanctuary? <Link href="/signup" className="text-primary hover:underline">Create Account</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
