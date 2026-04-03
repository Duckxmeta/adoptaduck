
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Bird, 
  Zap,  
  ShieldCheck, 
  Egg, 
  Save, 
  Megaphone, 
  Star,
  Wallet, 
  Database,
  Trash2,
  Edit3,
  Plus,
  Heart,
  TrendingUp,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, addDoc, deleteDoc, where, updateDoc, writeBatch } from 'firebase/firestore';
import { Resident, DailyStatus, Expense, NamingRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { DeleteResidentDialog } from '@/components/admin/DeleteResidentDialog';
import { ExpenseDialog } from '@/components/admin/ExpenseDialog';
import { Navbar } from '@/components/layout/Navbar';
import { format } from 'date-fns';
import { getResidentName } from '@/lib/utils';

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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return <ManagerPortal user={user} />;
}

function ManagerPortal({ user }: { user: any }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isResidentDialogOpen, setIsResidentDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isSavingEggs, setIsSavingEggs] = useState(false);
  const [localEggCount, setLocalEggCount] = useState(0);
  const [todayDate, setTodayDate] = useState<string>('');

  useEffect(() => {
    setTodayDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  // QUERIES
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore]);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'));
  }, [firestore]);

  const namingQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'naming_requests'), where('status', '==', 'pending'));
  }, [firestore]);

  const todayEggRef = useMemoFirebase(() => {
    if (!firestore || !todayDate) return null;
    return doc(firestore, 'egg_history', todayDate);
  }, [firestore, todayDate]);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: expenses } = useCollection<Expense>(expensesQuery);
  const { data: namingRequests } = useCollection<NamingRequest>(namingQuery);
  const { data: todayEggData } = useDoc<any>(todayEggRef);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  useEffect(() => {
    if (todayEggData) setLocalEggCount(todayEggData.count);
  }, [todayEggData]);

  // HANDLERS
  const handleUpdateStatus = (birdId: string, status: string) => {
    if (!firestore) return;
    const birdRef = doc(firestore, 'birds', birdId);
    updateDoc(birdRef, {
      liveStatus: status || "",
      statusLastUpdated: status ? new Date().toISOString() : null
    });
    toast({ title: "Vibe Updated" });
  };

  const handleSyncEggs = async () => {
    if (!todayEggRef) return;
    setIsSavingEggs(true);
    try {
      await setDoc(todayEggRef, { count: localEggCount, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: "Eggs Synced!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Error" });
    } finally { setIsSavingEggs(false); }
  };

  const toggleDailyTask = (taskKey: keyof Omit<DailyStatus, 'id' | 'lastReset'>) => {
    if (!dailyStatusRef) return;
    const newValue = dailyStatus ? !dailyStatus[taskKey] : true;
    setDoc(dailyStatusRef, { [taskKey]: newValue }, { merge: true });
  };

  const handleApproveRequest = async (req: NamingRequest) => {
    if (!firestore) return;
    try {
      const batch = writeBatch(firestore);
      const birdRef = doc(firestore, 'birds', req.birdId);
      const reqRef = doc(firestore, 'naming_requests', req.id);

      batch.update(birdRef, { name: req.suggestedName, updatedAt: new Date().toISOString() });
      batch.update(reqRef, { status: 'approved', updatedAt: new Date().toISOString() });

      await batch.commit();
      toast({ title: "Name Approved!", description: `Renamed to ${req.suggestedName}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'naming_requests', requestId), {
        status: 'denied',
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Request Denied" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleSaveResident = async (data: Partial<Resident>) => {
    if (!firestore) return;
    try {
      if (editingResident) {
        const birdRef = doc(firestore, 'birds', editingResident.id);
        await updateDoc(birdRef, { ...data, updatedAt: new Date().toISOString() });
        toast({ title: "Resident Updated" });
      } else {
        await addDoc(collection(firestore, 'birds'), { ...data, createdAt: new Date().toISOString() });
        toast({ title: "New Resident Added" });
      }
      setIsResidentDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  if (birdsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-primary font-black uppercase tracking-[0.3em] text-xs">Loading Sanctuary Ops...</div>;
  }

  const routineProgress = dailyStatus ? (['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'].filter(t => !!(dailyStatus as any)[t]).length / 5) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <Navbar />
      <main className="container mx-auto p-4 space-y-12 mt-8">
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <h1 className="font-headline font-black text-2xl uppercase tracking-tighter">MANAGER PORTAL</h1>
          <Badge className="bg-primary text-primary-foreground font-black">ADMIN</Badge>
        </div>

        {/* 1. PENDING NAME REQUESTS */}
        <section className="space-y-4">
          <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-secondary flex items-center gap-2">
            <Heart className="h-4 w-4" /> Pending Name Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {namingRequests && namingRequests.length > 0 ? namingRequests.map((req) => (
              <Card key={req.id} className="bg-card p-6 border-border border-2 rounded-2xl flex flex-col justify-between space-y-4 shadow-lg">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Suggestion for {req.birdName || "Resident"}</p>
                  <p className="text-xl font-headline font-black uppercase text-primary">"{req.suggestedName}"</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">From: {req.userName} ({req.userEmail})</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleApproveRequest(req)} className="flex-1 bg-primary text-primary-foreground font-black uppercase text-[10px] h-12 rounded-xl">Approve</Button>
                  <Button variant="outline" onClick={() => handleDenyRequest(req.id)} className="flex-1 border-destructive text-destructive hover:bg-destructive/10 font-black uppercase text-[10px] h-12 rounded-xl">Deny</Button>
                </div>
              </Card>
            )) : (
              <Card className="col-span-full p-10 text-center bg-muted/10 border-dashed border-2 border-border rounded-2xl">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">All naming requests processed 🌿</p>
              </Card>
            )}
          </div>
        </section>

        {/* 2. THE FLOCK MANAGEMENT */}
        <section className="space-y-4">
          <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
            <Bird className="h-4 w-4" /> The Flock Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {birds?.map((bird) => (
              <Card key={bird.id} className="bg-card border-border border-2 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  {bird.primaryImageUrl ? (
                    <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                  ) : (
                    <span className="text-4xl opacity-20">🦆</span>
                  )}
                  <div className="absolute top-2 right-2">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8 rounded-lg shadow-lg"
                      onClick={() => { setEditingResident(bird); setIsResidentDialogOpen(true); }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-headline font-black uppercase tracking-tight">{bird.name}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{bird.breed}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3 w-3" /> Live Vibe Board
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Current mood/activity..." 
                        defaultValue={bird.liveStatus}
                        className="bg-background border-border h-10 rounded-xl text-xs font-bold"
                        onBlur={(e) => handleUpdateStatus(bird.id, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. SANCTUARY LEDGER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Sanctuary Ledger
            </h2>
            <Button onClick={() => { setEditingExpense(null); setIsExpenseDialogOpen(true); }} size="sm" className="bg-primary text-primary-foreground font-black text-[10px] uppercase h-8 px-4 rounded-lg">
              <Plus className="h-3 w-3 mr-1" /> Add Expense
            </Button>
          </div>
          <Card className="bg-card border-border border-2 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-border">
              {expenses && expenses.length > 0 ? expenses.map((exp) => (
                <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg border border-border">
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{exp.itemName}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-secondary/30 text-secondary">{exp.category}</Badge>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{exp.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-headline font-black text-primary">${Number(exp.cost).toFixed(2)}</p>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">
                  No records materialized.
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* 4. DAILY OPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* EGG COUNTER */}
          <section className="space-y-4">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary">Daily Harvest</h2>
            <Card className="bg-card p-6 border-border border-2 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Collected Today</p>
                <h3 className="text-6xl font-headline font-black text-primary leading-none">{localEggCount}</h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={() => setLocalEggCount(Math.max(0, localEggCount - 1))} variant="outline" className="h-12 w-12 rounded-xl border-2 font-black">-</Button>
                  <Button onClick={() => setLocalEggCount(localEggCount + 1)} className="h-12 w-12 rounded-xl bg-primary text-primary-foreground font-black shadow-lg">+</Button>
                </div>
                <Button onClick={handleSyncEggs} disabled={isSavingEggs} className="h-10 bg-secondary text-secondary-foreground font-black uppercase text-[10px] rounded-xl shadow-lg">
                  {isSavingEggs ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Count"}
                </Button>
              </div>
            </Card>
          </section>

          {/* DAILY ROUTINE */}
          <section className="space-y-4">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary">Daily Routine</h2>
            <Card className="bg-card p-6 border-border border-2 rounded-2xl space-y-6 shadow-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sanctuary Health</p>
                  <span className="text-xs font-black text-primary">{Math.round(routineProgress)}%</span>
                </div>
                <Progress value={routineProgress} className="h-3 bg-muted" />
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "Feeding", key: "morningFeeding" },
                  { label: "Water", key: "freshWater" },
                  { label: "Eggs", key: "eggCounter" },
                  { label: "Health Check", key: "healthCheck" },
                  { label: "Pen Up", key: "nightlyPenUp" }
                ].map((task) => (
                  <div key={task.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border">
                    <Label className="text-[10px] font-black uppercase tracking-widest">{task.label}</Label>
                    <Switch checked={!!dailyStatus?.[task.key as keyof DailyStatus]} onCheckedChange={() => toggleDailyTask(task.key as any)} />
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        {/* 5. SYSTEM ACTIONS */}
        <section className="space-y-4 border-t border-border pt-12">
          <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-muted-foreground">System Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => { setEditingResident(null); setIsResidentDialogOpen(true); }} 
              className="bg-primary text-primary-foreground font-black uppercase text-[10px] px-8 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Bird
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                setIsProvisioning(true);
                const codeRef = doc(firestore, 'promo_codes', 'SPRINGDUCKS-JDI-G0');
                await setDoc(codeRef, { type: 'bypass_upgrade', targetRole: 'guardian', durationDays: 365, isActive: true, usageCount: 0 }, { merge: true });
                setIsProvisioning(false);
                toast({ title: "God Code Provisioned" });
              }} 
              disabled={isProvisioning} 
              className="border-secondary text-secondary font-black uppercase text-[10px] px-8 h-14 rounded-2xl hover:bg-secondary/5"
            >
              {isProvisioning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              Provision God Code
            </Button>
          </div>
        </section>
      </main>

      <ResidentDialog 
        open={isResidentDialogOpen} 
        onOpenChange={setIsResidentDialogOpen} 
        onSave={handleSaveResident} 
        resident={editingResident} 
      />
      
      <ExpenseDialog 
        open={isExpenseDialogOpen} 
        onOpenChange={setIsExpenseDialogOpen} 
        expense={editingExpense} 
      />

      <DeleteResidentDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        resident={deletingResident} 
        offspringCount={0} 
        onConfirm={async () => {
          if (!firestore || !deletingResident) return;
          await deleteDoc(doc(firestore, 'birds', deletingResident.id));
          toast({ title: "Removed from Sanctuary" });
        }} 
      />
    </div>
  );
}
