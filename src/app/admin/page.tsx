
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  LayoutGrid, 
  LogOut, 
  Image as ImageIcon, 
  Settings, 
  Sparkles, 
  Loader2, 
  Egg,
  Heart,
  ChevronRight,
  Bird as BirdIcon,
  Camera
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, serverTimestamp, setDoc, arrayUnion, updateDoc } from 'firebase/firestore';
import { Resident, SanctuaryStatistic } from '@/lib/types';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateDuckPersonalityAndLore } from '@/ai/flows/generate-duck-personality-and-lore-flow';
import { useToast } from '@/hooks/use-toast';
import { ResidentDialog } from '@/components/admin/ResidentDialog';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

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

  const statsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'sanctuaryStats');
  }, [firestore]);

  const { data: birds, isLoading: birdsLoading } = useCollection<Resident>(birdsQuery);
  const { data: stats } = useCollection<SanctuaryStatistic>(statsRef);
  const globalStats = stats?.find(s => s.id === 'globalStats');

  // Protect route
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };

  const handleAddEgg = (resident: Resident) => {
    if (!firestore) return;
    const birdRef = doc(firestore, 'birds', resident.id);
    updateDocumentNonBlocking(birdRef, {
      eggCounter: (resident.eggCounter || 0) + 1,
      updatedAt: new Date().toISOString()
    });
    
    // Also update global stats
    if (globalStats) {
      const statsDocRef = doc(firestore, 'sanctuaryStats', 'globalStats');
      updateDocumentNonBlocking(statsDocRef, {
        totalEggsRescuedToday: (globalStats.totalEggsRescuedToday || 0) + 1,
        lastUpdated: new Date().toISOString()
      });
    }

    toast({
      title: "Egg Counter Updated",
      description: `Successfully added an egg for ${resident.name}.`,
    });
  };

  const handlePostUpdate = (birdId: string) => {
    setUploadingBirdId(birdId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingBirdId || !firestore) return;

    toast({
      title: "Posting Update...",
      description: "Uploading media to sanctuary gallery.",
    });

    // Simulate upload delay for prototype
    setTimeout(() => {
      const birdRef = doc(firestore, 'birds', uploadingBirdId);
      // In a real app, you'd upload to Firebase Storage and get a URL
      // For the prototype, we simulate with a new unique picsum URL
      const newImageUrl = `https://picsum.photos/seed/${uploadingBirdId}-${Date.now()}/800/800`;
      
      updateDoc(birdRef, {
        galleryImageUrls: arrayUnion(newImageUrl),
        updatedAt: new Date().toISOString()
      }).catch(err => {
        console.error(err);
      });

      toast({
        title: "Gallery Updated",
        description: "Your snapshot has been shared with the public.",
      });
      setUploadingBirdId(null);
    }, 1500);
  };

  const handleGenerateLore = async (resident: Resident) => {
    toast({
      title: "Generating Lore...",
      description: "Asking the AI lore master for unique traits.",
    });
    
    try {
      const result = await generateDuckPersonalityAndLore({
        name: resident.name,
        breed: resident.breed,
        sex: resident.sex as any
      });
      
      const birdRef = doc(firestore!, 'birds', resident.id);
      updateDocumentNonBlocking(birdRef, { 
        personalityTraits: result.personalityTraits.join(', '),
        backstory: result.backstory,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Lore Updated",
        description: `New identity forged for ${resident.name}.`,
      });
    } catch (error) {
       toast({
        title: "Generation Failed",
        description: "The lore master is currently unavailable.",
        variant: "destructive"
      });
    }
  };

  const handleSaveResident = (data: Partial<Resident>) => {
    if (!firestore) return;
    
    if (editingResident) {
      const birdRef = doc(firestore, 'birds', editingResident.id);
      updateDocumentNonBlocking(birdRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Resident Updated", description: `${data.name} profile has been saved.` });
    } else {
      const newBirdId = data.name?.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const birdRef = doc(firestore, 'birds', newBirdId);
      setDoc(birdRef, {
        ...data,
        id: newBirdId,
        eggCounter: 0,
        galleryImageUrls: [],
        createdAt: new Date().toISOString(),
        primaryImageUrl: data.primaryImageUrl || `https://picsum.photos/seed/${newBirdId}/600/600`
      });
      
      // Update global bird count
      if (globalStats) {
        const statsDocRef = doc(firestore, 'sanctuaryStats', 'globalStats');
        updateDocumentNonBlocking(statsDocRef, {
          totalBirds: (globalStats.totalBirds || 0) + 1,
          lastUpdated: new Date().toISOString()
        });
      }
      
      toast({ title: "Resident Added", description: `${data.name} is now a sanctuary member.` });
    }
    setIsDialogOpen(false);
    setEditingResident(null);
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Hidden File Input for Gallery Updates */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-primary-foreground shadow-lg">M</div>
           <h1 className="font-headline font-black text-xl uppercase tracking-tighter">SANCTUARY <span className="text-primary">MANAGER</span></h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <main className="container mx-auto p-4 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary text-primary-foreground border-none shadow-2xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BirdIcon className="h-16 w-16" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Active Residents</p>
              <p className="text-4xl font-headline font-black mt-1">{birds?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Egg className="h-16 w-16 text-primary" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Eggs Today</p>
              <p className="text-4xl font-headline font-black mt-1 text-primary">{globalStats?.totalEggsRescuedToday || 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
           <h2 className="font-headline font-black text-sm uppercase tracking-[0.3em] flex items-center gap-2">
             <LayoutGrid className="h-4 w-4 text-primary" /> FLOCK DIRECTORY
           </h2>
           <Button 
             onClick={() => { setEditingResident(null); setIsDialogOpen(true); }}
             className="bg-primary text-primary-foreground font-black rounded-xl h-11 px-6 shadow-xl"
           >
             <Plus className="h-4 w-4 mr-2" /> ADD RESIDENT
           </Button>
        </div>

        {/* Admin Resident List */}
        <div className="space-y-6">
          {birdsLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />)
          ) : birds?.map((bird) => (
            <Card key={bird.id} className="bg-card text-card-foreground border-border rounded-2xl overflow-hidden shadow-xl group transition-all hover:border-primary/30">
              <div className="flex items-center p-4 gap-5">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border">
                  <Image src={bird.primaryImageUrl} alt={bird.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-black text-2xl truncate uppercase tracking-tight">{bird.name}</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{bird.breed} • {bird.sex}</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-background/80 rounded-xl p-3 min-w-[70px] border border-border">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">EGGS</span>
                  <span className="text-2xl font-headline font-black text-primary">{bird.eggCounter}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 border-t border-border divide-x divide-border">
                <Button 
                  variant="ghost" 
                  className="rounded-none h-20 text-[10px] font-black uppercase flex-col gap-1.5 py-2 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => handleAddEgg(bird)}
                >
                  <Plus className="h-5 w-5" /> EGG
                </Button>
                <Button 
                  variant="ghost" 
                  className="rounded-none h-20 text-[10px] font-black uppercase flex-col gap-1.5 py-2 hover:bg-secondary/10 hover:text-secondary"
                  onClick={() => handlePostUpdate(bird.id)}
                >
                  <Camera className="h-5 w-5" /> POST
                </Button>
                <Button 
                  variant="ghost" 
                  className="rounded-none h-20 text-[10px] font-black uppercase flex-col gap-1.5 py-2 hover:bg-secondary/10"
                  onClick={() => { setEditingResident(bird); setIsDialogOpen(true); }}
                >
                  <Settings className="h-5 w-5" /> BIO
                </Button>
                <Button 
                  variant="ghost" 
                  className="rounded-none h-20 text-[10px] font-black uppercase flex-col gap-1.5 py-2 hover:bg-primary/10"
                  onClick={() => handleGenerateLore(bird)}
                >
                  <Sparkles className="h-5 w-5 text-primary" /> AI
                </Button>
              </div>
            </Card>
          ))}
          
          {(!birds || birds.length === 0) && !birdsLoading && (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl opacity-40">
              <BirdIcon className="h-12 w-12 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sanctuary Database Empty</p>
            </div>
          )}
        </div>
      </main>

      {/* Admin Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around p-4 z-50 backdrop-blur-xl">
        <Button variant="ghost" className="flex-col gap-1 h-auto py-1 text-primary">
          <LayoutGrid className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Flock</span>
        </Button>
        <Button variant="ghost" className="flex-col gap-1 h-auto py-1 text-muted-foreground opacity-50">
          <Heart className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Health</span>
        </Button>
        <Button variant="ghost" className="flex-col gap-1 h-auto py-1 text-muted-foreground opacity-50">
          <ImageIcon className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Gallery</span>
        </Button>
        <Button variant="ghost" className="flex-col gap-1 h-auto py-1 text-muted-foreground opacity-50">
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Setup</span>
        </Button>
      </nav>

      <ResidentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveResident}
        resident={editingResident}
      />
    </div>
  );
}
