import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const donateUrl = "https://www.paypal.com/donate?business=decentducks@example.com";

  const Logo = () => (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center overflow-hidden border-2 border-secondary group-hover:scale-110 transition-transform">
        <span className="text-xl font-bold">🦆</span>
      </div>
      <span className="font-headline font-bold text-xl tracking-tight hidden sm:inline-block">
        DECENT <span className="text-primary">DUCKS</span>
      </span>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-background/80 backdrop-blur-md px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Residents</Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">Sanctuary</Link>
          <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">Admin</Link>
          <Button asChild className="bg-primary text-primary-foreground hover:glow-yellow font-bold">
            <a href={donateUrl} target="_blank" rel="noopener noreferrer">
              <Heart className="mr-2 h-4 w-4 fill-current" />
              DONATE
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
            <SheetContent side="right" className="bg-background border-secondary/20">
              <div className="flex flex-col gap-6 mt-12">
                <Link href="/" className="text-lg font-headline font-bold">Residents</Link>
                <Link href="/about" className="text-lg font-headline font-bold">Sanctuary</Link>
                <Link href="/admin" className="text-lg font-headline font-bold">Admin</Link>
                <Button asChild className="bg-primary text-primary-foreground font-bold mt-4">
                  <a href={donateUrl} target="_blank" rel="noopener noreferrer">
                    SUPPORT THE SANCTUARY
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