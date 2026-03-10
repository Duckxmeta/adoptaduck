"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Menu, ShieldCheck } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";
  const logoUrl = "https://picsum.photos/seed/duck-logo/200/200"; // Placeholder for the attached logo

  const Logo = () => (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative w-12 h-12 bg-transparent overflow-hidden transition-all group-hover:scale-110">
        <Image 
          src={logoUrl} 
          alt="Virtual Sanctuary Logo" 
          fill 
          className="object-contain mix-blend-screen"
          priority
        />
      </div>
      <span className="font-headline font-black text-2xl tracking-tighter hidden sm:inline-block uppercase">
        VIRTUAL <span className="text-primary">SANCTUARY</span>
      </span>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl px-4 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Home</Link>
          <Link href="#residents" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">The Ducks</Link>
          <Link href={donateUrl} target="_blank" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Adopt</Link>
          <Link href="/admin/login" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Member Login
          </Link>
          <Button asChild className="bg-primary text-primary-foreground hover:scale-105 transition-transform font-black rounded-xl px-6 h-11 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
            <a href={donateUrl} target="_blank" rel="noopener noreferrer">
              <Heart className="mr-2 h-4 w-4 fill-current" />
              SUPPORT US
            </a>
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="text-primary">
             <a href={donateUrl} target="_blank" rel="noopener noreferrer">
               <Heart className="h-5 w-5 fill-current" />
             </a>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border">
              <div className="flex flex-col gap-8 mt-16">
                <Link href="/" className="text-2xl font-headline font-black uppercase tracking-tighter">Home</Link>
                <Link href="#residents" className="text-2xl font-headline font-black uppercase tracking-tighter">The Ducks</Link>
                <Link href={donateUrl} target="_blank" className="text-2xl font-headline font-black uppercase tracking-tighter">Adopt</Link>
                <Link href="/admin/login" className="text-2xl font-headline font-black uppercase tracking-tighter">Member Login</Link>
                <Button asChild className="bg-primary text-primary-foreground font-black h-16 text-lg rounded-2xl shadow-xl">
                  <a href={donateUrl} target="_blank" rel="noopener noreferrer">
                    DONATE NOW
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
