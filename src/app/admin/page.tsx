
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Bird, 
  Zap,  
  ShieldCheck, 
  Wallet, 
  Database,
  Edit3,
  Plus,
  Heart,
  Eye,
  Lock,
  Search,
  UserCheck
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, addDoc, where, updateDoc, writeBatch, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Resident, DailyStatus, Expense, NamingRequest, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { ExpenseDialog } from '@/components/admin/ExpenseDialog';
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
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecovering, setIsRecovery] = useState(false);

  // QUERIES
  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore]);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'));
  }, [firestore]);

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

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: expenses } = useCollection<Expense>(expensesQuery);

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
        await addDoc(collection(firestore, 'birds'), { ...data, createdAt: new Date().toISOString() });
        toast({ title: "New Resident Added" });
      }
      setIsResidentDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed" });
    }
  };

  const handleRoleRecovery = async () => {
    if (!firestore || !isAdmin || !recoveryEmail.trim()) return;
    setIsRecovery(true);
    try {
      const userRef = doc(firestore, 'users', recoveryEmail.trim());
      await updateDoc(userRef, { 
        role: 'guardian', 
        updatedAt: serverTimestamp(),
        membershipStartedAt: new Date().toISOString()
      });
      toast({ title: "Role Provisioned", description: `Access restored for user.` });
      setRecoveryEmail('');
    } catch (e) {
      toast({ variant: "destructive", title: "Recovery Failed", description: "Verify User ID exists in Firestore." });
    } finally {
      setIsRecovery(false);
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
        
        {/* ACCESS BANNER */}
        {!isAdmin && (
          <div className="bg-secondary/10 border-2 border-secondary/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <Eye className="h-5 w-5 text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Guardian View-Only Mode Active 🌿</p>
          </div>
        )}

        <div className="flex items-center justify-between pb-6 border-b border-border">
          <h1 className="font-headline font-black text-2xl uppercase tracking-tighter">MANAGER PORTAL</h1>
          <Badge className={isAdmin ? "bg-primary text-primary-foreground font-black" : "bg-secondary text-secondary-foreground font-black"}>
            {isAdmin ? "ADMIN" : "GUARDIAN"}
          </Badge>
        </div>

        {/* 1. PENDING NAME REQUESTS (ADMIN ONLY) */}
        {isAdmin && (
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
        )}

        {/* 2. THE FLOCK MANAGEMENT */}
        <section className="space-y-4">
          <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
            <Bird className="h-4 w-4" /> The Flock Records
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
                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-headline font-black uppercase tracking-tight">{bird.name}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{bird.breed}</p>
                  </div>
                  
                  {isAdmin && (
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Zap className="h-3 w-3" /> Update Live Vibe
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {VIBES.map((vibe) => (
                          <Button
                            key={vibe}
                            size="sm"
                            variant={bird.liveStatus === vibe ? "default" : "outline"}
                            className={cn(
                              "h-7 px-2 text-[9px] font-black uppercase rounded-lg transition-all",
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
                          className="h-7 px-2 text-[9px] font-black uppercase rounded-lg text-destructive hover:bg-destructive/10"
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

        {/* 3. SANCTUARY LEDGER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-primary flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Sanctuary Ledger
            </h2>
            {isAdmin && (
              <Button onClick={() => { setEditingExpense(null); setIsExpenseDialogOpen(true); }} size="sm" className="bg-primary text-primary-foreground font-black text-[10px] uppercase h-8 px-4 rounded-lg">
                <Plus className="h-3 w-3 mr-1" /> Add Expense
              </Button>
            )}
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

        {/* 4. SYSTEM ACTIONS (ADMIN ONLY) */}
        {isAdmin && (
          <section className="space-y-8 border-t border-border pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Provisioning Tool */}
              <div className="space-y-4">
                <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-muted-foreground">Admin Entitlements</h2>
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
              </div>

              {/* Hybrid Account Recovery Tool */}
              <div className="space-y-4">
                <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-secondary">Role Recovery Tool</h2>
                <Card className="bg-secondary/5 border-secondary/20 p-6 rounded-2xl space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Enter User UID (e.g. buchebobby62)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="UID / Account Key"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="bg-background border-border h-12 rounded-xl text-xs"
                      />
                      <Button 
                        onClick={handleRoleRecovery}
                        disabled={isRecovering || !recoveryEmail.trim()}
                        className="bg-secondary text-secondary-foreground font-black px-6 rounded-xl h-12"
                      >
                        {isRecovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase leading-relaxed">
                    Manually force-sync a user to Guardian tier. Resolves hybrid transaction conflicts.
                  </p>
                </Card>
              </div>

            </div>
          </section>
        )}
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
    </div>
  );
}
