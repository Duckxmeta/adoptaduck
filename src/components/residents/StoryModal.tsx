"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { Resident } from "@/lib/types";
import Link from 'next/link';
import Image from 'next/image';

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-card text-card-foreground border-border max-w-2xl p-0 overflow-hidden rounded-[2rem] shadow-2xl">
        <div className="relative aspect-video w-full">
          <Image 
            src={resident.primaryImageUrl} 
            alt={resident.name} 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8">
            <DialogTitle className="text-4xl font-headline font-black text-white uppercase tracking-tighter leading-none">
              {resident.name}
            </DialogTitle>
            <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> RESCUE NARRATIVE
            </p>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-secondary">
              <BookOpen className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Story</span>
            </div>
            <DialogDescription className="text-muted-foreground text-lg leading-relaxed font-medium italic">
              &quot;{fullStory}&quot;
            </DialogDescription>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <Button asChild size="lg" className="w-full bg-primary text-primary-foreground font-black h-16 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
              <Link href="/membership">BECOME A GUARDIAN <Heart className="ml-2 h-5 w-5 fill-current" /></Link>
            </Button>
            <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.2em]">
              Your support directly funds life-saving care at the sanctuary
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StoryModalProps {
  resident: Resident;
  trigger: React.ReactNode;
}
