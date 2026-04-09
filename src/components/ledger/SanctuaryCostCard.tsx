"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense } from '@/lib/types';
import { Wallet, Info, Sparkles, Database, TrendingUp } from 'lucide-react';

interface SanctuaryCostCardProps {
  expenses: Expense[] | null;
  totalBirds?: number;
}

const CATEGORY_COLORS = {
  Bird: '#FFD700',    // Primary Gold
  Dog: '#FF4F4F',     // Bright Red
  Habitat: '#14F195', // Solana Green
  General: '#9945FF'  // Solana Purple
};

export function SanctuaryCostCard({ expenses, totalBirds = 1 }: SanctuaryCostCardProps) {
  const chartData = useMemo(() => {
    if (!expenses) return [];
    
    const categories = ['Bird', 'Dog', 'Habitat', 'General'];
    return categories.map(cat => ({
      name: cat,
      value: (expenses || []).filter(e => e.category === cat).reduce((sum, e) => sum + Number(e.cost), 0)
    })).filter(d => d.value > 0);
  }, [expenses]);

  const totalLifetime = useMemo(() => chartData.reduce((sum, d) => sum + d.value, 0), [chartData]);

  // SMART CALCULATION: (Bird + Habitat) / totalBirds. Dogs and General are excluded.
  const smartCareSpend = useMemo(() => {
    return (expenses || [])
      .filter(e => e.category === 'Bird' || e.category === 'Habitat')
      .reduce((sum, e) => sum + Number(e.cost), 0);
  }, [expenses]);

  const pricePerBird = smartCareSpend / (totalBirds || 1);

  return (
    <Card className="bg-card border-border border-2 rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="p-8 border-b border-border bg-primary/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" /> SANCTUARY LEDGER
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Smart Transparency Logs</CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-background/50 border border-primary/20 p-4 rounded-2xl flex items-center gap-4 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Investment</p>
                <p className="text-xl font-headline font-black text-primary leading-none">${totalLifetime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="bg-background/50 border border-secondary/20 p-4 rounded-2xl flex items-center gap-4 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Price Per Bird</p>
                <p className="text-xl font-headline font-black text-secondary leading-none">${pricePerBird.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> Care Distribution
              </h4>
              <div className="space-y-3">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name as keyof typeof CATEGORY_COLORS] || '#8884d8' }} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                    </div>
                    <span className="text-xs font-black">${item.value.toFixed(2)}</span>
                  </div>
                ))}
                {chartData.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center py-8">No smart ledger entries found.</p>
                )}
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-medium leading-relaxed italic">
                  'Price Per Bird' is calculated based on bird-specific care and habitat maintenance. 
                </p>
                <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold">
                  Dog and General expenses are excluded from the avian average but included in total transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}