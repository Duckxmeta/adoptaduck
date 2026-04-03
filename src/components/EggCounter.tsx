"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Egg, Plus, Minus, Save, Loader2 } from 'lucide-react';

interface EggCounterProps {
  initialCount: number;
  onSave: (count: number) => Promise<void>;
}

export function EggCounter({ initialCount, onSave }: EggCounterProps) {
  const [count, setCount] = useState(initialCount);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(count);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary/10 rounded-lg">
          <Egg className="h-5 w-5 text-secondary" />
        </div>
        <h2 className="text-sm font-headline font-black uppercase tracking-widest text-foreground">Daily Egg Count</h2>
      </div>
      
      <Card className="bg-card border-2 border-border rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Today's Harvest</p>
            <div className="flex items-center justify-center gap-8">
              <Button 
                onClick={() => setCount(Math.max(0, count - 1))} 
                variant="outline" 
                className="h-16 w-16 rounded-2xl border-2 border-border hover:border-destructive hover:text-destructive transition-all"
              >
                <Minus className="h-6 w-6" />
              </Button>
              
              <span className="text-8xl font-headline font-black text-primary leading-none min-w-[120px] text-center">{count}</span>
              
              <Button 
                onClick={() => setCount(count + 1)} 
                variant="outline"
                className="h-16 w-16 rounded-2xl border-2 border-border hover:border-primary hover:text-primary transition-all"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-16 w-full max-w-xs rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-lg hover:scale-105 transition-transform"
          >
            {isSaving ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Save className="h-6 w-6 mr-2" />}
            SAVE EGGS
          </Button>
        </div>
      </Card>
    </section>
  );
}
