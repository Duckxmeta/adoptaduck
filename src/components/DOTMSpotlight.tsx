"use client";

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { DuckOfTheMonthSettings, Resident } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, ArrowRight, Heart, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function DOTMSpotlight() {
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();

  const settingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'duck_of_the_month');
  }, [firestore]);

  const { data: settings, isLoading: settingsLoading } = useDoc<DuckOfTheMonthSettings>(settingsRef);

  const birdRef = useMemoFirebase(() => {
    if (!firestore || !settings?.birdId) return null;
    return doc(firestore, 'birds', settings.birdId);
  }, [firestore, settings?.birdId]);

  const { data: bird, isLoading: birdLoading } = useDoc<Resident>(birdRef);

  if (settingsLoading || birdLoading) return null;
  if (!bird) return null;

  const handleSupportClick = () => {
    if (pathname === '/membership') {
      const element = document.getElementById('support-options');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/membership?bird=${encodeURIComponent(bird.name)}`);
    }
  };

  const hasImage = !!bird.primaryImageUrl && bird.primaryImageUrl.trim() !== "";

  return (
    <Card className="relative overflow-hidden bg-card border-4 border-primary/50 shadow-2xl shadow-primary/10 rounded-[2.5rem] group animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Trophy className="h-32 w-32 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 items-center">
        {/* Left Side: Photo */}
        <div className="md:col-span-5 relative aspect-square md:aspect-auto md:h-full min-h-[300px] overflow-hidden bg-muted flex items-center justify-center">
          {hasImage ? (
            <Image 
              src={bird.primaryImageUrl} 
              alt={bird.name} 
              fill 
              className="object-cover transition-transform duration-10000 group-hover:scale-110" 
            />
          ) : (
            <span className="text-9xl">🦆</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:hidden" />
        </div>

        {/* Right Side: Details */}
        <div className="md:col-span-7 p-8 md:p-12 space-y-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] px-4 py-1 shadow-lg flex items-center w-fit gap-2">
                <Trophy className="h-3.5 w-3.5" /> DUCK OF THE MONTH
              </Badge>
              {bird.liveStatus && (
                <Badge variant="outline" className="border-secondary/50 text-secondary font-black text-[10px] uppercase tracking-[0.3em] px-4 py-1 bg-secondary/5">
                  <Zap className="h-3 w-3 mr-1.5" /> {bird.liveStatus}
                </Badge>
              )}
            </div>
            <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
              Meet <span className="text-primary">{bird.name}</span>
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-lg md:text-xl font-medium text-foreground/90 italic leading-relaxed">
              "{bird.personalityTraits.split('.')[0]}."
            </p>
            
            <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-2xl space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> Monthly Mission
              </p>
              <p className="text-sm font-bold text-foreground/80 leading-relaxed">
                {settings?.monthlyMission || 'Support our featured resident this month!'}
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSupportClick}
              className="bg-primary text-primary-foreground font-black h-14 px-8 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 group/btn flex-1"
            >
              <Heart className="h-5 w-5 fill-current" />
              SUPPORT {bird.name.toUpperCase()}
            </Button>
            <Button asChild variant="outline" className="border-primary text-primary font-black h-14 px-8 rounded-2xl hover:bg-primary/10 flex-1 flex items-center justify-center gap-2">
              <a href={`/residents/${bird.id}`}>
                LEARN MORE <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
