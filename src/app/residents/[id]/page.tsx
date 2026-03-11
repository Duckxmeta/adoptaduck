"use client";

import { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { AdoptionModal } from '@/components/residents/AdoptionModal';
import { 
  Egg, 
  Heart, 
  History, 
  Info, 
  ShieldCheck, 
  Stethoscope, 
  Sparkles, 
  MapPin, 
  Camera, 
  Lock, 
  CheckCircle2, 
  TreePine, 
  ChevronRight, 
  User,
  GitBranch,
  Wallet,
  ArrowRight,
  Trophy,
  BookOpen
} from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, where } from 'firebase/firestore';
import { Resident, HealthLogEntry, Expense } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FOREVER_NAMES = ['Joey', 'Huey', 'Jordie', 'Cutie Pie'];

export default function ResidentProfile() {
  const { id } = useParams() as { id: string };
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const birdRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'birds', id);
  }, [firestore, id]);

  const { data: bird, isLoading } = useDoc<Resident>(birdRef);

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !id || !user) return null;
    return query(collection(firestore, 'birds', id, 'healthLogs'), orderBy('logDate', 'desc'));
  }, [firestore, id, user]);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ledger'), orderBy('date', 'desc'));
  }, [firestore]);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'));
  }, [firestore]);

  const { data: logs } = useCollection<HealthLogEntry>(logsQuery);
  const { data: expenses } = useCollection<Expense>(expensesQuery);
  const { data: allBirds } = useCollection<Resident>(birdsQuery);

  const careCosts = useMemo(() => {
    if (!expenses || !allBirds || !id) return { monthly: 0 };
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    const monthlyExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const specific = monthlyExpenses.filter(e => e.birdId === id).reduce((s, e) => s + e.cost, 0);
    const shared = monthlyExpenses.filter(e => !e.birdId).reduce((s, e) => s + e.cost, 0);
    const overhead = shared / (allBirds.length || 1);

    return { monthly: specific + overhead };
  }, [expenses, allBirds, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-black uppercase tracking-[0.3em] text-xs text-muted-foreground">Checking Sanctuary Records...</p>
      </div>
    );
  }

  if (!bird && !isLoading) {
    notFound();
  }

  const isForever = bird && FOREVER_NAMES.some(fn => fn.toLowerCase().replace(/\s+/g, '') === bird.name.toLowerCase().replace(/\s+/g, ''));
  const isHen = bird?.sex === 'female';
  const isFounding = !bird?.motherId && !bird?.fatherId;

  // Narrative handling for Founding Four
  const nameNorm = bird?.name?.trim();
  const isFoundingGroup = FOREVER_NAMES.includes(nameNorm || '');
  const sharedNarrative = "The story of the Founding Four began in 2022, when they were purchased as seasonal Easter ducklings. After a year of growth, it became clear their initial home wasn't equipped for their long-term needs. In 2023, they were officially rehomed to Decent Ducks Sanctuary. For years now, this bonded group has served as the heart of our mission, proving that with the right environment, every rescue can thrive long-term.";
  const endings: Record<string, string> = {
    'Joey': "Today, Joey has taken his second chance and turned it into a mission, serving as the flock's primary protector.",
    'Huey': "Huey uses her loud, charismatic voice to make sure no one ever ignores the needs of the flock again.",
    'Jordie': "Jordie celebrates her freedom by being the fastest runner to the snack bowl every single morning.",
    'Cutie Pie': "Cutie Pie remains the silent guardian, staying by Jordie's side to ensure the family he arrived with stays safe."
  };
  const displayBackstory = isFoundingGroup 
    ? `${sharedNarrative} ${endings[nameNorm!] || ''}`
    : bird?.backstory;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 pb-32">
        <div className="container mx-auto px-4 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            <div className="space-y-6">
              <div className={cn(
                "relative aspect-square rounded-3xl overflow-hidden border-2 shadow-2xl group",
                isForever ? "border-primary/50 glow-primary" : "border-border"
              )}>
                <Image
                  src={bird?.primaryImageUrl || 'https://picsum.photos/seed/bird/800/800'}
                  alt={bird?.name || 'Resident'}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                   <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs">{bird?.breed}</Badge>
                   {isForever && (
                     <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs flex items-center gap-1.5">
                       <Trophy className="h-3 w-3" /> Forever Resident
                     </Badge>
                   )}
                   {isFounding && !isForever && (
                     <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md font-black px-4 py-1.5 rounded-xl uppercase tracking-wider text-xs">Founding Resident</Badge>
                   )}
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-7xl font-headline font-black text-primary tracking-tighter leading-[0.8] mb-4 uppercase">{bird?.name}</h1>
                  <div className="flex items-center gap-6 text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">
                     <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-secondary" /> Sanctuary Resident</span>
                     <span className="flex items-center gap-1.5 text-primary"><Wallet className="h-3.5 w-3.5" /> ${careCosts.monthly.toFixed(0)} Estimated Monthly Care</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push(`/residents/${bird?.id}/tree`)}
                  className="bg-secondary text-secondary-foreground font-black h-12 rounded-xl px-6 shadow-lg"
                >
                  <GitBranch className="mr-2 h-4 w-4" /> VIEW LINEAGE
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card p-8 rounded-2xl border border-border flex flex-col justify-between">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cost to Care</span>
                  </div>
                  <span className="text-2xl font-headline font-black uppercase tracking-tight">${careCosts.monthly.toFixed(2)}/MO</span>
                </div>
                <div className="bg-card p-8 rounded-2xl border border-border">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <Heart className="h-5 w-5 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sanctuary Status</span>
                  </div>
                  <span className="text-2xl font-headline font-black text-secondary uppercase tracking-tight">Protected</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Personality Profile
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg italic">
                  "{bird?.personalityTraits}"
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-headline font-black text-sm text-secondary uppercase tracking-[0.3em] flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Rescue Story
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {displayBackstory}
                </p>
              </div>

              <div className="pt-6">
                {bird && <AdoptionModal resident={bird as any} />}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
