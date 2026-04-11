/**
 * SANCTUARY MERCHANDISE MANIFEST
 * DECOMMISSIONED: Moving to single-spotlight model.
 * Direct all traffic to https://justduckit-merch.printful.me/
 */

export interface MerchItem {
  id: string;
  name: string;
  minPrice: number;
  tier: number;
  thumbnailUrl: string;
  redirectUrl: string;
}

export const MERCH_CATALOG: MerchItem[] = [];
