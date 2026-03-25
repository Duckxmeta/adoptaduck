"use client";

import { Card } from '@/components/ui/card';
import { Megaphone, Bell, Clock } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { BulletinEntry } from '@/lib/types';

interface BulletinBoardProps {
  bulletins: BulletinEntry[];
}

export function BulletinBoard({ bulletins }: BulletinBoardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-headline font-black uppercase tracking-[0.3em]">Sanctuary Bulletin</h2>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {bulletins.map((b) => (
          <Card key={b.id} className="bg-background border-2 border-border/80 rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:border-primary/50 group">
            <div className="p-6 md:p-10 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-2xl md:text-4xl font-headline font-black text-primary uppercase tracking-tight leading-none group-hover:scale-[1.01] transition-transform">
                    {b.title}
                  </h3>
                  <Bell className="h-5 w-5 text-muted-foreground opacity-20 shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                  <Clock className="h-3 w-3" />
                  {b.timestamp?.toDate ? `${formatDistanceToNow(b.timestamp.toDate())} ago` : 'Just Now'}
                </div>
              </div>

              {b.imageUrl && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-muted">
                  <Image 
                    src={b.imageUrl} 
                    alt={b.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 bg-card border border-border/50 rounded-2xl">
                <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
                  {b.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
        {bulletins.length === 0 && (
          <div className="py-20 text-center space-y-4 opacity-40">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">Waiting for the next sanctuary update...</p>
          </div>
        )}
      </div>
    </div>
  );
}