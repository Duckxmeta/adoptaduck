
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Resident } from '@/lib/types';
import { ChevronRight, Egg } from 'lucide-react';
import { useUser } from '@/firebase';

interface ResidentCardProps {
  resident: Resident;
}

export function ResidentCard({ resident }: ResidentCardProps) {
  const { user } = useUser();
  const isHen = resident.sex === 'female';

  return (
    <Link href={`/residents/${resident.id}`}>
      <Card className="group overflow-hidden bg-card border-border rounded-2xl duck-card-hover">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={resident.primaryImageUrl}
            alt={resident.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          <div className="absolute top-4 left-4">
            <Badge className="bg-background/90 backdrop-blur-md text-foreground border-border font-black text-[10px] uppercase tracking-wider px-3 py-1">
              {resident.breed}
            </Badge>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-headline font-black text-3xl tracking-tighter leading-none">{resident.name}</h3>
                <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mt-2">{resident.sex}</p>
              </div>
              {isHen && user && (
                <div className="flex items-center gap-1.5 bg-primary/20 backdrop-blur-md px-2 py-1 rounded-lg border border-primary/30">
                  <Egg className="h-3.5 w-3.5 text-primary" />
                  <span className="font-black text-xs text-primary">{resident.eggCounter}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <CardContent className="p-4 flex justify-end bg-card">
           <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
             <ChevronRight className="h-4 w-4" />
           </div>
        </CardContent>
      </Card>
    </Link>
  );
}
