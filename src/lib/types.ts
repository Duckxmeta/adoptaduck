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
  created_at: number;
};

export type HealthNote = {
  date: string;
  note: string;
};

export type SanctuaryInfo = {
  paypal_email: string;
};