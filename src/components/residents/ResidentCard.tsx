import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Resident } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

interface ResidentCardProps {
  resident: Resident;
}

export function ResidentCard({ resident }: ResidentCardProps) {
  return (
    <Link href={`/residents/${resident.id}`}>
      <Card className="group overflow-hidden bg-card border-none rounded-xl duck-card-hover">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={resident.image_url}
            alt={resident.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/80 backdrop-blur-md text-foreground border-secondary/50">
              {resident.breed}
            </Badge>
          </div>
          {resident.egg_counter > 100 && (
            <div className="absolute top-3 right-3">
              <span className="status-live">PROLIFIC</span>
            </div>
          )}
        </div>
        <CardContent className="p-5 flex justify-between items-center">
          <div>
            <h3 className="font-headline font-bold text-xl text-card-foreground">{resident.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{resident.sex}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-secondary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}