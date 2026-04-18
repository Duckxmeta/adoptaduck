'use client';

import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { Resident } from './types';

/**
 * @fileOverview Unified Multi-Collection Fetcher.
 * Combines 'birds' (Ducks) and 'residents' (Dogs, Cats, Horses, etc.)
 * for a comprehensive adoption experience.
 */

export async function fetchAllSanctuaryResidents(db: Firestore): Promise<Resident[]> {
  try {
    // 1. Fetch Legacy Birds (Primary focus)
    const birdsRef = collection(db, 'birds');
    const birdsQuery = query(birdsRef, orderBy('createdAt', 'desc'));
    const birdsSnap = await getDocs(birdsQuery);
    const birdsList = birdsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        isDuck: true,
        species: 'Duck',
        category: data.category || 'The Flock'
      } as Resident;
    });

    // 2. Fetch Multi-Species Residents (Sanctuary Friends)
    const residentsRef = collection(db, 'residents');
    // Fetching without orderBy for immediate visibility
    const residentsSnap = await getDocs(residentsRef);
    const residentsList = residentsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        isDuck: false,
        category: data.category || 'Sanctuary Friends'
      } as Resident;
    });

    return [...birdsList, ...residentsList];
  } catch (error) {
    console.error("Error syncing sanctuary residents:", error);
    return [];
  }
}
