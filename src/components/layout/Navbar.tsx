
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, LayoutDashboard, ArrowLeft, Lock, Bird, Home, Loader2, BookOpen, Menu, X } from 'lucide-react';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';

const ADMIN_EMAIL = 'flowmarket1@gmail.com';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/DDSlogo.png?alt=media";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isGuardian = userProfile?.role === 'guardian' || isAdmin;
  const isInDashboard = pathname === '/admin' || pathname === '/dashboard';

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const getDashboardHref = () => {
    if (!user) return '/login';
    if (isAdmin) return '/admin';
    if (isGuardian) return '/dashboard';
    return '/support';
  };

  const Logo = () => (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative w-10 h-10 md:w-12 md:h-12 bg-transparent overflow-hidden transition-all group-hover:scale-110">
        <Image 
          src={logoUrl} 
          alt="Decent Ducks Logo" 
          fill 
          className="object-contain mix-blend-screen"
          priority
        />
      </div>
      <span className="font-headline font-black text-xl md:text-2xl tracking-tighter uppercase">
        DECENT <span className="text-primary">DUCKS</span>
      </span>
    </Link>
  );

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Adoption', href: '/adopt', icon: Heart },
    { label: 'Our Story', href: '/our-story', icon: BookOpen },
    { label: 'Dashboard', href: getDashboardHref(), icon: LayoutDashboard },
    { label: user ? 'Logout' : 'Login', onClick: user ? handleLogout : () => router.push('/login'), icon: user ? LogOut : Lock },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl px-4 py-3 md:py-4">
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
            <Link href="/" className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors", pathname === '/' && "text-primary")}>Home</Link>
            <Link href="/adopt" className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-1.5", pathname === '/adopt' && "text-primary")}>
              <Heart className="h-3.5 w-3.5" /> Adoption Hub
            </Link>
            <Link href="/our-story" className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors", pathname === '/our-story' && "text-primary")}>
              Our Story
            </Link>
            {user ? (
              <>
                <Link href={getDashboardHref()} className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-1.5", isInDashboard && "text-primary")}>
                  <LayoutDashboard className="h-3.5 w-3.5" /> {isAdmin ? 'Manager Portal' : 'My Dashboard'}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-destructive transition-colors p-0 h-auto">
                  <LogOut className="h-3.5 w-3.5 mr-1.5" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className={cn("text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-1.5 group", pathname === '/login' && "text-primary")}>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" /> Member Login
                </Link>
                <Button asChild className="bg-primary text-primary-foreground hover:scale-105 transition-transform font-black rounded-xl px-6 h-11 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                  <Link href="/support#adopt">
                    <Heart className="mr-2 h-4 w-4 fill-current" />
                    ADOPT NOW
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {!isAdmin && (
              <Button size="sm" asChild className="bg-primary text-primary-foreground font-black rounded-lg h-10 px-4 text-[10px] tracking-widest uppercase shadow-lg">
                 <Link href="/support#adopt">ADOPT</Link>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="h-10 w-10 text-foreground shrink-0 relative z-50 hover:bg-transparent"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-background/98 backdrop-blur-xl animate-in fade-in slide-in-from-top duration-200">
          <div className="flex flex-col h-full pt-24 px-6 pb-8 space-y-6">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn("text-lg font-headline font-black uppercase tracking-widest py-4 border-b border-border/50 block", pathname === '/' && "text-primary")}
            >
              Home
            </Link>
            <Link 
              href="/adopt" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn("text-lg font-headline font-black uppercase tracking-widest py-4 border-b border-border/50 flex items-center gap-2 block", pathname === '/adopt' && "text-primary")}
            >
              <Heart className="h-5 w-5" /> Adoption Hub
            </Link>
            <Link 
              href="/our-story" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn("text-lg font-headline font-black uppercase tracking-widest py-4 border-b border-border/50 block", pathname === '/our-story' && "text-primary")}
            >
              Our Story
            </Link>
            {user ? (
              <>
                <Link 
                  href={getDashboardHref()} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn("text-lg font-headline font-black uppercase tracking-widest py-4 border-b border-border/50 flex items-center gap-2 block", isInDashboard && "text-primary")}
                >
                  <LayoutDashboard className="h-5 w-5" /> {isAdmin ? 'Manager Portal' : 'My Dashboard'}
                </Link>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-lg font-headline font-black uppercase tracking-widest py-4 border-b border-border/50 text-left text-destructive flex items-center gap-2 w-full"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn("text-lg font-headline font-black uppercase tracking-widest py-4 border-b border-border/50 flex items-center gap-2 block", pathname === '/login' && "text-primary")}
                >
                  <Lock className="h-5 w-5 text-muted-foreground" /> Member Login
                </Link>
                <div className="pt-6">
                  <Button asChild className="w-full bg-primary text-primary-foreground font-black rounded-xl py-6 text-xs tracking-widest uppercase shadow-lg">
                    <Link href="/support#adopt" onClick={() => setIsMobileMenuOpen(false)}>
                      <Heart className="mr-2 h-5 w-5 fill-current" />
                      ADOPT NOW
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
