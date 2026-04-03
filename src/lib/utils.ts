import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility to resolve resident identities.
 * Hard-coded references to specific birds have been removed to ensure 
 * the UI reflects the dynamic state of the database.
 */
export function getResidentName(bird?: { name: string; breed: string; id?: string } | null) {
  if (!bird) return 'New Resident';
  
  const name = bird.name?.trim();
  const nameUpper = name?.toUpperCase() || '';
  
  // Check for legacy placeholders or empty names
  const isPlaceholder = !name || 
                        nameUpper.includes('TBD') || 
                        nameUpper === 'NEW RESIDENT' || 
                        nameUpper === 'AWAITING NAME' ||
                        nameUpper === 'SANCTUARY FRIEND';
  
  if (isPlaceholder) {
    return 'Sanctuary Resident';
  }
  
  return bird.name;
}
