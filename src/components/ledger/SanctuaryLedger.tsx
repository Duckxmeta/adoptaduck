"use client";

import { useState, useEffect } from 'react';
import { initializeFirebase } from '@/firebase/init';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Heart, ClipboardList, TrendingUp, ShieldAlert } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useUser } from '@/firebase';

interface Purchase {
  id: string;
  date: string;
  item_description: string;
  amount_usd: number;
  category: string;
}

interface TransparencyTotals {
  total_donations_count: number;
  total_usd_value_received: number;
}

export function SanctuaryLedger() {
  const { user, isUserLoading } = useUser();
  const [totals, setTotals] = useState<TransparencyTotals>({
    total_donations_count: 0,
    total_usd_value_received: 0,
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const { firestore } = initializeFirebase();

    // 1. Listen to transparency aggregates
    const totalsRef = doc(firestore, 'transparency', 'totals');
    const unsubscribeTotals = onSnapshot(totalsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotals({
          total_donations_count: Number(data.total_donations_count) || 0,
          total_usd_value_received: Number(data.total_usd_value_received) || 0,
        });
      }
    }, (err) => {
      console.error("Error listening to transparency aggregates:", err);
    });

    // 2. Listen to sanctuary purchases
    const purchasesRef = collection(firestore, 'sanctuary_purchases');
    const q = query(purchasesRef, orderBy('date', 'desc'));
    const unsubscribePurchases = onSnapshot(q, (querySnap) => {
      const docs: Purchase[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        docs.push({
          id: docSnap.id,
          date: data.date || '',
          item_description: data.item_description || '',
          amount_usd: Number(data.amount_usd) || 0,
          category: data.category || 'General',
        });
      });
      setPurchases(docs);
      setLoading(false);
    }, (err) => {
      console.error("Error listening to sanctuary purchases:", err);
      setLoading(false);
    });

    return () => {
      unsubscribeTotals();
      unsubscribePurchases();
    };
  }, [user]);

  if (isUserLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground text-xs uppercase tracking-widest animate-pulse font-black">
        Syncing Ledger Pulse...
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="bg-card border-border border-2 rounded-3xl p-8 text-center space-y-4 max-w-4xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h4 className="font-headline font-black text-sm uppercase tracking-wider">Access Locked</h4>
        <p className="text-[10px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Please log in to view the live transparency ledger.
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border border-2 rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl mx-auto">
      <CardHeader className="p-6 md:p-8 border-b border-border bg-primary/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left flex-1">
            <Badge variant="outline" className="border-primary/40 text-primary px-3 py-0.5 text-[9px] font-black uppercase tracking-widest block w-max mx-auto md:mx-0">
              Live Transparency Ledger
            </Badge>
            <CardTitle className="text-xl md:text-2xl font-headline font-black uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
              <ClipboardList className="h-6 w-6 text-primary" /> SANCTUARY LEDGER
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Real-time audit tracking for all incoming donations and care costs
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-8">
        {/* Transparency Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total USD Received */}
          <div className="bg-background/50 border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:border-primary/20 transition-all duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total USD Received</p>
              <p className="text-2xl md:text-3xl font-headline font-black text-foreground leading-none mt-1">
                ${totals.total_usd_value_received.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Total Donations Count */}
          <div className="bg-background/50 border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:border-primary/20 transition-all duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Donations Count</p>
              <p className="text-2xl md:text-3xl font-headline font-black text-foreground leading-none mt-1">
                {totals.total_donations_count.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Sanctuary Purchases / Expense Log */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="font-headline font-black text-sm uppercase tracking-wider text-foreground">
              Recent Sanctuary Purchases
            </h4>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-xs uppercase tracking-widest animate-pulse font-bold">
              Loading transparency logs...
            </div>
          ) : purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Description</th>
                    <th className="py-3 px-2 text-right">Amount (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs font-semibold text-foreground">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-2 text-muted-foreground font-mono">{purchase.date}</td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider",
                            purchase.category === 'Feed' && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                            purchase.category === 'Rescue Logistics' && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                            purchase.category === 'Medical' && "bg-red-500/10 text-red-500 border border-red-500/20",
                            !['Feed', 'Rescue Logistics', 'Medical'].includes(purchase.category) && "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                          )}
                        >
                          {purchase.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{purchase.item_description}</td>
                      <td className="py-3 px-2 text-right font-headline font-black text-foreground">
                        ${purchase.amount_usd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-2xl p-8 text-center space-y-2 bg-primary/5">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                No purchases logged yet
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold max-w-md mx-auto leading-relaxed">
                All incoming donations are reserved for immediate care and rescue logistics. Purchases will appear here in real-time as expense audits are processed.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
