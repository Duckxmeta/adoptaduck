
export type Resident = {
  id: string;
  name: string;
  breed: string;
  sex: 'male' | 'female' | 'unknown';
  heritageTree?: string;
  eggCounter: number;
  personalityTraits: string;
  backstory: string;
  primaryImageUrl: string;
  galleryImageUrls: string[];
  createdAt: string;
  updatedAt?: string;
  adopterEmail?: string; 
  isCommunityDuck?: boolean;
};

export type UserProfile = {
  id: string;
  uid: string;
  email: string;
  my_flock: string[];
  community_codes: string[];
  updatedAt: string;
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

export type SanctuaryStatistic = {
  id: string;
  totalBirds: number;
  totalEggsRescuedToday: number;
  lastUpdated: string;
};
