
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ShieldCheck, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Resident } from "@/lib/types";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COMMUNITY_NAMES = ['Joey', 'Jordie', 'Cutie Pie', 'Huey', 'SolGods'];

export function AdoptionModal({ resident, trigger }: AdoptionModalProps) {
  const [suggestedName, setSuggestedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";

  const nameNorm = resident.name?.trim().toLowerCase().replace(/\s+/g, '');
  const isCommunity = COMMUNITY_NAMES.some(cn => cn.toLowerCase().replace(/\s+/g, '') === nameNorm) || !!resident.isCommunityDuck;
  const displayName = resident.name;

  const handleSubmitSuggestion = async () => {
    setIsSubmitting(true);
    try {
      if (suggestedName.trim() && firestore) {
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
          description: `We've noted your suggestion for ${displayName}. Redirecting to donation portal...`,
        });
      }
      
      // Redirect to membership page with bird name to enable specialized success page
      setTimeout(() => {
        router.push(`/membership?bird=${encodeURIComponent(displayName)}`);
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not save your suggestion. You can still support directly.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          isCommunity ? (
            <Button size="lg" className="w-full bg-secondary text-secondary-foreground font-black hover:scale-105 transition-all py-8 text-xl rounded-2xl shadow-lg shadow-secondary/20">
              <Sparkles className="mr-3 h-6 w-6" />
              COMMUNITY RESIDENT
            </Button>
          ) : (
            <Button size="lg" className="w-full bg-primary text-primary-foreground font-black hover:scale-105 transition-all py-8 text-xl rounded-2xl shadow-lg shadow-primary/20">
              <Heart className="mr-3 h-6 w-6 fill-current" />
              SUPPORT {displayName.toUpperCase()}
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="bg-card text-card-foreground border-border max-w-md p-0 overflow-hidden rounded-[2rem]">
        {isCommunity ? (
          <>
            <div className="bg-secondary/10 p-8 text-center space-y-4 border-b border-border">
              <div className="mx-auto w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center border-2 border-secondary/30">
                <Sparkles className="h-10 w-10 text-secondary" />
              </div>
              <DialogTitle className="font-headline text-2xl font-black uppercase tracking-tight">Community Resident</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
                This is a Community Duck! You can join this flock by entering the special partner referral code in your Member Dashboard.
              </DialogDescription>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-secondary/5 border-2 border-secondary/20 p-6 rounded-2xl text-center space-y-4">
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  This resident is already part of a community partnership. Direct donations support the entire flock's shared care and overhead.
                </p>
              </div>
              <Button asChild className="w-full bg-secondary text-secondary-foreground font-black h-16 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                <Link href="/dashboard">GO TO DASHBOARD <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <div className="flex flex-col items-center gap-2 text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-secondary" /> PARTNER VERIFIED</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-primary/10 p-8 text-center space-y-4 border-b border-border">
              <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30">
                <Heart className="h-10 w-10 text-primary fill-primary" />
              </div>
              <DialogTitle className="font-headline text-2xl font-black uppercase tracking-tight">Support {displayName}&apos;s Journey</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
                Your direct donation helps unlock internal care logs and dynamic lineage records in your member portal.
              </DialogDescription>
            </div>

            <div className="p-8 space-y-6">
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
                    className="bg-background border-border h-12 rounded-xl focus:ring-primary/50"
                  />
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                    Donations allow us to allocate funds exactly where needed in the sanctuary ledger.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleSubmitSuggestion}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-black h-16 text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>JOIN THE MISSION <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
                <div className="flex flex-col items-center gap-2 text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-secondary" /> SECURE DIRECT SUPPORT</span>
                  <span>Select a subscription or one-time gift on the next page</span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface AdoptionModalProps {
  resident: Resident;
  trigger?: React.ReactNode;
}
