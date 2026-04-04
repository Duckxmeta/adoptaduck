
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  limit, 
  onSnapshot
} from 'firebase/firestore';
import { Resident, DailyStatus, UserProfile, Expense, BulletinEntry, EggHistoryEntry } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Bird, 
  Loader2, 
  LayoutDashboard,
  ChevronRight,
  ScrollText,
  ShieldCheck,
  LogOut,
  Zap,
  Megaphone,
  Clock,
  Database,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { SanctuaryCostCard } from '@/components/ledger/SanctuaryCostCard';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { DailyRoutine } from '@/components/DailyRoutine';
import { EggCounter } from '@/components/EggCounter';

const ADMIN_EMAIL = 'flowmarket1@gmail.com';

export default function MemberDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const [bulletins, setBulletins] = useState<BulletinEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isGuardian = userProfile?.role === 'guardian' || isAdmin;

  // ACCESS GATING: Non-Guardians are redirected to support to upgrade
  useEffect(() => {
    if (isMounted && !isUserLoading && !profileLoading && user && userProfile) {
      if (!isGuardian && userProfile.role !== 'admin') {
        router.replace('/support');
      }
    }
  }, [user, userProfile, isGuardian, isUserLoading, profileLoading, isMounted, router]);

  // Bulletin Sync: Migrated to top of dashboard
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

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore || !isGuardian) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'));
  }, [firestore, isGuardian]);

  const { data: expenses } = useCollection<Expense>(expensesQuery);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore || !isGuardian) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore, isGuardian]);

  const { data: birds } = useCollection<Resident>(birdsQuery);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore || !isGuardian) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore, isGuardian]);

  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const eggHistoryRef = useMemoFirebase(() => {
    if (!firestore || !isGuardian) return null;
    return doc(firestore, 'egg_history', todayStr);
  }, [firestore, todayStr, isGuardian]);

  const { data: eggHistory } = useDoc<EggHistoryEntry>(eggHistoryRef);

  const globalHealth = useMemo(() => {
    if (!dailyStatus) return 0;
    const tasks = ['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'];
    const completed = tasks.filter(t => !!(dailyStatus as any)?.[t]).length;
    return (completed / tasks.length) * 100;
  }, [dailyStatus]);

  if (isUserLoading || profileLoading || !isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Syncing Sanctuary Pulse...</p>
      </div>
    );
  }

  if (!user || (!isGuardian && !isAdmin)) {
    return null; // Handle via redirect in useEffect
  }

  const liveStatusBirds = (birds || [])
    .filter(b => b?.liveStatus)
    .sort((a,b) => (b?.statusLastUpdated || '').localeCompare(a?.statusLastUpdated || ''))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground font-body pb-32">
      <Navbar />

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* HEADER */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                 <LayoutDashboard className="h-6 w-6" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Guardian Hub</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-[0.8]">
                WELCOME, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'GUARDIAN'}</span>
              </h1>
           </div>

           <div className="flex flex-col md:flex-row gap-4">
             <Card className="bg-secondary/5 border-secondary/20 rounded-2xl p-6 md:w-64 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                   <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Tier</p>
                   <p className="text-sm font-headline font-black text-secondary uppercase leading-tight">Verified Guardian</p>
                </div>
             </Card>
           </div>
        </section>

        {/* 1. LATEST UPDATES (NEWS) */}
        {bulletins.length > 0 && (
          <section className="animate-in fade-in duration-1000 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-sm font-headline font-black uppercase tracking-widest">The Sanctuary Bulletin</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bulletins.map(b => (
                <Card key={b.id} className="bg-card border-border border-2 rounded-3xl overflow-hidden hover:border-primary/30 transition-all flex flex-col">
                  {b.imageUrl && (
                    <div className="relative aspect-video w-full border-b border-border">
                      <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-6 space-y-4 flex-1">
                    <div className="space-y-1">
                      <h3 className="text-lg font-headline font-black text-primary uppercase leading-tight line-clamp-2">{b.title}</h3>
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                        <Clock className="h-2.5 w-2.5" />
                        {b.timestamp?.toDate ? formatDistanceToNow(b.timestamp.toDate()) : 'Recent'} ago
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 font-medium leading-relaxed">{b.content}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 2. DAILY ROUTINE (READ-ONLY MIRROR) */}
        <DailyRoutine dailyStatus={dailyStatus || null} readOnly />

        {/* 3. EGG COUNTER (READ-ONLY MIRROR) */}
        <EggCounter initialCount={eggHistory?.count || 0} readOnly />

        {/* LIVE PULSE */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-pulse">
              <Zap className="h-5 w-5 text-primary-foreground fill-current" />
            </div>
            <h2 className="text-sm font-headline font-black uppercase tracking-widest">Live Pulse</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {liveStatusBirds?.map(bird => (
              <Card key={bird.id} className="bg-background/50 rounded-2xl border border-primary/10 p-4 flex items-center gap-4">
                <span className="text-2xl">🦆</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-primary truncate">{bird.name}</p>
                  <p className="text-xs font-bold truncate">{bird.liveStatus || 'Chilling 🌿'}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. FLOCK RECORDS (MIRROR) */}
        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                <Bird className="h-4 w-4" /> THE SANCTUARY FLOCK
              </h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {birds?.map((bird) => (
               <ResidentDashboardCard key={bird.id} bird={bird} dailyStatusProgress={globalHealth} expenses={expenses || []} totalBirds={birds?.length || 1} />
             ))}
           </div>
        </section>

        {/* 5. ARCHIVAL LEDGER (GUARDIAN ONLY) */}
        <section className="space-y-8 pt-12 border-t border-border">
           <div className="flex items-center gap-3">
              <ScrollText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-headline font-black uppercase tracking-[0.3em]">Sanctuary Archives</h2>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                 <SanctuaryCostCard expenses={expenses || []} />
              </div>
              <ItemizedLedger expenses={expenses || []} />
           </div>
        </section>

        {/* LOGOUT */}
        <section className="pt-12 border-t border-border flex justify-center">
           <Button variant="ghost" onClick={async () => { await signOut(auth!); router.push('/'); }} className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-destructive">
             <LogOut className="h-4 w-4 mr-2" /> Log Out of Sanctuary
           </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ItemizedLedger({ expenses }: { expenses: Expense[] }) {
  const filteredExpenses = (expenses || []).filter(e => !!e?.date);

  return (
    <Card className="bg-card border-border border-2 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
      <div className="p-6 border-b border-border bg-primary/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Guardian Archive</p>
        <p className="text-xs font-bold text-muted-foreground">Detailed transparency logs</p>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar divide-y divide-border">
        {filteredExpenses.length > 0 ? filteredExpenses.map((exp) => (
          <div key={exp.id} className="p-4 hover:bg-muted/10 transition-colors flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase text-foreground">{exp.itemName}</p>
              <Badge variant="outline" className="text-[8px] border-secondary/30 text-secondary uppercase px-1.5 py-0">{exp.category}</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm font-headline font-black text-primary">${(Number(exp.cost) || 0).toFixed(2)}</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase">{exp.date}</p>
            </div>
          </div>
        )) : (
          <div className="p-12 text-center space-y-3">
            <Database className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Awaiting Log Updates</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function ResidentDashboardCard({ bird, dailyStatusProgress, expenses, totalBirds }: { bird: Resident, dailyStatusProgress: number, expenses: Expense[], totalBirds: number }) {
  const careCosts = useMemo(() => {
    if (!expenses || !totalBirds || totalBirds === 0) return 0;
    const specific = expenses.filter(e => e.birdId === bird.id).reduce((s, e) => s + (Number(e.cost) || 0), 0);
    const shared = expenses.filter(e => !e.birdId).reduce((s, e) => s + (Number(e.cost) || 0), 0);
    return specific + (shared / totalBirds);
  }, [expenses, totalBirds, bird.id]);

  return (
    <Card className="bg-card border-border border-2 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full group hover:glow-primary transition-all">
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {bird?.primaryImageUrl ? (
          <Image src={bird.primaryImageUrl} alt={bird.name || 'Resident'} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <span className="text-4xl">🦆</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
           <h3 className="text-xl font-headline font-black text-white uppercase tracking-tighter">{bird?.name || 'Sanctuary Friend'}</h3>
           <p className="text-[10px] text-primary font-black uppercase tracking-widest">{bird?.breed || 'Domestic Duck'}</p>
        </div>
      </div>
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
           <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Lifetime Care Share</span>
           <p className="text-lg font-headline font-black text-primary">${careCosts.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
           <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Health Status</span>
              <span>{Math.round(dailyStatusProgress)}%</span>
           </div>
           <Progress value={dailyStatusProgress} className="h-1.5" />
        </div>
        <div className="pt-2 mt-auto">
          <Button asChild variant="outline" className="w-full h-9 rounded-xl text-[9px] font-black uppercase tracking-widest border-border hover:bg-primary/10">
            <Link href={`/residents/${bird.id}`}>View Profile <ChevronRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
