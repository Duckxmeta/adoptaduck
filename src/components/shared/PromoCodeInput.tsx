"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Ticket, Check, Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

/**
 * Reusable Promo Code component with Atomic Counter logic.
 * Enforces a 2-use limit per code and updates user role to 'guardian'.
 */
export function PromoCodeInput() {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleApplyCode = async () => {
    const promoCode = code.trim().toUpperCase();
    if (!promoCode || !firestore || !user) return;

    setIsValidating(true);
    try {
      await runTransaction(firestore, async (transaction) => {
        const promoRef = doc(firestore, 'promo_codes', promoCode);
        const promoDoc = await transaction.get(promoRef);

        if (!promoDoc.exists()) {
          throw new Error("Invalid or expired promo code.");
        }

        const data = promoDoc.data();
        const usageCount = data.usageCount || 0;

        if (usageCount >= 2) {
          throw new Error("This promo code has reached its usage limit.");
        }

        // Apply atomic changes
        transaction.update(promoRef, { usageCount: usageCount + 1 });
        transaction.update(doc(firestore, 'users', user.uid), { 
          role: 'guardian',
          updatedAt: new Date().toISOString()
        });
      });

      toast({
        title: "Code Verified!",
        description: "Welcome to the Guardian tier. Your access is now active.",
      });
      setCode('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Code Error",
        description: error.message || "Failed to validate code.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="bg-secondary/5 border-secondary/20 rounded-2xl p-6 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-secondary">
          <Ticket className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Sanctuary Access Code</span>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="ENTER CODE" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-background border-secondary/20 h-12 text-sm font-black tracking-widest uppercase rounded-xl"
            disabled={isValidating}
          />
          <Button 
            size="icon"
            onClick={handleApplyCode} 
            disabled={isValidating || !code.trim()} 
            className="bg-secondary text-secondary-foreground font-black h-12 w-12 rounded-xl shrink-0"
          >
            {isValidating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">
          Enter a verified partner code to unlock Guardian benefits. (Atomic usage enforced)
        </p>
      </div>
    </Card>
  );
}
