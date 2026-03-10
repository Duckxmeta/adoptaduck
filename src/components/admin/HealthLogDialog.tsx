"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope, Loader2, Calendar } from 'lucide-react';

interface HealthLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (notes: string) => Promise<void>;
  residentName: string;
}

export function HealthLogDialog({ open, onOpenChange, onSave, residentName }: HealthLogDialogProps) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setSaving(true);
    try {
      await onSave(notes.trim());
      setNotes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Stethoscope className="h-5 w-5 text-secondary" />
            </div>
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tight">
              DAILY CARE LOG
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-medium">
            Recording wellness update for <span className="text-primary font-black uppercase">{residentName}</span>. 
            This will be visible to all Sanctuary Members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Update / Clinical Notes</label>
              <span className="text-[9px] font-black text-secondary flex items-center gap-1 uppercase tracking-widest">
                <Calendar className="h-3 w-3" /> Today
              </span>
            </div>
            <Textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Completed morning wellness check. Clear eyes, active foraging, healthy appetite observed..."
              className="bg-background border-border min-h-[150px] resize-none focus:ring-secondary/50"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 border-border font-black uppercase text-xs tracking-widest"
              disabled={saving}
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-secondary text-secondary-foreground font-black h-12 text-xs tracking-widest rounded-xl shadow-lg hover:shadow-secondary/20"
              disabled={saving || !notes.trim()}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              PUBLISH LOG
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
