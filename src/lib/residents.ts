'use client';

import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { Resident } from './types';

/**
 * @fileOverview Unified Fetcher.
 * Fetches waterfowl/birds from the 'birds' collection.
 */

export async function fetchAllSanctuaryResidents(db: Firestore): Promise<Resident[]> {
  try {
    // Fetch Birds (Primary focus)
    const birdsRef = collection(db, 'birds');
    const birdsSnap = await getDocs(birdsRef);
    const birdsList = birdsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        isDuck: true,
        species: data.species || 'Duck',
        category: data.category || 'The Flock'
      } as Resident;
    });

    // Sort client-side by createdAt desc
    birdsList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return birdsList;
  } catch (error) {
    console.error("Error syncing sanctuary residents:", error);
    return [];
  }
}
