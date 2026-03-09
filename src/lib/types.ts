export type Resident = {
  id: string;
  name: string;
  breed: string;
  sex: 'male' | 'female';
  heritage_tree?: string[];
  egg_counter: number;
  personality_traits: string[];
  backstory: string;
  image_url: string;
  health_notes: HealthNote[];
  createdAt: number;
  updatedAt?: number;
};

export type HealthNote = {
  date: string;
  note: string;
};

export type SanctuaryStats = {
  totalBirds: number;
  totalEggsRescuedToday: number;
  lastUpdated: string;
};