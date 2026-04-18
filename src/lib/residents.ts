
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
    const residentsQuery = query(residentsRef, orderBy('createdAt', 'desc'));
    const residentsSnap = await getDocs(residentsQuery);
    const residentsList = residentsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        isDuck: false,
        // Grouping category defaults to 'Sanctuary Friends' if missing
        category: data.category || 'Sanctuary Friends'
      } as Resident;
    });

    // 3. Combine with type safety
    return [...birdsList, ...residentsList];
  } catch (error) {
    console.error("Error syncing sanctuary residents:", error);
    return [];
  }
}
