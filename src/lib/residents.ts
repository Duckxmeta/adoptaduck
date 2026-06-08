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
    const birdsQuery = query(birdsRef, orderBy('createdAt', 'desc'));
    const birdsSnap = await getDocs(birdsQuery);
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

    return birdsList;
  } catch (error) {
    console.error("Error syncing sanctuary residents:", error);
    return [];
  }
}
