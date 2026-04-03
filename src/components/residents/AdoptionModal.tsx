
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ShieldCheck, Sparkles, Loader2, ArrowRight, Check } from "lucide-react";
import { Resident, UserProfile } from "@/lib/types";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export function AdoptionModal({ resident, trigger }: AdoptionModalProps) {
  const [suggestedName, setSuggestedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  const isGuardian = userProfile?.role === 'guardian' || userProfile?.role === 'admin';

  const displayName = resident.name;

  const handleSubmitSuggestion = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      if (suggestedName.trim() && firestore) {
        // Naming Request Engine: Save to naming_requests
        const requestData = {
          birdId: resident.id,
          birdName: resident.name,
          suggestedName: suggestedName.trim(),
          userEmail: user.email || 'anonymous',
          userName: user.displayName || 'A Supporter',
          status: 'pending',
          createdAt: serverTimestamp()
        };

        await addDoc(collection(firestore, 'naming_requests'), requestData);
        
        toast({
          title: "Suggestion Recorded!",
          description: `Admin notified of your suggested name for ${displayName}.`,
        });

        if (isGuardian) {
          setIsSuccess(true);
          setIsSubmitting(false);
          return;
        }
      }
      
      // If not Guardian, redirect to support
      setTimeout(() => {
        router.push(`/support?bird=${encodeURIComponent(displayName)}#membership`);
        setIsSubmitting(false);
      }, 800);
    } catch (error) {
      console.error("Submission Error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Check permissions or network and try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setIsSuccess(false)}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="w-full bg-primary text-primary-foreground font-black hover:scale-105 transition-all py-8 text-xl rounded-2xl shadow-lg shadow-primary/20">
            <Heart className="mr-3 h-6 w-6 fill-current" />
            SUPPORT {displayName.toUpperCase()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md p-0 overflow-hidden rounded-[2rem]">
        <div className="bg-primary/10 p-8 text-center space-y-4 border-b border-border">
          <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30">
            <Heart className="h-10 w-10 text-primary fill-primary" />
          </div>
          <DialogTitle className="font-headline text-2xl font-black uppercase tracking-tight">
            {isSuccess ? "REQUEST FILED!" : `Support ${displayName}`}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
            {isSuccess 
              ? "Your name suggestion has been queued for admin review. Thank you for your guardianship!" 
              : "Direct contributions fund the immediate care, health, and happiness of our residents."}
          </DialogDescription>
        </div>

        <div className="p-8 space-y-6">
          {!isSuccess ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-suggestion" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Name Suggestion (Optional)
                  </Label>
                  <Input 
                    id="name-suggestion" 
                    placeholder="Enter a new name..." 
                    value={suggestedName}
                    onChange={(e) => setSuggestedName(e.target.value)}
                    className="bg-background border-border h-12 rounded-xl focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleSubmitSuggestion}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-black h-16 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    isGuardian ? "SUBMIT NAME SUGGESTION" : <>CONTINUE TO SUPPORT <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
                <div className="flex flex-col items-center gap-2 text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-secondary" /> SECURE SUPPORT HUB</span>
                </div>
              </div>
            </>
          ) : (
            <DialogClose asChild>
              <Button className="w-full h-14 bg-secondary text-secondary-foreground font-black uppercase tracking-widest rounded-xl">
                <Check className="mr-2 h-4 w-4" /> CLOSE PORTAL
              </Button>
            </DialogClose>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AdoptionModalProps {
  resident: Resident;
  trigger?: React.ReactNode;
}
