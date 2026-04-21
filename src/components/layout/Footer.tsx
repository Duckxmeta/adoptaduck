import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export function Footer() {
  const supportUrl = "/support";
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/DDSlogo.png?alt=media";

  return (
    <footer id="contact-section" className="w-full bg-background border-t border-secondary/20 pt-16 pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-8 mb-16">
          <div className="relative w-24 h-24 overflow-hidden mb-2">
            <Image 
              src={logoUrl} 
              alt="Decent Ducks Logo" 
              fill 
              className="object-contain mix-blend-screen"
            />
          </div>
          <div className="space-y-4 max-w-md">
            <h4 className="font-headline font-black text-2xl tracking-tighter uppercase">DECENT <span className="text-primary">DUCKS</span></h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Providing a quiet, high-quality home for our flock. Join our community and virtually adopt your favorite resident today.
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground font-black px-12 h-14 rounded-xl hover:scale-105 transition-transform shadow-lg">
            <Link href="/support#donate" title="Support the Flock">
              <Heart className="mr-2 h-4 w-4 fill-current" />
              SUPPORT THE FLOCK
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-border/50 pt-12 mb-12">
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Mission</h5>
            <ul className="space-y-2 text-xs text-muted-foreground font-bold uppercase">
              <li><Link href="/flock" className="hover:text-primary transition-colors">Residents</Link></li>
              <li><Link href="/our-story" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link href="/found-a-duck" className="hover:text-destructive transition-colors text-destructive/80 italic font-black">I Found a Duck</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Community</h5>
            <ul className="space-y-2 text-xs text-muted-foreground font-bold uppercase">
              <li><Link href="/login" className="hover:text-primary transition-colors">Member Login</Link></li>
              <li><Link href="/support#membership" className="hover:text-primary transition-colors">Membership</Link></li>
              <li><Link href="/visit" className="hover:text-primary transition-colors">Visit Us</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Collaborate</h5>
            <ul className="space-y-2 text-xs text-muted-foreground font-bold uppercase">
              <li><Link href="/partners" className="hover:text-primary transition-colors">Official Partners</Link></li>
              <li><Link href="/support#merch" className="hover:text-primary transition-colors">Sanctuary Gear</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Legal</h5>
            <ul className="space-y-2 text-xs text-muted-foreground font-bold uppercase">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col items-center gap-4 text-[9px] text-muted-foreground uppercase tracking-[0.4em] font-black">
          <p>© {new Date().getFullYear()} DECENT DUCKS SANCTUARY. BUILT FOR THE BIRDS.</p>
        </div>
      </div>
    </footer>
  );
}
