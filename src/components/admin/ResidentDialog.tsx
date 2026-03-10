
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { Switch } from "@/components/ui/switch";
import { Resident } from '@/lib/types';
import { Bird, Loader2, Camera, X, Upload, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useStorage } from '@/firebase/provider';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

interface ResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Resident>) => void;
  resident?: Resident | null;
}

export function ResidentDialog({ open, onOpenChange, onSave, resident }: ResidentDialogProps) {
  const storage = useStorage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Resident>>({
    name: '',
    breed: '',
    sex: 'unknown',
    personalityTraits: '',
    backstory: '',
    primaryImageUrl: '',
    galleryImageUrls: [],
    isCommunityDuck: false
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (resident) {
      setFormData({
        ...resident,
        galleryImageUrls: resident.galleryImageUrls || [],
        isCommunityDuck: !!resident.isCommunityDuck
      });
      setPreviewUrl(resident.primaryImageUrl || null);
    } else {
      setFormData({
        name: '',
        breed: '',
        sex: 'unknown',
        personalityTraits: '',
        backstory: '',
        primaryImageUrl: '',
        galleryImageUrls: [],
        isCommunityDuck: false
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [resident, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let finalImageUrl = formData.primaryImageUrl;

    try {
      if (selectedFile && storage) {
        toast({
          title: "Uploading Image...",
          description: "Sending your photo to the sanctuary storage.",
        });
        
        const fileName = `${formData.name?.toLowerCase().replace(/\s+/g, '-') || 'bird'}-${Date.now()}`;
        const fileRef = storageRef(storage, `bird_profiles/${fileName}`);
        
        const snapshot = await uploadBytes(fileRef, selectedFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      onSave({
        ...formData,
        primaryImageUrl: finalImageUrl
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Could not save the image. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const i = index;
    const newGallery = [...(formData.galleryImageUrls || [])];
    newGallery.splice(i, 1);
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
            Maintain accurate sanctuary records. SNAP or UPLOAD a profile photo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Community Duck Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Community Resident
              </Label>
              <p className="text-[10px] text-muted-foreground font-medium">Available via partner referral codes.</p>
            </div>
            <Switch 
              checked={formData.isCommunityDuck} 
              onCheckedChange={(checked) => setFormData({...formData, isCommunityDuck: checked})} 
            />
          </div>

          {/* Profile Photo Upload Section */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Identity</Label>
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-border bg-background flex items-center justify-center group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {previewUrl ? (
                  <>
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                    <Camera className="h-10 w-10" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tap to snap or upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

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
              disabled={uploading}
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary text-primary-foreground font-black h-12 text-xs tracking-widest rounded-xl shadow-lg"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {resident ? 'SAVE CHANGES' : 'CREATE RESIDENT'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
