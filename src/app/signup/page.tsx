
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bird, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    
    setLoading(true);
    try {
      const userCredential = await initiateEmailSignUp(auth, email, password);
      const user = userCredential.user;

      try {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          my_flock: [], 
          role: 'member', 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        toast({
          title: "Welcome to the Flock!",
          description: "Your sanctuary member profile has been created.",
        });
      } catch (dbError: any) {
        console.error("Firestore Profile Init Failed:", dbError);
        toast({
          title: "Partial Success",
          description: "Account created, but profile setup is pending. Redirecting to dashboard...",
        });
      }

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An error occurred during sign-up.",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle className="text-3xl font-headline font-black uppercase tracking-tight">JOIN THE FLOCK</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Create your Sanctuary Member account today.</CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <form onSubmit={handleSignUp} className="space-y-6">
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
              <Label htmlFor="password">Create Password</Label>
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
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <span className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> CREATE ACCOUNT</span>
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
              Already a member? <Link href="/admin/login" className="text-primary hover:underline">Sign In</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black text-center max-w-xs leading-relaxed">
        100% Secure Sanctuary Registration
      </p>
    </div>
  );
}
