
"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense } from '@/lib/types';

interface ExpensePieChartProps {
  expenses: Expense[] | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  'The Flock': '#FFCC00',         // Decent Ducks Yellow
  'Canine Pack': '#9945FF',      // Canine Purple
  'Otis': '#8B4513',             // Equine Brown
  'Feline Friends': '#14F195',   // Green
  'General Operations': '#475569' // Slate/Dark Grey
};

export function ExpensePieChart({ expenses }: ExpensePieChartProps) {
  const chartData = useMemo(() => {
    if (!expenses) return [];

    const transformed: Record<string, number> = {
      'The Flock': 0,
      'Canine Pack': 0,
      'Otis': 0,
      'Feline Friends': 0,
      'General Operations': 0
    };

    expenses.forEach(e => {
      const cost = Number(e.cost) || 0;
      // Grouping Logic: Species categories map to animal slices, everything else is Operations
      if (e.category === 'Ducks') {
        transformed['The Flock'] += cost;
      } else if (e.category === 'Canine') {
        transformed['Canine Pack'] += cost;
      } else if (e.category === 'Horse') {
        transformed['Otis'] += cost;
      } else if (e.category === 'Feline') {
        transformed['Feline Friends'] += cost;
      } else {
        // Habitat, General, etc.
        transformed['General Operations'] += cost;
      }
    });

    return Object.entries(transformed)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  return (
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
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#8884d8'} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1A1A1A', 
                border: '1px solid #333', 
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Investment']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Care Distribution</h4>
        <div className="space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] }} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
              </div>
              <span className="text-xs font-black text-foreground">${item.value.toFixed(2)}</span>
            </div>
          ))}
          {chartData.length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-8">No ledger entries found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
