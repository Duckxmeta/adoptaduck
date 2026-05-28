
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
import { BulletinEntry } from '@/lib/types';
import { Megaphone, Loader2, Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useStorage } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { preprocessImage, getFriendlyStorageError } from '@/lib/image';

interface BulletinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<BulletinEntry>) => Promise<void>;
  bulletin?: BulletinEntry | null;
}

export function BulletinDialog({ open, onOpenChange, onSave, bulletin }: BulletinDialogProps) {
  const storage = useStorage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<BulletinEntry>>({
    title: '',
    content: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (bulletin) {
      setFormData(bulletin);
      setPreviewUrl(bulletin.imageUrl || null);
    } else {
      setFormData({ title: '', content: '', imageUrl: '' });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [bulletin, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl || "";

      if (selectedFile && storage) {
        // Preprocess (convert HEIC & compress client-side)
        const processedFile = await preprocessImage(selectedFile);
        // Safer mobile filename generation
        const safeName = (processedFile.name || 'update').replace(/\s+/g, '-');
        const fileName = `bulletin-${Date.now()}-${safeName}`;
        const fileRef = storageRef(storage, `bulletins/${fileName}`);
        const snapshot = await uploadBytes(fileRef, processedFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      await onSave({
        ...formData,
        imageUrl: finalImageUrl
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Bulletin Save Error:", error);
      const friendlyError = getFriendlyStorageError(error);
      toast({
        variant: "destructive",
        title: friendlyError.title,
        description: friendlyError.description,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md rounded-[2rem] focus:outline-none">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-headline font-black text-2xl uppercase tracking-tight">
              {bulletin ? 'EDIT BROADCAST' : 'NEW BROADCAST'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground font-medium">
            Post an update to the sanctuary community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Camera className="h-3 w-3" /> Update Image (Optional)
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
                  <ImageIcon className="h-10 w-10" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Tap to select photo</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broadcast Title</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g. Morning Pond Session" 
              className="bg-background border-border h-11 rounded-xl font-bold uppercase tracking-tight" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">The News</Label>
            <Textarea 
              id="content" 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              placeholder="Describe what's happening at the sanctuary..." 
              className="bg-background border-border min-h-[120px] resize-none rounded-xl text-sm leading-relaxed" 
              required 
            />
          </div>

          <DialogFooter className="gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-12 border-border font-black uppercase text-xs tracking-widest rounded-xl" disabled={loading}>CANCEL</Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground font-black h-12 text-xs tracking-widest rounded-xl shadow-lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {bulletin ? 'SAVE UPDATE' : 'PUBLISH UPDATE'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
