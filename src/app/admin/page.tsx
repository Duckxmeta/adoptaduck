
"use client";

import { useState, useEffect } from 'react';
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
  Heart,
  Eye,
  CheckCircle2,
  Egg,
  Utensils,
  Droplets,
  Stethoscope,
  Clock,
  ChevronRight,
  ChevronLeft,
  Bell,
  Edit3
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, addDoc, where, updateDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { Resident, DailyStatus, EggHistoryEntry, NamingRequest, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { Navbar } from '@/components/layout/Navbar';
import { format } from 'date-fns';
import { getResidentName, cn } from '@/lib/utils';

const ADMIN_EMAILS = ['flowmarket1@gmail.com', 'decentducksorg@gmail.com'];

const VIBES = [
  "Happy ☀️", 
  "Hungry 🥨", 
  "Sassy 💅", 
  "Sleepy 💤", 
  "Bath Time 🧼", 
  "Exploring 🌿", 
  "Relaxing 🛁", 
  "Zoomies 🏎️", 
  "Broody 🪺"
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
  
  const isAdmin = ADMIN_EMAILS.includes(user.email || '');

  const [isResidentDialogOpen, setIsResidentDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

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

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);
  const { data: eggHistory } = useDoc<EggHistoryEntry>(eggHistoryRef);

  // Real-time Naming Queue
  const [namingRequests, setNamingRequests] = useState<NamingRequest[]>([]);
  useEffect(() => {
    if (!firestore || !isAdmin) return;
    const q = query(collection(firestore, 'naming_requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NamingRequest));
      setNamingRequests(results);
    });
    return () => unsubscribe();
  }, [firestore, isAdmin]);

  // HANDLERS
  const handleUpdateStatus = (birdId: string, status: string) => {
    if (!firestore || !isAdmin) return;
    const birdRef = doc(firestore, 'birds', birdId);
    updateDoc(birdRef, {
      liveStatus: status || "",
      statusLastUpdated: status ? new Date().toISOString() : null
    });
    toast({ title: "Vibe Updated" });
  };

  const handleToggleRoutine = async (key: keyof DailyStatus) => {
    if (!firestore || !isAdmin) return;
    const ref = doc(firestore, 'daily_status', 'today');
    const currentValue = dailyStatus ? !!(dailyStatus as any)[key] : false;
    await setDoc(ref, { [key]: !currentValue, lastReset: new Date().toISOString() }, { merge: true });
    toast({ title: "Task Updated" });
  };

  const handleUpdateEggs = async (delta: number) => {
    if (!firestore || !isAdmin) return;
    const ref = doc(firestore, 'egg_history', todayStr);
    const currentCount = eggHistory?.count || 0;
    await setDoc(ref, { 
      count: Math.max(0, currentCount + delta), 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
    toast({ title: "Egg Count Updated" });
  };

  const handleApproveRequest = async (req: NamingRequest) => {
    if (!firestore || !isAdmin) return;
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
    if (!firestore || !isAdmin) return;
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
    if (!firestore || !isAdmin) return;
    try {
      if (editingResident) {
        const birdRef = doc(firestore, 'birds', editingResident.id);
        await updateDoc(birdRef, { ...data, updatedAt: new Date().toISOString() });
        toast({ title: "Resident Updated" });
      } else {
        await addDoc(collection(firestore, 'birds'), { 
          ...data, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast({ title: "New Resident Added" });
      }
      setIsResidentDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  if (birdsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary gap-4">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="font-headline font-black uppercase tracking-[0.3em] text-[10px]">Syncing Sanctuary Pulse...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <Navbar />
      <main className="container mx-auto p-4 space-y-12 mt-8">
        
        {/* HEADER & ACCESS BANNER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h1 className="font-headline font-black text-2xl uppercase tracking-tighter">MANAGER PORTAL</h1>
            <Badge className={isAdmin ? "bg-primary text-primary-foreground font-black" : "bg-secondary text-secondary-foreground font-black"}>
              {isAdmin ? "ADMIN" : "GUARDIAN"}
            </Badge>
          </div>
          {!isAdmin && (
            <div className="bg-secondary/10 border-2 border-secondary/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
              <Eye className="h-5 w-5 text-secondary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Guardian View-Only Mode Active 🌿</p>
            </div>
          )}
        </div>

        {/* 1. NOTIFICATIONS (NAME REQUESTS) */}
        {isAdmin && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Bell className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="text-sm font-headline font-black uppercase tracking-widest">Pending Notifications</h2>
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
        )}

        {/* 2. DAILY CHECKLIST */}
        {isAdmin && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-sm font-headline font-black uppercase tracking-widest">Daily Routine</h2>
            </div>
            <Card className="bg-card border-2 border-border rounded-3xl p-6 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: "Morning Feeding", key: "morningFeeding", icon: <Utensils className="h-4 w-4" /> },
                  { label: "Fresh Water", key: "freshWater", icon: <Droplets className="h-4 w-4" /> },
                  { label: "Egg Counter", key: "eggCounter", icon: <Egg className="h-4 w-4" /> },
                  { label: "Health Check", key: "healthCheck", icon: <Stethoscope className="h-4 w-4" /> },
                  { label: "Nightly Pen Up", key: "nightlyPenUp", icon: <Clock className="h-4 w-4" /> },
                ].map((item) => {
                  const isDone = dailyStatus ? !!(dailyStatus as any)[item.key] : false;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleToggleRoutine(item.key as any)}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group gap-3",
                        isDone 
                          ? "bg-primary/5 border-primary/30 text-primary" 
                          : "bg-muted/10 border-border text-muted-foreground hover:border-primary/20"
                      )}
                    >
                      {item.icon}
                      <span className="text-[9px] font-black uppercase tracking-widest text-center">{item.label}</span>
                      {isDone && <CheckCircle2 className="h-4 w-4 fill-primary text-black" />}
                    </button>
                  );
                })}
              </div>
            </Card>
          </section>
        )}

        {/* 3. EGG COUNTER */}
        {isAdmin && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Egg className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="text-sm font-headline font-black uppercase tracking-widest">Daily Egg Count</h2>
            </div>
            <Card className="bg-card border-2 border-border rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Today's Harvest</p>
                  <span className="text-8xl font-headline font-black text-primary leading-none">{eggHistory?.count || 0}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => handleUpdateEggs(-1)} 
                    variant="outline" 
                    className="h-16 w-16 rounded-2xl border-2 border-border hover:border-destructive hover:text-destructive transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={() => handleUpdateEggs(1)} 
                    className="h-16 w-32 rounded-2xl bg-secondary text-secondary-foreground font-black text-xl shadow-lg hover:scale-105 transition-transform"
                  >
                    <Plus className="h-6 w-6 mr-2" /> ADD
                  </Button>
                  <Button 
                    onClick={() => handleUpdateEggs(1)} 
                    variant="outline"
                    className="h-16 w-16 rounded-2xl border-2 border-border hover:border-primary hover:text-primary transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* 4. FLOCK RECORDS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bird className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-sm font-headline font-black uppercase tracking-widest">The Flock Records</h2>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => { setEditingResident(null); setIsResidentDialogOpen(true); }} 
                className="bg-primary text-primary-foreground font-black uppercase text-[10px] h-10 px-6 rounded-xl shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Bird
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {birds?.map((bird) => (
              <Card key={bird.id} className="bg-card border-border border-2 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  {bird.primaryImageUrl ? (
                    <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                  ) : (
                    <span className="text-4xl opacity-20">🦆</span>
                  )}
                  {isAdmin && (
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
                  )}
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div>
                    <h3 className="text-xl font-headline font-black uppercase tracking-tight">{bird.name}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{bird.breed}</p>
                  </div>
                  
                  {isAdmin && (
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Zap className="h-3 w-3" /> Update Live Vibe
                      </Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {VIBES.map((vibe) => (
                          <Button
                            key={vibe}
                            size="sm"
                            variant={bird.liveStatus === vibe ? "default" : "outline"}
                            className={cn(
                              "h-10 px-1 text-[8px] font-black uppercase rounded-lg transition-all text-center leading-tight whitespace-normal",
                              bird.liveStatus === vibe ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"
                            )}
                            onClick={() => handleUpdateStatus(bird.id, vibe)}
                          >
                            {vibe}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-10 px-1 text-[8px] font-black uppercase rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => handleUpdateStatus(bird.id, "")}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <ResidentDialog 
        open={isResidentDialogOpen} 
        onOpenChange={setIsResidentDialogOpen} 
        onSave={handleSaveResident} 
        resident={editingResident} 
      />
    </div>
  );
}
