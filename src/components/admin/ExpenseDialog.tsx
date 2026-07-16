
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Expense, Resident } from '@/lib/types';
import { Wallet, Loader2, Calendar, Tag, Bird, ShieldAlert } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

export function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [isVetEmergency, setIsVetEmergency] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    itemName: '',
    category: 'Ducks',
    cost: 0,
    date: new Date().toISOString().split('T')[0],
    birdId: '',
    note: ''
  });
  const [linkToBird, setLinkToBird] = useState(false);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: birds } = useCollection<Resident>(birdsQuery);

  useEffect(() => {
    if (expense) {
      setFormData(expense);
      setLinkToBird(!!expense.birdId);
      setIsVetEmergency(expense.note?.includes('[VET/EMERGENCY]') || false);
    } else {
      setFormData({
        itemName: '',
        category: 'Ducks',
        cost: 0,
        date: new Date().toISOString().split('T')[0],
        birdId: '',
        note: ''
      });
      setLinkToBird(false);
      setIsVetEmergency(false);
    }
  }, [expense, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    
    setLoading(true);
    try {
      let finalNote = formData.note || "";
      if (isVetEmergency && !finalNote.includes('[VET/EMERGENCY]')) {
        finalNote = `[VET/EMERGENCY] ${finalNote}`.trim();
      }

      const data = {
        ...formData,
        cost: Number(formData.cost),
        birdId: linkToBird ? formData.birdId : null,
        note: finalNote,
        updatedAt: new Date().toISOString()
      };

      const purchaseData = {
        date: formData.date,
        item_description: formData.itemName,
        amount_usd: Number(formData.cost),
        category: formData.category,
        updatedAt: new Date().toISOString()
      };

      if (expense) {
        await updateDoc(doc(firestore, 'sanctuary_purchases', expense.id), purchaseData);
        toast({ title: "Purchase Updated" });
      } else {
        await addDoc(collection(firestore, 'sanctuary_purchases'), {
          ...purchaseData,
          createdAt: new Date().toISOString()
        });
        toast({ title: "Purchase Recorded" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save purchase." });
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Feed & Nutrition", "Medical Care", "Sanctuary Infrastructure", "General Operations"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md rounded-[2rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tight">
              {expense ? 'EDIT EXPENSE' : 'RECORD EXPENSE'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-medium">
            Log species-specific spending for 501(c)(3) readiness.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <div>
                <Label htmlFor="vet-toggle" className="text-[10px] font-black uppercase tracking-widest text-destructive">Vet / Emergency</Label>
                <p className="text-[8px] text-muted-foreground uppercase font-black">Tag as critical medical spend</p>
              </div>
            </div>
            <Switch 
              id="vet-toggle" 
              checked={isVetEmergency} 
              onCheckedChange={setIsVetEmergency} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Item / Service Name</Label>
            <Input 
              id="itemName" 
              value={formData.itemName} 
              onChange={e => setFormData({...formData, itemName: e.target.value})}
              placeholder="e.g. Layer Pellets"
              className="bg-background border-border h-11 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={v => setFormData({...formData, category: v as any})}
              >
                <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cost ($)</Label>
              <Input 
                id="cost" 
                type="number" 
                step="0.01"
                value={formData.cost} 
                onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                className="bg-background border-border h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Purchase Date</Label>
            <Input 
              id="date" 
              type="date"
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="bg-background border-border h-11 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audit Notes (Optional)</Label>
            <Textarea 
              id="note" 
              value={formData.note} 
              onChange={e => setFormData({...formData, note: e.target.value})}
              placeholder="Add details for transparency..."
              className="bg-background border-border min-h-[80px] resize-none rounded-xl"
            />
          </div>

          <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="link-bird" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Bird className="h-3.5 w-3.5" /> Link to specific resident?
              </Label>
              <Switch id="link-bird" checked={linkToBird} onCheckedChange={setLinkToBird} />
            </div>
            
            {linkToBird && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Select 
                  value={formData.birdId || ""} 
                  onValueChange={v => setFormData({...formData, birdId: v})}
                >
                  <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                    <SelectValue placeholder="Select resident" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {birds?.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 border-border font-black uppercase text-xs tracking-widest rounded-xl"
              disabled={loading}
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary text-primary-foreground font-black h-12 text-xs tracking-widest rounded-xl shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {expense ? 'SAVE CHANGES' : 'POST TO LEDGER'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
