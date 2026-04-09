
import { Resident, Expense } from './types';

/**
 * Data injection for historical archives and manual entries.
 * April 8, 2026 Batch: $49.86 Total.
 */
export const MOCK_RESIDENTS: Resident[] = [];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'batch-20260408-1',
    itemName: 'Gorilla Glue',
    cost: 8.49,
    category: 'Habitat',
    date: '2026-04-08',
    createdAt: '2026-04-08T17:00:00Z'
  },
  {
    id: 'batch-20260408-2',
    itemName: 'Krylon Fusion Paint',
    cost: 8.49,
    category: 'Habitat',
    date: '2026-04-08',
    createdAt: '2026-04-08T17:00:00Z'
  },
  {
    id: 'batch-20260408-3',
    itemName: 'Gorilla All Weather Tape',
    cost: 1.49,
    category: 'Habitat',
    date: '2026-04-08',
    createdAt: '2026-04-08T17:00:00Z'
  },
  {
    id: 'batch-20260408-4',
    itemName: 'B&S Air Filter (Maintenance)',
    cost: 9.99,
    category: 'General',
    date: '2026-04-08',
    createdAt: '2026-04-08T17:00:00Z'
  },
  {
    id: 'batch-20260408-5',
    itemName: 'Puppy Chow',
    cost: 16.99,
    category: 'Dog',
    date: '2026-04-08',
    createdAt: '2026-04-08T17:00:00Z'
  },
  {
    id: 'batch-20260408-6',
    itemName: 'Sales Tax',
    cost: 4.41,
    category: 'General',
    date: '2026-04-08',
    createdAt: '2026-04-08T17:00:00Z'
  }
];
