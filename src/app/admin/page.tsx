"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_RESIDENTS } from '@/lib/mock-data';
import { Egg, Plus, LayoutGrid, LogOut, ChevronRight, Image as ImageIcon, FileText, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { generateDuckPersonalityAndLore } from '@/ai/flows/generate-duck-personality-and-lore-flow';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [residents, setResidents] = useState(MOCK_RESIDENTS);
  const { toast } = useToast();

  const incrementEgg = (id: string) => {
    setResidents(prev => prev.map(r => 
      r.id === id ? { ...r, egg_counter: r.egg_counter + 1 } : r
    ));
    toast({
      title: "Egg Counter Updated",
      description: "Successfully incremented for resident.",
    });
  };

  const decrementEgg = (id: string) => {
    setResidents(prev => prev.map(r => 
      r.id === id ? { ...r, egg_counter: Math.max(0, r.egg_counter - 1) } : r
    ));
  };

  const handleGenerateLore = async (resident: any) => {
    toast({
      title: "Generating Lore...",
      description: "Using GenAI to craft unique personality traits.",
    });
    
    try {
      const result = await generateDuckPersonalityAndLore({
        name: resident.name,
        breed: resident.breed,
        sex: resident.sex
      });
      
      setResidents(prev => prev.map(r => 
        r.id === resident.id ? { 
          ...r, 
          personality_traits: result.personalityTraits,
          backstory: result.backstory
        } : r
      ));

      toast({
        title: "Lore Generated!",
        description: `New personality updated for ${resident.name}.`,
      });
    } catch (error) {
       toast({
        title: "Generation Failed",
        description: "Could not reach the lore master.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Admin Mobile Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-secondary/20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-xs">D</div>
           <h1 className="font-headline font-black text-xl uppercase tracking-tighter">ADMIN <span className="text-primary">PANEL</span></h1>
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/login"><LogOut className="h-5 w-5" /></Link>
        </Button>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Quick Actions Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Residents</p>
              <p className="text-3xl font-headline font-black">{residents.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary text-secondary-foreground border-none">
            <CardContent className="p-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Eggs Today</p>
              <p className="text-3xl font-headline font-black">24</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
           <h2 className="font-headline font-bold text-lg uppercase tracking-wider flex items-center gap-2">
             <LayoutGrid className="h-4 w-4" /> Resident Management
           </h2>
           <Button size="sm" className="bg-primary text-primary-foreground font-bold">
             <Plus className="h-4 w-4 mr-1" /> ADD NEW
           </Button>
        </div>

        {/* Admin Resident List */}
        <div className="space-y-4">
          {residents.map((resident) => (
            <Card key={resident.id} className="bg-card text-card-foreground border-none rounded-xl overflow-hidden shadow-xl">
              <div className="flex items-center p-3 gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image src={resident.image_url} alt={resident.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-bold truncate uppercase">{resident.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase">{resident.breed} • {resident.sex}</p>
                </div>
                <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-2 min-w-[60px]">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Eggs</span>
                  <span className="text-lg font-black">{resident.egg_counter}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 border-t border-background divide-x divide-background">
                <Button 
                  variant="ghost" 
                  className="rounded-none h-12 text-[10px] font-bold uppercase flex-col gap-1 py-1"
                  onClick={() => incrementEgg(resident.id)}
                >
                  <Plus className="h-4 w-4" /> ADD EGG
                </Button>
                <Button 
                  variant="ghost" 
                  className="rounded-none h-12 text-[10px] font-bold uppercase flex-col gap-1 py-1"
                >
                  <ImageIcon className="h-4 w-4" /> PHOTOS
                </Button>
                <Button 
                  variant="ghost" 
                  className="rounded-none h-12 text-[10px] font-bold uppercase flex-col gap-1 py-1"
                  onClick={() => handleGenerateLore(resident)}
                >
                  <Sparkles className="h-4 w-4 text-primary" /> AI LORE
                </Button>
              </div>

              <div className="p-3 bg-secondary/5 flex gap-2 overflow-x-auto">
                <Button variant="outline" size="sm" className="bg-white/5 border-none h-8 text-[10px] font-bold uppercase">
                  <FileText className="h-3 w-3 mr-1" /> HEALTH NOTE
                </Button>
                <Button variant="outline" size="sm" className="bg-white/5 border-none h-8 text-[10px] font-bold uppercase">
                  <Settings className="h-3 w-3 mr-1" /> EDIT PROFILE
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Admin Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-secondary/20 flex justify-around p-3 z-50">
        <Button variant="ghost" className="flex-col gap-1 h-auto py-1 text-primary">
          <LayoutGrid className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase">Residents</span>
        </Button>
        <Button variant="ghost" className="flex-col gap-1 h-auto py-1 text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase">Gallery</span>
        </Button>
        <Button variant="ghost" className="flex-col gap-1 h-auto py-1 text-muted-foreground">
          <Stethoscope className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase">Health</span>
        </Button>
        <Button variant="ghost" className="flex-col gap-1 h-auto py-1 text-muted-foreground">
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase">Settings</span>
        </Button>
      </nav>
    </div>
  );
}

function Stethoscope({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z"/><path d="M10 22v-2a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v2"/><path d="M10 22h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"/><path d="M21 15V9a2 2 0 0 0-2-2h-3"/><path d="M21 15a2 2 0 0 1-2 2h-3"/>
    </svg>
  );
}