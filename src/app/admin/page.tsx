
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
  CalendarDays,
  TrendingUp,
  Award,
  Save,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, updateDoc, increment, deleteDoc, addDoc, getDocs, where, writeBatch, limit } from 'firebase/firestore';
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

const PRESET_VIBES = [
  { label: 'Chill', emoji: '🌿' },
  { label: 'Energetic', emoji: '⚡' },
  { label: 'Hungry', emoji: '🥨' },
  { label: 'Broody', emoji: '🪺' },
  { label: 'Sleepy', emoji: '💤' },
  { label: 'Vigilant', emoji: '🛡️' },
  { label: 'Vocal', emoji: '📢' },
];

const logoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/DDSlogo.png?alt=media";

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

  // Vibe Selection State
  const [vibeBird, setVibeBird] = useState<Resident | null>(null);

  const [missionInput, setMissionInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingEggs, setIsSavingEggs] = useState(false);
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const [localEggCount, setLocalEggCount] = useState(0);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const historyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'egg_history'), orderBy('id', 'desc'), limit(30));
  }, [firestore]);

  const todayEggRef = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return doc(firestore, 'egg_history', todayDate);
  }, [firestore, isAdmin, todayDate]);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore, isAdmin]);

  const dotmRef = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return doc(firestore, 'settings', 'duck_of_the_month');
  }, [firestore, isAdmin]);

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
    if (!isUserLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router, isAdmin]);

  const handleUpdateStatus = (birdId: string, status: string) => {
    if (!firestore) return;
    const birdRef = doc(firestore, 'birds', birdId);
    updateDocumentNonBlocking(birdRef, {
      liveStatus: status,
      statusLastUpdated: new Date().toISOString()
    });

    // If broody, auto-add a care log entry
    if (status.includes('BROODY')) {
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
    setVibeBird(null); // Auto-close modal
  };

  const handleUpdateDOTM = async (birdId: string, mission: string) => {
    if (!firestore) return;
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
    if (!firestore || !dotmSettings?.birdId) return;
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
    if (!firestore || !todayEggRef) return;
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
    if (!firestore) return;
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
    if (!dailyStatusRef) return;
    const newValue = dailyStatus ? !dailyStatus[taskKey] : true;
    setDocumentNonBlocking(dailyStatusRef, { [taskKey]: newValue }, { merge: true });
  };

  const resetDailyTasks = () => {
    if (!dailyStatusRef) return;
    setDocumentNonBlocking(dailyStatusRef, {
      morningFeeding: false, freshWater: false, eggCounter: false, healthCheck: false, nightlyPenUp: false,
      lastReset: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Checklist Reset" });
  };

  if (isUserLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const foundingFour = birds?.filter(b => b.isFoundingResident).sort((a,b) => a.name.localeCompare(b.name)) || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-body">
      <Navbar />
      <BlankCertificateTemplate logoUrl={logoUrl} />

      <main className="container mx-auto p-4 space-y-12 mt-4 no-print">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div className="space-y-1">
              <h1 className="font-headline font-black text-3xl uppercase tracking-tighter flex items-center gap-3">
                <LayoutDashboard className="h-7 w-7 text-primary" /> 
                MANAGER <span className="text-primary">PORTAL</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">DAILY OPERATIONS</p>
           </div>
        </div>

        {/* 1. EGG COUNTER */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Egg className="h-4 w-4 text-primary" />
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY HARVEST</h2>
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
            </div>
          </Card>
        </section>

        {/* 2. DAILY CHECK LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY ROUTINE</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={resetDailyTasks} className="text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
              <RotateCcw className="h-3 w-3 mr-1" /> Reset Day
            </Button>
          </div>
          <Card className="bg-card border-border rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Feeding", icon: "🌾", key: "morningFeeding" },
                { label: "Water", icon: "💧", key: "freshWater" },
                { label: "Eggs", icon: "🥚", key: "eggCounter" },
                { label: "Health", icon: "🩺", key: "healthCheck" },
                { label: "Pen Up", icon: "🌙", key: "nightlyPenUp" }
              ].map((task) => (
                <div key={task.key} className="flex flex-col items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border">
                  <span className="text-xl">{task.icon}</span>
                  <Label className="text-[8px] font-black uppercase tracking-tight text-center">{task.label}</Label>
                  <Switch 
                    checked={dailyStatus ? !!dailyStatus[task.key as keyof DailyStatus] : false}
                    onCheckedChange={() => toggleDailyTask(task.key as any)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 3. VIBE CHECK (Refactored for High-Performance Mobile) */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">LIVE VIBE CHECK</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foundingFour.map((bird) => {
              const isRecentlyUpdated = bird.statusLastUpdated && 
                isAfter(new Date(bird.statusLastUpdated), subMinutes(new Date(), 60));
              
              const isBroody = bird.liveStatus?.includes('BROODY');

              return (
                <Card 
                  key={bird.id} 
                  onClick={() => setVibeBird(bird)}
                  className={cn(
                    "bg-card border-border rounded-2xl p-5 flex items-center justify-between shadow-xl cursor-pointer hover:border-primary/50 transition-all group active:scale-95",
                    isRecentlyUpdated && "border-secondary/40 bg-secondary/5",
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
                        {bird.statusLastUpdated ? `Updated ${format(new Date(bird.statusLastUpdated), 'h:mm a')}` : 'Not checked today'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 border-border",
                      isRecentlyUpdated ? "bg-secondary text-secondary-foreground border-none" : "text-primary border-primary/30"
                    )}>
                      {bird.liveStatus || 'CHILL'}
                    </Badge>
                    {isRecentlyUpdated && <CheckCircle2 className="h-3 w-3 text-secondary" />}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 4. SHOWCASE DIRECTORY */}
        <section className="space-y-4">
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

        {/* 5. ADD NEW DUCK */}
        <section className="space-y-4">
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

        {/* 6. OVERALL FLOCK */}
        <section className="space-y-4">
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
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-[8px] font-black uppercase text-secondary hover:bg-secondary/10" onClick={() => { setLoggingResident(bird); setIsHealthLogOpen(true); }}>
                      <ClipboardList className="h-3 w-3 mr-1" /> LOG
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-[8px] font-black uppercase text-muted-foreground" onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}>
                      <Settings className="h-3 w-3 mr-1" /> EDIT
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="ghost" size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => { setDeletingResident(bird); setIsDeleteDialogOpen(true); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* 7. 30-DAY EGG HISTORY */}
        <section className="space-y-4">
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

        {/* 8. BLANK TEMPLATE */}
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
      </main>

      {/* VIBE SELECTION MODAL */}
      <Dialog open={!!vibeBird} onOpenChange={(open) => !open && setVibeBird(null)}>
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
            {/* Conditional Reordering: Females get Broody first */}
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
                <RotateCcw className="h-3.5 w-3.5" /> Clear Vibe
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
    </div>
  );
}

function BlankCertificateTemplate({ logoUrl }: { logoUrl: string }) {
  return (
    <div className="hidden print:block fixed inset-0 z-[100] bg-white text-black p-0 m-0">
      <div className="h-screen w-full flex items-center justify-center p-8 bg-white">
        <div className="relative w-full max-w-[1000px] aspect-[1.414/1] bg-white border-[12px] border-[#FFD700] rounded-[3rem] p-16 flex flex-col items-center justify-between text-center overflow-hidden">
          <Award className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] text-[#FFD700]/5 -rotate-12 pointer-events-none" />
          <div className="space-y-6 w-full">
            <div className="flex justify-center items-center gap-4">
              <ShieldCheck className="h-10 w-10 text-[#FFD700]" />
              <span className="text-[12px] font-bold uppercase tracking-[0.5em] text-gray-400">Official Sanctuary Document</span>
              <ShieldCheck className="h-10 w-10 text-[#FFD700]" />
            </div>
            <h2 className="text-5xl font-black uppercase tracking-[0.1em] border-y-4 border-[#FFD700]/20 py-8">Guardian Certificate</h2>
          </div>
          <div className="space-y-12 py-4 w-full">
            <p className="text-2xl font-medium text-gray-400 uppercase tracking-[0.3em]">This certifies that</p>
            <div className="border-b-4 border-[#FFD700] w-3/4 mx-auto pb-2"><span className="text-6xl font-black uppercase opacity-10">Guardian Name</span></div>
            <p className="text-3xl font-medium leading-relaxed max-w-2xl mx-auto">
              is an Official Guardian of <br /><span className="text-[#FFD700] text-5xl font-black uppercase">____________________</span> <br />
              <span className="text-xl text-gray-400 uppercase tracking-widest mt-4 block">For the 2026 Sanctuary Season</span>
            </p>
          </div>
          <div className="w-full flex justify-between items-center pt-16 border-t-2 border-gray-100">
            <div className="text-left space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sanctuary Seal</p>
              <div className="relative w-24 h-24"><Image src={logoUrl} alt="DDS Logo" fill className="object-contain" /></div>
            </div>
            <div className="flex-1 text-center italic text-gray-400 text-sm max-w-sm px-8">"Saving lives, one duck at a time. Your guardianship ensures safety and health."</div>
            <div className="text-right space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Serial No.</p>
               <p className="text-2xl font-black text-[#FFD700]">No. ____</p>
               <p className="text-[9px] font-bold text-gray-400 uppercase">DECENT DUCKS ORG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
