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
import { Bird, Loader2, Camera, ShieldCheck, TreePine, Upload } from 'lucide-react';
import Image from 'next/image';
import { useStorage, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Resident>) => void;
  resident?: Resident | null;
}

export function ResidentDialog({ open, onOpenChange, onSave, resident }: ResidentDialogProps) {
  const storage = useStorage();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: birds } = useCollection<Resident>(birdsQuery);
  
  const [formData, setFormData] = useState<Partial<Resident>>({
    name: '',
    breed: '',
    sex: 'unknown',
    personalityTraits: '',
    backstory: '',
    primaryImageUrl: '',
    galleryImageUrls: [],
    isCommunityDuck: false,
    source: 'Founding',
    motherId: '',
    fatherId: '',
    hatch_date: '',
    isFoundingResident: false
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (resident) {
      setFormData({
        ...resident,
        galleryImageUrls: resident.galleryImageUrls || [],
        isCommunityDuck: !!resident.isCommunityDuck,
        source: resident.source || 'Founding',
        motherId: resident.motherId || '',
        fatherId: resident.fatherId || '',
        hatch_date: resident.hatch_date || '',
        isFoundingResident: !!resident.isFoundingResident
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
        isCommunityDuck: false,
        source: 'Founding',
        motherId: '',
        fatherId: '',
        hatch_date: '',
        isFoundingResident: false
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

    // Default fallback if no image exists or is uploaded
    let finalImageUrl = formData.primaryImageUrl || `https://picsum.photos/seed/${formData.name || 'duck'}/600/600`;

    try {
      if (selectedFile && storage) {
        toast({
          title: "Uploading Photo...",
          description: "Storing resident image in the sanctuary archives.",
        });
        
        const fileName = `${formData.name?.toLowerCase().replace(/\s+/g, '-') || 'resident'}-${Date.now()}`;
        // Saving to the /resident-photos/ folder as requested
        const fileRef = storageRef(storage, `resident-photos/${fileName}`);
        
        const snapshot = await uploadBytes(fileRef, selectedFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const submissionData = {
        ...formData,
        primaryImageUrl: finalImageUrl,
        motherId: formData.motherId || null,
        fatherId: formData.fatherId || null,
        isFoundingResident: formData.source === 'Founding',
        updatedAt: new Date().toISOString()
      };

      onSave(submissionData);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-lg max-h-[90vh] overflow-y-auto rounded-[2rem]">
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
            Maintain accurate sanctuary records and lineage data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Photo Upload Section with Preview */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Camera className="h-3 w-3" /> Upload Resident Photo
            </Label>
            <div 
              className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-border bg-background flex flex-col items-center justify-center group cursor-pointer hover:border-primary/50 transition-colors" 
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <Camera className="h-10 w-10" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Tap to select or snap photo</span>
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
            {selectedFile && (
              <p className="text-[9px] font-black uppercase text-secondary text-center">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Community
                </Label>
              </div>
              <Switch 
                checked={formData.isCommunityDuck} 
                onCheckedChange={(checked) => setFormData({...formData, isCommunityDuck: checked})} 
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <TreePine className="h-3 w-3" /> Founding
                </Label>
              </div>
              <Switch 
                checked={formData.source === 'Founding'} 
                onCheckedChange={(checked) => setFormData({...formData, source: checked ? 'Founding' : 'Rehomed', isFoundingResident: checked})} 
              />
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
                className="bg-background border-border h-11 rounded-xl"
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
                className="bg-background border-border h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="sex" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Biological Sex</Label>
              <Select 
                value={formData.sex} 
                onValueChange={v => setFormData({...formData, sex: v as any})}
              >
                <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="male">Male (Drake)</SelectItem>
                  <SelectItem value="female">Female (Hen)</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rescue Source</Label>
              <Select 
                value={formData.source} 
                onValueChange={v => setFormData({...formData, source: v as any, isFoundingResident: v === 'Founding'})}
              >
                <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Founding">Founding</SelectItem>
                  <SelectItem value="Rehomed">Rehomed</SelectItem>
                  <SelectItem value="Hatched">Hatched (Sanctuary Born)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mother" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mother</Label>
              <Select 
                value={formData.motherId || "unknown"} 
                onValueChange={v => setFormData({...formData, motherId: v === "unknown" ? "" : v})}
              >
                <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                  <SelectValue placeholder="Select mother" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="unknown">Unknown / Original</SelectItem>
                  {birds?.filter(b => b.sex === 'female' && b.id !== resident?.id).map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="father" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Father</Label>
              <Select 
                value={formData.fatherId || "unknown"} 
                onValueChange={v => setFormData({...formData, fatherId: v === "unknown" ? "" : v})}
              >
                <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                  <SelectValue placeholder="Select father" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="unknown">Unknown / Original</SelectItem>
                  {birds?.filter(b => b.sex === 'male' && b.id !== resident?.id).map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hatch_date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hatch Date / Arrival Date</Label>
            <Input 
              id="hatch_date" 
              type="date"
              value={formData.hatch_date} 
              onChange={e => setFormData({...formData, hatch_date: e.target.value})}
              className="bg-background border-border h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="traits" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personality Traits</Label>
            <Input 
              id="traits" 
              value={formData.personalityTraits} 
              onChange={e => setFormData({...formData, personalityTraits: e.target.value})}
              placeholder="Brave, curious, loves water..."
              className="bg-background border-border h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rescue Story & Heritage Notes</Label>
            <Textarea 
              id="story" 
              value={formData.backstory} 
              onChange={e => setFormData({...formData, backstory: e.target.value})}
              placeholder="Describe origin story or incubation notes..."
              className="bg-background border-border min-h-[120px] resize-none rounded-xl"
            />
          </div>

          <DialogFooter className="pt-4 sm:justify-between gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 border-border font-black uppercase text-xs tracking-widest rounded-xl"
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
