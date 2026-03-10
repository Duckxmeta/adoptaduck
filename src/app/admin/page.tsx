
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Minus,
  LayoutGrid, 
  LogOut, 
  Image as ImageIcon, 
  Settings, 
  Sparkles, 
  Loader2, 
  Egg,
  Heart,
  Bird as BirdIcon,
  Camera,
  MessageSquare,
  Check,
  X as CloseIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, arrayUnion, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { Resident, SanctuaryStatistic, NameSuggestion } from '@/lib/types';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateDuckPersonalityAndLore } from '@/ai/flows/generate-duck-personality-and-lore-flow';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ADMIN_EMAIL = 'flowmarket1@gmail.com';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [uploadingBirdId, setUploadingBirdId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const suggestionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'nameSuggestions'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: suggestions } = useCollection<NameSuggestion>(suggestionsQuery);

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
    updateDocumentNonBlocking(birdRef, { eggCounter: increment(1), updatedAt: new Date().toISOString() });
    toast({ title: "Egg Added" });
  };

  const handleRemoveEgg = (resident: Resident) => {
    if (!firestore || resident.sex !== 'female' || (resident.eggCounter || 0) <= 0) return;
    const birdRef = doc(firestore, 'birds', resident.id);
    updateDocumentNonBlocking(birdRef, { eggCounter: increment(-1), updatedAt: new Date().toISOString() });
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
        galleryImageUrls: [],
        createdAt: new Date().toISOString(),
        primaryImageUrl: data.primaryImageUrl || `https://picsum.photos/seed/${newId}/600/600`
      });
      toast({ title: "Resident Added" });
    }
    setIsDialogOpen(false);
  };

  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
        <h1 className="font-headline font-black text-xl uppercase tracking-tighter">SANCTUARY <span className="text-primary">MANAGER</span></h1>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground"><LogOut className="h-5 w-5" /></Button>
      </header>

      <main className="container mx-auto p-4 space-y-8">
        {/* Pending Name Suggestions Notification Panel */}
        {suggestions && suggestions.length > 0 && (
          <section className="space-y-4">
             <h2 className="font-headline font-black text-xs uppercase tracking-[0.4em] text-secondary flex items-center gap-2">
               <MessageSquare className="h-4 w-4" /> PENDING NAME SUGGESTIONS
             </h2>
             <div className="grid gap-4">
               {suggestions.map((s) => (
                 <Card key={s.id} className="bg-secondary/5 border-secondary/20 rounded-2xl">
                    <CardContent className="p-4 flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-tight">
                            <span className="text-muted-foreground">{s.birdOriginalName}</span> 
                            <ArrowRight className="inline h-3 w-3 mx-2 opacity-50" /> 
                            <span className="text-secondary">{s.suggestedName}</span>
                          </p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Donor: {s.donorEmail}</p>
                       </div>
                       <div className="flex gap-2">
                          <Button size="icon" className="bg-emerald-500 hover:bg-emerald-600 rounded-full h-8 w-8" onClick={() => handleApproveSuggestion(s)}>
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
           <Button onClick={() => { setEditingResident(null); setIsDialogOpen(true); }} className="bg-primary text-primary-foreground font-black rounded-xl">
             <Plus className="h-4 w-4 mr-2" /> ADD BIRD
           </Button>
        </div>

        <div className="space-y-6">
          {birds?.map((bird) => {
            const isHen = bird.sex === 'female';
            return (
              <Card key={bird.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="flex items-center p-4 gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
                    <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-black text-lg uppercase truncate">{bird.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{bird.breed} • {bird.sex}</p>
                  </div>
                  {isHen && (
                    <div className="flex flex-col items-center bg-background/50 p-2 rounded-lg border border-border min-w-[50px]">
                      <span className="text-lg font-headline font-black text-primary">{bird.eggCounter}</span>
                    </div>
                  )}
                </div>
                
                <div className={cn("grid border-t border-border divide-x divide-border", isHen ? "grid-cols-4" : "grid-cols-2")}>
                  {isHen && (
                    <>
                      <Button variant="ghost" className="rounded-none h-16 text-[9px] font-black uppercase text-emerald-500" onClick={() => handleAddEgg(bird)}><Plus className="h-4 w-4" /></Button>
                      <Button variant="ghost" className="rounded-none h-16 text-[9px] font-black uppercase text-red-500" onClick={() => handleRemoveEgg(bird)} disabled={bird.eggCounter <= 0}><Minus className="h-4 w-4" /></Button>
                    </>
                  )}
                  <Button variant="ghost" className="rounded-none h-16 text-[9px] font-black uppercase" onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}><Settings className="h-4 w-4" /></Button>
                  <Button variant="ghost" className="rounded-none h-16 text-[9px] font-black uppercase" onClick={() => toast({ title: "AI Generation...", description: "Feature ready forLore update." })}><Sparkles className="h-4 w-4 text-primary" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <ResidentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveResident} resident={editingResident} />
    </div>
  );
}
