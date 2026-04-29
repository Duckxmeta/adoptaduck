"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Resident } from '@/lib/types';
import { ChevronRight, Trophy, PawPrint, Bird, Loader2, Heart, Lock, ShieldCheck } from 'lucide-react';
import { useStorage } from '@/firebase';
import { getResidentName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ref, getDownloadURL } from 'firebase/storage';

// DIRECT LINK INJECTION MAP
const RESIDENT_IMAGE_MAP: Record<string, string> = {
  'Cassidy': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FCassidy.jpeg?alt=media&token=f66f2e79-86e3-4ba3-8f3c-9aff47227075',
  'Echo': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FEcho.jpeg?alt=media&token=6375ff79-0b14-4611-b789-a640017ffc9f',
  'Cracker': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FCracker.jpeg?alt=media&token=94b6629c-43d4-4721-9fd7-c50dd215d7b8',
  'Coffee': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FCoffee.jpeg?alt=media&token=08099fb8-2362-44ff-bb72-324b14ecc099',
  'Jade': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FJade.jpeg?alt=media&token=f89ea02f-f805-49df-a649-bad6524faa9d',
  'River': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FRiver.jpeg?alt=media&token=af080dc3-3a5a-42ad-b1cd-08a50e336fe1',
  'SweetPea': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FSweetPea.jpeg?alt=media&token=330a41bc-26c1-405c-ac1c-2f0fda3794ae',
  'Leela': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FLeela.jpeg?alt=media&token=f8c89eea-cf96-437a-b0de-e1263fe23254',
  'Whiskey': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FWhiskey.jpeg?alt=media&token=073b8dc6-a2ee-4ed8-8425-ce31505e2efc',
  'Pepper': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FPepper.jpeg?alt=media&token=8138ef48-61e1-428d-987e-c3da61eec7ee',
  'Otis': 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/resident-photos%2FOtis.jpeg?alt=media&token=e765d331-774d-4bd3-bb73-75a143af24f1',
};

export function ResidentCard({ resident }: { resident: Resident }) {
  const storage = useStorage();
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const displayName = getResidentName(resident);
  const isDuck = !!resident.isDuck;
  const isFounder = resident.isFoundingResident || resident.generation === 0 || resident.founder;
  
  // SUPPORT FUNNEL LOGIC
  const isLegend = ['Bandit', 'Moxie'].includes(resident.name);
  const isOtis = resident.name === 'Otis';
  // Small Resident Pack includes all non-ducks that are not Otis (Dogs and Cats)
  const isPack = !resident.isDuck && resident.name !== 'Otis';

  let buttonText = "ADOPT NOW";
  let buttonHref = "/support#donate";

  if (isLegend) {
    buttonText = "SUPPORT THE MISSION";
    buttonHref = "/support#guardian";
  } else if (isPack) {
    buttonText = "SUPPORT THE PACK";
    buttonHref = "/support#pack";
  } else if (isOtis) {
    buttonText = "SUPPORT OTIS";
    buttonHref = "/support#equine";
  }
  
  useEffect(() => {
    async function resolve() {
      if (RESIDENT_IMAGE_MAP[resident.name]) {
        setResolvedImage(RESIDENT_IMAGE_MAP[resident.name]);
        return;
      }

      const fileName = resident.primaryImageUrl;
      if (!fileName) return;

      if (fileName.startsWith('http')) {
        setResolvedImage(fileName);
        return;
      }

      setIsLoadingImage(true);
      try {
        const storageRefInstance = ref(storage, `resident-photos/${fileName}`);
        const downloadUrl = await getDownloadURL(storageRefInstance);
        setResolvedImage(downloadUrl);
      } catch (error) {
        setResolvedImage(null);
      } finally {
        setIsLoadingImage(false);
      }
    }
    resolve();
  }, [resident.primaryImageUrl, resident.name, storage]);

  return (
    <Card className={cn(
      "group overflow-hidden bg-card border-border rounded-2xl duck-card-hover h-full flex flex-col",
      isLegend && "border-primary shadow-primary/20 ring-1 ring-primary/30"
    )}>
      <Link href={`/residents/${resident.id}`} className="relative aspect-[4/5] overflow-hidden shrink-0 bg-[#1a1a1a]">
        {resolvedImage ? (
          <>
            <Image
              src={resolvedImage}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {isLoadingImage ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            ) : (
              <>
                <span className="text-7xl mb-4 transition-transform group-hover:scale-125 duration-500">
                  {isDuck ? '🦆' : '🐾'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Photo Coming Soon!</span>
              </>
            )}
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isLegend ? (
            <Badge className="bg-primary text-black border-none font-black text-[10px] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5 shadow-xl">
              <ShieldCheck className="h-3 w-3" /> LEGEND | FULLY SPONSORED
            </Badge>
          ) : (
            <Badge className="bg-background/90 backdrop-blur-md text-foreground border-border font-black text-[10px] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
              {isDuck ? <Bird className="h-3 w-3 text-primary" /> : <PawPrint className="h-3 w-3 text-secondary" />}
              {resident.species || resident.breed}
            </Badge>
          )}
        </div>

        {isDuck && !isLegend && (
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
          <div>
            <h3 className="font-headline font-black text-3xl tracking-tighter leading-none">{displayName}</h3>
            <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mt-2">
              {resident.breed} • {resident.sex === 'female' ? 'Hen' : resident.sex === 'male' ? 'Drake' : 'Resident'}
            </p>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4 flex flex-col gap-3 bg-card mt-auto">
         <Button asChild className={cn(
           "w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-transform",
           isLegend ? "bg-primary text-black" : isPack ? "bg-secondary text-white" : "bg-primary text-black"
         )}>
           <Link href={buttonHref}>
             <Heart className="mr-2 h-3.5 w-3.5 fill-current" /> {buttonText}
           </Link>
         </Button>
         
         <div className="flex justify-between items-center pt-1">
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
