
export type Resident = {
  id: string;
  name: string;
  breed: string;
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
  category: 'Feed' | 'Medical' | 'Bedding' | 'Infrastructure';
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
  role: 'member' | 'admin' | 'guardian';
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

export type NameSuggestion = {
  id: string;
  birdId: string;
  birdOriginalName: string;
  suggestedName: string;
  donorEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
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
