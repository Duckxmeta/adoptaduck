"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Resident } from '@/lib/types';
import { ChevronRight, Trophy, PawPrint, Bird, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { useStorage } from '@/firebase';
import { getResidentName, getBirdTypeAndSex } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ref, getDownloadURL } from 'firebase/storage';

const RESIDENT_IMAGE_MAP: Record<string, string> = {};

export function ResidentCard({ resident }: { resident: Resident }) {
  const storage = useStorage();
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const displayName = getResidentName(resident);
  const birdInfo = getBirdTypeAndSex(resident);
  const isFounder = resident.isFoundingResident || resident.generation === 0 || resident.founder;
  const isLegend = ['bandit', 'moxie'].includes(resident.name?.toLowerCase().trim());

  // ALL buttons link to centralized support hub
  const buttonHref = "/support";
  const buttonText = "VIEW MISSION TIERS";
  
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
                  {birdInfo.type === 'TURKEY' ? '🦃' : birdInfo.type === 'GOOSE' ? '🦢' : '🦆'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Institutional Record</span>
              </>
            )}
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isLegend ? (
            <Badge className="bg-primary text-black border-none font-black text-[10px] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5 shadow-xl">
              <ShieldCheck className="h-3 w-3" /> MISSION MASCOT | LEGEND
            </Badge>
          ) : (
            <Badge className="bg-background/90 backdrop-blur-md text-foreground border-border font-black text-[10px] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
              <Bird className="h-3 w-3 text-primary" />
              {birdInfo.type}
            </Badge>
          )}
        </div>

        {!isLegend && (
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
              {resident.breed} • {birdInfo.sexLabel}
            </p>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4 flex flex-col gap-3 bg-card mt-auto">
         <Button asChild className="w-full h-11 bg-primary text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-transform">
           <Link href={buttonHref}>
             <Zap className="mr-2 h-3.5 w-3.5 fill-current" /> {buttonText}
           </Link>
         </Button>
         
         <div className="flex justify-between items-center pt-1">
           <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
             {resident.category}
           </span>
            <Link 
              href={`/residents/${resident.id}`} 
              aria-label={`View full profile for ${displayName}`}
              className={cn(
                "w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all duration-300",
                birdInfo.type === 'DUCK' ? "group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary" : "group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:border-secondary"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
         </div>
      </CardContent>
    </Card>
  );
}
