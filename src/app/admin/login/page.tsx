"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulating Firebase Auth login
    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Link href="/" className="mb-8 flex items-center gap-2 text-primary hover:underline font-bold">
        <ArrowLeft className="h-4 w-4" /> BACK TO SANCTUARY
      </Link>
      
      <Card className="w-full max-w-md bg-card border-none rounded-2xl glow-purple">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-black uppercase">Admin Access</CardTitle>
          <CardDescription>Enter your credentials to manage the sanctuary residents.</CardDescription>
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
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold h-12" disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest font-bold">
        Unauthorized access is strictly monitored
      </p>
    </div>
  );
}