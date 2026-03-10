
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { Resident } from "@/lib/types";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface AdoptionModalProps {
  resident: Resident;
  trigger?: React.ReactNode;
}

export function AdoptionModal({ resident, trigger }: AdoptionModalProps) {
  const [suggestedName, setSuggestedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";

  const handleSubmitSuggestion = async () => {
    if (!suggestedName.trim()) {
      window.open(donateUrl, '_blank');
      return;
    }

    setIsSubmitting(true);
    try {
      if (firestore) {
        await addDoc(collection(firestore, 'nameSuggestions'), {
          birdId: resident.id,
          birdOriginalName: resident.name,
          suggestedName: suggestedName.trim(),
          donorEmail: user?.email || 'anonymous',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        
        toast({
          title: "Suggestion Recorded!",
          description: `We've noted your suggestion for ${resident.name}. Redirecting to PayPal...`,
        });
      }
      
      // Open PayPal after a short delay
      setTimeout(() => {
        window.open(donateUrl, '_blank');
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not save your suggestion. You can still donate directly.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="w-full bg-primary text-primary-foreground font-black hover:scale-105 transition-all py-8 text-xl rounded-2xl shadow-lg shadow-primary/20">
            <Heart className="mr-3 h-6 w-6 fill-current" />
            SUPPORT {resident.name.toUpperCase()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-primary fill-primary" />
          </div>
          <DialogTitle className="text-center font-headline text-2xl font-black uppercase tracking-tight">Help {resident.name}</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-base font-medium">
            Donate $25+ to Adopt & Name a Resident! Your contribution supports food, bedding, and medical care.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="name-suggestion" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                 <Sparkles className="h-3 w-3" /> Name Suggestion (Optional)
               </Label>
               <Input 
                 id="name-suggestion" 
                 placeholder="Enter a new name for this duck..." 
                 value={suggestedName}
                 onChange={(e) => setSuggestedName(e.target.value)}
                 className="bg-background border-border h-12 rounded-xl"
               />
               <p className="text-[9px] text-muted-foreground italic">If you donate $25+, we'll consider this name officially!</p>
             </div>
          </div>

          <div className="bg-background p-4 rounded-xl border border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Current Name:</span>
              <span className="text-primary font-black uppercase">{resident.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Goal:</span>
              <span className="font-black uppercase">Sanctuary Adoption</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleSubmitSuggestion}
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground font-black h-14 text-lg rounded-xl shadow-xl"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "DONATE & SUBMIT"}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 font-bold uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              Secure sanctuary support via PayPal
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
