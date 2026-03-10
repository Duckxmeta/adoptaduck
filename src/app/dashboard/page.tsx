
"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, limit } from 'firebase/firestore';
import { Resident, DailyStatus, HealthLogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Bird, 
  Egg, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  Stethoscope,
  PartyPopper
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function MemberDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  // Query for birds adopted by the user
  const flockQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return query(collection(firestore, 'birds'), where('adopterEmail', '==', user.email));
  }, [firestore, user?.email]);

  // Global daily status
  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore, user]);

  const { data: myFlock, isLoading: flockLoading } = useCollection<Resident>(flockQuery);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  const calculateProgress = () => {
    if (!dailyStatus) return 0;
    const tasks = ['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'];
    const completed = tasks.filter(t => !!(dailyStatus as any)[t]).length;
    return (completed / tasks.length) * 100;
  };

  if (isUserLoading || flockLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 space-y-16">
        {/* Welcome Header */}
        <section className="space-y-2">
           <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase">
             WELCOME BACK, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'MEMBER'}</span>
           </h1>
           <p className="text-muted-foreground text-lg font-medium tracking-tight">Your personal sanctuary portal and adopted flock updates.</p>
        </section>

        {/* Your Adopted Residents Section */}
        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                <Bird className="h-4 w-4" /> YOUR ADOPTED RESIDENTS
              </h2>
           </div>

           {myFlock && myFlock.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {myFlock.map((bird) => (
                 <ResidentDashboardCard key={bird.id} bird={bird} dailyStatusProgress={calculateProgress()} />
               ))}
             </div>
           ) : (
             <Card className="bg-card/30 border-2 border-dashed border-border rounded-3xl p-12 text-center">
                <CardContent className="space-y-6">
                   <div className="mx-auto w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center">
                      <Heart className="h-10 w-10 text-muted-foreground opacity-50" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-headline font-black uppercase">You haven't adopted a resident yet!</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">Your support directly funds life-saving care. Find a resident to name and adopt today.</p>
                   </div>
                   <Button asChild className="bg-primary text-primary-foreground font-black px-10 h-12 rounded-xl">
                      <Link href="/#residents">BROWSE RESIDENTS <ArrowRight className="ml-2 h-4 w-4" /></Link>
                   </Button>
                </CardContent>
             </Card>
           )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ResidentDashboardCard({ bird, dailyStatusProgress }: { bird: Resident, dailyStatusProgress: number }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const isHen = bird.sex === 'female';

  // Get latest health log for this specific bird
  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !bird.id || !user) return null;
    return query(collection(firestore, 'birds', bird.id, 'healthLogs'), orderBy('logDate', 'desc'), limit(1));
  }, [firestore, bird.id, user]);

  const { data: logs } = useCollection<HealthLogEntry>(logsQuery);
  const latestLog = logs?.[0];

  // Check if an egg was laid in the last 24 hours
  const hasRecentEgg = useMemo(() => {
    if (!bird.updatedAt || !isHen) return false;
    const diff = new Date().getTime() - new Date(bird.updatedAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  }, [bird.updatedAt, isHen]);

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:glow-purple transition-all duration-500">
      <div className="relative aspect-video overflow-hidden">
        <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
           <div>
              <h3 className="text-3xl font-headline font-black text-white uppercase tracking-tighter">{bird.name}</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{bird.breed}</p>
           </div>
           {hasRecentEgg && (
             <Badge className="bg-[#14F195] text-black font-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none animate-bounce">
                <PartyPopper className="h-3.5 w-3.5" /> LAID TODAY
             </Badge>
           )}
        </div>
      </div>

      <CardContent className="p-6 space-y-8">
        {/* Daily Care Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Clock className="h-3.5 w-3.5 text-secondary" /> Daily Care Progress
             </span>
             <span className="text-[11px] font-black text-foreground">{Math.round(dailyStatusProgress)}%</span>
          </div>
          <Progress value={dailyStatusProgress} className="h-2.5 bg-muted/20" />
        </div>

        {/* Member Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           {isHen ? (
             <div className="bg-background/50 border border-border p-4 rounded-2xl flex flex-col items-center justify-center">
                <Egg className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-headline font-black">{bird.eggCounter}</span>
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Rescued Eggs</span>
             </div>
           ) : (
             <div className="bg-background/50 border border-border p-4 rounded-2xl flex flex-col items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-secondary mb-1" />
                <span className="text-lg font-headline font-black uppercase">Guardian</span>
                <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Role</span>
             </div>
           )}
           <div className="bg-background/50 border border-border p-4 rounded-2xl flex flex-col items-center justify-center">
              <Stethoscope className="h-5 w-5 text-[#14F195] mb-1" />
              <span className="text-lg font-headline font-black uppercase">Healthy</span>
              <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Status</span>
           </div>
        </div>

        {/* Recent Care Log Snippet */}
        <div className="space-y-3">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
             <Sparkles className="h-3.5 w-3.5" /> Latest Care Update
           </h4>
           <div className="bg-background/50 border border-border p-4 rounded-2xl min-h-[80px]">
              {latestLog ? (
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{latestLog.notes.length > 100 ? latestLog.notes.substring(0, 100) + '...' : latestLog.notes}"
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic leading-relaxed flex items-center justify-center h-full">
                  Waiting for today's logs...
                </p>
              )}
           </div>
        </div>

        <Button variant="ghost" className="w-full h-12 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary/10 group" asChild>
           <Link href={`/residents/${bird.id}`}>
             VIEW FULL PROFILE <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
           </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
