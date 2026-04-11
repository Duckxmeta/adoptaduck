
/**
 * SANCTUARY MERCHANDISE MANIFEST
 * Static Inventory for JustDuckit Quick Store Mirror
 */

export interface MerchItem {
  id: string;
  name: string;
  minPrice: number;
  tier: number;
  thumbnailUrl: string;
  redirectUrl: string;
}

const BASE_STORE_URL = 'https://justduckit-merch.printful.me/product/';

export const MERCH_CATALOG: MerchItem[] = [
  // TIER 1: STAPLES
  { id: '427494940', name: 'JustDuckit Hat', minPrice: 25.00, tier: 1, thumbnailUrl: 'https://picsum.photos/seed/jdi-hat/600/600', redirectUrl: `${BASE_STORE_URL}427494940` },
  { id: '390119961', name: 'Quack Hat', minPrice: 25.00, tier: 1, thumbnailUrl: 'https://picsum.photos/seed/quack-hat/600/600', redirectUrl: `${BASE_STORE_URL}390119961` },
  { id: '427491715', name: 'JustDuckit Tee', minPrice: 28.00, tier: 1, thumbnailUrl: 'https://picsum.photos/seed/jdi-tee/600/600', redirectUrl: `${BASE_STORE_URL}427491715` },

  // TIER 2: SEASONAL (Summer)
  { id: '427490682', name: 'Decent Ducks Sport Polo', minPrice: 35.00, tier: 2, thumbnailUrl: 'https://picsum.photos/seed/dd-polo/600/600', redirectUrl: `${BASE_STORE_URL}427490682` },
  { id: '427490526', name: 'JustDuckit Sport Polo', minPrice: 35.00, tier: 2, thumbnailUrl: 'https://picsum.photos/seed/jdi-polo/600/600', redirectUrl: `${BASE_STORE_URL}427490526` },
  { id: '427490183', name: 'JustDuckit Tanktop', minPrice: 24.00, tier: 2, thumbnailUrl: 'https://picsum.photos/seed/jdi-tank/600/600', redirectUrl: `${BASE_STORE_URL}427490183` },

  // TIER 3: ACCESSORIES
  { id: '427493867', name: 'JustDuckit Tumbler', minPrice: 22.00, tier: 3, thumbnailUrl: 'https://picsum.photos/seed/jdi-tumbler/600/600', redirectUrl: `${BASE_STORE_URL}427493867` },
  { id: '427493676', name: 'JustDuckit Coffee Mug', minPrice: 16.00, tier: 3, thumbnailUrl: 'https://picsum.photos/seed/jdi-mug/600/600', redirectUrl: `${BASE_STORE_URL}427493676` },
  { id: '427494347', name: 'JustDuckit Set of Pins', minPrice: 12.00, tier: 3, thumbnailUrl: 'https://picsum.photos/seed/jdi-pins/600/600', redirectUrl: `${BASE_STORE_URL}427494347` },

  // TIER 4: DECENTRALIZED
  { id: '390254175', name: 'Decentralized Sanctuary Hat', minPrice: 26.00, tier: 4, thumbnailUrl: 'https://picsum.photos/seed/dc-hat/600/600', redirectUrl: `${BASE_STORE_URL}390254175` },
  { id: '390112271', name: 'Decentralized Premium Tee', minPrice: 30.00, tier: 4, thumbnailUrl: 'https://picsum.photos/seed/dc-pre-tee/600/600', redirectUrl: `${BASE_STORE_URL}390112271` },
  { id: '390110911', name: 'Decentralized Tee', minPrice: 26.00, tier: 4, thumbnailUrl: 'https://picsum.photos/seed/dc-tee/600/600', redirectUrl: `${BASE_STORE_URL}390110911` },

  // TIER 5: OG MERCH
  { id: '369430382', name: 'Nashville JDI Hat', minPrice: 25.00, tier: 5, thumbnailUrl: 'https://picsum.photos/seed/nash-hat/600/600', redirectUrl: `${BASE_STORE_URL}369430382` },
  { id: '369430416', name: 'Nashville Fanny Pack', minPrice: 32.00, tier: 5, thumbnailUrl: 'https://picsum.photos/seed/nash-fanny/600/600', redirectUrl: `${BASE_STORE_URL}369430416` },
  { id: '369548933', name: 'What The Duck Hat', minPrice: 25.00, tier: 5, thumbnailUrl: 'https://picsum.photos/seed/wtd-hat/600/600', redirectUrl: `${BASE_STORE_URL}369548933` },
  { id: '369283718', name: 'OG Stickers', minPrice: 5.00, tier: 5, thumbnailUrl: 'https://picsum.photos/seed/og-stickers/600/600', redirectUrl: `${BASE_STORE_URL}369283718` },
];
