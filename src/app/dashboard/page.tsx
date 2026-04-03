
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  doc, 
  limit, 
  onSnapshot,
  collectionGroup
} from 'firebase/firestore';
import { Resident, DailyStatus, HealthLogEntry, UserProfile, Expense, Donation, BulletinEntry } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
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
  Stethoscope,
  Utensils as ForkKnife,
  Droplets,
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
  Activity,
  ScrollText,
  Users,
  Zap,
  Award,
  Lock,
  Calendar,
  Database,
  Ticket,
  CreditCard
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { SanctuaryCostCard } from '@/components/ledger/SanctuaryCostCard';
import { DOTMSpotlight } from '@/components/DOTMSpotlight';
import { BulletinBoard } from '@/components/members/BulletinBoard';
import { PromoCodeInput } from '@/components/shared/PromoCodeInput';

const GOALS = {
  feed: 300,
  medical: 500,
  infrastructure: 1000
};

export default function MemberDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [bulletins, setBulletins] = useState<BulletinEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Real-time Bulletin Listener
  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'bulletin'), orderBy('timestamp', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BulletinEntry[];
      setBulletins(docs);
    }, (err) => console.warn("Bulletin access denied or malformed", err));
    return () => unsubscribe();
  }, [firestore]);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'));
  }, [firestore]);

  const { data: expenses } = useCollection<Expense>(expensesQuery);

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), orderBy('timestamp', 'desc'), limit(50));
  }, [firestore]);

  const { data: donations } = useCollection<Donation>(donationsQuery);

  const myDonationsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'donations'), where('uid', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: myDonations } = useCollection<Donation>(myDonationsQuery);

  const myTotalImpact = useMemo(() => {
    if (!myDonations) return 0;
    return myDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  }, [myDonations]);

  const allBirdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'));
  }, [firestore]);

  const { data: allBirds } = useCollection<Resident>(allBirdsQuery);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore]);

  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  const impactStats = useMemo(() => {
    if (!donations) return { feed: 0, medical: 0, infrastructure: 0 };
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthly = donations.filter(d => {
      const date = new Date(d.timestamp);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    return {
      feed: monthly.filter(d => d.designation === 'feed').reduce((s, d) => s + (d.amount || 0), 0),
      medical: monthly.filter(d => d.designation === 'medical').reduce((s, d) => s + (d.amount || 0), 0),
      infrastructure: monthly.filter(d => d.designation === 'infrastructure').reduce((s, d) => s + (d.amount || 0), 0)
    };
  }, [donations]);

  const calculateProgress = () => {
    if (!dailyStatus) return 0;
    const tasks = ['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'];
    const completed = tasks.filter(t => !!(dailyStatus as any)[t]).length;
    return (completed / tasks.length) * 100;
  };

  const routineTasks = [
    { label: "Morning Feeding", key: "morningFeeding", icon: <ForkKnife className="h-4 w-4" /> },
    { label: "Fresh Water", key: "freshWater", icon: <Droplets className="h-4 w-4" /> },
    { label: "Egg Counter", key: "eggCounter", icon: <Egg className="h-4 w-4" /> },
    { label: "Health Check", key: "healthCheck", icon: <Stethoscope className="h-4 w-4" /> },
    { label: "Nightly Pen Up", key: "nightlyPenUp", icon: <Clock className="h-4 w-4" /> },
  ];

  if (isUserLoading || !isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary gap-4">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Syncing Sanctuary Pulse...</p>
      </div>
    );
  }

  const globalHealth = calculateProgress();
  const liveStatusBirds = allBirds?.filter(b => b.liveStatus)?.sort((a,b) => (b.statusLastUpdated || '').localeCompare(a.statusLastUpdated || '')) || [];
  const isGuardian = userProfile?.role === 'guardian' || userProfile?.role === 'admin';
  const isGiftedAccess = isGuardian && !userProfile?.stripeSubscriptionId && (userProfile?.usedCodes?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-body pb-32">
      <Navbar />

      <main className="container mx-auto px-4 py-12 space-y-16">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                 <LayoutDashboard className="h-6 w-6" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                   {isGuardian ? "Guardian Hub" : "Supporter Hub"}
                 </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-[0.8]">
                WELCOME, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'HERO'}</span>
              </h1>
           </div>

           <div className="flex flex-col md:flex-row gap-4">
             <Card className="bg-primary/5 border-primary/20 rounded-2xl p-6 md:w-64 shadow-lg flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <Award className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">My Impact</p>
                   <p className="text-2xl font-headline font-black text-primary">${myTotalImpact.toFixed(0)}</p>
                </div>
             </Card>

             {isGuardian && (
               <Card className="bg-secondary/5 border-secondary/20 rounded-2xl p-6 md:w-64 shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                     {isGiftedAccess ? <Ticket className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                  </div>
                  <div>
                     <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                     <p className="text-sm font-headline font-black text-secondary uppercase leading-tight">
                       {isGiftedAccess ? "Gifted Access" : "Guardian Pro"}
                     </p>
                  </div>
               </Card>
             )}
           </div>
        </section>

        <section className="animate-in fade-in duration-700">
          <BulletinBoard bulletins={bulletins} />
        </section>

        <section className="animate-in fade-in duration-1000">
          <DOTMSpotlight />
        </section>

        {liveStatusBirds.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <Card className="bg-primary/10 border-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="h-24 w-24 text-primary" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                  <Zap className="h-5 w-5 text-primary-foreground fill-current" />
                </div>
                <div>
                  <h2 className="text-sm font-headline font-black uppercase tracking-widest">Live Sanctuary Status</h2>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-tight">Real-time vibe broadcast</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {liveStatusBirds.slice(0, 4).map((bird) => (
                  <div key={bird.id} className="flex items-center justify-between p-3 bg-background/50 rounded-2xl border border-primary/10 hover:border-primary/30 transition-colors gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                      {bird.primaryImageUrl ? (
                        <Image src={bird.primaryImageUrl} alt={bird.name} width={40} height={40} className="object-cover h-full" />
                      ) : (
                        <span className="text-lg">🦆</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase text-primary tracking-tight truncate">{bird.name}</p>
                      <p className="text-xs font-bold truncate">{bird.liveStatus || 'Chilling 🌿'}</p>
                      {bird.statusLastUpdated && (
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">
                          {formatDistanceToNow(new Date(bird.statusLastUpdated))} ago
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" /> COMMUNITY SUSTAINMENT
                    </h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Monthly funding progress towards direct care</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { label: "Flock Feed", key: "feed", goal: GOALS.feed, icon: "🌾" },
                     { label: "Vet Fund", key: "medical", goal: GOALS.medical, icon: "🏥" },
                     { label: "Projects", key: "infrastructure", goal: GOALS.infrastructure, icon: "🔨" }
                   ].map(item => (
                     <div key={item.key} className="space-y-3 p-4 bg-muted/10 rounded-2xl border border-border">
                        <div className="flex justify-between items-center">
                           <span className="text-lg">{item.icon}</span>
                           <span className="text-[10px] font-black text-primary">
                             ${Math.round(impactStats[item.key as keyof typeof impactStats] || 0)} / ${item.goal}
                           </span>
                        </div>
                        <Progress value={((impactStats[item.key as keyof typeof impactStats] || 0) / item.goal) * 100} className="h-2" />
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                     </div>
                   ))}
                </div>

                {donations && donations.length > 0 && (
                  <div className="flex items-center gap-3 pt-2">
                     <Activity className="h-3.5 w-3.5 text-secondary animate-pulse" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-secondary/80">
                       LATEST: {donations[0]?.donorDisplayName} supported the {donations[0]?.designation} fund!
                     </p>
                  </div>
                )}
              </div>
           </Card>

           <Card className="bg-card border-border rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-headline font-black uppercase tracking-tight">Flock Health</h2>
                  <span className="text-3xl font-headline font-black text-primary leading-none">{Math.round(globalHealth)}%</span>
                </div>
                <Progress value={globalHealth} className="h-3" />
                <div className="grid grid-cols-5 gap-2">
                  {routineTasks.map((task) => {
                    const isCompleted = dailyStatus ? !!dailyStatus[task.key as keyof DailyStatus] : false;
                    return (
                      <div key={task.key} className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                        isCompleted ? "bg-[#14F195]/5 border-[#14F195]/20 text-[#14F195]" : "bg-muted/10 border-border opacity-40"
                      )}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : task.icon}
                      </div>
                    );
                  })}
                </div>
              </div>
           </Card>
        </section>

        {/* ROLE-GATED SECTION: ITEMIZIED LEDGER */}
        <section className="space-y-8 animate-in fade-in duration-1000">
           <div className="flex items-center gap-3">
              <ScrollText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-headline font-black uppercase tracking-[0.3em]">Itemized Care Logs</h2>
           </div>
           <ItemizedLedger expenses={expenses} isGuardian={isGuardian} userProfile={userProfile} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              <SanctuaryCostCard expenses={expenses} />
           </div>
           
           <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-border bg-secondary/5">
                 <h2 className="text-sm font-headline font-black uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary" /> COMMUNITY FEED
                 </h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1">Live Contribution Broadcast</p>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[400px] p-0 custom-scrollbar">
                 {donations && donations.length > 0 ? (
                    <div className="divide-y divide-border/50">
                       {donations.map((donation) => (
                          <div key={donation.id} className="p-4 hover:bg-muted/10 transition-colors space-y-1">
                             <div className="flex justify-between items-start">
                                <span className="text-[11px] font-black uppercase text-foreground">{donation.donorDisplayName}</span>
                                <span className="text-[11px] font-black text-primary">${(donation.amount || 0).toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <Badge variant="outline" className="text-[8px] border-secondary/30 text-secondary uppercase px-1.5 py-0">
                                   {donation.designation}
                                </Badge>
                                <span className="text-[9px] font-bold text-muted-foreground">
                                   {donation.timestamp ? format(new Date(donation.timestamp), 'MMM dd') : ''}
                                </span>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-12 text-center space-y-3">
                       <ScrollText className="h-8 w-8 text-muted-foreground mx-auto opacity-20" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Awaiting Support</p>
                    </div>
                 )}
              </div>
              <div className="p-4 bg-muted/5 border-t border-border">
                 <Button asChild variant="ghost" className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-secondary hover:text-secondary hover:bg-secondary/10">
                    <Link href="/support#membership">SUPPORT THE LEDGER <ArrowRight className="h-3 w-3 ml-2" /></Link>
                 </Button>
              </div>
           </Card>
        </section>

        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                <Bird className="h-4 w-4" /> THE SANCTUARY FLOCK
              </h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {allBirds?.map((bird) => (
               <ResidentDashboardCard key={bird.id} bird={bird} dailyStatusProgress={globalHealth} expenses={expenses} totalBirds={allBirds?.length || 1} />
             ))}
           </div>
        </section>

        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-secondary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> WELLNESS LOGS
              </h2>
           </div>
           <NewsFeed />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ItemizedLedger({ expenses, isGuardian, userProfile }: { expenses: Expense[] | null, isGuardian: boolean, userProfile: UserProfile | null }) {
  if (!isGuardian) {
    return (
      <Card className="bg-card border-border rounded-3xl p-12 text-center space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
        <div className="relative z-10 space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-headline font-black uppercase tracking-tight">GUARDIAN LEDGER ACCESS</h3>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
              Upgrade to Guardian to unlock itemized care logs and track every dollar spent on sanctuary operations.
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground font-black px-12 h-14 rounded-xl shadow-xl hover:scale-105 transition-transform text-xs tracking-widest uppercase">
            <Link href="/support#membership">UPGRADE TO GUARDIAN</Link>
          </Button>
        </div>
      </Card>
    );
  }

  // Null-Safe Join Date Calculation
  const getSafeDate = (dString?: string | null) => {
    if (!dString) return new Date();
    const d = new Date(dString);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const joinDate = getSafeDate(userProfile?.membershipStartedAt);
  
  const filteredExpenses = (expenses || []).filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return true; // Show malformed dates instead of hiding
    return d >= joinDate;
  });

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-border bg-primary/5 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Guardian Archive</p>
          <p className="text-xs font-bold text-muted-foreground">Detailed transparency for verified members</p>
        </div>
        <Badge className="bg-primary text-black font-black text-[10px] uppercase tracking-widest px-3 py-1">UNLOCKED</Badge>
      </div>
      <div className="divide-y divide-border">
        {filteredExpenses.length > 0 ? filteredExpenses.map((exp) => (
          <div key={exp.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl border border-border">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground text-lg uppercase tracking-tight">{exp.itemName}</p>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-secondary/30 text-secondary">{exp.category}</Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{exp.date}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-headline font-black text-primary">${(exp.cost || 0).toFixed(2)}</p>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center space-y-4 opacity-40">
            <Database className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No recent ledger entries found.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function ResidentDashboardCard({ bird, dailyStatusProgress, expenses, totalBirds }: { bird: Resident, dailyStatusProgress: number, expenses: Expense[] | null, totalBirds: number }) {
  const careCosts = useMemo(() => {
    if (!expenses || !totalBirds) return 0;
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const monthlyExpenses = expenses.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
    });
    const specific = monthlyExpenses.filter(e => e.birdId === bird.id).reduce((s, e) => s + (e.cost || 0), 0);
    const shared = monthlyExpenses.filter(e => !e.birdId).reduce((s, e) => s + (e.cost || 0), 0);
    return specific + (shared / totalBirds);
  }, [expenses, totalBirds, bird.id]);

  return (
    <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-xl flex flex-col h-full group hover:glow-primary transition-all">
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {bird.primaryImageUrl ? (
          <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <span className="text-4xl">🦆</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
           <h3 className="text-xl font-headline font-black text-white uppercase tracking-tighter">{bird.name}</h3>
           <p className="text-[10px] text-primary font-black uppercase tracking-widest">{bird.breed}</p>
        </div>
      </div>
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
           <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">30-Day Care Share</span>
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

function NewsFeed() {
  const firestore = useFirestore();
  const logsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'healthLogs'), orderBy('logDate', 'desc'), limit(10));
  }, [firestore]);

  const { data: logs, isLoading } = useCollection<HealthLogEntry>(logsQuery);
  const birdsQuery = useMemoFirebase(() => {
     if (!firestore) return null;
     return query(collection(firestore, 'birds'));
  }, [firestore]);
  const { data: birds } = useCollection<Resident>(birdsQuery);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {logs?.map((log) => {
        const bird = birds?.find(b => b.id === log.birdId);
        if (!bird) return null;
        return (
          <Card key={log.id} className="bg-muted/5 border-border rounded-2xl p-6 hover:border-secondary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border bg-muted flex items-center justify-center">
                {bird.primaryImageUrl ? (
                  <Image src={bird.primaryImageUrl} alt={bird.name} width={48} height={48} className="object-cover h-full" />
                ) : (
                  <span className="text-xl">🦆</span>
                )}
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                   <h4 className="font-headline font-black text-xs uppercase tracking-tight text-secondary truncate">{bird.name} Update</h4>
                   <span className="text-[9px] font-bold text-muted-foreground shrink-0">{log.logDate ? format(new Date(log.logDate), 'MMM dd') : ''}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-3">"{log.notes}"</p>
              </div>
            </div>
          </Card>
        );
      })}
      {(!logs || logs.length === 0) && (
        <div className="col-span-full py-12 text-center opacity-40">
           <Activity className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
           <p className="text-xs font-black uppercase tracking-widest">Awaiting wellness updates...</p>
        </div>
      )}
    </div>
  );
}
