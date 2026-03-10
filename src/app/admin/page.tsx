
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Minus,
  LogOut, 
  Settings, 
  Sparkles, 
  Loader2, 
  MessageSquare,
  Check,
  X as CloseIcon,
  Stethoscope,
  ChevronRight,
  ClipboardList,
  RotateCcw
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, updateDoc, increment, deleteDoc, addDoc } from 'firebase/firestore';
import { Resident, NameSuggestion, DailyStatus } from '@/lib/types';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { HealthLogDialog } from '@/components/admin/HealthLogDialog';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

const ADMIN_EMAIL = 'flowmarket1@gmail.com';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  
  const [isHealthLogOpen, setIsHealthLogOpen] = useState(false);
  const [loggingResident, setLoggingResident] = useState<Resident | null>(null);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const suggestionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'nameSuggestions'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const dailyStatusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'daily_status', 'today');
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: suggestions } = useCollection<NameSuggestion>(suggestionsQuery);
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/admin/login');
      }
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };

  const handleApproveSuggestion = async (suggestion: NameSuggestion) => {
    if (!firestore) return;
    try {
      const birdRef = doc(firestore, 'birds', suggestion.birdId);
      await updateDoc(birdRef, { name: suggestion.suggestedName });
      await deleteDoc(doc(firestore, 'nameSuggestions', suggestion.id));
      toast({ title: "Name Updated", description: `Resident is now officially ${suggestion.suggestedName}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not approve suggestion." });
    }
  };

  const handleRejectSuggestion = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'nameSuggestions', id));
      toast({ title: "Suggestion Removed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleAddEgg = (resident: Resident) => {
    if (!firestore || resident.sex !== 'female') return;
    const birdRef = doc(firestore, 'birds', resident.id);
    updateDocumentNonBlocking(birdRef, { 
      eggCounter: increment(1), 
      updatedAt: new Date().toISOString() 
    });
    toast({ title: "Egg Added", description: `${resident.name} laid an egg!` });
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
      setDoc(doc(firestore, 'birds', newId), {
        ...data,
        id: newId,
        eggCounter: 0,
        galleryImageUrls: data.galleryImageUrls || [],
        createdAt: new Date().toISOString(),
        primaryImageUrl: data.primaryImageUrl || `https://picsum.photos/seed/${newId}/600/600`
      });
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
      toast({ title: "Care Log Saved", description: "Members will see this update in real-time." });
      setIsHealthLogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save health log." });
    }
  };

  const toggleDailyTask = (taskKey: keyof Omit<DailyStatus, 'id' | 'lastReset'>) => {
    if (!dailyStatusRef) return;
    const newValue = dailyStatus ? !dailyStatus[taskKey] : true;
    updateDocumentNonBlocking(dailyStatusRef, { [taskKey]: newValue });
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
    toast({ title: "Checklist Reset", description: "A fresh start for a new day." });
  };

  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-body">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
        <h1 className="font-headline font-black text-xl uppercase tracking-tighter">SANCTUARY <span className="text-primary">MANAGER</span></h1>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground"><LogOut className="h-5 w-5" /></Button>
      </header>

      <main className="container mx-auto p-4 space-y-12">
        {/* Daily Sanctuary Routine Checklist */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> DAILY SANCTUARY ROUTINE
            </h2>
            <Button variant="ghost" size="sm" onClick={resetDailyTasks} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
              <RotateCcw className="h-3 w-3 mr-1" /> Reset Day
            </Button>
          </div>
          <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-xl">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { label: "Morning Feeding", icon: "🌾", key: "morningFeeding" },
                { label: "Fresh Water", icon: "💧", key: "freshWater" },
                { label: "Egg Counter", icon: "🥚", key: "eggCounter" },
                { label: "Health Check", icon: "🩺", key: "healthCheck" },
                { label: "Nightly Pen Up", icon: "🌙", key: "nightlyPenUp" }
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

        {/* Pending Name Suggestions Notification Panel */}
        {suggestions && suggestions.length > 0 && (
          <section className="space-y-4">
             <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-secondary flex items-center gap-2">
               <MessageSquare className="h-4 w-4" /> PENDING NAME SUGGESTIONS
             </h2>
             <div className="grid gap-4">
               {suggestions.map((s) => (
                 <Card key={s.id} className="bg-secondary/5 border-secondary/20 rounded-2xl overflow-hidden shadow-lg">
                    <CardContent className="p-4 flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-tight flex items-center">
                            <span className="text-muted-foreground">{s.birdOriginalName}</span> 
                            <ChevronRight className="h-3 w-3 mx-2 opacity-50" /> 
                            <span className="text-secondary">{s.suggestedName}</span>
                          </p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Donor: {s.donorEmail}</p>
                       </div>
                       <div className="flex gap-2">
                          <Button size="icon" className="bg-[#14F195] hover:bg-[#14F195]/80 text-black rounded-full h-8 w-8" onClick={() => handleApproveSuggestion(s)}>
                             <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive rounded-full h-8 w-8" onClick={() => handleRejectSuggestion(s.id)}>
                             <CloseIcon className="h-4 w-4" />
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
               ))}
             </div>
          </section>
        )}

        <div className="flex justify-between items-center">
           <h2 className="font-headline font-black text-sm uppercase tracking-[0.3em]">FLOCK DIRECTORY</h2>
           <Button onClick={() => { setEditingResident(null); setIsDialogOpen(true); }} className="bg-primary text-primary-foreground font-black rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
             <Plus className="h-4 w-4 mr-2" /> ADD BIRD
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {birdsLoading ? (
             [1,2,3].map(i => <div key={i} className="h-48 bg-card animate-pulse rounded-2xl" />)
          ) : birds?.map((bird) => {
            const isHen = bird.sex === 'female';
            return (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-xl flex flex-col">
                <div className="flex items-center p-4 gap-5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border shadow-inner">
                    <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-black text-2xl truncate uppercase tracking-tight">{bird.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{bird.breed} • {bird.sex}</p>
                  </div>
                  {isHen && (
                    <div className="flex flex-col items-center bg-primary/10 p-3 rounded-xl border border-primary/20 min-w-[60px] shadow-sm">
                      <span className="text-2xl font-headline font-black text-primary leading-none">{bird.eggCounter}</span>
                      <span className="text-[8px] font-black uppercase text-primary/60 tracking-tighter mt-1">EGGS</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 border-t border-border divide-x divide-border mt-auto">
                  {isHen ? (
                    <>
                      <Button variant="ghost" className="rounded-none h-16 flex flex-col gap-1 group" onClick={() => handleAddEgg(bird)}>
                        <Plus className="h-5 w-5 text-[#14F195] group-hover:scale-125 transition-transform" />
                        <span className="text-[9px] font-black text-[#14F195] tracking-widest uppercase">ADD EGG</span>
                      </Button>
                      <Button variant="ghost" className="rounded-none h-16 flex flex-col gap-1 group" onClick={() => handleRemoveEgg(bird)} disabled={bird.eggCounter <= 0}>
                        <Minus className="h-5 w-5 text-red-500 group-hover:scale-125 transition-transform" />
                        <span className="text-[9px] font-black text-red-500 tracking-widest uppercase">SUB EGG</span>
                      </Button>
                    </>
                  ) : (
                    <div className="col-span-2 h-16 bg-muted/20 flex items-center justify-center">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] italic">Sanctuary Guardian (No Eggs)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
                  <Button variant="ghost" className="rounded-none h-16 flex flex-col gap-1 group" onClick={() => { setLoggingResident(bird); setIsHealthLogOpen(true); }}>
                    <Stethoscope className="h-5 w-5 text-secondary group-hover:scale-125 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-widest">LOG CARE</span>
                  </Button>
                  <Button variant="ghost" className="rounded-none h-16 flex flex-col gap-1 group" onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}>
                    <Settings className="h-5 w-5 text-muted-foreground group-hover:scale-125 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-widest">EDIT</span>
                  </Button>
                  <Button variant="ghost" className="rounded-none h-16 flex flex-col gap-1 group" onClick={() => toast({ title: "AI Generation...", description: "Feature ready for Lore update." })}>
                    <Sparkles className="h-5 w-5 text-primary group-hover:scale-125 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-widest">LORE</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <ResidentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveResident} resident={editingResident} />
      <HealthLogDialog 
        open={isHealthLogOpen} 
        onOpenChange={setIsHealthLogOpen} 
        onSave={(notes) => handleSaveHealthLog(loggingResident?.id || '', notes)} 
        residentName={loggingResident?.name || ''} 
      />
    </div>
  );
}
