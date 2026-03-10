"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAIL = 'flowmarket1@gmail.com';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) {
      if (user.email === ADMIN_EMAIL) {
        router.push('/admin');
      } else if (auth) {
        signOut(auth);
      }
    }
  }, [user, isUserLoading, router, auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This account is not authorized to manage the sanctuary.",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Access Granted",
        description: "Welcome back, Manager.",
      });
      router.push('/admin');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast({
          variant: "destructive",
          title: "Setup Required",
          description: "Email/Password sign-in is not enabled in the Firebase Console.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid credentials or insufficient permissions.",
        });
      }
    } finally {
      setLoading(false);
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
      
      <Card className="w-full max-w-md bg-card border-none rounded-2xl glow-purple">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-black uppercase">Manager Access</CardTitle>
          <CardDescription>Enter secure credentials to manage residents.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Sanctuary Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@decentducks.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-secondary/20 h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Key</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-secondary/20 h-12"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-black h-12 text-lg rounded-xl shadow-lg" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ACCESS DASHBOARD'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black text-center max-w-xs leading-relaxed">
        Restricted to authorized Sanctuary Manager: <br/> {ADMIN_EMAIL}
      </p>
    </div>
  );
}
