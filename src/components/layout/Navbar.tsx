"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Menu, LogOut, LayoutDashboard, ArrowLeft, User, Lock, Bird } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ADMIN_EMAILS = ['decentducksorg@gmail.com', 'flowmarket1@gmail.com'];

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const membershipUrl = "/membership";
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/DDSlogo.png?alt=media";

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');
  const isInDashboard = pathname === '/admin';

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const Logo = () => (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative w-12 h-12 bg-transparent overflow-hidden transition-all group-hover:scale-110">
        <Image 
          src={logoUrl} 
          alt="Decent Ducks Logo" 
          fill 
          className="object-contain mix-blend-screen"
          priority
        />
      </div>
      <span className="font-headline font-black text-2xl tracking-tighter hidden sm:inline-block uppercase">
        DECENT <span className="text-primary">DUCKS</span>
      </span>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl px-4 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          {isInDashboard && isAdmin && (
             <Link href="/" className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors ml-4 border-l border-border pl-6">
               <ArrowLeft className="h-3 w-3" /> View Site
             </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Home</Link>
              <Link href="/flock" className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-1.5", pathname === '/flock' && "text-primary")}>
                <Bird className="h-3.5 w-3.5" /> The Flock
              </Link>
              <Link href="/admin" className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-1.5", isInDashboard && "text-primary")}>
                <LayoutDashboard className="h-3.5 w-3.5" /> {isAdmin ? 'Manager Portal' : 'My Dashboard'}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-destructive transition-colors p-0 h-auto">
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Home</Link>
              <Link href="/flock" className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-1.5", pathname === '/flock' && "text-primary")}>
                <Bird className="h-3.5 w-3.5" /> The Flock
              </Link>
              <Link href="/login" className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-1.5 group", pathname === '/login' && "text-primary")}>
                <Lock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" /> Member Login
              </Link>
              <Button asChild className="bg-primary text-primary-foreground hover:scale-105 transition-transform font-black rounded-xl px-6 h-11 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                <Link href={membershipUrl} title="Support the Flock">
                  <Heart className="mr-2 h-4 w-4 fill-current" />
                  ADOPT NOW
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {!isAdmin && (
            <Button variant="ghost" size="icon" asChild className="text-primary">
               <Link href={membershipUrl} title="Support the Flock">
                 <Heart className="h-5 w-5 fill-current" />
               </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border">
              <div className="flex flex-col gap-8 mt-16">
                {user ? (
                  <>
                    <Link href="/" className="text-2xl font-headline font-black uppercase tracking-tighter">Home</Link>
                    <Link href="/flock" className="text-2xl font-headline font-black uppercase tracking-tighter">The Flock</Link>
                    <Link href="/admin" className="text-2xl font-headline font-black uppercase tracking-tighter text-primary">{isAdmin ? 'Manager Portal' : 'My Dashboard'}</Link>
                    <button onClick={handleLogout} className="text-left text-2xl font-headline font-black uppercase tracking-tighter text-destructive">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/" className="text-2xl font-headline font-black uppercase tracking-tighter">Home</Link>
                    <Link href="/flock" className="text-2xl font-headline font-black uppercase tracking-tighter">The Flock</Link>
                    <Link href="/login" className="text-2xl font-headline font-black uppercase tracking-tighter flex items-center gap-2">
                      <Lock className="h-5 w-5" /> Member Login
                    </Link>
                    <Button asChild className="bg-primary text-primary-foreground font-black h-16 text-lg rounded-2xl shadow-xl">
                      <Link href={membershipUrl} title="Support the Flock">
                        ADOPT NOW
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}