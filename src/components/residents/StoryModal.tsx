"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Sparkles, ArrowLeft, X } from "lucide-react";
import { Resident } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const FOUNDING_FOUR = ['Joey', 'Huey', 'Jordie', 'Cutie Pie'];

export function StoryModal({ resident, trigger }: StoryModalProps) {
  const nameNorm = resident.name?.trim();
  const isFounding = FOUNDING_FOUR.includes(nameNorm || '');
  
  const sharedNarrative = "The story of the Founding Four began in 2022, when they were purchased as seasonal Easter ducklings. After a year of growth, it became clear their initial home wasn't equipped for their long-term needs. In 2023, they were officially rehomed to Decent Ducks Sanctuary. For years now, this bonded group has served as the heart of our mission, proving that with the right environment, every rescue can thrive long-term.";
  
  const endings: Record<string, string> = {
    'Joey': "Today, Joey has taken his second chance and turned it into a mission, serving as the flock's primary protector.",
    'Huey': "Huey uses her loud, charismatic voice to make sure no one ever ignores the needs of the flock again.",
    'Jordie': "Jordie celebrates her freedom by being the fastest runner to the snack bowl every single morning.",
    'Cutie Pie': "Cutie Pie remains the silent guardian, staying by Jordie's side to ensure the family he arrived with stays safe."
  };

  const fullStory = isFounding 
    ? `${sharedNarrative} ${endings[nameNorm!] || ''}`
    : resident.backstory;

  const hasImage = !!resident.primaryImageUrl && resident.primaryImageUrl.trim() !== "";

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-card text-card-foreground border-border max-w-2xl p-0 overflow-hidden rounded-[2.5rem] shadow-2xl h-[95vh] md:h-auto flex flex-col">
        
        {/* STICKY HEADER - Always visible */}
        <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 h-16 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-primary"><Sparkles className="h-4 w-4" /></span>
            <span className="font-headline font-black uppercase text-sm tracking-widest">{resident.name}</span>
          </div>
          <DialogClose asChild>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Full Image Header */}
          <div className="relative aspect-[4/3] md:aspect-video w-full bg-muted flex items-center justify-center shrink-0">
            {hasImage ? (
              <Image 
                src={resident.primaryImageUrl} 
                alt={resident.name} 
                fill 
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-8xl">🦆</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-8 right-8">
              <DialogTitle className="text-4xl md:text-5xl font-headline font-black text-white uppercase tracking-tighter leading-none">
                {resident.name}
              </DialogTitle>
              <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> RESCUE NARRATIVE
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8 pb-32">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-secondary">
                <BookOpen className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Story</span>
              </div>
              <DialogDescription className="text-foreground/90 text-[16px] md:text-lg leading-relaxed font-medium italic">
                &quot;{fullStory}&quot;
              </DialogDescription>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Heritage</p>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 {resident.breed} • {resident.sex === 'female' ? 'Hen' : 'Drake'} • {resident.source || 'Rescue'}
               </p>
            </div>
          </div>
        </div>

        {/* FIXED FOOTER - Thumb Reach Optimized */}
        <div className="sticky bottom-0 z-50 p-6 bg-gradient-to-t from-background via-background/95 to-transparent shrink-0 space-y-4 pt-10">
          <Button asChild size="lg" className="w-full bg-primary text-primary-foreground font-black h-16 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
            <Link href="/membership">BECOME A GUARDIAN <Heart className="ml-2 h-5 w-5 fill-current" /></Link>
          </Button>
          
          <DialogClose asChild>
            <Button variant="ghost" className="w-full h-12 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> BACK TO FLOCK
            </Button>
          </DialogClose>
          
          {/* Safe area padding for mobile home indicators */}
          <div className="h-2 pb-safe" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StoryModalProps {
  resident: Resident;
  trigger: React.ReactNode;
}
