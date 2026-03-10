"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, Loader2, Info } from 'lucide-react';
import { Resident } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DeleteResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  resident: Resident | null;
  offspringCount: number;
}

export function DeleteResidentDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  resident, 
  offspringCount 
}: DeleteResidentDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmationText('');
      setIsDeleting(false);
    }
  }, [open]);

  const isValid = confirmationText === 'DELETE' || confirmationText === resident?.name;

  const handleDelete = async () => {
    if (!isValid) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md rounded-[2rem]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tight">
              REMOVE RESIDENT
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-medium">
            This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {offspringCount > 0 && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-black text-[10px] uppercase tracking-widest">Lineage Protection Warning</AlertTitle>
              <AlertDescription className="text-xs font-medium mt-1">
                {resident?.name} is listed as a parent for <span className="font-black">{offspringCount}</span> other residents. 
                Deleting them will break the Family Tree for their children.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-muted/20 rounded-xl border border-border">
              <p className="text-sm font-medium leading-relaxed">
                Are you sure you want to remove <span className="text-primary font-black uppercase">{resident?.name}</span> from the sanctuary records?
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Type <span className="text-foreground">DELETE</span> or <span className="text-foreground">{resident?.name}</span> to confirm
              </Label>
              <Input 
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Confirmation text"
                className="bg-background border-border h-12 rounded-xl"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 border-border font-black uppercase text-xs tracking-widest rounded-xl"
            disabled={isDeleting}
          >
            CANCEL
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={!isValid || isDeleting}
            className="flex-1 font-black h-12 text-xs tracking-widest rounded-xl shadow-lg"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            CONFIRM DELETE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
