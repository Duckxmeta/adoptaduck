
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Minus,
  Settings, 
  Loader2, 
  Stethoscope,
  ChevronRight,
  ClipboardList,
  RotateCcw,
  LayoutDashboard,
  TreePine,
  Trash2,
  Wallet,
  ArrowRight,
  Bird,
  Zap,
  Sparkles,
  Trophy
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, useStorage } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, updateDoc, increment, deleteDoc, addDoc, limit } from 'firebase/firestore';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { Resident, DailyStatus, Expense, DuckOfTheMonthSettings } from '@/lib/types';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { HealthLogDialog } from '@/components/admin/HealthLogDialog';
import { DeleteResidentDialog } from '@/components/admin/DeleteResidentDialog';
import { ExpenseDialog } from '@/components/admin/ExpenseDialog';
import { Navbar } from '@/components/layout/Navbar';
import { format } from 'date-fns';

const ADMIN_EMAILS = ['decentducksorg@gmail.com', 'flowmarket1@gmail.com'];

const PRESET_VIBES = [
  { label: 'Vigilant', emoji: '🛡️' },
  { label: 'Vocal', emoji: '📢' },
  { label: 'Zoomies', emoji: '💨' },
  { label: 'Napping', emoji: '💤' },
  { label: 'Snacking', emoji: '🥗' },
];

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  
  const [isHealthLogOpen, setIsHealthLogOpen] = useState(false);
  const [loggingResident, setLoggingResident] = useState<Resident | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [customVibes, setCustomVibes] = useState<Record<string, string>>({});
  const [savingDOTM, setSavingDOTM] = useState(false);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'), limit(10));
  }, [firestore]);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore, isAdmin]);

  const dotmRef = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return doc(firestore, 'settings', 'duck_of_the_month');
  }, [firestore, isAdmin]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);
  const { data: dotmSettings } = useDoc<DuckOfTheMonthSettings>(dotmRef);

  useEffect(() => {
    if (!isUserLoading) {
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [user, isUserLoading, router, isAdmin]);

  const handleUpdateStatus = (birdId: string, status: string) => {
    if (!firestore) return;
    const birdRef = doc(firestore, 'birds', birdId);
    updateDocumentNonBlocking(birdRef, {
      liveStatus: status,
      statusLastUpdated: new Date().toISOString()
    });
    toast({ title: "Status Updated", description: `Vibe set to: ${status}` });
  };

  const handleUpdateDOTM = async (birdId: string, mission: string) => {
    if (!firestore) return;
    setSavingDOTM(true);
    try {
      await setDoc(doc(firestore, 'settings', 'duck_of_the_month'), {
        birdId,
        monthlyMission: mission,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Spotlight Updated", description: "Duck of the Month has been set." });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setSavingDOTM(false);
    }
  };

  const handleAddEgg = (resident: Resident) => {
    if (!firestore || resident.sex !== 'female') return;
    const birdRef = doc(firestore, 'birds', resident.id);
    updateDocumentNonBlocking(birdRef, { 
      eggCounter: increment(1), 
      updatedAt: new Date().toISOString() 
    });
    toast({ title: "Egg Counted", description: `${resident.name}'s daily total updated.` });
  };

  const handleRemoveEgg = (resident: Resident) => {
    if (!firestore || resident.sex !== 'female' || (resident.eggCounter || 0) <= 0) return;
    const birdRef = doc(firestore, 'birds', resident.id);
    updateDocumentNonBlocking(birdRef, { 
      eggCounter: increment(-1), 
      updatedAt: new Date().toISOString() 
    });
    toast({ title: "Egg Removed" });
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
        eggCounter: 0,
        galleryImageUrls: data.galleryImageUrls || [],
        createdAt: new Date().toISOString(),
        primaryImageUrl: data.primaryImageUrl || ""
      }, { merge: true });
      toast({ title: "Resident Added" });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteResident = async () => {
    if (!firestore || !deletingResident) return;
    
    try {
      await deleteDoc(doc(firestore, 'birds', deletingResident.id));
      
      if (storage && deletingResident.primaryImageUrl && deletingResident.primaryImageUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const url = new URL(deletingResident.primaryImageUrl);
          const pathParam = url.pathname.split('/o/')[1];
          const decodedPath = decodeURIComponent(pathParam.split('?')[0]);
          
          if (decodedPath.startsWith('resident-photos/')) {
            const fileRef = storageRef(storage, decodedPath);
            await deleteObject(fileRef);
          }
        } catch (storageErr) {
          console.warn("Storage cleanup skipped or failed:", storageErr);
        }
      }

      toast({ 
        title: "Resident Removed", 
        description: `${deletingResident.name} has been removed from the sanctuary records.` 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Delete Failed", 
        description: "Could not remove resident records. Please check permissions." 
      });
    }
  };

  const handleSaveHealthLog = async (birdId: string, notes: string) => {
    if (!firestore) return;
    try {
      await addDoc(collection(firestore, 'birds', birdId, 'healthLogs'), {
        birdId,
        logDate: new Date().toISOString(),
        notes,
      });
      toast({ title: "Care Log Saved" });
      setIsHealthLogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save health log." });
    }
  };

  const toggleDailyTask = (taskKey: keyof Omit<DailyStatus, 'id' | 'lastReset'>) => {
    if (!dailyStatusRef) return;
    const newValue = dailyStatus ? !dailyStatus[taskKey] : true;
    setDocumentNonBlocking(dailyStatusRef, { [taskKey]: newValue }, { merge: true });
  };

  const resetDailyTasks = () => {
    if (!dailyStatusRef) return;
    setDocumentNonBlocking(dailyStatusRef, {
      morningFeeding: false,
      freshWater: false,
      eggCounter: false,
      healthCheck: false,
      nightlyPenUp: false,
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

      <main className="container mx-auto p-4 space-y-12 mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div className="space-y-1">
              <h1 className="font-headline font-black text-4xl uppercase tracking-tighter flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" /> 
                MANAGER <span className="text-primary">PORTAL</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">FLOCK LINEAGE & OPERATIONS</p>
           </div>
        </div>

        {/* Duck of the Month Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <Trophy className="h-4 w-4" /> DUCK OF THE MONTH SPOTLIGHT
            </h2>
          </div>
          
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Featured Resident</Label>
                  <Select 
                    value={dotmSettings?.birdId || ""} 
                    onValueChange={(val) => handleUpdateDOTM(val, dotmSettings?.monthlyMission || "")}
                  >
                    <SelectTrigger className="bg-background border-border h-12 rounded-xl">
                      <SelectValue placeholder="Select bird..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {foundingFour.map(bird => (
                        <SelectItem key={bird.id} value={bird.id}>{bird.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Mission / Goal</Label>
                  <Input 
                    placeholder="e.g. This month, all $5 Treat Fund donations go toward..."
                    value={dotmSettings?.monthlyMission || ""}
                    onChange={(e) => {
                      // We'll update the mission text. To avoid constant DB writes, we'll use a local state or just handle blur.
                      // For simplicity in this admin panel, we'll just update on change with a small debounce or just a save button.
                    }}
                    onBlur={(e) => handleUpdateDOTM(dotmSettings?.birdId || "", e.target.value)}
                    className="h-12 bg-background border-border rounded-xl text-sm"
                  />
                  <p className="text-[9px] text-muted-foreground italic">Tip: Tapping away from the field saves changes automatically.</p>
                </div>
              </div>
              
              <div className="bg-primary/5 border border-dashed border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <Sparkles className="h-8 w-8 text-primary opacity-50" />
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  The Duck of the Month spotlight appears at the top of the membership and user dashboard pages to drive targeted support.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Live Status Control Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <Zap className="h-4 w-4" /> LIVE VIBE CHECK
            </h2>
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/30 text-primary">REAL-TIME BROADCAST</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foundingFour.map((bird) => (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border relative">
                      <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-headline font-black uppercase tracking-tight">{bird.name}</h3>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Current: {bird.liveStatus || 'Chill'}</p>
                    </div>
                  </div>
                  {bird.statusLastUpdated && (
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">
                      Updated {format(new Date(bird.statusLastUpdated), 'HH:mm')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {PRESET_VIBES.map((vibe) => (
                    <Button 
                      key={vibe.label} 
                      variant="outline" 
                      className="h-12 rounded-xl border-border flex flex-col items-center justify-center p-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group"
                      onClick={() => handleUpdateStatus(bird.id, `${vibe.emoji} ${vibe.label}`)}
                    >
                      <span className="text-lg group-hover:scale-125 transition-transform">{vibe.emoji}</span>
                      <span className="text-[6px] font-black uppercase tracking-tighter">{vibe.label}</span>
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input 
                    placeholder="Custom Vibe..." 
                    className="h-10 rounded-xl bg-background border-border text-[10px] font-bold"
                    value={customVibes[bird.id] || ''}
                    onChange={(e) => setCustomVibes({...customVibes, [bird.id]: e.target.value})}
                  />
                  <Button 
                    className="h-10 rounded-xl bg-secondary text-secondary-foreground font-black text-[10px]"
                    onClick={() => {
                      if (customVibes[bird.id]) {
                        handleUpdateStatus(bird.id, customVibes[bird.id]);
                        setCustomVibes({...customVibes, [bird.id]: ''});
                      }
                    }}
                  >
                    SEND
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Financial Ledger Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <Wallet className="h-4 w-4" /> SANCTUARY LEDGER
            </h2>
            <Button onClick={() => { setEditingExpense(null); setIsExpenseDialogOpen(true); }} className="bg-primary text-primary-foreground font-black rounded-xl h-10 px-6 shadow-lg">
              <Plus className="h-3 w-3 mr-2" /> RECORD EXPENSE
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-card border-border rounded-2xl overflow-hidden shadow-xl">
              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="p-4 font-black uppercase tracking-widest text-muted-foreground">Date</th>
                        <th className="p-4 font-black uppercase tracking-widest text-muted-foreground">Item</th>
                        <th className="p-4 font-black uppercase tracking-widest text-muted-foreground">Category</th>
                        <th className="p-4 font-black uppercase tracking-widest text-muted-foreground">Linked To</th>
                        <th className="p-4 font-black uppercase tracking-widest text-muted-foreground text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {expensesLoading ? (
                        [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="p-6 bg-muted/10"></td></tr>)
                      ) : expenses?.map((expense) => {
                        const linkedBird = birds?.find(b => b.id === expense.birdId);
                        return (
                          <tr key={expense.id} className="hover:bg-muted/5 transition-colors cursor-pointer" onClick={() => { setEditingExpense(expense); setIsExpenseDialogOpen(true); }}>
                            <td className="p-4 font-medium text-muted-foreground">{format(new Date(expense.date), 'MMM dd')}</td>
                            <td className="p-4 font-bold uppercase tracking-tight">{expense.itemName}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-[8px] border-secondary/30 text-secondary uppercase px-2">{expense.category}</Badge>
                            </td>
                            <td className="p-4 text-muted-foreground font-medium">
                              {linkedBird ? (
                                <span className="flex items-center gap-1.5"><Bird className="h-3 w-3 text-primary" /> {linkedBird.name}</span>
                              ) : (
                                "General Care"
                              )}
                            </td>
                            <td className="p-4 font-black text-right text-primary">${expense.cost.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
            
            <div className="space-y-6">
              <Card className="bg-primary/5 border border-primary/20 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-headline font-black uppercase tracking-widest">Transparency Audit</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These records are streamed live to the public dashboard. Link expenses to individual ducks to generate their specific <strong>Cost to Care</strong> profiles.
                </p>
                <div className="pt-2">
                  <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary p-0 h-auto hover:bg-transparent" asChild>
                    <a href="/dashboard">View Public Ledger <ArrowRight className="h-3 w-3 ml-2" /></a>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> DAILY ROUTINE
            </h2>
            <Button variant="ghost" size="sm" onClick={resetDailyTasks} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
              <RotateCcw className="h-3 w-3 mr-1" /> Reset Day
            </Button>
          </div>
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-xl">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { label: "Feeding", icon: "🌾", key: "morningFeeding" },
                { label: "Water", icon: "💧", key: "freshWater" },
                { label: "Eggs", icon: "🥚", key: "eggCounter" },
                { label: "Health", icon: "🩺", key: "healthCheck" },
                { label: "Pen Up", icon: "🌙", key: "nightlyPenUp" }
              ].map((task) => (
                <div key={task.key} className="flex flex-col items-center gap-3 p-4 bg-background/50 rounded-xl border border-border">
                  <span className="text-2xl">{task.icon}</span>
                  <Label htmlFor={task.key} className="text-[10px] font-black uppercase tracking-tight text-center">{task.label}</Label>
                  <Switch 
                    id={task.key} 
                    checked={dailyStatus ? !!dailyStatus[task.key as keyof DailyStatus] : false}
                    onCheckedChange={() => toggleDailyTask(task.key as any)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-between items-center">
           <h2 className="font-headline font-black text-sm uppercase tracking-[0.3em]">RESIDENT DIRECTORY</h2>
           <Button onClick={() => { setEditingResident(null); setIsDialogOpen(true); }} className="bg-primary text-primary-foreground font-black rounded-xl h-11 px-6 shadow-lg">
             <Plus className="h-4 w-4 mr-2" /> ADD BIRD
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {birdsLoading ? (
             [1,2,3].map(i => <div key={i} className="h-48 bg-card animate-pulse rounded-2xl" />)
          ) : birds?.map((bird) => {
            const isHen = bird.sex === 'female';
            const isFounding = !!bird.isFoundingResident;
            const hasImage = !!bird.primaryImageUrl && 
                             bird.primaryImageUrl.startsWith('http') && 
                             !bird.primaryImageUrl.includes('placeholder') &&
                             !bird.primaryImageUrl.includes('picsum.photos');

            return (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-xl flex flex-col group relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={() => { setDeletingResident(bird); setIsDeleteDialogOpen(true); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="flex items-center p-4 gap-5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border shadow-inner bg-[#1a1a1a] flex flex-col items-center justify-center">
                    {hasImage ? (
                      <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                    ) : (
                      <>
                        <span className="text-3xl mb-1">🦆</span>
                        <span className="text-[6px] font-black uppercase tracking-widest text-primary/40 text-center">No Photo</span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-black text-2xl truncate uppercase tracking-tight">{bird.name}</h3>
                      {isFounding && <TreePine className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{bird.breed} • {bird.sex}</p>
                    <Badge variant="outline" className="mt-1 text-[8px] border-primary/30 text-primary/80 uppercase">Gen: {bird.source || 'Founding'}</Badge>
                  </div>
                  {isHen && (
                    <div className="flex flex-col items-center bg-primary/10 p-3 rounded-xl border border-primary/20 min-w-[60px]">
                      <span className="text-2xl font-headline font-black text-primary leading-none">{bird.eggCounter}</span>
                      <span className="text-[8px] font-black uppercase text-primary/60 mt-1">EGGS</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 border-t border-border divide-x divide-border mt-auto">
                  {isHen ? (
                    <>
                      <Button variant="ghost" className="rounded-none h-14 flex flex-col gap-1" onClick={() => handleAddEgg(bird)}>
                        <Plus className="h-4 w-4 text-[#14F195]" />
                        <span className="text-[8px] font-black text-[#14F195] tracking-widest uppercase">ADD EGG</span>
                      </Button>
                      <Button variant="ghost" className="rounded-none h-14 flex flex-col gap-1" onClick={() => handleRemoveEgg(bird)} disabled={bird.eggCounter <= 0}>
                        <Minus className="h-4 w-4 text-red-500" />
                        <span className="text-[8px] font-black text-red-500 tracking-widest uppercase">SUB EGG</span>
                      </Button>
                    </>
                  ) : (
                    <div className="col-span-2 h-14 bg-muted/20 flex items-center justify-center">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Sanctuary Guardian</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
                  <Button variant="ghost" className="rounded-none h-14 flex flex-col gap-1" onClick={() => { setLoggingResident(bird); setIsHealthLogOpen(true); }}>
                    <Stethoscope className="h-4 w-4 text-secondary" />
                    <span className="text-[7px] font-black uppercase tracking-widest">LOG</span>
                  </Button>
                  <Button variant="ghost" className="rounded-none h-14 flex flex-col gap-1" onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[7px] font-black uppercase tracking-widest">EDIT</span>
                  </Button>
                  <Button variant="ghost" className="rounded-none h-14 flex flex-col gap-1" onClick={() => router.push(`/residents/${bird.id}/tree`)}>
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-[7px] font-black uppercase tracking-widest">TREE</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <ResidentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleSaveResident} 
        resident={editingResident}
      />
      <HealthLogDialog 
        open={isHealthLogOpen} 
        onOpenChange={setIsHealthLogOpen} 
        onSave={(notes) => handleSaveHealthLog(loggingResident?.id || '', notes)} 
        residentName={loggingResident?.name || ''} 
      />
      <DeleteResidentDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        resident={deletingResident}
        offspringCount={birds?.filter(b => b.motherId === deletingResident?.id || b.fatherId === deletingResident?.id).length || 0}
        onConfirm={handleDeleteResident}
      />
      <ExpenseDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        expense={editingExpense}
      />
    </div>
  );
}
