
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, LayoutDashboard, ArrowLeft, Lock, Bird, Home } from 'lucide-react';
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
    { label: 'The Flock', href: '/flock', icon: Bird },
    { label: 'Dashboard', href: user ? '/admin' : '/login', icon: LayoutDashboard },
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
                  <Link href="/support#adopt">
                    <Heart className="mr-2 h-4 w-4 fill-current" />
                    ADOPT NOW
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            {!isAdmin && (
              <Button size="sm" asChild className="bg-primary text-primary-foreground font-black rounded-lg h-10 px-4 text-[10px] tracking-widest uppercase">
                 <Link href="/support#adopt">ADOPT</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            if (link.onClick) {
              return (
                <button 
                  key={link.label}
                  onClick={link.onClick}
                  className="flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[8px] font-black uppercase tracking-widest">{link.label}</span>
                </button>
              );
            }

            return (
              <Link 
                key={link.label}
                href={link.href!}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span className="text-[8px] font-black uppercase tracking-widest">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
