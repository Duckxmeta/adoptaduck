
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
  Trophy,
  Download,
  Award,
  ShieldCheck
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, updateDoc, increment, deleteDoc, addDoc, limit } from 'firebase/firestore';
import { Resident, DailyStatus, DuckOfTheMonthSettings } from '@/lib/types';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { HealthLogDialog } from '@/components/admin/HealthLogDialog';
import { DeleteResidentDialog } from '@/components/admin/DeleteResidentDialog';
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

  const [customVibes, setCustomVibes] = useState<Record<string, string>>({});
  const [missionInput, setMissionInput] = useState("");

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
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
  const { data: dailyStatus } = useDoc<DailyStatus>(dailyStatusRef);
  const { data: dotmSettings } = useDoc<DuckOfTheMonthSettings>(dotmRef);

  useEffect(() => {
    if (dotmSettings?.monthlyMission) {
      setMissionInput(dotmSettings.monthlyMission);
    }
  }, [dotmSettings?.monthlyMission]);

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
    try {
      await setDoc(doc(firestore, 'settings', 'duck_of_the_month'), {
        birdId,
        monthlyMission: mission,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Spotlight Updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handleAddEgg = (resident: Resident) => {
    if (!firestore || resident.sex !== 'female') return;
    const birdRef = doc(firestore, 'birds', resident.id);
    updateDocumentNonBlocking(birdRef, { 
      eggCounter: increment(1), 
      updatedAt: new Date().toISOString() 
    });
    toast({ title: "Egg Counted" });
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
      morningFeeding: false,
      freshWater: false,
      eggCounter: false,
      healthCheck: false,
      nightlyPenUp: false,
      lastReset: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Checklist Reset" });
  };

  const handleExportBlank = () => {
    window.print();
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

      <main className="container mx-auto p-4 space-y-12 mt-8 no-print">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div className="space-y-1">
              <h1 className="font-headline font-black text-4xl uppercase tracking-tighter flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" /> 
                MANAGER <span className="text-primary">PORTAL</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">SANCTUARY OPERATIONS & ASSETS</p>
           </div>
        </div>

        {/* Supporter Assets Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> SUPPORTER ASSETS
            </h2>
          </div>
          <Card className="bg-card border-border rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-headline font-black uppercase tracking-tight">Blank Certificate Template</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Export a branded, high-resolution "2026 Season" certificate with blank fields. Perfect for physical signatures or manual gifts.
              </p>
            </div>
            <Button onClick={handleExportBlank} className="bg-primary text-primary-foreground font-black rounded-xl h-12 px-8 shadow-lg shrink-0">
              <Download className="h-4 w-4 mr-2" /> EXPORT BLANK TEMPLATE
            </Button>
          </Card>
        </section>

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
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
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

        {/* Daily Routine Section */}
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
                    {bird.primaryImageUrl ? (
                      <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                    ) : (
                      <span className="text-3xl">🦆</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-black text-2xl truncate uppercase tracking-tight">{bird.name}</h3>
                      {isFounding && <TreePine className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{bird.breed} • {bird.sex}</p>
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

                <div className="grid grid-cols-2 border-t border-border divide-x divide-border">
                  <Button variant="ghost" className="rounded-none h-14 flex flex-col gap-1" onClick={() => { setLoggingResident(bird); setIsHealthLogOpen(true); }}>
                    <Stethoscope className="h-4 w-4 text-secondary" />
                    <span className="text-[7px] font-black uppercase tracking-widest">LOG</span>
                  </Button>
                  <Button variant="ghost" className="rounded-none h-14 flex flex-col gap-1" onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[7px] font-black uppercase tracking-widest">EDIT</span>
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
        onSave={async (notes) => {
          if (!firestore || !loggingResident) return;
          await addDoc(collection(firestore, 'birds', loggingResident.id, 'healthLogs'), {
            birdId: loggingResident.id,
            logDate: new Date().toISOString(),
            notes,
          });
          toast({ title: "Care Log Saved" });
          setIsHealthLogOpen(false);
        }} 
        residentName={loggingResident?.name || ''} 
      />
      <DeleteResidentDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        resident={deletingResident}
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
            <h2 className="text-5xl font-black uppercase tracking-[0.1em] border-y-4 border-[#FFD700]/20 py-8">
              Guardian Certificate
            </h2>
          </div>

          <div className="space-y-12 py-4 w-full">
            <p className="text-2xl font-medium text-gray-400 uppercase tracking-[0.3em]">This certifies that</p>
            <div className="border-b-4 border-[#FFD700] w-3/4 mx-auto pb-2">
              <span className="text-6xl font-black uppercase opacity-10">Guardian Name</span>
            </div>
            <p className="text-3xl font-medium leading-relaxed max-w-2xl mx-auto">
              is an Official Guardian of <br />
              <span className="text-[#FFD700] text-5xl font-black uppercase">____________________</span> <br />
              <span className="text-xl text-gray-400 uppercase tracking-widest mt-4 block">For the 2026 Sanctuary Season</span>
            </p>
          </div>

          <div className="w-full flex justify-between items-center pt-16 border-t-2 border-gray-100">
            <div className="text-left space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sanctuary Seal</p>
              <div className="relative w-24 h-24">
                 <Image src={logoUrl} alt="DDS Logo" fill className="object-contain" />
              </div>
            </div>
            <div className="flex-1 text-center italic text-gray-400 text-sm max-w-sm px-8">
              "Saving lives, one duck at a time. Your guardianship ensures safety and health for those who cannot fly."
            </div>
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
