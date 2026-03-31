
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
import { Resident } from '@/lib/types';
import { Bird, Loader2, Camera, ShieldCheck, TreePine, Upload, Sparkles, User, Info, Images, X, Star, Palette } from 'lucide-react';
import Image from 'next/image';
import { useStorage, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { getResidentName } from '@/lib/utils';

interface ResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Resident>) => Promise<void>;
  resident?: Resident | null;
}

export function ResidentDialog({ open, onOpenChange, onSave, resident }: ResidentDialogProps) {
  const storage = useStorage();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const birdsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'birds'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: birds } = useCollection<Resident>(birdsQuery);
  
  const [formData, setFormData] = useState<Partial<Resident>>({
    name: '',
    breed: '',
    color: '',
    sex: 'unknown',
    personalityTraits: '',
    backstory: '',
    primaryImageUrl: '',
    galleryImageUrls: [],
    isCommunityDuck: false,
    source: 'Rehomed',
    motherId: '',
    fatherId: '',
    hatch_date: '',
    isFoundingResident: true,
    generation: 0,
    tier: 'G0',
    founder: true,
    isFeatured: false
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (resident) {
      setFormData({
        ...resident,
        galleryImageUrls: resident.galleryImageUrls || [],
        isCommunityDuck: !!resident.isCommunityDuck,
        source: resident.source || 'Rehomed',
        motherId: resident.motherId || '',
        fatherId: resident.fatherId || '',
        hatch_date: resident.hatch_date || '',
        isFoundingResident: resident.isFoundingResident ?? (resident.source !== 'Hatched'),
        generation: resident.generation ?? 0,
        tier: resident.tier || (resident.generation === 0 ? 'G0' : 'G1'),
        founder: resident.founder ?? (resident.generation === 0),
        isFeatured: !!resident.isFeatured
      });
      setPreviewUrl(resident.primaryImageUrl || null);
      setGalleryPreviews(resident.galleryImageUrls || []);
    } else {
      setFormData({
        name: '',
        breed: '',
        color: '',
        sex: 'unknown',
        personalityTraits: '',
        backstory: '',
        primaryImageUrl: '',
        galleryImageUrls: [],
        isCommunityDuck: false,
        source: 'Rehomed',
        motherId: '',
        fatherId: '',
        hatch_date: '',
        isFoundingResident: true,
        generation: 0,
        tier: 'G0',
        founder: true,
        isFeatured: false
      });
      setPreviewUrl(null);
      setGalleryPreviews([]);
    }
    setSelectedFile(null);
    setSelectedGalleryFiles([]);
  }, [resident, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedGalleryFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryItem = (index: number) => {
    const isSavedUrl = typeof galleryPreviews[index] === 'string' && galleryPreviews[index].startsWith('http');
    
    if (isSavedUrl) {
      setFormData(prev => ({
        ...prev,
        galleryImageUrls: prev.galleryImageUrls?.filter((_, i) => i !== index)
      }));
    } else {
      const newFileIndex = galleryPreviews.slice(0, index).filter(p => !p.startsWith('http')).length;
      setSelectedGalleryFiles(prev => prev.filter((_, i) => i !== newFileIndex));
    }
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const calculateGeneration = (motherId?: string, fatherId?: string) => {
    if (!motherId && !fatherId) return 0;
    const mother = birds?.find(b => b.id === motherId);
    const father = birds?.find(b => b.id === fatherId);
    const motherGen = mother?.generation ?? 0;
    const fatherGen = father?.generation ?? 0;
    return Math.max(motherGen, fatherGen) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let finalImageUrl = formData.primaryImageUrl || "";
    const finalGalleryUrls = [...(formData.galleryImageUrls || [])];

    try {
      if (storage) {
        if (selectedFile) {
          const fileName = `${formData.name?.toLowerCase().replace(/\s+/g, '-') || 'resident'}-primary-${Date.now()}`;
          const fileRef = storageRef(storage, `resident-photos/${fileName}`);
          const snapshot = await uploadBytes(fileRef, selectedFile);
          finalImageUrl = await getDownloadURL(snapshot.ref);
        }

        if (selectedGalleryFiles.length > 0) {
          for (const file of selectedGalleryFiles) {
            const fileName = `${formData.name?.toLowerCase().replace(/\s+/g, '-') || 'resident'}-gallery-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const fileRef = storageRef(storage, `resident-photos/gallery/${fileName}`);
            const snapshot = await uploadBytes(fileRef, file);
            const url = await getDownloadURL(snapshot.ref);
            finalGalleryUrls.push(url);
          }
        }
      }

      const isRehomed = formData.source !== 'Hatched';
      const finalGeneration = isRehomed ? 0 : calculateGeneration(formData.motherId, formData.fatherId);

      if (finalImageUrl && !finalGalleryUrls.includes(finalImageUrl)) {
        finalGalleryUrls.unshift(finalImageUrl);
      }

      const submissionData = {
        ...formData,
        primaryImageUrl: finalImageUrl,
        galleryImageUrls: finalGalleryUrls,
        motherId: isRehomed ? "" : (formData.motherId || ""),
        fatherId: isRehomed ? "" : (formData.fatherId || ""),
        isFoundingResident: isRehomed,
        generation: finalGeneration,
        tier: `G${finalGeneration}` as any,
        founder: isRehomed,
        updatedAt: new Date().toISOString()
      };

      await onSave(submissionData);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Could not save images. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const isHatched = formData.source === 'Hatched';

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
            Register identity and sanctuary lineage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <div>
                <Label htmlFor="featured-toggle" className="text-[10px] font-black uppercase tracking-widest text-primary">Duck of the Month</Label>
                <p className="text-[8px] text-muted-foreground uppercase font-black">Feature on home page</p>
              </div>
            </div>
            <Switch 
              id="featured-toggle" 
              checked={formData.isFeatured} 
              onCheckedChange={(val) => setFormData({...formData, isFeatured: val})} 
            />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Camera className="h-3 w-3" /> Resident Portrait
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Tap to select primary portrait</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Images className="h-3 w-3" /> Growth Album (Gallery)
              </Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => galleryInputRef.current?.click()} className="text-[10px] font-black uppercase tracking-widest h-8">
                Add Photos
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {galleryPreviews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted">
                  <Image src={src} alt={`Gallery ${idx}`} fill className="object-cover" />
                  <button type="button" onClick={() => removeGalleryItem(idx)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              <div onClick={() => galleryInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background/50">
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resident Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder={getResidentName(formData as any)} 
              className="bg-background border-border h-12 rounded-xl text-lg font-headline font-bold uppercase tracking-tight" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Breed / Species</Label>
              <Input id="breed" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} placeholder="e.g. Pekin Duck" className="bg-background border-border h-11 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Palette className="h-3 w-3" /> Primary Color</Label>
              <Input id="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="e.g. Grey" className="bg-background border-border h-11 rounded-xl" />
            </div>
          </div>

          <div className="space-y-4 p-5 bg-muted/20 border border-border rounded-2xl">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Registration Type
            </Label>
            <RadioGroup value={formData.source} onValueChange={(v) => setFormData({...formData, source: v as any, isFoundingResident: v !== 'Hatched', founder: v !== 'Hatched', motherId: '', fatherId: ''})} className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 bg-background p-4 rounded-xl border border-border cursor-pointer hover:border-primary/40 transition-colors">
                <RadioGroupItem value="Rehomed" id="type-rehomed" />
                <Label htmlFor="type-rehomed" className="font-black uppercase text-[10px] tracking-widest cursor-pointer">G0 Founder</Label>
              </div>
              <div className="flex items-center space-x-2 bg-background p-4 rounded-xl border border-border cursor-pointer hover:border-primary/40 transition-colors">
                <RadioGroupItem value="Hatched" id="type-hatched" />
                <Label htmlFor="type-hatched" className="font-black uppercase text-[10px] tracking-widest cursor-pointer">Sanctuary Born</Label>
              </div>
            </RadioGroup>
          </div>

          {isHatched && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="mother" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><TreePine className="h-3 w-3 text-secondary" /> Mother</Label>
                <Select value={formData.motherId || "unknown"} onValueChange={v => setFormData({...formData, motherId: v === "unknown" ? "" : v})}>
                  <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                    <SelectValue placeholder="Select mother" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="unknown">Unknown / Original</SelectItem>
                    {birds?.filter(b => b.sex === 'female' && b.id !== resident?.id).map(b => (
                      <SelectItem key={b.id} value={b.id}>{getResidentName(b)} ({b.tier || `G${b.generation || 0}`})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="father" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><TreePine className="h-3 w-3 text-secondary" /> Father</Label>
                <Select value={formData.fatherId || "unknown"} onValueChange={v => setFormData({...formData, fatherId: v === "unknown" ? "" : v})}>
                  <SelectTrigger className="bg-background border-border h-11 rounded-xl">
                    <SelectValue placeholder="Select father" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="unknown">Unknown / Original</SelectItem>
                    {birds?.filter(b => b.sex === 'male' && b.id !== resident?.id).map(b => (
                      <SelectItem key={b.id} value={b.id}>{getResidentName(b)} ({b.tier || `G${b.generation || 0}`})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sex" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Biological Sex</Label>
            <Select value={formData.sex} onValueChange={v => setFormData({...formData, sex: v as any})}>
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
            <Label htmlFor="hatch_date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Arrival / Hatch Date</Label>
            <Input id="hatch_date" type="date" value={formData.hatch_date} onChange={e => setFormData({...formData, hatch_date: e.target.value})} className="bg-background border-border h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="traits" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personality Traits</Label>
            <Input id="traits" value={formData.personalityTraits} onChange={e => setFormData({...formData, personalityTraits: e.target.value})} placeholder="Brave, curious, loves water..." className="bg-background border-border h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rescue Story & Heritage Notes</Label>
            <Textarea id="story" value={formData.backstory} onChange={e => setFormData({...formData, backstory: e.target.value})} placeholder="Describe origin story or incubation notes..." className="bg-background border-border min-h-[100px] resize-none rounded-xl" />
          </div>

          <DialogFooter className="pt-4 sm:justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-12 border-border font-black uppercase text-xs tracking-widest rounded-xl" disabled={uploading}>CANCEL</Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground font-black h-12 text-xs tracking-widest rounded-xl shadow-lg" disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {resident ? 'SAVE CHANGES' : 'CREATE RESIDENT'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
