
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Expense } from '@/lib/types';
import { Wallet, Info, Database } from 'lucide-react';
import { ExpensePieChart } from './ExpensePieChart';

interface SanctuaryCostCardProps {
  expenses: Expense[] | null;
}

const ALLOWED_CATEGORIES = ['Ducks', 'Canine', 'Feline', 'Horse', 'Habitat', 'General'];

export function SanctuaryCostCard({ expenses }: SanctuaryCostCardProps) {
  // STRICT AUDIT: Ensure total remains linked to the master ledger total ($212.44)
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(e => ALLOWED_CATEGORIES.includes(e.category));
  }, [expenses]);

  const totalLifetime = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
  }, [filteredExpenses]);

  return (
    <Card className="bg-card border-border border-2 rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="p-8 border-b border-border bg-primary/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" /> SANCTUARY LEDGER
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audit-Ready Species Tracking</CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-background/50 border border-primary/20 p-4 rounded-2xl flex items-center gap-4 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Investment</p>
                <p className="text-xl font-headline font-black text-primary leading-none">
                  ${totalLifetime.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* NEW PIE CHART COMPONENT WITH ANIMAL VS GENERAL GROUPING */}
        <ExpensePieChart expenses={filteredExpenses} />

        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-medium leading-relaxed italic">
              Advanced tracking provides 100% transparency for verified Guardians and 501(c)(3) filing accuracy. Itemized ledger reflects real-time care costs.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
