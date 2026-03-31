
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility to resolve resident identities, transitioning from TBD placeholders
 * to finalized G0 Founder names. This serves as a robust fallback for the
 * mobile-uploaded birds (Cocoa and Puff).
 */
export function getResidentName(bird?: { name: string; breed: string; id?: string } | null) {
  if (!bird) return 'New Resident';
  
  // Hard-lock Production IDs
  if (bird.id === 'G0-COCOA') return 'Cocoa';
  if (bird.id === 'G0-PUFF') return 'Puff';
  
  // Check for TBD placeholders or empty names
  const nameUpper = bird.name?.toUpperCase() || '';
  const isPlaceholder = !bird.name || nameUpper.includes('TBD') || nameUpper === 'NEW RESIDENT';
  
  if (isPlaceholder) {
    // Exact mapping for the G0 Swedish Blue and Silver Appleyard
    if (bird.breed === 'Swedish Blue' || bird.breed?.toLowerCase().includes('swedish')) return 'Cocoa';
    if (bird.breed === 'Silver Appleyard' || bird.breed?.toLowerCase().includes('appleyard')) return 'Puff';
    return bird.name || 'Awaiting Name';
  }
  
  return bird.name;
}
