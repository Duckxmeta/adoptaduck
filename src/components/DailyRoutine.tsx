"use client";

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DailyStatus } from '@/lib/types';
import { 
  CheckCircle2, 
  Utensils, 
  Droplets, 
  Egg, 
  Stethoscope, 
  Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyRoutineProps {
  dailyStatus: DailyStatus | null;
  onToggle: (key: keyof DailyStatus) => void;
}

export function DailyRoutine({ dailyStatus, onToggle }: DailyRoutineProps) {
  const tasks = [
    { label: "Morning Feeding", key: "morningFeeding", icon: <Utensils className="h-4 w-4" /> },
    { label: "Fresh Water", key: "freshWater", icon: <Droplets className="h-4 w-4" /> },
    { label: "Egg Counter", key: "eggCounter", icon: <Egg className="h-4 w-4" /> },
    { label: "Health Check", key: "healthCheck", icon: <Stethoscope className="h-4 w-4" /> },
    { label: "Nightly Pen Up", key: "nightlyPenUp", icon: <Clock className="h-4 w-4" /> },
  ] as const;

  const completedCount = tasks.filter(t => dailyStatus?.[t.key as keyof DailyStatus]).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-sm font-headline font-black uppercase tracking-widest text-foreground">Daily Routine</h2>
      </div>
      
      <Card className="bg-card border-2 border-border rounded-3xl p-6 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sanctuary Progress</span>
            <span className="text-xs font-black text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {tasks.map((item) => {
            const isDone = dailyStatus ? !!(dailyStatus as any)[item.key] : false;
            return (
              <button
                key={item.key}
                onClick={() => onToggle(item.key as any)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group gap-3",
                  isDone 
                    ? "bg-primary/5 border-primary/30 text-primary" 
                    : "bg-muted/10 border-border text-muted-foreground hover:border-primary/20"
                )}
              >
                {item.icon}
                <span className="text-[9px] font-black uppercase tracking-widest text-center">{item.label}</span>
                {isDone && <CheckCircle2 className="h-4 w-4 fill-primary text-black" />}
              </button>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
