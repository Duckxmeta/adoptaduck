
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Resident } from '@/lib/types';
import { ChevronRight, GitBranch, Trophy, PawPrint, Bird } from 'lucide-react';
import { useUser } from '@/firebase';
import { getResidentName } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ResidentCardProps {
  resident: Resident;
}

export function ResidentCard({ resident }: ResidentCardProps) {
  const { user } = useUser();
  const displayName = getResidentName(resident);
  const isDuck = !!resident.isDuck;
  const isFounder = resident.isFoundingResident || resident.generation === 0 || resident.founder;
  
  // High-Fidelity Image Resolver for Firebase Storage filenames
  const getResolvedImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    // Case-sensitive folder mapping: 'birds' or 'residents'
    const folder = isDuck ? 'birds' : 'residents';
    const bucket = "studio-7482167027-804c1.firebasestorage.app";
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${folder}%2F${url}?alt=media`;
  };

  const resolvedImage = getResolvedImageUrl(resident.primaryImageUrl);
  const hasImage = !!resolvedImage;

  return (
    <Card className={cn(
      "group overflow-hidden bg-card border-border rounded-2xl duck-card-hover h-full flex flex-col",
      !isDuck && "border-secondary/20 hover:border-secondary/40"
    )}>
      <Link href={`/residents/${resident.id}`} className="relative aspect-[4/5] overflow-hidden shrink-0">
        {hasImage ? (
          <>
            <Image
              src={resolvedImage!}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center p-6 text-center border-b border-border">
            <span className="text-7xl mb-4 transition-transform group-hover:scale-125 duration-500">
              {isDuck ? '🦆' : '🐾'}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Photo Coming Soon!</span>
          </div>
        )}
        
        {/* Identity Badge - Top Left */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge className="bg-background/90 backdrop-blur-md text-foreground border-border font-black text-[10px] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
            {isDuck ? <Bird className="h-3 w-3 text-primary" /> : <PawPrint className="h-3 w-3 text-secondary" />}
            {resident.species || resident.breed}
          </Badge>
        </div>

        {/* Dynamic Generation Badge (Ducks Only) - Top Right */}
        {isDuck && (
          <div className="absolute top-4 right-4">
            {resident.generation === 0 || (resident.generation === undefined && isFounder) ? (
              <Badge className="bg-primary text-primary-foreground border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-lg flex items-center gap-1.5">
                <Trophy className="h-3 w-3" /> G0 FOUNDER
              </Badge>
            ) : resident.generation && resident.generation > 0 ? (
              <Badge className="bg-secondary text-secondary-foreground border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-lg">
                G{resident.generation}
              </Badge>
            ) : null}
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-headline font-black text-3xl tracking-tighter leading-none">{displayName}</h3>
              <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mt-2">
                {resident.breed} • {resident.sex === 'female' ? 'Hen' : resident.sex === 'male' ? 'Drake' : 'Resident'}
              </p>
            </div>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4 flex flex-col gap-3 bg-card mt-auto">
         {isDuck && (
           <Button asChild variant="outline" size="sm" className="w-full text-[9px] font-black uppercase tracking-widest border-border hover:bg-primary hover:text-primary-foreground h-10 rounded-xl">
             <Link href={`/residents/${resident.id}/tree`}>
               <GitBranch className="mr-2 h-3.5 w-3.5" /> View Heritage Tree
             </Link>
           </Button>
         )}
         
         <div className="flex justify-between items-center">
           <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
             {resident.category}
           </span>
           <Link href={`/residents/${resident.id}`} className={cn(
             "w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all duration-300",
             isDuck ? "group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary" : "group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:border-secondary"
           )}>
             <ChevronRight className="h-4 w-4" />
           </Link>
         </div>
      </CardContent>
    </Card>
  );
}
