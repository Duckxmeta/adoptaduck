import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility to resolve resident identities, hard-locked to production IDs
 * for G0 Founders. This handles fallback naming for all sanctuary views.
 */
export function getResidentName(bird?: { name: string; breed: string; id?: string } | null) {
  if (!bird) return 'New Resident';
  
  // Hard-lock Production IDs
  if (bird.id === 'G0-COCOA') return 'Cocoa';
  if (bird.id === 'G0-PUFF') return 'Puff';
  
  // Check for legacy placeholders or empty names
  const nameUpper = bird.name?.toUpperCase() || '';
  const isPlaceholder = !bird.name || nameUpper.includes('TBD') || nameUpper === 'NEW RESIDENT' || nameUpper === 'AWAITING NAME';
  
  if (isPlaceholder) {
    // Exact mapping for the G0 Founders based on breed signature
    if (bird.breed === 'Swedish Blue' || bird.breed?.toLowerCase().includes('swedish')) return 'Cocoa';
    if (bird.breed === 'Silver Appleyard' || bird.breed?.toLowerCase().includes('appleyard')) return 'Puff';
    return bird.name || 'Sanctuary Friend';
  }
  
  return bird.name;
}