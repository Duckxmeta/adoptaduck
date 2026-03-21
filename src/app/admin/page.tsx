"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Minus, Loader2, ClipboardList, 
  LayoutDashboard, Trash2, Bird, Zap, Sanitize, 
  ShieldCheck, Bell, CheckCheck, Inbox, GitBranch,
  Sparkles, Activity, ChevronRight, Egg, Save
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, addDoc, deleteDoc, runTransaction, serverTimestamp, onSnapshot, where, updateDoc } from 'firebase/firestore';
import { Resident, DailyStatus, EggHistoryEntry, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { HealthLogDialog } from '@/components/admin/HealthLogDialog';
import { DeleteResidentDialog } from '@/components/admin/DeleteResidentDialog';
import { StoryModal } from '@/components/residents/StoryModal';
import { Navbar } from '@/components/layout/Navbar';
import { format, isValid as isDateValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from 'next/link';

const ADMIN_EMAILS = ['decentducksorg@gmail.com', 'flowmarket1@gmail.com'];
const PRESET_VIBES = [
  { label: 'Chill', emoji: '🌿' },
  { label: 'Energetic', emoji: '⚡' },
  { label: 'Hungry', emoji: '🥨' },
  { label: 'Broody', emoji: '🪺' },
  { label: 'Sleepy', emoji: '💤' },
  { label: 'Vigilant', emoji: '🛡️' },
  { label: 'Vocal', emoji: '📢' },
];

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isUserLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const isUserAdmin = !!(user.email && ADMIN_EMAILS.includes(user.email));

  if (isUserAdmin) {
    return <ManagerPortal user={user} />;
  }

  return <MemberPulseView user={user} />;
}

function ManagerPortal({ user }: { user: any }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isHealthLogOpen, setIsHealthLogOpen] = useState(false);
  const [loggingResident, setLoggingResident] = useState<Resident | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);
  const [vibeBird, setVibeBird] = useState<Resident | null>(null);
  const [isSavingEggs, setIsSavingEggs] = useState(false);
  const [localEggCount, setLocalEggCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const birdsQuery = useMemoFirebase(() => query(collection(firestore!, 'birds'), orderBy('createdAt', 'desc')), [firestore]);
  const todayEggRef = useMemoFirebase(() => doc(firestore!, 'egg_history', todayDate), [firestore, todayDate]);
  const dailyStatusRef = useMemoFirebase(() => doc(firestore!, 'daily_status', 'today'), [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: todayEggData } = useDoc<EggHistoryEntry>(todayEggRef);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  useEffect(() => {
    if (todayEggData) setLocalEggCount(todayEggData.count);
  }, [todayEggData]);

  // Admin Notification Listener
  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email)) return;

    const q = query(
      collection(firestore!, 'notifications'),
      where('status', '==', 'unread'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(docs);
    }, (error) => {
      console.error("Notification listener error:", error);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const handleUpdateStatus = (birdId: string, status: string) => {
    const birdRef = doc(firestore!, 'birds', birdId);
    updateDoc(birdRef, {
      liveStatus: status || "",
      statusLastUpdated: status ? new Date().toISOString() : null
    });
    toast({ title: status ? "Status Updated" : "Status Cleared" });
    setVibeBird(null);
  };

  const handleSyncEggs = async () => {
    setIsSavingEggs(true);
    try {
      await setDoc(todayEggRef!, { count: localEggCount, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: "Eggs Synced!", description: `${localEggCount} recorded.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Error" });
    } finally { setIsSavingEggs(false); }
  };

  const toggleDailyTask = (taskKey: keyof Omit<DailyStatus, 'id' | 'lastReset'>) => {
    const newValue = dailyStatus ? !dailyStatus[taskKey] : true;
    setDoc(dailyStatusRef!, { [taskKey]: newValue }, { merge: true });
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(firestore!, 'notifications', id), {
        status: 'read'
      });
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  const progress = dailyStatus ? (['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'].filter(t => !!(dailyStatus as any)[t]).length / 5) * 100 : 0;
  const foundingFour = birds?.filter(b => b.isFoundingResident).sort((a,b) => a.name.localeCompare(b.name)) || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-body">
      <Navbar />
      <main className="container mx-auto p-4 space-y-10 mt-4 md:mt-8">
        <div className="flex flex-col gap-2 pb-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-primary" /> MANAGER <span className="text-primary">PORTAL</span>
            </h1>
            <Badge className="bg-primary text-primary-foreground text-[8px] font-black tracking-widest px-2 py-0.5">ADMIN</Badge>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Sanctuary Operations</p>
        </div>

        {/* NOTIFICATION FEED */}
        {notifications.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-secondary" />
                <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">NOTIFICATION FEED</h2>
                <Badge className="bg-secondary text-secondary-foreground text-[10px] px-2">{notifications.length}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              {notifications.map((note) => (
                <Card key={note.id} className="bg-secondary/5 border-secondary/20 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-full">
                      <Inbox className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">New Name Suggestion</p>
                      <p className="text-xs text-muted-foreground">"{note.suggestedName}" for {note.birdId}</p>
                      <p className="text-[9px] text-muted-foreground/60 uppercase font-black">{note.userEmail}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markNotificationRead(note.id)}
                    className="text-secondary hover:bg-secondary/10 h-8 px-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark Read
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* EGG COUNTER */}
        <section className="space-y-4">
          <div className="flex items-center gap-3"><Egg className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY HARVEST</h2></div>
          <Card className="bg-card border-border rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-1">
              <h2 className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-primary">TODAY'S TOTAL</h2>
              <h3 className="text-7xl md:text-8xl font-headline font-black text-primary tracking-tighter leading-none">{localEggCount}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{format(new Date(), 'MMMM dd, yyyy')}</p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="flex gap-4">
                <Button onClick={() => setLocalEggCount(Math.max(0, localEggCount - 1))} variant="outline" className="flex-1 h-[80px] rounded-2xl border-2 border-border"><Minus className="h-6 w-6" /></Button>
                <Button onClick={() => setLocalEggCount(localEggCount + 1)} className="flex-1 h-[80px] rounded-2xl bg-primary text-primary-foreground shadow-lg"><Plus className="h-6 w-6" /></Button>
              </div>
              <Button onClick={handleSyncEggs} disabled={isSavingEggs} className="w-full h-14 bg-secondary text-secondary-foreground font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm tracking-widest">
                {isSavingEggs ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} SAVE FOR TODAY
              </Button>
            </div>
          </Card>
        </section>

        {/* DAILY ROUTINE */}
        <section className="space-y-4">
          <div className="flex items-center gap-3"><ClipboardList className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY ROUTINE</h2></div>
          <Card className="bg-card border-border rounded-[2rem] p-6 shadow-xl space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase tracking-widest text-primary">Sanctuary Health</span><span className="text-2xl font-headline font-black text-primary">{Math.round(progress)}%</span></div>
              <Progress value={progress} className="h-4 bg-muted" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { label: "Feeding", icon: "🌾", key: "morningFeeding" },
                { label: "Fresh Water", icon: "💧", key: "freshWater" },
                { label: "Egg Count", icon: "🥚", key: "eggCounter" },
                { label: "Health Check", icon: "🩺", key: "healthCheck" },
                { label: "Nightly Pen", icon: "🌙", key: "nightlyPenUp" }
              ].map((task) => (
                <div key={task.key} className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border transition-all h-[70px] md:h-auto md:flex-col md:gap-3",
                  dailyStatus?.[task.key as keyof DailyStatus] ? "bg-[#14F195]/5 border-[#14F195]/20 text-[#14F195]" : "bg-background/50 border-border text-muted-foreground"
                )}>
                  <div className="flex items-center gap-4 md:flex-col md:gap-2">
                    <span className="text-2xl">{task.icon}</span>
                    <Label className="text-[10px] font-black uppercase tracking-widest">{task.label}</Label>
                  </div>
                  <Switch 
                    className="scale-125"
                    checked={!!dailyStatus?.[task.key as keyof DailyStatus]} 
                    onCheckedChange={() => toggleDailyTask(task.key as any)} 
                  />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* VIBE BOARD */}
        <section className="space-y-4">
          <div className="flex items-center gap-3"><Zap className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">LIVE VIBE BOARD</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {foundingFour.map((bird) => {
              const lastUpdatedDate = bird.statusLastUpdated ? new Date(bird.statusLastUpdated) : null;
              const formattedTime = lastUpdatedDate && isDateValid(lastUpdatedDate) 
                ? format(lastUpdatedDate, 'h:mm a') 
                : 'Routine';

              return (
                <Card key={bird.id} onClick={() => setVibeBird(bird)} className="bg-card border-border rounded-2xl p-5 flex items-center justify-between shadow-xl cursor-pointer hover:border-primary/50 transition-all min-h-[80px]">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border shrink-0">
                      {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-xl">🦆</div>}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline font-black uppercase tracking-tight text-sm truncate">{bird.name}</h3>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase truncate">
                        {bird.statusLastUpdated ? `Updated ${formattedTime}` : 'Sanctuary Routine'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-2 min-w-[100px] justify-center text-primary border-primary/30 ml-2">
                    {bird.liveStatus || 'DAILY ROUTINE'}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </section>

        {/* RESIDENT DIRECTORY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><Bird className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">RESIDENT DIRECTORY</h2></div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="bg-secondary/10 text-secondary border border-secondary/20 h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest">
                <Link href="/flock">VIEW ALL</Link>
              </Button>
              <Button onClick={() => { setEditingResident(null); setIsDialogOpen(true); }} className="bg-primary/10 text-primary border border-primary/20 h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"><Plus className="h-4 w-4 mr-1" /> ADD BIRD</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {birdsLoading ? [1,2,3].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-2xl" />) : birds?.map((bird) => (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-lg flex group relative">
                <div className="relative w-24 md:w-32 aspect-square overflow-hidden shrink-0 border-r border-border">
                  {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl bg-background">🦆</div>}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div><h3 className="font-headline font-black text-lg uppercase tracking-tight truncate">{bird.name}</h3><p className="text-[9px] text-muted-foreground uppercase font-black truncate">{bird.breed}</p></div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-10 px-3 text-[10px] font-black uppercase text-secondary bg-secondary/5 rounded-lg" onClick={() => { setLoggingResident(bird); setIsHealthLogOpen(true); }}>LOG</Button>
                    <Button variant="ghost" size="sm" className="h-10 px-3 text-[10px] font-black uppercase text-muted-foreground bg-muted/5 rounded-lg" onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}>EDIT</Button>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-destructive md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={() => { setDeletingResident(bird); setIsDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Dialog open={!!vibeBird} onOpenChange={(open) => !open && setVibeBird(null)}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-sm rounded-[2.5rem] p-0 overflow-hidden shadow-2xl h-[90vh] md:h-auto flex flex-col">
          <DialogHeader className="p-8 bg-primary/5 border-b border-border shrink-0">
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tighter">SET <span className="text-primary">VIBE</span></DialogTitle>
          </DialogHeader>
          <div className="p-6 grid grid-cols-2 gap-3 overflow-y-auto flex-1 text-center">
            {PRESET_VIBES.map((vibe) => (
              <Button key={vibe.label} variant="outline" className="h-[90px] rounded-[1.5rem] flex flex-col items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground group" onClick={() => vibeBird && handleUpdateStatus(vibeBird.id, `${vibe.emoji} ${vibe.label.toUpperCase()}`)}>
                <span className="text-3xl group-hover:scale-110 transition-transform">{vibe.emoji}</span><span className="text-[10px] font-black uppercase tracking-widest">{vibe.label}</span>
              </Button>
            ))}
          </div>
          <div className="p-6 space-y-3 bg-card border-t border-border shrink-0">
            <Button variant="outline" className="w-full h-14 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => vibeBird && handleUpdateStatus(vibeBird.id, "")}>RESET STATUS</Button>
            <Button variant="ghost" onClick={() => setVibeBird(null)} className="w-full h-12 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Dismiss</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ResidentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={(data) => {
        if (editingResident) {
          setDoc(doc(firestore!, 'birds', editingResident.id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
          toast({ title: "Updated" });
        } else {
          const newId = (data.name || 'bird').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
          setDoc(doc(firestore!, 'birds', newId), { ...data, id: newId, createdAt: new Date().toISOString() }, { merge: true });
          toast({ title: "Added" });
        }
        setIsDialogOpen(false);
      }} resident={editingResident} />
      
      <HealthLogDialog open={isHealthLogOpen} onOpenChange={setIsHealthLogOpen} onSave={async (notes) => {
        await addDoc(collection(firestore!, 'birds', loggingResident!.id, 'healthLogs'), { birdId: loggingResident!.id, logDate: new Date().toISOString(), notes });
        toast({ title: "Log Saved" });
        setIsHealthLogOpen(false);
      }} residentName={loggingResident?.name || ''} />

      <DeleteResidentDialog open={isDeleteDialogOpen} onOpenChange={setIsDialogOpen} resident={deletingResident} offspringCount={0} onConfirm={async () => {
        await deleteDoc(doc(firestore!, 'birds', deletingResident!.id));
        toast({ title: "Removed" });
      }} />
    </div>
  );
}

function MemberPulseView({ user }: { user: any }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const isGuest = user.isAnonymous;

  const [alphaCode, setAlphaCode] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const userProfileRef = useMemoFirebase(() => doc(firestore!, 'users', user.uid), [firestore, user.uid]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const birdsQuery = useMemoFirebase(() => query(collection(firestore!, 'birds'), orderBy('createdAt', 'desc')), [firestore]);
  const todayEggRef = useMemoFirebase(() => doc(firestore!, 'egg_history', todayDate), [firestore, todayDate]);
  const dailyStatusRef = useMemoFirebase(() => doc(firestore!, 'daily_status', 'today'), [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: todayEggData } = useDoc<EggHistoryEntry>(todayEggRef);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  const progress = dailyStatus ? (['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'].filter(t => !!(dailyStatus as any)[t]).length / 5) * 100 : 0;
  const foundingFour = birds?.filter(b => b.isFoundingResident).sort((a,b) => a.name.localeCompare(b.name)) || [];

  const handleAlphaUnlock = async () => {
    const code = alphaCode.trim();
    if (code !== 'SpringDucks-JDI-G0') {
      toast({ variant: "destructive", title: "Invalid Code", description: "Alpha access code not recognized." });
      return;
    }
    
    setIsUnlocking(true);
    try {
      await runTransaction(firestore!, async (transaction) => {
        const promoRef = doc(firestore!, 'promo_codes', code);
        const userRef = doc(firestore!, 'users', user.uid);
        
        const promoSnap = await transaction.get(promoRef);
        let currentCount = 0;
        if (promoSnap.exists()) {
          currentCount = promoSnap.data().usageCount || 0;
        }
        
        if (currentCount >= 2) {
          throw new Error('Expired');
        }
        
        transaction.set(promoRef, { 
          usageCount: currentCount + 1,
          lastUsedAt: serverTimestamp() 
        }, { merge: true });
        
        transaction.set(userRef, { 
          role: 'guardian', 
          updatedAt: serverTimestamp() 
        }, { merge: true });
      });
      toast({ title: "Guardian Status Unlocked!", description: "You now have full alpha access features." });
      setAlphaCode('');
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: e.message === 'Expired' ? "Code Expired" : "Access Denied",
        description: e.message === 'Expired' ? "This alpha code has reached its 2-use limit." : "Failed to process alpha access."
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const isGuardian = userProfile?.role === 'guardian';

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-body">
      <Navbar />
      <main className="container mx-auto p-4 space-y-10 mt-4 md:mt-8 animate-in fade-in duration-700">
        <div className="flex flex-col gap-2 pb-6 border-b border-border text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <h1 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-primary" /> SANCTUARY <span className="text-primary">PULSE</span>
            </h1>
            <div className="flex items-center gap-2">
              {isGuardian && (
                <Badge className="bg-secondary text-secondary-foreground text-[8px] font-black tracking-widest px-2 py-0.5 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> GUARDIAN
                </Badge>
              )}
              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-secondary text-secondary">
                {isGuest ? "GUEST" : "FLOCK MEMBER"}
              </Badge>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Live Sanctuary Feed</p>
        </div>

        {/* ALPHA ACCESS FEATURE */}
        {!isGuardian && !isGuest && (
          <section className="animate-in slide-in-from-top-4 duration-500">
            <Card className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center">
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="font-headline font-black text-sm uppercase tracking-tight text-secondary">Alpha Tester Access</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Enter code to unlock Guardian features</p>
                </div>
                <div className="flex w-full md:w-auto gap-3">
                  <input 
                    value={alphaCode}
                    onChange={(e) => setAlphaCode(e.target.value)}
                    placeholder="ENTER ALPHA CODE"
                    className="bg-background border border-secondary/20 h-12 px-4 rounded-xl text-xs font-black tracking-widest uppercase flex-1 md:w-64 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    disabled={isUnlocking}
                  />
                  <Button 
                    onClick={handleAlphaUnlock}
                    disabled={isUnlocking || !alphaCode.trim()}
                    className="bg-secondary text-secondary-foreground font-black h-12 px-6 rounded-xl shadow-lg hover:scale-105 transition-transform text-xs tracking-widest"
                  >
                    {isUnlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'UNLOCK'}
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {isGuardian && (
          <section className="animate-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <Badge className="bg-[#14F195]/10 text-[#14F195] border-[#14F195]/30 px-6 py-2 rounded-full font-black tracking-[0.3em] text-[10px]">
                <ShieldCheck className="h-4 w-4 mr-2" /> GUARDIAN STATUS VERIFIED
              </Badge>
            </div>
          </section>
        )}

        {isGuest && (
          <Card className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-[2.5rem] p-8 text-center space-y-4">
            <div className="flex justify-center"><Sparkles className="h-8 w-8 text-primary animate-pulse" /></div>
            <h2 className="text-xl font-headline font-black uppercase tracking-tight">Viewing as <span className="text-primary">Guest</span></h2>
            <p className="text-[16px] text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">Join the flock to unlock lineage records and receive direct rescue notifications.</p>
            <Button asChild className="bg-primary text-primary-foreground font-black px-8 rounded-xl h-14 shadow-lg hover:scale-105 transition-transform"><Link href="/signup">JOIN THE FLOCK</Link></Button>
          </Card>
        )}

        {/* EGG COUNTER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><Egg className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY HARVEST</h2></div>
            <Badge variant="outline" className="bg-[#14F195]/10 text-[#14F195] border-[#14F195]/30 px-4 py-1.5 rounded-full font-black tracking-widest text-[8px]">
              <Activity className="h-3 w-3 mr-2 animate-pulse" /> LIVE
            </Badge>
          </div>
          <Card className="bg-card border-border rounded-[2.5rem] p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-1">
              <h2 className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-primary">TODAY'S TOTAL</h2>
              <h3 className="text-8xl md:text-9xl font-headline font-black text-primary tracking-tighter leading-none">{todayEggData?.count || 0}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{format(new Date(), 'MMMM dd, yyyy')}</p>
            </div>
            <div className="text-center md:text-right max-w-[250px] space-y-4">
              <p className="text-[12px] text-muted-foreground uppercase font-black tracking-tight leading-relaxed">Real-time counts as staff complete the daily harvest.</p>
              <div className="flex justify-center md:justify-end gap-1.5">{[1,2,3,4].map(i => <div key={i} className="w-5 h-6 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
            </div>
          </Card>
        </section>

        {/* DAILY ROUTINE */}
        <section className="space-y-4">
          <div className="flex items-center gap-3"><ClipboardList className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY ROUTINE</h2></div>
          <Card className="bg-card border-border rounded-[2.5rem] p-6 shadow-xl space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase tracking-widest text-primary">Sanctuary Status</span><span className="text-2xl font-headline font-black text-primary">{Math.round(progress)}%</span></div>
              <Progress value={progress} className="h-4 bg-muted" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { label: "Feeding", icon: "🌾", key: "morningFeeding" },
                { label: "Fresh Water", icon: "💧", key: "freshWater" },
                { label: "Egg Counter", icon: "🥚", key: "eggCounter" },
                { label: "Health Check", icon: "🩺", key: "healthCheck" },
                { label: "Pen Up", icon: "🌙", key: "nightlyPenUp" }
              ].map((task) => (
                <div key={task.key} className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border h-[70px] md:h-auto md:flex-col md:gap-3",
                  dailyStatus?.[task.key as keyof DailyStatus] ? "bg-[#14F195]/5 border-[#14F195]/20 text-[#14F195]" : "bg-background/50 border-border text-muted-foreground"
                )}>
                  <div className="flex items-center gap-4 md:flex-col md:gap-2">
                    <span className="text-2xl">{task.icon}</span>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-center">{task.label}</Label>
                  </div>
                  <Switch checked={!!dailyStatus?.[task.key as keyof DailyStatus]} disabled className="scale-125 opacity-100" />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* VIBE BOARD */}
        <section className="space-y-4">
          <div className="flex items-center gap-3"><Zap className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">LIVE VIBE BOARD</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {foundingFour.map((bird) => {
              const lastUpdatedDate = bird.statusLastUpdated ? new Date(bird.statusLastUpdated) : null;
              const formattedTime = lastUpdatedDate && isDateValid(lastUpdatedDate) 
                ? format(lastUpdatedDate, 'h:mm a') 
                : 'Routine';

              return (
                <Card key={bird.id} className="bg-card border-border rounded-2xl p-5 flex items-center justify-between shadow-xl min-h-[80px]">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border shrink-0">
                      {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-xl">🦆</div>}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline font-black uppercase tracking-tight text-sm truncate">{bird.name}</h3>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase truncate">
                        {bird.statusLastUpdated ? `Updated ${formattedTime}` : 'Sanctuary Routine'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-2 min-w-[100px] justify-center text-primary border-primary/30 ml-2">
                    {bird.liveStatus || 'DAILY ROUTINE'}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </section>

        {/* RESIDENT DIRECTORY */}
        <section className="space-y-4 text-center">
          <div className="flex items-center gap-3"><Bird className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">RESIDENT DIRECTORY</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {birdsLoading ? [1,2,3].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-2xl" />) : birds?.map((bird) => (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-lg flex group relative min-h-[100px]">
                <div className="relative w-24 md:w-32 aspect-square overflow-hidden shrink-0 border-r border-border">
                  {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl bg-background">🦆</div>}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div><h3 className="font-headline font-black text-lg uppercase tracking-tight truncate">{bird.name}</h3><p className="text-[9px] text-muted-foreground uppercase font-black truncate">{bird.breed}</p></div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <StoryModal resident={bird} trigger={<Button variant="outline" size="sm" className="h-10 text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 rounded-lg">PROFILE</Button>} />
                    <Button asChild variant="outline" size="sm" className="h-10 text-[8px] font-black uppercase tracking-widest border-secondary/20 text-secondary hover:bg-secondary/5 rounded-lg">
                      <Link href={`/residents/${bird.id}/tree`}>
                        <GitBranch className="mr-1 h-3 w-3" /> TREE
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
