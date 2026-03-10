"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  TreePine
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, updateDoc, increment, deleteDoc, addDoc } from 'firebase/firestore';
import { Resident, NameSuggestion, DailyStatus } from '@/lib/types';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { HealthLogDialog } from '@/components/admin/HealthLogDialog';
import { Navbar } from '@/components/layout/Navbar';

const ADMIN_EMAILS = ['decentducksorg@gmail.com', 'flowmarket1@gmail.com'];

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  
  const [isHealthLogOpen, setIsHealthLogOpen] = useState(false);
  const [loggingResident, setLoggingResident] = useState<Resident | null>(null);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore, isAdmin]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  useEffect(() => {
    if (!isUserLoading) {
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [user, isUserLoading, router, isAdmin]);

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
        primaryImageUrl: data.primaryImageUrl || `https://picsum.photos/seed/${newId}/600/600`
      }, { merge: true });
      toast({ title: "Resident Added" });
    }
    setIsDialogOpen(false);
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

        {/* Daily Routine Checklist */}
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
            return (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-xl flex flex-col group">
                <div className="flex items-center p-4 gap-5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border shadow-inner">
                    <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
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
                  <Button variant="ghost" className="rounded-none h-14 flex flex-col gap-1" onClick={() => router.push(`/residents/${bird.id}`)}>
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
    </div>
  );
}