export type Resident = {
  id: string;
  name: string;
  breed: string;
  color?: string; // Physical color marker
  sex: 'male' | 'female' | 'unknown';
  heritageTree?: string;
  personalityTraits: string;
  backstory: string;
  primaryImageUrl: string;
  galleryImageUrls: string[];
  createdAt: string;
  updatedAt?: string;
  adopterEmail?: string; 
  isCommunityDuck?: boolean;
  motherId?: string;
  fatherId?: string;
  source?: 'Founding' | 'Rehomed' | 'Hatched';
  hatch_date?: string;
  isFoundingResident?: boolean;
  generation?: number;
  tier?: 'G0' | 'G1' | 'G2'; // New dynamic tiering
  founder?: boolean; // Explicit founder tag
  liveStatus?: string;
  statusLastUpdated?: string;
  isFeatured?: boolean;
};

export type EggHistoryEntry = {
  id: string; // Date as YYYY-MM-DD
  count: number;
  updatedAt: string;
};

export type Expense = {
  id: string;
  itemName: string;
  note?: string; // Additional archival details
  category: 'Feed' | 'Medical' | 'Bedding' | 'Infrastructure' | 'Acquisition' | 'Hardware' | 'Logistics';
  cost: number;
  date: string;
  birdId?: string;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  uid: string;
  email: string;
  my_flock: string[];
  community_codes: string[];
  usedCodes?: string[]; // Code tracking for Golden Tickets
  role: 'member' | 'admin' | 'guardian';
  membershipStartedAt?: string;
  membershipExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Donation = {
  id: string;
  amount: number;
  designation: string;
  timestamp: string;
  donorDisplayName: string;
  donorPrivateName?: string; 
  donorPrivateEmail?: string; 
  uid: string | null;
};

export type NamingRequest = {
  id: string;
  birdId: string;
  birdName: string;
  suggestedName: string;
  userEmail: string;
  userName: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: any;
};

export type HealthLogEntry = {
  id: string;
  birdId: string;
  logDate: string;
  notes: string;
};

export type DailyStatus = {
  id: string;
  morningFeeding: boolean;
  freshWater: boolean;
  eggCounter: boolean;
  healthCheck: boolean;
  nightlyPenUp: boolean;
  lastReset: string;
};

export type DuckOfTheMonthSettings = {
  birdId: string;
  monthlyMission: string;
  updatedAt: string;
};

export type BulletinEntry = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  timestamp: any;
};

export type PromoCode = {
  id: string;
  type: 'discount' | 'bypass_upgrade';
  targetRole?: string;
  durationDays?: number;
  usageCount: number;
  isActive: boolean;
  expirationDate?: string | null;
};
