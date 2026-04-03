
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Minus, Loader2, ClipboardList, 
  LayoutDashboard, Trash2, Bird, Zap,  
  ShieldCheck, Bell, CheckCheck, Inbox, GitBranch,
  Sparkles, Activity, ChevronRight, Egg, Save, UserCheck, Megaphone, Camera, Star,
  Settings, Wallet, Database, XCircle, Ticket, Calendar
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, useStorage } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, addDoc, deleteDoc, serverTimestamp, onSnapshot, where, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Resident, DailyStatus, Expense, NamingRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { HealthLogDialog } from '@/components/admin/HealthLogDialog';
import { DeleteResidentDialog } from '@/components/admin/DeleteResidentDialog';
import { ExpenseDialog } from '@/components/admin/ExpenseDialog';
import { Navbar } from '@/components/layout/Navbar';
import { format } from 'date-fns';
import { cn, getResidentName } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const storage = useStorage();
  const { toast } = useToast();
  const bullFileRef = useRef<HTMLInputElement>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isHealthLogOpen, setIsHealthLogOpen] = useState(false);
  const [loggingResident, setLoggingResident] = useState<Resident | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isInitializingLedger, setIsInitializingLedger] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [vibeBird, setVibeBird] = useState<Resident | null>(null);
  const [isSavingEggs, setIsSavingEggs] = useState(false);
  const [localEggCount, setLocalEggCount] = useState(0);
  const [namingRequests, setNamingRequests] = useState<NamingRequest[]>([]);
  const [todayDate, setTodayDate] = useState<string>('');

  useEffect(() => {
    setTodayDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const [bullTitle, setBullTitle] = useState('');
  const [bullContent, setBullContent] = useState('');
  const [bullImage, setBullImage] = useState<File | null>(null);
  const [bullPreview, setBullPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore]);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'));
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
  const { data: todayEggData } = useDoc<any>(todayEggRef);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  useEffect(() => {
    if (todayEggData) setLocalEggCount(todayEggData.count);
  }, [todayEggData]);

  useEffect(() => {
    if (!firestore) return;

    const q = query(
      collection(firestore, 'naming_requests'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as NamingRequest[];
        setNamingRequests(docs);
      } catch (err) {
        console.error("Error mapping naming requests:", err);
      }
    }, async (err) => {
      const permissionError = new FirestorePermissionError({
        path: 'naming_requests',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsubscribe();
  }, [firestore]);

  const handleUpdateStatus = (birdId: string, status: string) => {
    if (!firestore) return;
    const birdRef = doc(firestore, 'birds', birdId);
    updateDoc(birdRef, {
      liveStatus: status || "",
      statusLastUpdated: status ? new Date().toISOString() : null
    });
    toast({ title: status ? "Status Updated" : "Status Cleared" });
    setVibeBird(null);
  };

  const handleProvisionGodCode = async () => {
    if (!firestore) return;
    setIsProvisioning(true);
    try {
      const codeRef = doc(firestore, 'promo_codes', 'SPRINGDUCKS-JDI-G0');
      await setDoc(codeRef, {
        type: 'bypass_upgrade',
        targetRole: 'guardian',
        durationDays: 365,
        isActive: true,
        expirationDate: null,
        usageCount: 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "God Code Provisioned" });
    } catch (e) {
      toast({ variant: "destructive", title: "Provisioning Error" });
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleInitializeLedger = async () => {
    if (!firestore) return;
    setIsInitializingLedger(true);
    try {
      const bulkExpenses = [
        { itemName: 'Resident Acquisition', category: 'Acquisition', cost: 20.00, date: '2026-04-01', birdId: null },
        { itemName: 'Flex Seal for pond liner', category: 'Infrastructure', cost: 37.30, date: '2026-04-01', birdId: null },
        { itemName: 'Pen door latches', category: 'Hardware', cost: 7.70, date: '2026-04-01', birdId: null },
        { itemName: 'Water probiotics 3-pack', category: 'Medical', cost: 5.48, date: '2026-04-01', birdId: null },
        { itemName: 'Travel and transport gas', category: 'Logistics', cost: 15.00, date: '2026-04-01', birdId: null }
      ];

      for (const item of bulkExpenses) {
        await addDoc(collection(firestore, 'ledger'), {
          ...item,
          createdAt: new Date().toISOString()
        });
      }

      toast({ title: "Records Materialized" });
    } catch (e) {
      toast({ variant: "destructive", title: "Setup Error" });
    } finally {
      setIsInitializingLedger(false);
    }
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
      toast({ title: "Approved!", description: `Renamed to ${req.suggestedName}.` });
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

  const handlePostBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bullTitle.trim() || !bullContent.trim() || !firestore) return;
    setIsPosting(true);
    try {
      let imageUrl = null;
      if (bullImage && storage) {
        const fileName = `bulletin-${Date.now()}`;
        const fileRef = storageRef(storage, `bulletin-images/${fileName}`);
        const snapshot = await uploadBytes(fileRef, bullImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(firestore, 'bulletin'), {
        title: bullTitle,
        content: bullContent,
        imageUrl,
        timestamp: serverTimestamp()
      });
      setBullTitle('');
      setBullContent('');
      setBullImage(null);
      setBullPreview(null);
      toast({ title: "Bulletin Published" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveResident = async (data: Partial<Resident>) => {
    if (!firestore) return;
    try {
      if (editingResident) {
        const birdRef = doc(firestore, 'birds', editingResident.id);
        await updateDoc(birdRef, { ...data, updatedAt: new Date().toISOString() });
        toast({ title: "Updated" });
      } else {
        await addDoc(collection(firestore, 'birds'), { ...data, createdAt: new Date().toISOString() });
        toast({ title: "Success!" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  if (birdsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Sanctuary...</div>;
  }

  const progress = dailyStatus ? (['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'].filter(t => !!(dailyStatus as any)[t]).length / 5) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <Navbar />
      <main className="container mx-auto p-4 space-y-10 mt-8">
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <h1 className="font-headline font-black text-2xl uppercase tracking-tighter">MANAGER PORTAL</h1>
          <Badge className="bg-primary text-primary-foreground">ADMIN</Badge>
        </div>

        {/* PENDING NAME REQUESTS - SIMPLE TEXT LIST */}
        <section className="space-y-4">
          <h2 className="font-headline font-black text-xs uppercase tracking-widest">PENDING NAME REQUESTS</h2>
          <Card className="bg-card p-6 rounded-2xl">
            {namingRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground uppercase font-black">All caught up! 🌿</p>
            ) : (
              <div className="space-y-4">
                {namingRequests.map((req) => (
                  <div key={req.id} className="flex flex-col md:flex-row items-center justify-between bg-muted/20 p-4 rounded-xl gap-4">
                    <div className="text-sm font-bold uppercase">
                      "{req.suggestedName}" suggested for {req.birdName || "Resident"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleApproveRequest(req)} className="bg-primary text-primary-foreground h-10 px-6 font-black uppercase text-[10px]">Approve</Button>
                      <Button variant="ghost" onClick={() => handleDenyRequest(req.id)} className="text-destructive h-10 px-6 font-black uppercase text-[10px]">Deny</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        {/* EGG COUNTER */}
        <section className="space-y-4">
          <h2 className="font-headline font-black text-xs uppercase tracking-widest">DAILY HARVEST</h2>
          <Card className="bg-card p-6 rounded-2xl flex items-center justify-between">
            <h3 className="text-6xl font-headline font-black text-primary">{localEggCount}</h3>
            <div className="flex gap-2">
              <Button onClick={() => setLocalEggCount(Math.max(0, localEggCount - 1))} variant="outline" className="h-14 w-14 rounded-xl border-2">-</Button>
              <Button onClick={() => setLocalEggCount(localEggCount + 1)} className="h-14 w-14 rounded-xl bg-primary text-primary-foreground shadow-lg">+</Button>
              <Button onClick={handleSyncEggs} className="h-14 px-6 bg-secondary text-secondary-foreground font-black uppercase text-xs rounded-xl shadow-lg">Save</Button>
            </div>
          </Card>
        </section>

        {/* DAILY ROUTINE */}
        <section className="space-y-4">
          <h2 className="font-headline font-black text-xs uppercase tracking-widest">DAILY ROUTINE</h2>
          <Card className="bg-card p-6 rounded-2xl space-y-6">
            <Progress value={progress} className="h-4 bg-muted" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { label: "Feeding", key: "morningFeeding" },
                { label: "Water", key: "freshWater" },
                { label: "Eggs", key: "eggCounter" },
                { label: "Health", key: "healthCheck" },
                { label: "Pen Up", key: "nightlyPenUp" }
              ].map((task) => (
                <div key={task.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border">
                  <Label className="text-[10px] font-black uppercase">{task.label}</Label>
                  <Switch checked={!!dailyStatus?.[task.key as keyof DailyStatus]} onCheckedChange={() => toggleDailyTask(task.key as any)} />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* SYSTEM SETUP */}
        <section className="space-y-4">
          <h2 className="font-headline font-black text-xs uppercase tracking-widest">SYSTEM ACTIONS</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleProvisionGodCode} disabled={isProvisioning} className="bg-primary text-primary-foreground font-black uppercase text-[10px] px-6 h-12 rounded-xl">Provision God Code</Button>
            <Button onClick={handleInitializeLedger} disabled={isInitializingLedger} className="bg-secondary text-secondary-foreground font-black uppercase text-[10px] px-6 h-12 rounded-xl">File Founding Records</Button>
            <Button onClick={() => { setEditingResident(null); setIsDialogOpen(true); }} className="bg-background border border-border text-foreground font-black uppercase text-[10px] px-6 h-12 rounded-xl">Add Bird</Button>
          </div>
        </section>
      </main>

      <ResidentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveResident} resident={editingResident} />
      <HealthLogDialog open={isHealthLogOpen} onOpenChange={setIsHealthLogOpen} onSave={async (notes) => {
        if (!firestore) return;
        await addDoc(collection(firestore, 'birds', loggingResident!.id, 'healthLogs'), { birdId: loggingResident!.id, logDate: new Date().toISOString(), notes });
        toast({ title: "Log Saved" });
        setIsHealthLogOpen(false);
      }} residentName={getResidentName(loggingResident)} />
      <DeleteResidentDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} resident={deletingResident} offspringCount={0} onConfirm={async () => {
        if (!firestore) return;
        await deleteDoc(doc(firestore, 'birds', deletingResident!.id));
        toast({ title: "Removed" });
      }} />
      <ExpenseDialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} expense={editingExpense} />
    </div>
  );
}
