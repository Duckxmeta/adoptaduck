
import { Resident, Expense } from './types';

/**
 * Data injection for historical archives and manual entries.
 * Consolidated category system: Bird, Dog, Habitat, General.
 */
export const MOCK_RESIDENTS: Resident[] = [];

export const MOCK_EXPENSES: Expense[] = [
  // --- HISTORICAL REWORK ---
  {
    id: 'hist-gas-transport',
    itemName: 'Gas (Transport)',
    cost: 15.00,
    category: 'General',
    date: '2026-03-15',
    createdAt: '2026-03-15T12:00:00Z'
  },
  {
    id: 'hist-gas-mower',
    itemName: 'Gas (Lawnmower)',
    cost: 6.14,
    category: 'Habitat',
    date: '2026-03-20',
    createdAt: '2026-03-20T12:00:00Z'
  },
  {
    id: 'hist-hardware-base',
    itemName: 'Hardware (Bolt/Hooks/Eyes)',
    cost: 7.02,
    category: 'Habitat',
    date: '2026-03-22',
    createdAt: '2026-03-22T12:00:00Z'
  },
  {
    id: 'hist-hardware-tax',
    itemName: 'Hardware Tax',
    cost: 0.68,
    category: 'General',
    date: '2026-03-22',
    createdAt: '2026-03-22T12:05:00Z'
  },
  {
    id: 'hist-probiotic-base',
    itemName: 'Probiotic (3-pack)',
    cost: 4.99,
    category: 'Bird',
    date: '2026-03-25',
    createdAt: '2026-03-25T12:00:00Z'
  },
  {
    id: 'hist-probiotic-tax',
    itemName: 'Probiotic Tax',
    cost: 0.49,
    category: 'General',
    date: '2026-03-25',
    createdAt: '2026-03-25T12:05:00Z'
  },
  {
    id: 'hist-crumble-base',
    itemName: 'DMR Duck Crumble',
    cost: 6.99,
    category: 'Bird',
    date: '2026-03-28',
    createdAt: '2026-03-28T12:00:00Z'
  },
  {
    id: 'hist-feed-tax',
    itemName: 'Feed Tax',
    cost: 0.68,
    category: 'General',
    date: '2026-03-28',
    createdAt: '2026-03-28T12:05:00Z'
  },
  {
    id: 'hist-flex-base',
    itemName: 'Flex Seal (2 cans)',
    cost: 33.98,
    category: 'Habitat',
    date: '2026-04-01',
    createdAt: '2026-04-01T12:00:00Z'
  },
  {
    id: 'hist-flex-tax',
    itemName: 'Flex Seal Tax',
    cost: 3.32,
    category: 'General',
    date: '2026-04-01',
    createdAt: '2026-04-01T12:05:00Z'
  },
  {
    id: 'hist-liner',
    itemName: 'Rubber Liner',
    cost: 40.00,
    category: 'Habitat',
    date: '2026-04-05',
    createdAt: '2026-04-05T12:00:00Z'
  },

  // --- APRIL 8, 2026 BATCH ---
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
