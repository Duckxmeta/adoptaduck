import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Footer() {
  const donateUrl = "https://www.paypal.com/donate/?hosted_button_id=RG9T939ERXZB8";

  return (
    <footer className="w-full bg-background border-t border-secondary/20 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border border-secondary">
                <span className="text-sm">🦆</span>
              </div>
              <span className="font-headline font-bold text-lg">DECENT DUCKS</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Providing a forever home for ducks in need. Join our community and virtually adopt your favorite resident today.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm tracking-widest uppercase text-primary">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Resident Directory</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Sanctuary Mission</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm tracking-widest uppercase text-primary">Support</h4>
            <p className="text-sm text-muted-foreground mb-4">Every donation goes directly to feed, shelter, and medical care for our birds.</p>
            <Button asChild className="w-full md:w-auto bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform">
              <a href={donateUrl} target="_blank" rel="noopener noreferrer">
                DONATE VIA PAYPAL
              </a>
            </Button>
          </div>
        </div>

        <div className="pt-8 border-t border-secondary/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Decent Ducks Sanctuary. Built for the birds.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}