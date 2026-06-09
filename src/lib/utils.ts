
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

export function getBirdTypeAndSex(resident?: {
  breed?: string;
  species?: string;
  personalityTraits?: string;
  backstory?: string;
  bio?: string;
  sex?: 'male' | 'female' | 'unknown';
} | null) {
  if (!resident) {
    return { type: 'DUCK', sexLabel: 'Resident' };
  }

  const clean = (val?: string) => (val || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const breed = clean(resident.breed);
  const species = clean(resident.species);
  const personality = clean(resident.personalityTraits);
  const backstory = clean(resident.backstory);
  const bio = clean(resident.bio);

  const isTurkey = breed.includes('turkey') || 
                   species.includes('turkey') || 
                   personality.includes('turkey') || 
                   backstory.includes('turkey') || 
                   bio.includes('turkey');

  const isGoose = breed.includes('goose') || 
                  species.includes('goose') || 
                  personality.includes('goose') || 
                  backstory.includes('goose') || 
                  bio.includes('goose');

  if (isTurkey) {
    return {
      type: 'TURKEY',
      sexLabel: resident.sex === 'male' ? 'Tom' : 'Hen'
    };
  }

  if (isGoose) {
    return {
      type: 'GOOSE',
      sexLabel: resident.sex === 'male' ? 'Gander' : 'Hen'
    };
  }

  return {
    type: 'DUCK',
    sexLabel: resident.sex === 'male' ? 'Drake' : 'Hen'
  };
}
