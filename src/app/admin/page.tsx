
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, Minus, Settings, Loader2, ChevronRight, ClipboardList, RotateCcw,
  LayoutDashboard, Trash2, Bird, Zap, Egg, Save, History, User, Activity, Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, addDoc, deleteDoc, limit } from 'firebase/firestore';
import { Resident, DailyStatus, EggHistoryEntry } from '@/lib/types';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { HealthLogDialog } from '@/components/admin/HealthLogDialog';
import { DeleteResidentDialog } from '@/components/admin/DeleteResidentDialog';
import { StoryModal } from '@/components/residents/StoryModal';
import { Navbar } from '@/components/layout/Navbar';
import { format, isAfter, subMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const isUserAdmin = !!(user && ADMIN_EMAILS.includes(user.email || ''));
  const isGuest = !!(user?.isAnonymous);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isHealthLogOpen, setIsHealthLogOpen] = useState(false);
  const [loggingResident, setLoggingResident] = useState<Resident | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);
  const [vibeBird, setVibeBird] = useState<Resident | null>(null);
  const [isSavingEggs, setIsSavingEggs] = useState(false);
  const [localEggCount, setLocalEggCount] = useState(0);
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Data queries
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const todayEggRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'egg_history', todayDate);
  }, [firestore, todayDate]);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore]);

  // Restricted queries (Admin Only)
  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collection(firestore, 'egg_history'), orderBy('id', 'desc'), limit(30));
  }, [firestore, isUserAdmin]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: eggHistory } = useCollection<EggHistoryEntry>(historyQuery);
  const { data: todayEggData } = useDoc<EggHistoryEntry>(todayEggRef);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  useEffect(() => {
    if (todayEggData) {
      setLocalEggCount(todayEggData.count);
    }
  }, [todayEggData]);

  // Actions
  const handleUpdateStatus = (birdId: string, status: string) => {
    if (!firestore || !isUserAdmin) return;
    const birdRef = doc(firestore, 'birds', birdId);
    updateDocumentNonBlocking(birdRef, {
      liveStatus: status || "",
      statusLastUpdated: status ? new Date().toISOString() : null
    });
    toast({ title: status ? "Status Updated" : "Status Cleared" });
    setVibeBird(null);
  };

  const handleSyncEggs = async () => {
    if (!firestore || !todayEggRef || !isUserAdmin) return;
    setIsSavingEggs(true);
    try {
      await setDoc(todayEggRef, { count: localEggCount, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: "Eggs Synced!", description: `${localEggCount} recorded.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Error" });
    } finally { setIsSavingEggs(false); }
  };

  const toggleDailyTask = (taskKey: keyof Omit<DailyStatus, 'id' | 'lastReset'>) => {
    if (!dailyStatusRef || !isUserAdmin) return;
    const newValue = dailyStatus ? !dailyStatus[taskKey] : true;
    setDoc(dailyStatusRef, { [taskKey]: newValue }, { merge: true });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const foundingFour = birds?.filter(b => b.isFoundingResident).sort((a,b) => a.name.localeCompare(b.name)) || [];
  const progress = dailyStatus ? (['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'].filter(t => !!(dailyStatus as any)[t]).length / 5) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-body">
      <Navbar />

      <main className="container mx-auto p-4 space-y-12 mt-4">
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-black text-3xl uppercase tracking-tighter flex items-center gap-3">
                  <LayoutDashboard className="h-7 w-7 text-primary" /> 
                  {isUserAdmin ? "MANAGER" : "SANCTUARY"} <span className="text-primary">{isUserAdmin ? "PORTAL" : "PULSE"}</span>
                </h1>
                <Badge variant={isUserAdmin ? "default" : "outline"} className={cn(
                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ml-2",
                  isUserAdmin ? "bg-primary text-primary-foreground" : "border-secondary text-secondary"
                )}>
                  {isUserAdmin ? "Admin" : isGuest ? "Guest" : "Flock Member"}
                </Badge>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                {isUserAdmin ? "SANCTUARY OPERATIONS" : "LIVE SANCTUARY FEED"}
              </p>
           </div>

           {user && !isGuest && (
             <Card className="bg-card border-border rounded-2xl p-4 flex items-center gap-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest block">
                      {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Staff'}
                    </Label>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">
                      {isUserAdmin ? 'Operational Control' : 'Active Member'}
                    </p>
                  </div>
                </div>
             </Card>
           )}
        </div>

        {/* GUEST BANNER */}
        {isGuest && (
          <Card className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-3xl p-8 text-center space-y-4 animate-in fade-in duration-700">
            <div className="flex justify-center"><Sparkles className="h-8 w-8 text-primary animate-pulse" /></div>
            <h2 className="text-xl font-headline font-black uppercase">Viewing as a <span className="text-primary">Guest</span></h2>
            <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">You're seeing the live sanctuary pulse! Sign up to save your favorite ducks and unlock the lineage records.</p>
            <Button asChild className="bg-primary text-primary-foreground font-black px-8 rounded-xl h-12 shadow-lg">
              <Link href="/signup">JOIN THE FLOCK</Link>
            </Button>
          </Card>
        )}

        {/* EGG COUNTER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Egg className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY HARVEST</h2>
            </div>
            {!isUserAdmin && (
              <Badge variant="outline" className="bg-[#14F195]/10 text-[#14F195] border-[#14F195]/30 px-4 py-1 rounded-full font-black tracking-widest text-[8px]">
                <Activity className="h-3 w-3 mr-2 animate-pulse" /> LIVE FEED
              </Badge>
            )}
          </div>
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left space-y-1">
                <h2 className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-primary">TODAY'S TOTAL</h2>
                <h3 className="text-7xl font-headline font-black text-primary tracking-tighter leading-none">{localEggCount}</h3>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{format(new Date(), 'MMMM dd, yyyy')}</p>
              </div>
              
              {isUserAdmin ? (
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <div className="flex gap-4">
                    <Button onClick={() => setLocalEggCount(Math.max(0, localEggCount - 1))} variant="outline" className="flex-1 md:w-20 h-20 rounded-2xl border-2 border-border"><Minus /></Button>
                    <Button onClick={() => setLocalEggCount(localEggCount + 1)} className="flex-1 md:w-20 h-20 rounded-2xl bg-primary text-primary-foreground shadow-lg"><Plus /></Button>
                  </div>
                  <Button onClick={handleSyncEggs} disabled={isSavingEggs} className="w-full bg-secondary text-secondary-foreground font-black rounded-xl h-12 shadow-lg flex items-center justify-center gap-2">
                    {isSavingEggs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} SAVE
                  </Button>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter text-center md:text-right max-w-[200px]">Updated by sanctuary staff in real-time as eggs are harvested.</p>
              )}
            </div>
          </Card>
        </section>

        {/* DAILY ROUTINE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY ROUTINE</h2>
            </div>
          </div>
          <Card className="bg-card border-border rounded-2xl p-6 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sanctuary Health</span>
                <span className="text-2xl font-headline font-black text-primary leading-none">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-muted" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Feeding", icon: "🌾", key: "morningFeeding" },
                { label: "Water", icon: "💧", key: "freshWater" },
                { label: "Eggs", icon: "🥚", key: "eggCounter" },
                { label: "Health", icon: "🩺", key: "healthCheck" },
                { label: "Pen Up", icon: "🌙", key: "nightlyPenUp" }
              ].map((task) => {
                const isCompleted = dailyStatus ? !!dailyStatus[task.key as keyof DailyStatus] : false;
                return (
                  <div key={task.key} className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-colors",
                    isCompleted ? "bg-[#14F195]/5 border-[#14F195]/20 text-[#14F195]" : "bg-background/50 border-border text-muted-foreground"
                  )}>
                    <span className="text-xl">{task.icon}</span>
                    <Label className="text-[8px] font-black uppercase tracking-tight text-center">{task.label}</Label>
                    <Switch checked={isCompleted} disabled={!isUserAdmin} onCheckedChange={() => toggleDailyTask(task.key as any)} />
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* VIBE BOARD */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">LIVE VIBE BOARD</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foundingFour.map((bird) => {
              const isRecentlyUpdated = bird.statusLastUpdated && isAfter(new Date(bird.statusLastUpdated), subMinutes(new Date(), 60));
              const hasVibe = !!bird.liveStatus;
              return (
                <Card key={bird.id} onClick={() => isUserAdmin && setVibeBird(bird)} className={cn(
                  "bg-card border-border rounded-2xl p-5 flex items-center justify-between shadow-xl transition-all group",
                  isUserAdmin && "cursor-pointer hover:border-primary/50",
                  (hasVibe && isRecentlyUpdated) && "border-secondary/40 bg-secondary/5"
                )}>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border">
                      {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-xl">🦆</div>}
                    </div>
                    <div>
                      <h3 className="font-headline font-black uppercase tracking-tight text-sm">{bird.name}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {bird.statusLastUpdated ? `Updated ${format(new Date(bird.statusLastUpdated), 'h:mm a')}` : 'Sanctuary Routine'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 min-w-[120px] justify-center",
                    (hasVibe && isRecentlyUpdated) ? "bg-secondary text-secondary-foreground border-none" : "text-primary border-primary/30"
                  )}>
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
            <div className="flex items-center gap-3">
              <Bird className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">RESIDENT DIRECTORY</h2>
            </div>
            {isUserAdmin && (
              <Button onClick={() => { setEditingResident(null); setIsDialogOpen(true); }} className="bg-primary/10 text-primary border border-primary/20 h-8 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest">
                <Plus className="h-3 w-3 mr-1" /> ADD BIRD
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {birdsLoading ? (
              [1,2,3].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-2xl" />)
            ) : birds?.map((bird) => (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-lg flex group relative">
                <div className="relative w-24 aspect-square overflow-hidden shrink-0 border-r border-border">
                  {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl bg-background">🦆</div>}
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-headline font-black text-lg uppercase tracking-tight truncate">{bird.name}</h3>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-black truncate">{bird.breed}</p>
                  </div>
                  <div className="flex gap-2">
                    {isUserAdmin ? (
                      <>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[8px] font-black uppercase text-secondary hover:bg-secondary/10" onClick={() => { setLoggingResident(bird); setIsHealthLogOpen(true); }}>LOG</Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}>EDIT</Button>
                      </>
                    ) : (
                      <StoryModal resident={bird} trigger={
                        <Button variant="outline" size="sm" className="w-full h-8 px-2 text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">
                          VIEW PROFILE <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      } />
                    )}
                  </div>
                </div>
                {isUserAdmin && (
                  <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => { setDeletingResident(bird); setIsDeleteDialogOpen(true); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* MODALS */}
      {isUserAdmin && (
        <>
          <Dialog open={!!vibeBird} onOpenChange={(open) => !open && setVibeBird(null)}>
            <DialogContent className="bg-card text-card-foreground border-border max-w-sm rounded-[2.5rem] p-0 overflow-hidden">
              <DialogHeader className="p-8 bg-primary/5 border-b border-border">
                <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tighter">SET <span className="text-primary">VIBE</span></DialogTitle>
              </DialogHeader>
              <div className="p-6 grid grid-cols-2 gap-3">
                {PRESET_VIBES.map((vibe) => (
                  <Button key={vibe.label} variant="outline" className="h-[80px] rounded-[1.5rem] flex flex-col items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground group" onClick={() => vibeBird && handleUpdateStatus(vibeBird.id, `${vibe.emoji} ${vibe.label.toUpperCase()}`)}>
                    <span className="text-3xl group-hover:scale-110 transition-transform">{vibe.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{vibe.label}</span>
                  </Button>
                ))}
              </div>
              <div className="px-6 pb-8 space-y-3">
                <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground" onClick={() => vibeBird && handleUpdateStatus(vibeBird.id, "")}>RESET</Button>
                <Button variant="ghost" onClick={() => setVibeBird(null)} className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Cancel</Button>
              </div>
            </DialogContent>
          </Dialog>

          <ResidentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={(data) => {
            if (!firestore) return;
            if (editingResident) {
              setDoc(doc(firestore, 'birds', editingResident.id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
              toast({ title: "Updated" });
            } else {
              const newId = (data.name || 'bird').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
              setDoc(doc(firestore, 'birds', newId), { ...data, id: newId, createdAt: new Date().toISOString() }, { merge: true });
              toast({ title: "Added" });
            }
            setIsDialogOpen(false);
          }} resident={editingResident} />
          <HealthLogDialog 
            open={isHealthLogOpen} onOpenChange={setIsHealthLogOpen} 
            onSave={async (notes) => {
              if (!firestore || !loggingResident) return;
              await addDoc(collection(firestore, 'birds', loggingResident.id, 'healthLogs'), { birdId: loggingResident.id, logDate: new Date().toISOString(), notes });
              toast({ title: "Log Saved" });
              setIsHealthLogOpen(false);
            }} 
            residentName={loggingResident?.name || ''} 
          />
          <DeleteResidentDialog
            open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} resident={deletingResident}
            offspringCount={birds?.filter(b => b.motherId === deletingResident?.id || b.fatherId === deletingResident?.id).length || 0}
            onConfirm={async () => {
              if (!firestore || !deletingResident) return;
              await deleteDoc(doc(firestore, 'birds', deletingResident.id));
              toast({ title: "Removed" });
            }}
          />
        </>
      )}
    </div>
  );
}
