"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck } from "lucide-react";
import { Resident } from "@/lib/types";

interface AdoptionModalProps {
  resident: Resident;
  trigger?: React.ReactNode;
}

export function AdoptionModal({ resident, trigger }: AdoptionModalProps) {
  // Using the provided hosted button ID for the sanctuary
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";

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
            Your direct donation supports {resident.name}&apos;s food, bedding, and specialized medical needs at the sanctuary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="bg-background p-4 rounded-xl border border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Resident Name:</span>
              <span className="text-primary font-black uppercase">{resident.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Support Type:</span>
              <span className="font-black uppercase">Sanctuary Donation</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-primary text-primary-foreground font-black h-14 text-lg rounded-xl shadow-xl">
              <a href={donateUrl} target="_blank" rel="noopener noreferrer">
                DONATE VIA PAYPAL
              </a>
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