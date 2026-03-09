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
  const donateUrl = `https://www.paypal.com/donate?business=decentducks@example.com&item_name=Virtual+Adoption+of+${resident.name}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="w-full bg-primary text-primary-foreground font-bold hover:glow-yellow py-8 text-xl">
            <Heart className="mr-3 h-6 w-6 fill-current" />
            VIRTUALLY ADOPT {resident.name.toUpperCase()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card text-card-foreground border-none max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-primary fill-primary" />
          </div>
          <DialogTitle className="text-center font-headline text-2xl font-bold">Adopt {resident.name}</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-base">
            Your virtual adoption supports {resident.name}'s food, bedding, and medical needs at the sanctuary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="bg-background/5 p-4 rounded-lg border border-secondary/10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Selected Duck:</span>
              <span className="text-primary font-bold">{resident.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Type:</span>
              <span>Virtual Adoption</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-primary text-primary-foreground font-bold h-14 text-lg">
              <a href={donateUrl} target="_blank" rel="noopener noreferrer">
                CONTINUE TO PAYPAL
              </a>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Secure donation processed via PayPal
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}