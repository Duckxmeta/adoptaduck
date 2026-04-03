
"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Ticket, Check, Loader2, Sparkles } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, runTransaction, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PromoCode, UserProfile } from '@/lib/types';

/**
 * Enhanced Promo Code component with Golden Ticket Redemption logic.
 * Corrected to physically update the database 'role' field.
 * HARD SHIELD: SPRINGDUCKS and SPRINGDUCKS-JDI-G0 bypass activation/expiration checks.
 */
export function PromoCodeInput() {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleApplyCode = async () => {
    const promoCodeInput = code.trim().toUpperCase();
    if (!promoCodeInput || !firestore || !user) return;

    setIsValidating(true);
    try {
      await runTransaction(firestore, async (transaction) => {
        // God Code Shielding: SPRINGDUCKS and SPRINGDUCKS-JDI-G0
        const isGodCode = promoCodeInput === 'SPRINGDUCKS-JDI-G0' || promoCodeInput === 'SPRINGDUCKS';
        const promoRef = doc(firestore, 'promo_codes', promoCodeInput);
        const userRef = doc(firestore, 'users', user.uid);
        
        const promoDoc = await transaction.get(promoRef);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error("User profile not found in database.");
        }

        const userData = userDoc.data() as UserProfile;

        // User-Specific Usage Check
        if (userData.usedCodes?.includes(promoCodeInput)) {
          throw new Error("You have already redeemed this reward.");
        }

        let duration = 365;
        let targetRole = 'guardian';

        if (!isGodCode) {
          if (!promoDoc.exists()) {
            throw new Error("Invalid or expired promo code.");
          }

          const promoData = promoDoc.data() as PromoCode;

          if (!promoData.isActive) {
            throw new Error("This promo code is no longer active.");
          }

          duration = promoData.durationDays || 365;
          targetRole = promoData.targetRole || 'guardian';
          
          transaction.update(promoRef, { 
            usageCount: (promoData.usageCount || 0) + 1 
          });
        } else {
          // God Code handling: Force update metadata if doc exists, but allow redemption anyway
          if (promoDoc.exists()) {
            const pData = promoDoc.data() as PromoCode;
            transaction.update(promoRef, { 
              usageCount: (pData.usageCount || 0) + 1 
            });
          }
        }

        // PHYSICAL DATABASE UPDATE: Change the role field
        const now = new Date();
        const expires = new Date();
        expires.setDate(now.getDate() + duration);

        transaction.update(userRef, { 
          role: targetRole, // THIS IS THE CRITICAL ROLE FLIP
          membershipStartedAt: now.toISOString(),
          membershipExpiresAt: expires.toISOString(),
          usedCodes: arrayUnion(promoCodeInput),
          updatedAt: new Date().toISOString()
        });
      });

      toast({
        title: "Reward Redeemed!",
        description: "Welcome to the Guardian tier. Syncing your access...",
      });
      
      setCode('');
      
      // AUTO-REFRESH: Ensure the user sees their real, database-verified role immediately
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error("Redemption Error:", error);
      
      const isPermissionError = error.message?.toLowerCase().includes('permission') || error.code === 'permission-denied';
      const displayMessage = isPermissionError ? "Checking your Golden Ticket... 🦆" : (error.message || "Failed to validate code.");

      toast({
        variant: "destructive",
        title: "Redemption Note",
        description: displayMessage,
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="bg-secondary/5 border-secondary/20 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles className="h-12 w-12 text-secondary" />
      </div>
      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-2 text-secondary">
          <Ticket className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Sanctuary Reward Code</span>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder={isValidating ? "Verifying... 🦆" : "Enter code..."}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-background border-secondary/20 h-12 text-sm font-black tracking-widest uppercase rounded-xl placeholder:text-muted-foreground/30"
            disabled={isValidating}
          />
          <Button 
            size="icon"
            onClick={handleApplyCode} 
            disabled={isValidating || !code.trim()} 
            className="bg-secondary text-secondary-foreground font-black h-12 w-12 rounded-xl shrink-0 shadow-lg hover:scale-105 transition-transform"
          >
            {isValidating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">
          Enter your Golden Ticket to unlock Guardian benefits. The site will refresh upon success.
        </p>
      </div>
    </Card>
  );
}
