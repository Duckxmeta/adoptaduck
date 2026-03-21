"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Dna, 
  ShieldCheck, 
  ArrowLeft, 
  Heart, 
  Info, 
  X 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Resident } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HeritageTreeProps {
  rootResident: Resident;
  familyData: {
    mother?: Resident | null;
    father?: Resident | null;
    mGrandma?: Resident | null;
    mGrandpa?: Resident | null;
    fGrandma?: Resident | null;
    fGrandpa?: Resident | null;
  };
}

export const HeritageTree: React.FC<HeritageTreeProps> = ({ rootResident, familyData }) => {
  const [selectedBird, setSelectedBird] = useState<Resident | null>(null);

  const { mother, father, mGrandma, mGrandpa, fGrandma, fGrandpa } = familyData;

  const TreeCard = ({ bird, label, genLabel, className }: { bird: Resident | null, label: string, genLabel?: string, className?: string }) => {
    if (!bird) return null;

    const isG0 = !bird.motherId && !bird.fatherId;
    const imagePath = bird.primaryImageUrl || '/images/placeholder-duck.png';

    return (
      <div 
        onClick={() => setSelectedBird(bird)}
        className={cn("w-[220px] h-[300px] cursor-pointer group relative shrink-0", className)}
      >
        <div className={cn(
          "h-full w-full rounded-2xl overflow-hidden border-2 bg-card shadow-lg transition-all duration-300 group-hover:scale-105 flex flex-col",
          isG0 ? "border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "border-border group-hover:border-primary"
        )}>
          <div className="relative h-full w-full bg-muted">
            <Image 
              src={imagePath} 
              alt={bird.name} 
              fill 
              className="object-cover"
              sizes="220px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
          
          {genLabel && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/60 backdrop-blur-sm text-white border-none text-[8px] font-black px-1.5 py-0.5">
                {genLabel}
              </Badge>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[8px] font-black uppercase tracking-widest text-primary/80 mb-0.5 block">{label}</span>
            <p className="font-headline font-black text-sm uppercase tracking-tight truncate">{bird.name}</p>
          </div>

          {isG0 && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-[#D4AF37] text-black border-none text-[7px] font-black px-1.5 py-0.5 rounded-sm shadow-md">
                ROOT
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap pb-12">
        <div className="relative min-w-fit mx-auto py-12 px-24 flex flex-col items-center">
          {/* SVG Connector Layer */}
          <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Logic for connectors would go here - simplified for brevity */}
          </svg>

          {/* Generation 0: Grandparents */}
          <div className="flex justify-center gap-8 mb-24">
            <div className="flex gap-4">
              <TreeCard bird={mGrandma || null} label="M-Grandmother" genLabel="G0" />
              <TreeCard bird={mGrandpa || null} label="M-Grandfather" genLabel="G0" />
            </div>
            <div className="flex gap-4">
              <TreeCard bird={fGrandma || null} label="P-Grandmother" genLabel="G0" />
              <TreeCard bird={fGrandpa || null} label="P-Grandfather" genLabel="G0" />
            </div>
          </div>

          {/* Generation 1: Parents */}
          <div className="flex justify-center gap-32 mb-24">
            <TreeCard bird={mother || null} label="Mother" genLabel="G1" />
            <TreeCard bird={father || null} label="Father" genLabel="G1" />
          </div>

          {/* Generation 2: Target */}
          <div className="relative">
            <div className="absolute -inset-10 bg-primary/10 blur-[80px] rounded-full opacity-40" />
            <TreeCard 
              bird={rootResident} 
              label="Selected Resident" 
              genLabel={`G${rootResident.generation || 2}`}
              className="w-[260px] h-[340px] scale-110" 
            />
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Bird Detail Dialog */}
      <Dialog open={!!selectedBird} onOpenChange={(open) => !open && setSelectedBird(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2rem] bg-card border-border border-2">
          {selectedBird && (
            <div className="flex flex-col h-[85vh] md:h-auto">
              {/* Sticky Header */}
              <div className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-headline font-black uppercase text-sm tracking-widest">{selectedBird.name}</span>
                </div>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                    <X className="h-5 w-5" />
                  </Button>
                </DialogClose>
              </div>

              <div className="overflow-y-auto">
                <div className="relative h-64 w-full">
                  <Image 
                    src={selectedBird.primaryImageUrl || '/images/placeholder-duck.png'} 
                    alt={selectedBird.name} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
                
                <div className="p-8 space-y-6">
                  <div>
                    <h2 className="text-3xl font-headline font-black uppercase text-primary">{selectedBird.name}</h2>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">{selectedBird.breed}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Biography</h4>
                    <p className="text-sm leading-relaxed text-foreground/90">{selectedBird.backstory}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Generation</p>
                      <p className="font-bold">G{selectedBird.generation || 0}</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Source</p>
                      <p className="font-bold">{selectedBird.source || 'Rescue'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border p-6 flex flex-col gap-3">
                <Button asChild className="w-full bg-primary text-primary-foreground font-black h-14 rounded-xl shadow-lg">
                  <Link href={`/support?bird=${encodeURIComponent(selectedBird.name)}#membership`}>
                    BECOME A GUARDIAN
                  </Link>
                </Button>
                <p className="text-[9px] text-center font-black uppercase tracking-widest text-muted-foreground">
                  Secure Donation via PayPal
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};