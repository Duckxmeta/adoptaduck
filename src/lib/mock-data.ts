
import { Expense } from './types';

/**
 * MASTER SANCTUARY LEDGER - AUDITED APRIL 15, 2026
 * Total Investment: $347.80
 * High-precision species-specific tracking for 501(c)(3) readiness.
 */

export const MOCK_EXPENSES: Expense[] = [
  // --- APRIL 15, 2026 BATCH (Property Utility) ---
  { id: 'g11', itemName: 'Farm Truck Fuel (Property Utility)', cost: 15.00, category: 'General', date: '2026-04-15', createdAt: '2026-04-15T10:00:00Z' },

  // --- APRIL 14, 2026 BATCH (Facility Maintenance) ---
  { id: 'h11', itemName: 'Gutter System Components (End caps, Hangers, Drops)', cost: 71.22, category: 'Habitat', date: '2026-04-14', createdAt: '2026-04-14T10:00:00Z' },
  { id: 'g10', itemName: "Sales Tax (Lowe's Hardware)", cost: 6.94, category: 'General', date: '2026-04-14', createdAt: '2026-04-14T10:00:00Z' },

  // --- APRIL 12, 2026 BATCH (Infrastructure & Habitat Expansion) ---
  { id: 'h9', itemName: '5x 6ft T-posts (Fencing Infrastructure)', cost: 28.45, category: 'Habitat', date: '2026-04-12', createdAt: '2026-04-12T09:00:00Z' },
  { id: 'h10', itemName: 'Kiddie Pool (Drought Relief Habitat)', cost: 10.00, category: 'Habitat', date: '2026-04-12', createdAt: '2026-04-12T09:00:00Z' },
  { id: 'g9', itemName: 'Sales Tax (T-posts & Pool)', cost: 3.75, category: 'General', date: '2026-04-12', createdAt: '2026-04-12T09:00:00Z' },

  // --- APRIL 10, 2026 BATCH ---
  { id: 'b3', itemName: 'DMR Duck Feed (50lb)', cost: 25.99, category: 'Ducks', date: '2026-04-10', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'h8', itemName: 'Fescue Hay (Bedding)', cost: 9.00, category: 'Habitat', date: '2026-04-10', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'b4', itemName: 'Frozen Peas (12oz x2)', cost: 1.96, category: 'Ducks', date: '2026-04-10', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'b5', itemName: 'Frozen Peas (32oz)', cost: 2.48, category: 'Ducks', date: '2026-04-10', createdAt: '2026-04-10T10:00:00Z' },
  { id: 'g8', itemName: "Today's Combined Sales Tax", cost: 3.86, category: 'General', date: '2026-04-10', createdAt: '2026-04-10T10:00:00Z' },

  // --- HABITAT ARCHIVE ---
  { id: 'h1', itemName: 'Gas (Lawnmower)', cost: 6.14, category: 'Habitat', date: '2026-03-20', createdAt: '2026-03-20T12:00:00Z' },
  { id: 'h2', itemName: 'Hardware (Bolt/Hooks/Eyes)', cost: 7.02, category: 'Habitat', date: '2026-03-22', createdAt: '2026-03-22T12:00:00Z' },
  { id: 'h3', itemName: 'Flex Seal (2 cans)', cost: 33.98, category: 'Habitat', date: '2026-04-01', createdAt: '2026-04-01T12:00:00Z' },
  { id: 'h4', itemName: 'Rubber Liner', cost: 40.00, category: 'Habitat', date: '2026-04-05', createdAt: '2026-04-05T12:00:00Z' },
  { id: 'h5', itemName: 'Gorilla Glue', cost: 8.49, category: 'Habitat', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },
  { id: 'h6', itemName: 'Krylon Fusion Paint', cost: 8.49, category: 'Habitat', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },
  { id: 'h7', itemName: 'Gorilla All Weather Tape', cost: 1.49, category: 'Habitat', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },

  // --- DUCKS ARCHIVE ---
  { id: 'b1', itemName: 'Probiotic (3-pack)', cost: 4.99, category: 'Ducks', date: '2026-03-25', createdAt: '2026-03-25T12:00:00Z' },
  { id: 'b2', itemName: 'DMR Duck Crumble', cost: 6.99, category: 'Ducks', date: '2026-03-28', createdAt: '2026-03-28T12:00:00Z' },

  // --- CANINE ARCHIVE ---
  { id: 'd1', itemName: 'Puppy Chow', cost: 16.99, category: 'Canine', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },

  // --- GENERAL / OVERHEAD ARCHIVE ---
  { id: 'g1', itemName: 'Gas (Transport)', cost: 15.00, category: 'General', date: '2026-03-15', createdAt: '2026-03-15T12:00:00Z' },
  { id: 'g2', itemName: 'B&S Air Filter (Maintenance)', cost: 9.99, category: 'General', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' },
  { id: 'g3', itemName: 'Hardware Tax', cost: 0.68, category: 'General', date: '2026-03-22', createdAt: '2026-03-22T12:05:00Z' },
  { id: 'g4', itemName: 'Probiotic Tax', cost: 0.49, category: 'General', date: '2026-03-25', createdAt: '2026-03-25T12:05:00Z' },
  { id: 'g5', itemName: 'Feed Tax', cost: 0.68, category: 'General', date: '2026-03-28', createdAt: '2026-03-28T12:05:00Z' },
  { id: 'g6', itemName: 'Flex Seal Tax', cost: 3.32, category: 'General', date: '2026-04-01', createdAt: '2026-04-01T12:05:00Z' },
  { id: 'g7', itemName: "Today's Sales Tax", cost: 4.41, category: 'General', date: '2026-04-08', createdAt: '2026-04-08T17:00:00Z' }
];
