
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Resident } from '@/lib/types';
import { Bird, Loader2, Camera, X } from 'lucide-react';
import Image from 'next/image';

interface ResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Resident>) => void;
  resident?: Resident | null;
}

export function ResidentDialog({ open, onOpenChange, onSave, resident }: ResidentDialogProps) {
  const [formData, setFormData] = useState<Partial<Resident>>({
    name: '',
    breed: '',
    sex: 'unknown',
    personalityTraits: '',
    backstory: '',
    primaryImageUrl: '',
    galleryImageUrls: []
  });

  useEffect(() => {
    if (resident) {
      setFormData({
        ...resident,
        galleryImageUrls: resident.galleryImageUrls || []
      });
    } else {
      setFormData({
        name: '',
        breed: '',
        sex: 'unknown',
        personalityTraits: '',
        backstory: '',
        primaryImageUrl: '',
        galleryImageUrls: []
      });
    }
  }, [resident, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...(formData.galleryImageUrls || [])];
    newGallery.splice(index, 1);
    setFormData({ ...formData, galleryImageUrls: newGallery });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bird className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tight">
              {resident ? 'EDIT RESIDENT' : 'ADD NEW RESIDENT'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-medium">
            Maintain accurate sanctuary records for public transparency.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bird Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Captain Quack"
                className="bg-background border-border h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Breed / Type</Label>
              <Input 
                id="breed" 
                value={formData.breed} 
                onChange={e => setFormData({...formData, breed: e.target.value})}
                placeholder="e.g. Pekin Duck"
                className="bg-background border-border h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Biological Sex</Label>
            <Select 
              value={formData.sex} 
              onValueChange={v => setFormData({...formData, sex: v as any})}
            >
              <SelectTrigger className="bg-background border-border h-11">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="male">Male (Drake)</SelectItem>
                <SelectItem value="female">Female (Hen)</SelectItem>
                <SelectItem value="unknown">Unknown / Not Yet Determined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Image URL</Label>
            <Input 
              id="image" 
              value={formData.primaryImageUrl} 
              onChange={e => setFormData({...formData, primaryImageUrl: e.target.value})}
              placeholder="https://..."
              className="bg-background border-border h-11"
            />
          </div>

          <div className="space-y-3">
             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Gallery Management</Label>
             <div className="grid grid-cols-4 gap-2">
               {formData.galleryImageUrls?.map((url, i) => (
                 <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                   <Image src={url} alt="Gallery item" fill className="object-cover" />
                   <button 
                     type="button"
                     onClick={() => removeGalleryImage(i)}
                     className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <X className="h-3 w-3" />
                   </button>
                 </div>
               ))}
               <div className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center opacity-40">
                 <Camera className="h-5 w-5" />
               </div>
             </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="traits" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personality Traits</Label>
            <Input 
              id="traits" 
              value={formData.personalityTraits} 
              onChange={e => setFormData({...formData, personalityTraits: e.target.value})}
              placeholder="Brave, curious, loves water..."
              className="bg-background border-border h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rescue Story & History</Label>
            <Textarea 
              id="story" 
              value={formData.backstory} 
              onChange={e => setFormData({...formData, backstory: e.target.value})}
              placeholder="Tell the story of how they joined the sanctuary..."
              className="bg-background border-border min-h-[120px] resize-none"
            />
          </div>

          <DialogFooter className="pt-4 sm:justify-between gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 border-border font-black uppercase text-xs tracking-widest"
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary text-primary-foreground font-black h-12 text-xs tracking-widest rounded-xl shadow-lg"
            >
              SAVE CHANGES
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
