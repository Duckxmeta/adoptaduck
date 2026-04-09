
import { Resident, Expense } from './types';

/**
 * MASTER SANCTUARY LEDGER - AUDITED APRIL 8, 2026
 * Total Investment: $169.15
 * Categories: Bird, Dog, Habitat, General
 */

export const MOCK_RESIDENTS: Resident[] = [];

export const MOCK_EXPENSES: Expense[] = [
  // --- HABITAT: $105.61 ---
  { id: 'h1', itemName: 'Gas (Lawnmower)', cost: 6.14, category: 'Habitat', date: '2026-03-20', createdAt: '2026-03-20T12:00:00Z' },
  { id: 'h2', itemName: 'Hardware (Bolt/Hooks/Eyes)', cost: 7.02, category: 'Habitat', date: '2026-03-22', createdAt: '2026-03-22T12:00:00Z' },
  { id: 'h3', itemName: 'Flex Seal (2 cans)', cost: 33.98, category: 'Habitat', date: '2026-04-01', createdAt: '2026-04-01T12:00:00Z' },
  { id: 'h4', itemName: 'Rubber Liner', cost: 40.00, category: 'Habitat', date: '2026-04-05', createdAt: '2026-04-05T12:00:00Z' },
  { id: 'h5', itemName: 'Gorilla Glue', cost: 8.49, category: 'Habitat', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },
  { id: 'h6', itemName: 'Krylon Fusion Paint', cost: 8.49, category: 'Habitat', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },
  { id: 'h7', itemName: 'Gorilla All Weather Tape', cost: 1.49, category: 'Habitat', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },

  // --- BIRD: $11.98 ---
  { id: 'b1', itemName: 'Probiotic (3-pack)', cost: 4.99, category: 'Bird', date: '2026-03-25', createdAt: '2026-03-25T12:00:00Z' },
  { id: 'b2', itemName: 'DMR Duck Crumble', cost: 6.99, category: 'Bird', date: '2026-03-28', createdAt: '2026-03-28T12:00:00Z' },

  // --- DOG: $16.99 ---
  { id: 'd1', itemName: 'Puppy Chow', cost: 16.99, category: 'Dog', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },

  // --- GENERAL: $34.57 ---
  { id: 'g1', itemName: 'Gas (Transport)', cost: 15.00, category: 'General', date: '2026-03-15', createdAt: '2026-03-15T12:00:00Z' },
  { id: 'g2', itemName: 'B&S Air Filter (Maintenance)', cost: 9.99, category: 'General', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },
  { id: 'g3', itemName: 'Hardware Tax', cost: 0.68, category: 'General', date: '2026-03-22', createdAt: '2026-03-22T12:05:00Z' },
  { id: 'g4', itemName: 'Probiotic Tax', cost: 0.49, category: 'General', date: '2026-03-25', createdAt: '2026-03-25T12:05:00Z' },
  { id: 'g5', itemName: 'Feed Tax', cost: 0.68, category: 'General', date: '2026-03-28', createdAt: '2026-03-28T12:05:00Z' },
  { id: 'g6', itemName: 'Flex Seal Tax', cost: 3.32, category: 'General', date: '2026-04-01', createdAt: '2026-04-01T12:05:00Z' },
  { id: 'g7', itemName: "Today's Sales Tax", cost: 4.41, category: 'General', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' }
];
