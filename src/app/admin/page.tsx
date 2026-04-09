
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Bird, 
  Zap,  
  Plus,
  Bell,
  Edit3,
  ScrollText,
  Trash2,
  Megaphone,
  Clock,
  Receipt
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, addDoc, where, updateDoc, writeBatch, onSnapshot, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Resident, DailyStatus, EggHistoryEntry, UserProfile, Expense, BulletinEntry, NamingRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { Navbar } from '@/components/layout/Navbar';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { DailyRoutine } from '@/components/DailyRoutine';
import { EggCounter } from '@/components/EggCounter';
import { ExpenseDialog } from '@/components/admin/ExpenseDialog';
import { SanctuaryCostCard } from '@/components/ledger/SanctuaryCostCard';
import { BulletinDialog } from '@/components/admin/BulletinDialog';
import { MOCK_EXPENSES } from '@/lib/mock-data';

// STRICT ADMIN LOCK
const ADMIN_EMAIL = 'flowmarket1@gmail.com';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (mounted && !isUserLoading && user) {
      if (user.email !== ADMIN_EMAIL) {
        if (userProfile?.role === 'guardian' ) {
          router.replace('/dashboard');
        } else {
          router.replace('/support');
        }
      }
    } else if (mounted && !isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, mounted, router, userProfile]);

  if (isUserLoading || !mounted || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <ManagerPortal user={user} />;
}

function ManagerPortal({ user }: { user: any }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isResidentDialogOpen, setIsResidentDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isBulletinDialogOpen, setIsBulletinDialogOpen] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState<BulletinEntry | null>(null);

  const VIBES = ["Happy ☀️", "Hungry 🥨", "Sassy 💅", "Sleepy 💤", "Bath Time 🧼", "Exploring 🌿", "Relaxing 🛁", "Zoomies 🏎️", "Broody 🪺"];

  // QUERIES
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore]);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const eggHistoryRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'egg_history', todayStr);
  }, [firestore, todayStr]);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'));
  }, [firestore]);

  const bulletinQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'bulletin'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: birds } = useCollection<Resident>(birdsQuery);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);
  const { data: eggHistory } = useDoc<EggHistoryEntry>(eggHistoryRef);
  const { data: firestoreExpenses } = useCollection<Expense>(expensesQuery);
  const { data: bulletins } = useCollection<BulletinEntry>(bulletinQuery);

  // MASTER LEDGER SYNC: Force sum from mock data only if firestore is clean
  const expenses = useMemo(() => {
    const combined = [...MOCK_EXPENSES, ...(firestoreExpenses || [])];
    return combined.sort((a, b) => b.date.localeCompare(a.date));
  }, [firestoreExpenses]);

  const [namingRequests, setNamingRequests] = useState<NamingRequest[]>([]);
  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'naming_requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NamingRequest));
      setNamingRequests(results);
    });
    return () => unsubscribe();
  }, [firestore]);

  const handleUpdateStatus = (birdId: string, status: string) => {
    if (!firestore) return;
    const birdRef = doc(firestore, 'birds', birdId);
    updateDoc(birdRef, { liveStatus: status || "", statusLastUpdated: new Date().toISOString() });
    toast({ title: "Vibe Updated" });
  };

  const handleToggleRoutine = async (key: keyof DailyStatus) => {
    if (!firestore) return;
    const ref = doc(firestore, 'daily_status', 'today');
    const currentValue = dailyStatus ? !!(dailyStatus as any)[key] : false;
    await setDoc(ref, { [key]: !currentValue, lastReset: new Date().toISOString() }, { merge: true });
    toast({ title: "Task Updated" });
  };

  const handleSaveEggs = async (newCount: number) => {
    if (!firestore) return;
    const ref = doc(firestore, 'egg_history', todayStr);
    await setDoc(ref, { count: newCount, updatedAt: new Date().toISOString() }, { merge: true });
    toast({ title: "Egg Count Saved" });
  };

  const handleDeleteBulletin = async (bulletinId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'bulletin', bulletinId));
      toast({ title: "Update Removed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error Deleting" });
    }
  };

  const handleSaveBulletin = async (data: Partial<BulletinEntry>) => {
    if (!firestore) return;
    try {
      const { id, ...payload } = data;
      const cleanPayload = { ...payload, timestamp: serverTimestamp() };
      if (id) {
        await updateDoc(doc(firestore, 'bulletin', id), cleanPayload);
        toast({ title: "Update Edited" });
      } else {
        await addDoc(collection(firestore, 'bulletin'), cleanPayload);
        toast({ title: "Update Published" });
      }
      setIsBulletinDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error Publishing" });
      throw e;
    }
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
      await updateDoc(doc(firestore, 'naming_requests', requestId), { status: 'denied', updatedAt: new Date().toISOString() });
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
        await addDoc(collection(firestore, 'birds'), { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        toast({ title: "New Resident Added" });
      }
      setIsResidentDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <Navbar />
      <main className="container mx-auto p-4 space-y-12 mt-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h1 className="font-headline font-black text-2xl uppercase tracking-tighter">MANAGER PORTAL</h1>
          <Badge className="bg-primary text-primary-foreground font-black">ADMIN ACCESS</Badge>
        </div>

        {/* 1. NOTIFICATIONS */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg"><Bell className="h-5 w-5 text-secondary" /></div>
            <h2 className="text-sm font-headline font-black uppercase tracking-widest">Pending Requests</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {namingRequests && namingRequests.length > 0 ? namingRequests.map((req) => (
              <Card key={req.id} className="bg-card p-6 border-border border-2 rounded-2xl flex flex-col justify-between space-y-4 shadow-lg">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Suggestion for {req.birdName || "Resident"}</p>
                  <p className="text-xl font-headline font-black uppercase text-primary">"{req.suggestedName}"</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">From: {req.userName}</p>
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

        {/* 2. NEWSROOM */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Megaphone className="h-5 w-5 text-primary" /></div>
              <h2 className="text-sm font-headline font-black uppercase tracking-widest">Sanctuary Updates</h2>
            </div>
            <Button onClick={() => { setEditingBulletin(null); setIsBulletinDialogOpen(true); }} className="bg-primary text-primary-foreground font-black uppercase text-[10px] h-10 px-6 rounded-xl shadow-lg"><Plus className="h-4 w-4 mr-2" /> New Broadcast</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bulletins?.map((b) => (
              <Card key={b.id} className="bg-card border-border border-2 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <h3 className="text-lg font-headline font-black text-primary uppercase leading-tight line-clamp-1">{b.title}</h3>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground"><Clock className="h-3 w-3" /> {b.timestamp?.toDate ? formatDistanceToNow(b.timestamp.toDate()) : 'Recently'} ago</div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 font-medium">{b.content}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 h-9 rounded-xl text-[10px] font-black border-border hover:bg-primary hover:text-primary-foreground" onClick={() => { setEditingBulletin(b); setIsBulletinDialogOpen(true); }}><Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit</Button>
                  <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl border-border text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBulletin(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. DAILY ROUTINE */}
        <DailyRoutine dailyStatus={dailyStatus || null} onToggle={handleToggleRoutine} />

        {/* 4. EGG COUNTER */}
        <EggCounter initialCount={eggHistory?.count || 0} onSave={handleSaveEggs} />

        {/* 5. FLOCK RECORDS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Bird className="h-5 w-5 text-primary" /></div>
              <h2 className="text-sm font-headline font-black uppercase tracking-widest">The Flock Records</h2>
            </div>
            <Button onClick={() => { setEditingResident(null); setIsResidentDialogOpen(true); }} className="bg-primary text-primary-foreground font-black uppercase text-[10px] h-10 px-6 rounded-xl shadow-lg"><Plus className="h-4 w-4 mr-2" /> Add Bird</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {birds?.map((bird) => (
              <Card key={bird.id} className="bg-card border-border border-2 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" /> : <span className="text-4xl opacity-20">🦆</span>}
                  <div className="absolute top-2 right-2"><Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-lg" onClick={() => { setEditingResident(bird); setIsResidentDialogOpen(true); }}><Edit3 className="h-4 w-4" /></Button></div>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div>
                    <h3 className="text-xl font-headline font-black uppercase tracking-tight">{bird.name}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{bird.breed}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Zap className="h-3 w-3" /> Update Live Vibe</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {VIBES.map((vibe) => (
                        <button key={vibe} className={cn("h-12 px-1 text-[9px] font-black uppercase rounded-lg transition-all text-center leading-tight border-2", bird.liveStatus === vibe ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50 text-foreground")} onClick={() => handleUpdateStatus(bird.id, vibe)}>{vibe}</button>
                      ))}
                      <button className="h-12 px-1 text-[9px] font-black uppercase rounded-lg text-destructive hover:bg-destructive/10 border-2 border-transparent" onClick={() => handleUpdateStatus(bird.id, "")}>Clear</button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 6. SANCTUARY LEDGER */}
        <section className="space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><ScrollText className="h-5 w-5 text-primary" /></div>
                <h2 className="text-sm font-headline font-black uppercase tracking-widest">Sanctuary Archives</h2>
              </div>
              <Button onClick={() => { setEditingExpense(null); setIsExpenseDialogOpen(true); }} className="bg-primary text-primary-foreground font-black uppercase text-[10px] h-10 px-6 rounded-xl shadow-lg"><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2"><SanctuaryCostCard expenses={expenses} /></div>
              <Card className="bg-card border-border border-2 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
                <div className="p-6 border-b border-border bg-primary/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Itemized Audit Trail</p>
                  <p className="text-xs font-bold text-muted-foreground">Sales Tax itemized for transparency</p>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar divide-y divide-border">
                  {expenses.length > 0 ? expenses.map((exp) => {
                    const isTax = exp.itemName.toLowerCase().includes('tax') || exp.itemName.toLowerCase().includes('vat');
                    return (
                      <div key={exp.id} className="p-4 hover:bg-muted/10 transition-colors flex justify-between items-center group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-black uppercase text-foreground">{exp.itemName}</p>
                            {isTax && <Badge className="bg-[#14F195]/20 text-[#14F195] border-[#14F195]/30 font-black text-[7px] px-1 py-0 uppercase">TAX</Badge>}
                          </div>
                          <Badge variant="outline" className="text-[8px] border-secondary/30 text-secondary uppercase px-1.5 py-0">{exp.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-headline font-black text-primary">${(Number(exp.cost) || 0).toFixed(2)}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">{exp.date}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setEditingExpense(exp); setIsExpenseDialogOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm('Delete this archival expense?')) deleteDoc(doc(firestore, 'ledger', exp.id)); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    );
                  }) : <div className="p-12 text-center text-muted-foreground/50 text-[10px] font-black uppercase tracking-widest">No ledger entries found</div>}
                </div>
              </Card>
           </div>
        </section>
      </main>

      <ResidentDialog open={isResidentDialogOpen} onOpenChange={setIsResidentDialogOpen} onSave={handleSaveResident} resident={editingResident} />
      <ExpenseDialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} expense={editingExpense} />
      <BulletinDialog open={isBulletinDialogOpen} onOpenChange={setIsBulletinDialogOpen} onSave={handleSaveBulletin} bulletin={editingBulletin} />
    </div>
  );
}
