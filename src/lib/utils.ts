
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility to resolve resident identities, transitioning from TBD placeholders
 * to finalized G0 Founder names.
 */
export function getResidentName(bird?: { name: string; breed: string } | null) {
  if (!bird) return 'New Resident';
  
  const isPlaceholder = !bird.name || bird.name.toUpperCase().includes('TBD');
  
  if (isPlaceholder) {
    if (bird.breed === 'Swedish Blue') return 'Cocoa';
    if (bird.breed === 'Silver Appleyard') return 'Puff';
    return bird.name || 'Awaiting Name';
  }
  
  return bird.name;
}
