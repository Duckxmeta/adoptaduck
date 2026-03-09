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
};

export type HealthLogEntry = {
  id: string;
  birdId: string;
  logDate: string;
  notes: string;
};

export type SanctuaryStatistic = {
  id: string;
  totalBirds: number;
  totalEggsRescuedToday: number;
  lastUpdated: string;
};
