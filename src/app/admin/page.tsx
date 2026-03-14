
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Minus,
  Settings, 
  Loader2, 
  ChevronRight,
  ClipboardList,
  RotateCcw,
  LayoutDashboard,
  Trash2,
  Bird,
  Zap,
  Sparkles,
  Trophy,
  Download,
  ShieldCheck,
  Egg,
  Send,
  History,
  Save,
  CheckCircle2,
  Clock,
  Eye,
  User,
  Activity,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, updateDoc, deleteDoc, addDoc, getDocs, where, writeBatch, limit, serverTimestamp } from 'firebase/firestore';
import { Resident, DailyStatus, DuckOfTheMonthSettings, EggHistoryEntry } from '@/lib/types';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { HealthLogDialog } from '@/components/admin/HealthLogDialog';
import { DeleteResidentDialog } from '@/components/admin/DeleteResidentDialog';
import { Navbar } from '@/components/layout/Navbar';
import { format, parseISO, isAfter, subMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const ADMIN_EMAILS = ['decentducksorg@gmail.com', 'flowmarket1@gmail.com'];
const MASTER_UID = 'cgQheQMuxqZd4N825PppPl72GtE2';

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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  
  const [isHealthLogOpen, setIsHealthLogOpen] = useState(false);
  const [loggingResident, setLoggingResident] = useState<Resident | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);

  const [vibeBird, setVibeBird] = useState<Resident | null>(null);
  const [missionInput, setMissionInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingEggs, setIsSavingEggs] = useState(false);
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const isAdmin = user && (ADMIN_EMAILS.includes(user.email || '') || user.uid === MASTER_UID);

  const [localEggCount, setLocalEggCount] = useState(0);

  // Force Admin Sync for Master Account
  useEffect(() => {
    if (user?.uid === MASTER_UID && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: 'admin',
        isAdmin: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  }, [user, firestore]);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const historyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'egg_history'), orderBy('id', 'desc'), limit(30));
  }, [firestore]);

  const todayEggRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'egg_history', todayDate);
  }, [firestore, todayDate]);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore]);

  const dotmRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'duck_of_the_month');
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: eggHistory } = useCollection<EggHistoryEntry>(historyQuery);
  const { data: todayEggData } = useDoc<EggHistoryEntry>(todayEggRef);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);
  const { data: dotmSettings } = useDoc<DuckOfTheMonthSettings>(dotmRef);

  useEffect(() => {
    if (dotmSettings?.monthlyMission) {
      setMissionInput(dotmSettings.monthlyMission);
    }
  }, [dotmSettings?.monthlyMission]);

  useEffect(() => {
    if (todayEggData) {
      setLocalEggCount(todayEggData.count);
    }
  }, [todayEggData]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleUpdateStatus = (birdId: string, status: string) => {
    if (!firestore || !isAdmin) return;
    const birdRef = doc(firestore, 'birds', birdId);
    
    updateDocumentNonBlocking(birdRef, {
      liveStatus: status || "",
      statusLastUpdated: status ? new Date().toISOString() : null
    });

    if (status && status.includes('BROODY')) {
      addDoc(collection(firestore, 'birds', birdId, 'healthLogs'), {
        birdId,
        logDate: new Date().toISOString(),
        notes: "Automated Log: Resident marked as BROODY during daily vibe check."
      });
    }

    toast({ 
      title: status ? "Status Updated" : "Status Cleared", 
      description: status ? `Vibe set to: ${status}` : "Resident status has been reset."
    });
    setVibeBird(null);
  };

  const handleUpdateDOTM = async (birdId: string, mission: string) => {
    if (!firestore || !isAdmin) return;
    try {
      await setDoc(doc(firestore, 'settings', 'duck_of_the_month'), {
        birdId,
        monthlyMission: mission,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Spotlight Data Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handlePublishDOTM = async () => {
    if (!firestore || !dotmSettings?.birdId || !isAdmin) return;
    setIsPublishing(true);
    try {
      const batch = writeBatch(firestore);
      const featuredQuery = query(collection(firestore, 'birds'), where('isFeatured', '==', true));
      const featuredDocs = await getDocs(featuredQuery);
      featuredDocs.forEach(d => {
        batch.update(d.ref, { isFeatured: false });
      });
      const birdRef = doc(firestore, 'birds', dotmSettings.birdId);
      batch.update(birdRef, { 
        isFeatured: true,
        updatedAt: new Date().toISOString() 
      });
      await batch.commit();
      toast({ title: "Spotlight Published!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Publish Failed" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSyncEggs = async () => {
    if (!firestore || !todayEggRef || !isAdmin) return;
    setIsSavingEggs(true);
    try {
      await setDoc(todayEggRef, {
        count: localEggCount,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ 
        title: "Eggs Synced!", 
        description: `${localEggCount} eggs recorded for ${format(new Date(), 'MMM dd')}` 
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message });
    } finally {
      setIsSavingEggs(false);
    }
  };

  const handleSaveResident = (data: Partial<Resident>) => {
    if (!firestore || !isAdmin) return;
    if (editingResident) {
      updateDocumentNonBlocking(doc(firestore, 'birds', editingResident.id), { ...data, updatedAt: new Date().toISOString() });
      toast({ title: "Resident Updated" });
    } else {
      const newId = (data.name || 'bird').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      setDocumentNonBlocking(doc(firestore, 'birds', newId), {
        ...data,
        id: newId,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      toast({ title: "Resident Added" });
    }
    setIsDialogOpen(false);
  };

  const toggleDailyTask = (taskKey: keyof Omit<DailyStatus, 'id' | 'lastReset'>) => {
    if (!dailyStatusRef || !isAdmin) return;
    const newValue = dailyStatus ? !dailyStatus[taskKey] : true;
    setDocumentNonBlocking(dailyStatusRef, { [taskKey]: newValue }, { merge: true });
  };

  const resetDailyTasks = () => {
    if (!dailyStatusRef || !isAdmin) return;
    setDocumentNonBlocking(dailyStatusRef, {
      morningFeeding: false, freshWater: false, eggCounter: false, healthCheck: false, nightlyPenUp: false,
      lastReset: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Checklist Reset" });
  };

  const calculateProgress = () => {
    if (!dailyStatus) return 0;
    const tasks = ['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'];
    const completed = tasks.filter(t => !!(dailyStatus as any)[t]).length;
    return (completed / tasks.length) * 100;
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const foundingFour = birds?.filter(b => b.isFoundingResident).sort((a,b) => a.name.localeCompare(b.name)) || [];
  const progress = calculateProgress();

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
                  {isAdmin ? "MANAGER" : "SANCTUARY"} <span className="text-primary">{isAdmin ? "PORTAL" : "PULSE"}</span>
                </h1>
                <Badge variant={isAdmin ? "default" : "outline"} className={cn(
                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ml-2",
                  isAdmin ? "bg-primary text-primary-foreground" : "border-secondary text-secondary"
                )}>
                  {isAdmin ? "Admin" : "Flock Member"}
                </Badge>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                {isAdmin ? "SANCTUARY OPERATIONS" : "LIVE SANCTUARY FEED"}
              </p>
           </div>

           {user && (
             <Card className="bg-card border-border rounded-2xl p-4 flex items-center gap-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest block">
                      {isAdmin ? 'Admin:' : 'Member:'} {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Staff'}
                    </Label>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">
                      {isAdmin ? 'Managing Operations' : 'Sanctuary Pulse View'}
                    </p>
                  </div>
                </div>
             </Card>
           )}
        </div>

        {/* 1. EGG COUNTER */}
        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Egg className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY HARVEST</h2>
            </div>
            {!isAdmin && (
              <div className="flex items-center gap-2 text-[#14F195]">
                <Activity className="h-3 w-3 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">Live Harvest Feed</span>
              </div>
            )}
          </div>
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left space-y-1">
                <h2 className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-primary">
                  TODAY'S TOTAL
                </h2>
                <h3 className="text-7xl font-headline font-black text-primary tracking-tighter leading-none">{localEggCount}</h3>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{format(new Date(), 'MMMM dd, yyyy')}</p>
              </div>
              
              {isAdmin ? (
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setLocalEggCount(Math.max(0, localEggCount - 1))}
                      variant="outline" 
                      className="flex-1 md:w-20 h-20 rounded-2xl border-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                    >
                      <Minus className="h-7 w-7" />
                    </Button>
                    <Button 
                      onClick={() => setLocalEggCount(localEggCount + 1)}
                      className="flex-1 md:w-20 h-20 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                    >
                      <Plus className="h-7 w-7" />
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSyncEggs}
                    disabled={isSavingEggs || localEggCount === todayEggData?.count}
                    className="w-full bg-secondary text-secondary-foreground font-black rounded-xl h-12 shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSavingEggs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    SAVE FOR TODAY
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Badge variant="outline" className="bg-[#14F195]/10 text-[#14F195] border-[#14F195]/30 px-6 py-2 rounded-full font-black tracking-widest">
                    <Activity className="h-3 w-3 mr-2 animate-pulse" /> LIVE FEED
                  </Badge>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Updated by sanctuary staff in real-time</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* 2. DAILY CHECK LIST */}
        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY ROUTINE</h2>
            </div>
            {isAdmin ? (
              <Button variant="ghost" size="sm" onClick={resetDailyTasks} className="text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Day
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-3 w-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Verified Care Status</span>
              </div>
            )}
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
                    <div className="h-6 flex items-center justify-center">
                      <Switch 
                        checked={isCompleted}
                        disabled={!isAdmin}
                        onCheckedChange={() => toggleDailyTask(task.key as any)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* 3. VIBE CHECK */}
        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">LIVE VIBE BOARD</h2>
            </div>
            {!isAdmin && (
              <div className="flex items-center gap-2 text-secondary">
                <Activity className="h-3 w-3 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">Real-time Broadcast</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foundingFour.map((bird) => {
              const isRecentlyUpdated = bird.statusLastUpdated && 
                isAfter(new Date(bird.statusLastUpdated), subMinutes(new Date(), 60));
              
              const isBroody = bird.liveStatus?.includes('BROODY');
              const hasVibe = !!bird.liveStatus;

              return (
                <Card 
                  key={bird.id} 
                  onClick={() => isAdmin && setVibeBird(bird)}
                  className={cn(
                    "bg-card border-border rounded-2xl p-5 flex items-center justify-between shadow-xl transition-all group",
                    isAdmin && "cursor-pointer hover:border-primary/50 active:scale-95",
                    (hasVibe && isRecentlyUpdated) && "border-secondary/40 bg-secondary/5",
                    isBroody && "border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                      {bird.primaryImageUrl ? (
                        <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-xl">🦆</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline font-black uppercase tracking-tight text-sm">{bird.name}</h3>
                        {isBroody && <span className="text-lg" title="Broody Hen">🪺</span>}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {bird.statusLastUpdated ? `Updated ${format(new Date(bird.statusLastUpdated), 'h:mm a')}` : 'Sanctuary Routine'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 border-border whitespace-nowrap min-w-[120px] justify-center",
                      (hasVibe && isRecentlyUpdated) ? "bg-secondary text-secondary-foreground border-none" : "text-primary border-primary/30"
                    )}>
                      {bird.liveStatus || 'DAILY ROUTINE'}
                    </Badge>
                    <div className="h-3 flex items-center justify-end w-full">
                      {(hasVibe && isRecentlyUpdated) && <CheckCircle2 className="h-3 w-3 text-secondary" />}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 4. SHOWCASE DIRECTORY (Admin Only) */}
        {isAdmin && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">HOMEPAGE SPOTLIGHT</h2>
            </div>
            <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Resident</Label>
                  <Select 
                    value={dotmSettings?.birdId || ""} 
                    onValueChange={(val) => handleUpdateDOTM(val, dotmSettings?.monthlyMission || "")}
                  >
                    <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                      <SelectValue placeholder="Select bird..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {birds?.map(bird => (
                        <SelectItem key={bird.id} value={bird.id}>{bird.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Mission</Label>
                  <Input 
                    placeholder="e.g. Treat Fund goal..."
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
                    onBlur={(e) => handleUpdateDOTM(dotmSettings?.birdId || "", e.target.value)}
                    className="h-11 bg-background border-border rounded-xl text-xs"
                  />
                </div>
                <Button 
                  className="bg-primary text-primary-foreground font-black h-11 rounded-xl shadow-lg flex items-center justify-center gap-2"
                  disabled={!dotmSettings?.birdId || isPublishing}
                  onClick={handlePublishDOTM}
                >
                  {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  PUBLISH SPOTLIGHT
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* 5. ADD NEW DUCK (Admin Only) */}
        {isAdmin && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
            <div className="flex items-center gap-3">
              <Bird className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">FLOCK MANAGEMENT</h2>
            </div>
            <Card className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-black uppercase tracking-tight text-sm">New Resident</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Register Rescue or Lineage</p>
                </div>
              </div>
              <Button onClick={() => { setEditingResident(null); setIsDialogOpen(true); }} className="w-full md:w-auto bg-primary text-primary-foreground font-black rounded-xl h-12 px-12 shadow-lg">
                ADD BIRD
              </Button>
            </Card>
          </section>
        )}

        {/* 6. OVERALL FLOCK */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Bird className="h-4 w-4 text-primary" />
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">RESIDENT DIRECTORY</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {birdsLoading ? (
              [1,2,3].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-2xl" />)
            ) : birds?.map((bird) => (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-lg flex group relative">
                <div className="relative w-24 aspect-square overflow-hidden shrink-0 border-r border-border">
                  {bird.primaryImageUrl ? (
                    <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-background">🦆</div>
                  )}
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-black text-lg uppercase tracking-tight truncate">{bird.name}</h3>
                      {bird.liveStatus?.includes('BROODY') && <span title="Broody Hen">🪺</span>}
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-black truncate">{bird.breed}</p>
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-[8px] font-black uppercase text-secondary hover:bg-secondary/10" onClick={() => { setLoggingResident(bird); setIsHealthLogOpen(true); }}>
                        <ClipboardList className="h-3 w-3 mr-1" /> LOG
                      </Button>
                    )}
                    <Button asChild variant={isAdmin ? "ghost" : "outline"} size="sm" className={cn(
                      "h-8 px-2 text-[8px] font-black uppercase tracking-widest",
                      isAdmin ? "text-muted-foreground" : "w-full mt-2"
                    )} onClick={() => {
                      if (isAdmin) {
                        setEditingResident(bird); 
                        setIsDialogOpen(true);
                      }
                    }}>
                      {isAdmin ? (
                        <span><Settings className="h-3 w-3 mr-1 inline" /> EDIT</span>
                      ) : (
                        <Link href={`/residents/${bird.id}`}>VIEW PROFILE <ChevronRight className="ml-1 h-3 w-3 inline" /></Link>
                      )}
                    </Button>
                  </div>
                </div>
                {isAdmin && (
                  <Button 
                    variant="ghost" size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => { setDeletingResident(bird); setIsDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* 7. 30-DAY EGG HISTORY (Admin Only) */}
        {isAdmin && (
          <section className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
              <History className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">30-DAY HISTORY</h2>
            </div>
            <Card className="bg-card border-border rounded-3xl p-6 overflow-hidden shadow-xl">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                  {eggHistory && eggHistory.length > 0 ? (
                    eggHistory.map((entry) => (
                      <div key={entry.id} className="flex flex-col items-center gap-2 min-w-[80px] p-3 bg-background/50 rounded-2xl border border-border relative group">
                        <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                          {format(parseISO(entry.id), 'MMM dd')}
                        </div>
                        <div className="text-xl font-headline font-black text-primary">{entry.count}</div>
                        {entry.count > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#14F195] shadow-[0_0_8px_#14F195]" title="Productive Day" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">No history recorded yet.</p>
                    </div>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Card>
          </section>
        )}

        {/* 8. SUPPORTER ASSETS (Admin Only) */}
        {isAdmin && (
          <section className="pt-8 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">SUPPORTER ASSETS</h2>
            </div>
            <Card className="bg-card border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-headline font-black uppercase tracking-tight">Blank Certificate Template</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export high-resolution "2026 Season" certificates with blank fields for physical events or manual personalization.
                </p>
              </div>
              <Button onClick={() => window.print()} className="bg-primary text-primary-foreground font-black rounded-xl h-12 px-8 shadow-lg shrink-0">
                <Download className="h-4 w-4 mr-2" /> EXPORT BLANK TEMPLATE
              </Button>
            </Card>
          </section>
        )}
      </main>

      {/* VIBE SELECTION MODAL */}
      <Dialog open={!!vibeBird && isAdmin} onOpenChange={(open) => !open && setVibeBird(null)}>
        <DialogContent className="bg-card text-card-foreground border-border max-w-sm rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-primary/5 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary shadow-lg">
                {vibeBird?.primaryImageUrl && <Image src={vibeBird.primaryImageUrl} alt={vibeBird.name} fill className="object-cover" />}
              </div>
              <div>
                <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tighter">
                  SET <span className="text-primary">VIBE</span>
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Updating {vibeBird?.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 grid grid-cols-2 gap-3">
            {PRESET_VIBES
              .sort((a, b) => {
                if (vibeBird?.sex === 'female' && a.label === 'Broody') return -1;
                if (vibeBird?.sex === 'female' && b.label === 'Broody') return 1;
                return 0;
              })
              .map((vibe) => (
              <Button
                key={vibe.label}
                variant="outline"
                className={cn(
                  "h-[80px] rounded-[1.5rem] border-border flex flex-col items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95 group",
                  vibe.label === 'Broody' && vibeBird?.sex === 'female' && "border-primary/40 bg-primary/5"
                )}
                onClick={() => vibeBird && handleUpdateStatus(vibeBird.id, `${vibe.emoji} ${vibe.label.toUpperCase()}`)}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{vibe.emoji}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{vibe.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="px-6 pb-2">
             <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center justify-center gap-2"
                onClick={() => vibeBird && handleUpdateStatus(vibeBird.id, "")}
             >
                <RotateCcw className="h-3.5 w-3.5" /> Reset to Daily Routine
             </Button>
          </div>

          <div className="px-6 pb-8">
            <Button 
              variant="ghost" 
              onClick={() => setVibeBird(null)} 
              className="w-full text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-destructive"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <>
          <ResidentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveResident} resident={editingResident} />
          <HealthLogDialog 
            open={isHealthLogOpen} onOpenChange={setIsHealthLogOpen} 
            onSave={async (notes) => {
              if (!firestore || !loggingResident) return;
              await addDoc(collection(firestore, 'birds', loggingResident.id, 'healthLogs'), {
                birdId: loggingResident.id, logDate: new Date().toISOString(), notes,
              });
              toast({ title: "Care Log Saved" });
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
              toast({ title: "Resident Removed" });
            }}
          />
        </>
      )}
    </div>
  );
}
