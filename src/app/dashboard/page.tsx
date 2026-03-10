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
  getDocs, 
  getDoc,
  setDoc, 
  arrayUnion,
  or
} from 'firebase/firestore';
import { Resident, DailyStatus, HealthLogEntry, UserProfile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  PartyPopper,
  Utensils,
  Droplets,
  Calendar,
  LayoutDashboard,
  Ticket,
  Check
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const REFERRAL_MAP: Record<string, string> = {
  'STRAY-G0': 'Joey',
  'QUAKK-G0': 'Jordie',
  'QUAKEY-G0': 'Cutie Pie',
  'GODS-G0': 'SolGods'
};

export default function MemberDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [referralCode, setReferralCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [unlockedName, setUnlockedName] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  // Query for user profile to get linked birds
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  // Query for birds adopted by the user or linked via community codes
  const flockQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    
    const unlockedIds = userProfile?.my_flock || [];
    
    if (unlockedIds.length > 0) {
      // Use 'or' query to fetch both adopted and community ducks
      return query(
        collection(firestore, 'birds'), 
        or(
          where('adopterEmail', '==', user.email),
          where('id', 'in', unlockedIds)
        )
      );
    }
    
    return query(collection(firestore, 'birds'), where('adopterEmail', '==', user.email));
  }, [firestore, user?.email, userProfile?.my_flock]);

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

  const handleReferralCode = async () => {
    const code = referralCode.trim().toUpperCase();
    
    // 1. Validation
    if (!code || !firestore || !user) return;
    
    if (!REFERRAL_MAP[code]) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Invalid Community Code. Please check the spelling and try again."
      });
      return;
    }

    const targetName = REFERRAL_MAP[code];

    // 2. Duplicate Use Check
    if (userProfile?.community_codes?.includes(code)) {
      toast({
        title: "Already Adopted",
        description: `You are already a community adopter for ${targetName}!`,
      });
      return;
    }

    setIsVerifying(true);
    try {
      const birdsRef = collection(firestore, 'birds');
      
      // Robust lookup logic
      let birdDoc = null;

      // Stage A: Exact Case-Sensitive Name Match
      const q = query(birdsRef, where('name', '==', targetName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        birdDoc = querySnapshot.docs[0];
      }

      // Stage B: Fallback - Check by Document IDs (potential slugs)
      if (!birdDoc) {
        const potentialSlugs = [
          targetName.toLowerCase().replace(/\s+/g, '-'),
          targetName.toLowerCase().replace(/\s+/g, '_'),
          targetName.toLowerCase().replace(/\s+/g, ''),
          'cutie-pie',
          'solgods',
          'huey'
        ];
        
        for (const slug of potentialSlugs) {
          const birdDocRef = doc(firestore, 'birds', slug);
          const birdDocSnap = await getDoc(birdDocRef);
          if (birdDocSnap.exists()) {
            birdDoc = birdDocSnap;
            break;
          }
        }
      }

      // Stage C: Fallback - Scan all residents for trimmed, case-insensitive, space-normalized match
      if (!birdDoc) {
        const allBirdsSnap = await getDocs(birdsRef);
        birdDoc = allBirdsSnap.docs.find(d => {
          const name = d.data().name;
          if (!name) return false;
          const normalizedDbName = name.trim().toLowerCase().replace(/\s+/g, '');
          const normalizedTargetName = targetName.trim().toLowerCase().replace(/\s+/g, '');
          // Special fallback for SolGods/Huey
          if (normalizedTargetName === 'solgods' && normalizedDbName === 'huey') return true;
          return normalizedDbName === normalizedTargetName;
        }) || null;
      }

      if (!birdDoc) {
        if (targetName === 'Cutie Pie') {
          toast({
            variant: "destructive",
            title: "Update in Progress",
            description: "Resident record for Cutie Pie is being updated, please try again in a moment."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Resident Not Found",
            description: `We couldn't find ${targetName} in the sanctuary records.`
          });
        }
      } else {
        const birdId = birdDoc.id;

        if (userProfile?.my_flock?.includes(birdId)) {
          toast({
            title: "Already Adopted",
            description: `You are already a community adopter for ${targetName}!`,
          });
          setIsVerifying(false);
          return;
        }
        
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          my_flock: arrayUnion(birdId),
          community_codes: arrayUnion(code),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        setUnlockedName(targetName);
        toast({
          title: "Welcome to the flock!",
          description: `You are now a community adopter of ${targetName}.`,
        });
        setReferralCode('');
      }
    } catch (e: any) {
      console.error("Referral Code Error:", e);
      toast({
        variant: "destructive",
        title: "Link Failed",
        description: "Could not link the community resident. Please try again."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const routineTasks = [
    { label: "Morning Feeding", key: "morningFeeding", icon: <Utensils className="h-4 w-4" /> },
    { label: "Fresh Water", key: "freshWater", icon: <Droplets className="h-4 w-4" /> },
    { label: "Egg Counter", key: "eggCounter", icon: <Egg className="h-4 w-4" /> },
    { label: "Health Check", key: "healthCheck", icon: <Stethoscope className="h-4 w-4" /> },
    { label: "Nightly Pen Up", key: "nightlyPenUp", icon: <Clock className="h-4 w-4" /> },
  ];

  if (isUserLoading || flockLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const globalHealth = calculateProgress();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 space-y-16">
        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                 <LayoutDashboard className="h-6 w-6" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sanctuary Viewer Portal</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase">
                WELCOME, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'HERO'}</span>
              </h1>
           </div>

           {/* Community Code Entry */}
           <Card className="bg-secondary/5 border-secondary/20 rounded-2xl p-6 md:w-80 shadow-lg">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-secondary">
                    <Ticket className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Community Code</span>
                 </div>
                 <div className="flex gap-2">
                    <Input 
                      placeholder="ENTER CODE" 
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="bg-background border-secondary/20 h-10 text-xs font-black tracking-widest uppercase"
                      disabled={isVerifying}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleReferralCode} 
                      disabled={isVerifying}
                      className="bg-secondary text-secondary-foreground font-black px-4"
                    >
                      {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                 </div>
                 {isVerifying && <p className="text-[9px] font-black uppercase text-center animate-pulse text-secondary">Checking Code...</p>}
              </div>
           </Card>
        </section>

        {unlockedName && (
          <div className="bg-[#14F195]/10 border-2 border-[#14F195]/20 p-6 rounded-2xl text-center animate-in zoom-in duration-500">
             <PartyPopper className="h-8 w-8 text-[#14F195] mx-auto mb-2" />
             <h3 className="text-xl font-headline font-black uppercase text-[#14F195]">Code Success!</h3>
             <p className="text-sm font-medium">Welcome to the flock! You are now a community adopter of <strong>{unlockedName === 'Huey' ? 'SolGods' : unlockedName}</strong>.</p>
             <Button variant="ghost" size="sm" onClick={() => setUnlockedName(null)} className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-60">Dismiss</Button>
          </div>
        )}

        {/* Global Sanctuary Routine & Health */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-headline font-black uppercase tracking-tight">Global Sanctuary Health</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Daily routine completion across all aviaries</p>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-headline font-black text-primary leading-none">{Math.round(globalHealth)}%</span>
                  </div>
                </div>
                <Progress value={globalHealth} className="h-4 bg-muted/20" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {routineTasks.map((task) => {
                    const isCompleted = dailyStatus ? !!dailyStatus[task.key as keyof DailyStatus] : false;
                    return (
                      <div key={task.key} className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                        isCompleted ? "bg-[#14F195]/5 border-[#14F195]/20" : "bg-muted/10 border-border opacity-60"
                      )}>
                        <div className={cn("p-2 rounded-xl", isCompleted ? "text-[#14F195]" : "text-muted-foreground")}>
                          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : task.icon}
                        </div>
                        <span className="text-[8px] font-black uppercase text-center tracking-tighter leading-tight">
                          {task.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full" />
           </Card>

           <Card className="bg-primary/5 border-primary/20 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Heart className="h-10 w-10 text-primary fill-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-headline font-black uppercase">Live Impact</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Your support directly fuels the daily health check progress shown here.</p>
              </div>
           </Card>
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
                 <ResidentDashboardCard key={bird.id} bird={bird} dailyStatusProgress={globalHealth} />
               ))}
             </div>
           ) : (
             <Card className="bg-card/30 border-2 border-dashed border-border rounded-3xl p-12 text-center">
                <CardContent className="space-y-6">
                   <div className="mx-auto w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center">
                      <Heart className="h-10 w-10 text-muted-foreground opacity-50" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-headline font-black uppercase">Start your flock today</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">Your support directly funds life-saving care. Find a resident to name and adopt today.</p>
                   </div>
                   <Button asChild className="bg-primary text-primary-foreground font-black px-10 h-12 rounded-xl">
                      <Link href="/flock">BROWSE RESIDENTS <ArrowRight className="ml-2 h-4 w-4" /></Link>
                   </Button>
                </CardContent>
             </Card>
           )}
        </section>

        {/* Supporter News & Care Logs */}
        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-secondary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> SUPPORTER NEWS FEED
              </h2>
           </div>
           <div className="max-w-4xl mx-auto space-y-6">
              <NewsFeed adopterEmail={user?.email || ''} unlockedIds={userProfile?.my_flock || []} />
           </div>
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
  
  const displayName = bird.name === 'Huey' ? 'SolGods' : bird.name;

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !bird.id || !user) return null;
    return query(collection(firestore, 'birds', bird.id, 'healthLogs'), orderBy('logDate', 'desc'), limit(1));
  }, [firestore, bird.id, user]);

  const { data: logs } = useCollection<HealthLogEntry>(logsQuery);
  const latestLog = logs?.[0];

  const hasRecentEgg = useMemo(() => {
    if (!bird.updatedAt || !isHen) return false;
    const diff = new Date().getTime() - new Date(bird.updatedAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  }, [bird.updatedAt, isHen]);

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:glow-purple transition-all duration-500">
      <div className="relative aspect-video overflow-hidden">
        <Image 
          src={bird.primaryImageUrl} 
          alt={`${displayName} Community Duck`} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
           <div>
              <h3 className="text-3xl font-headline font-black text-white uppercase tracking-tighter">{displayName}</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{bird.breed}</p>
           </div>
           {hasRecentEgg && (
             <Badge className="bg-[#14F195] text-black font-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none animate-bounce">
                <PartyPopper className="h-3.5 w-3.5" /> LAID TODAY
             </Badge>
           )}
           {bird.isCommunityDuck && (
             <Badge className="bg-secondary text-secondary-foreground font-black px-3 py-1.5 rounded-lg border-none">
                COMMUNITY
             </Badge>
           )}
        </div>
      </div>

      <CardContent className="p-6 space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Clock className="h-3.5 w-3.5 text-secondary" /> Care Progress
             </span>
             <span className="text-[11px] font-black text-foreground">{Math.round(dailyStatusProgress)}%</span>
          </div>
          <Progress value={dailyStatusProgress} className="h-2.5 bg-muted/20" />
        </div>

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
              <span className="text-lg font-headline font-black uppercase text-[#14F195]">Healthy</span>
              <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Status</span>
           </div>
        </div>

        <div className="space-y-3">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
             <Calendar className="h-3.5 w-3.5" /> Latest Wellness Note
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

function NewsFeed({ adopterEmail, unlockedIds }: { adopterEmail: string, unlockedIds: string[] }) {
  const firestore = useFirestore();
  
  const flockQuery = useMemoFirebase(() => {
    if (!firestore || (!adopterEmail && unlockedIds.length === 0)) return null;
    
    if (unlockedIds.length > 0) {
      return query(
        collection(firestore, 'birds'), 
        or(
          where('adopterEmail', '==', adopterEmail),
          where('id', 'in', unlockedIds)
        ),
        limit(5)
      );
    }
    
    return query(collection(firestore, 'birds'), where('adopterEmail', '==', adopterEmail), limit(5));
  }, [firestore, adopterEmail, unlockedIds]);

  const { data: flock } = useCollection<Resident>(flockQuery);

  if (!flock || flock.length === 0) {
    return (
      <Card className="bg-muted/10 border-border p-12 text-center rounded-3xl border-dashed">
        <p className="text-muted-foreground font-medium italic">News feed will populate once you adopt a resident or use a community code.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {flock.map(bird => (
        <BirdLogs key={bird.id} bird={bird} />
      ))}
    </div>
  );
}

function BirdLogs({ bird }: { bird: Resident }) {
  const firestore = useFirestore();
  const displayName = bird.name === 'Huey' ? 'SolGods' : bird.name;
  
  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !bird.id) return null;
    return query(collection(firestore, 'birds', bird.id, 'healthLogs'), orderBy('logDate', 'desc'), limit(2));
  }, [firestore, bird.id]);

  const { data: logs } = useCollection<HealthLogEntry>(logsQuery);

  if (!logs || logs.length === 0) return null;

  return (
    <div className="space-y-4">
      {logs.map(log => (
        <Card key={log.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-lg group hover:border-secondary/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-primary/20">
                <Image src={bird.primaryImageUrl} alt={`${displayName} Community Duck`} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">{displayName} • Daily Care Log</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    {format(new Date(log.logDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                  {log.notes}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className="bg-[#14F195]/10 text-[#14F195] border-none text-[8px] font-black px-2">Verified Status</Badge>
                  <Badge className="bg-secondary/10 text-secondary border-none text-[8px] font-black px-2">Adopter Exclusive</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
