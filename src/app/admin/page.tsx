
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Minus, Loader2, ClipboardList, 
  LayoutDashboard, Trash2, Bird, Zap,  
  ShieldCheck, Bell, CheckCheck, Inbox, GitBranch,
  Sparkles, Activity, ChevronRight, Egg, Save, Info, UserCheck, Megaphone, Camera, Star,
  Wrench, Settings, Wallet, Database, XCircle, Ticket
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
import { format, isValid as isDateValid } from 'date-fns';
import { cn, getResidentName } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  // Bulletin Board State
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

  // Real-time Naming Request Listener - Hardened status and collection path
  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '') || !firestore) return;

    const q = query(
      collection(firestore, 'naming_requests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() || {})
      })) as NamingRequest[];
      setNamingRequests(docs);
    }, async (err) => {
      const permissionError = new FirestorePermissionError({
        path: 'naming_requests',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsubscribe();
  }, [user, firestore]);

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
      toast({ title: "God Code Provisioned", description: "SPRINGDUCKS-JDI-G0 is now active indefinitely." });
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
        { itemName: 'Purchase of Cocoa and Puff', category: 'Acquisition', cost: 20.00, date: '2026-04-01', birdId: null },
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

      await addDoc(collection(firestore, 'naming_requests'), {
        birdId: 'G0-PUFF',
        birdName: 'Puff',
        suggestedName: 'Bandit',
        userEmail: 'coryb@example.com',
        userName: 'CoryB',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      toast({ title: "Records Materialized", description: "Founding receipts and test requests seeded." });
    } catch (e) {
      console.error("Seeding error:", e);
      toast({ variant: "destructive", title: "Setup Error", description: "Could not file receipts." });
    } finally {
      setIsInitializingLedger(false);
    }
  };

  const handleSyncEggs = async () => {
    if (!todayEggRef) return;
    setIsSavingEggs(true);
    try {
      await setDoc(todayEggRef, { count: localEggCount, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: "Eggs Synced!", description: `${localEggCount} recorded.` });
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
      toast({ title: "Approved!", description: `Resident renamed to ${req.suggestedName}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not approve naming request." });
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
      toast({ variant: "destructive", title: "Error", description: "Could not deny request." });
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
      toast({ variant: "destructive", title: "Error posting update" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveResident = async (data: Partial<Resident>) => {
    if (!firestore) return;
    try {
      const batch = writeBatch(firestore);

      if (data.isFeatured) {
        const featuredQuery = query(collection(firestore, 'birds'), where('isFeatured', '==', true));
        const featuredDocs = await getDocs(featuredQuery);
        featuredDocs.forEach((d) => {
          if (d.id !== editingResident?.id) {
            batch.update(d.ref, { isFeatured: false });
          }
        });
      }

      if (editingResident) {
        const birdRef = doc(firestore, 'birds', editingResident.id);
        batch.update(birdRef, { 
          ...data, 
          updatedAt: new Date().toISOString() 
        });
        await batch.commit();
        toast({ title: "Updated", description: `${data.name} has been updated.` });
      } else {
        const docRef = doc(collection(firestore, 'birds'));
        const newId = docRef.id;
        await batch.commit();
        await setDoc(docRef, { 
          ...data,
          id: newId,
          createdAt: new Date().toISOString() 
        });
        toast({ title: "Success!", description: `${data.name} added to the flock.` });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  if (birdsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary gap-4">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Loading Sanctuary Data...</p>
      </div>
    );
  }

  const progress = dailyStatus ? (['morningFeeding', 'freshWater', 'eggCounter', 'healthCheck', 'nightlyPenUp'].filter(t => !!(dailyStatus as any)[t]).length / 5) * 100 : 0;
  const foundingResidents = birds?.filter(b => b.isFoundingResident || b.generation === 0 || b.founder)?.sort((a,b) => (a.name || '').localeCompare(b.name || '')) || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-body">
      <Navbar />
      <main className="container mx-auto p-4 space-y-10 mt-4 md:mt-8">
        <div className="flex flex-col gap-2 pb-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tighter flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-primary" /> MANAGER <span className="text-primary">PORTAL</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-muted-foreground" />
                {namingRequests.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-destructive text-white h-5 w-5 flex items-center justify-center rounded-full text-[10px] border-2 border-background font-bold animate-pulse">
                    {namingRequests.length}
                  </div>
                )}
              </div>
              <Badge className="bg-primary text-primary-foreground text-[8px] font-black tracking-widest px-2 py-0.5">ADMIN</Badge>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Sanctuary Operations</p>
        </div>

        {/* SYSTEM BYPASS ADMIN */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">SYSTEM OVERRIDES</h2>
          </div>
          <Card className="bg-card border-border rounded-[2rem] p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline font-black text-sm uppercase">Golden Ticket Bypass</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1">Force reset 'SPRINGDUCKS-JDI-G0' to active status.</p>
              </div>
            </div>
            <Button 
              onClick={handleProvisionGodCode} 
              disabled={isProvisioning}
              className="bg-primary text-primary-foreground font-black px-8 h-12 rounded-xl shadow-lg hover:scale-105 transition-transform text-[10px] uppercase tracking-widest"
            >
              {isProvisioning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              PROVISION GOD CODE
            </Button>
          </Card>
        </section>

        {/* PENDING NAME REQUESTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-secondary" />
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">PENDING NAME REQUESTS</h2>
          </div>
          <Card className="bg-card border-border rounded-[2rem] p-6 shadow-xl">
            {Array.isArray(namingRequests) && namingRequests.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {namingRequests?.map((req) => (
                    <div key={req.id} className="flex items-center justify-between bg-secondary/5 border border-secondary/10 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-full">
                          <Inbox className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            <span className="text-secondary">{req.userName}</span> suggested <span className="text-primary">'{req.suggestedName}'</span> for Resident {req.birdName || req.birdId}
                          </p>
                          <p className="text-[9px] font-black uppercase text-muted-foreground mt-1">Email: {req.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleApproveRequest(req)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-[10px] font-black uppercase tracking-widest"><UserCheck className="h-3.5 w-3.5 mr-1" /> Approve</Button>
                        <Button variant="ghost" onClick={() => handleDenyRequest(req.id)} className="text-destructive hover:bg-destructive/10 h-9 px-4 text-[10px] font-black uppercase tracking-widest"><XCircle className="h-3.5 w-3.5 mr-1" /> Deny</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[100px] flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                <CheckCheck className="h-8 w-8 text-muted-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest">No pending naming requests.</p>
              </div>
            )}
          </Card>
        </section>

        {/* BULLETIN BOARD ADMIN */}
        <section className="space-y-4">
          <div className="flex items-center gap-3"><Megaphone className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">POST SANCTUARY UPDATE</h2></div>
          <Card className="bg-card border-border rounded-[2rem] p-6 shadow-xl">
            <form onSubmit={handlePostBulletin} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Update Title</Label>
                  <input 
                    value={bullTitle} 
                    onChange={e => setBullTitle(e.target.value)}
                    placeholder="e.g. Morning Routine Completed"
                    className="flex h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content</Label>
                  <Textarea 
                    value={bullContent} 
                    onChange={e => setBullContent(e.target.value)}
                    placeholder="What's happening at the sanctuary?"
                    className="bg-background border-border min-h-[100px] rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Attach Photo (Optional)</Label>
                  <div 
                    onClick={() => bullFileRef.current?.click()}
                    className="relative w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background overflow-hidden"
                  >
                    {bullPreview ? (
                      <Image src={bullPreview} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Camera className="h-8 w-8" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Tap to Snap or Select</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={bullFileRef} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBullImage(file);
                        setBullPreview(URL.createObjectURL(file));
                      }
                    }} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
                <Button type="submit" disabled={isPosting || !bullTitle.trim() || !bullContent.trim()} className="w-full h-12 bg-primary text-primary-foreground font-black rounded-xl shadow-lg">
                  {isPosting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Megaphone className="h-4 w-4 mr-2" />}
                  PUBLISH TO BULLETIN
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* EGG COUNTER */}
        <section className="space-y-4">
          <div className="flex items-center gap-3"><Egg className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">DAILY HARVEST</h2></div>
          <Card className="bg-card border-border rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-1">
              <h2 className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-primary">TODAY'S TOTAL</h2>
              <h3 className="text-7xl md:text-8xl font-headline font-black text-primary tracking-tighter leading-none">{localEggCount}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{todayDate ? format(new Date(), 'MMMM dd, yyyy') : 'Loading...'}</p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="flex gap-4">
                <Button onClick={() => setLocalEggCount(Math.max(0, localEggCount - 1))} variant="outline" className="flex-1 h-[80px] rounded-2xl border-2 border-border"><Minus className="h-6 w-6" /></Button>
                <Button onClick={() => setLocalEggCount(localEggCount + 1)} className="flex-1 h-[80px] rounded-2xl bg-primary text-primary-foreground shadow-lg"><Plus className="h-6 w-6" /></Button>
              </div>
              <Button onClick={handleSyncEggs} disabled={isSavingEggs || !todayEggRef} className="w-full h-14 bg-secondary text-secondary-foreground font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm tracking-widest">
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

        {/* SANCTUARY LEDGER ADMIN */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-4 w-4 text-primary" />
              <h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">SANCTUARY LEDGER</h2>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleInitializeLedger} 
                disabled={isInitializingLedger}
                variant="outline" 
                className="border-secondary/20 text-secondary h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
              >
                {isInitializingLedger ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Database className="h-4 w-4 mr-1" />} 
                File Founding Records
              </Button>
              <Button 
                onClick={() => { setEditingExpense(null); setIsExpenseDialogOpen(true); }} 
                className="bg-primary/10 text-primary border border-primary/20 h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
              >
                <Plus className="h-4 w-4 mr-1" /> ADD EXPENSE
              </Button>
            </div>
          </div>
          <Card className="bg-card border-border rounded-[2rem] p-6 shadow-xl">
            {expenses && Array.isArray(expenses) && expenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.slice(0, 10).map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-xl border border-border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{exp.itemName}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground">{exp.category} • {exp.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-headline font-black text-primary">${Number(exp.cost).toFixed(2)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { setEditingExpense(exp); setIsExpenseDialogOpen(true); }}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[100px] flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                <Wallet className="h-8 w-8 text-muted-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest">No expenses recorded.</p>
              </div>
            )}
          </Card>
        </section>

        {/* VIBE BOARD */}
        <section className="space-y-4">
          <div className="flex items-center gap-3"><Zap className="h-4 w-4 text-primary" /><h2 className="font-headline font-black text-xs uppercase tracking-[0.3em]">LIVE VIBE BOARD</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {foundingResidents?.map((bird) => {
              const lastUpdatedDate = bird.statusLastUpdated ? new Date(bird.statusLastUpdated) : null;
              const formattedTime = lastUpdatedDate && isDateValid(lastUpdatedDate) 
                ? format(lastUpdatedDate, 'h:mm a') 
                : 'Routine';

              return (
                <Card key={bird.id} onClick={() => setVibeBird(bird)} className="bg-card border-border rounded-2xl p-5 flex items-center justify-between shadow-xl cursor-pointer hover:border-primary/50 transition-all min-h-[80px]">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border shrink-0">
                      {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={getResidentName(bird)} fill className="object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-xl">🦆</div>}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline font-black uppercase tracking-tight text-sm truncate">{getResidentName(bird)}</h3>
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
                  {bird.primaryImageUrl ? <Image src={bird.primaryImageUrl} alt={getResidentName(bird)} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl bg-background">🦆</div>}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-black text-lg uppercase tracking-tight truncate">{getResidentName(bird)}</h3>
                      {bird.isFeatured && <Star className="h-3 w-3 text-primary fill-primary" />}
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase font-black truncate">{bird.breed}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-10 flex-1 px-3 text-[10px] font-black uppercase text-secondary bg-secondary/5 rounded-lg" onClick={() => { setLoggingResident(bird); setIsHealthLogOpen(true); }}>LOG</Button>
                      <Button variant="ghost" size="sm" className="h-10 flex-1 px-3 text-[10px] font-black uppercase text-muted-foreground bg-muted/5 rounded-lg" onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}>EDIT</Button>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-8 w-full text-[8px] font-black uppercase tracking-widest border-secondary/20 text-secondary hover:bg-secondary/5 rounded-lg">
                      <Link href={`/residents/${bird.id}/tree`}>
                        <GitBranch className="mr-1 h-3 w-3" /> TREE
                      </Link>
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-destructive md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={() => { setDeletingResident(bird); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Dialogs */}
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

function MemberPulseView({ user }: { user: any }) {
  const firestore = useFirestore();
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore]);
  const { data: birds } = useCollection<Resident>(birdsQuery);
  const foundingResidents = birds?.filter(b => b.isFoundingResident || b.generation === 0 || b.founder) || [];

  return (
    <div className="min-h-screen bg-background p-4">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <h1 className="text-2xl font-headline font-black uppercase">Member Sanctuary Feed</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foundingResidents?.map(bird => (
            <Card key={bird.id} className="p-6 bg-card border-border rounded-2xl">
              <h2 className="text-lg font-headline font-black uppercase">{getResidentName(bird)}</h2>
              <p className="text-sm text-muted-foreground">{bird.liveStatus || 'At Routine'}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
