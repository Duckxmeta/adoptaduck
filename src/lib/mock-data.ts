import { Resident } from './types';

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: 'captain-quack',
    name: 'Captain Quack',
    breed: 'Pekin',
    sex: 'male',
    heritageTree: 'Descendant of the original sanctuary flock.',
    eggCounter: 0,
    personalityTraits: 'Natural leader, protective, loves floating on calm waters.',
    backstory: 'Rescued from a local pond where he was being bullied. Now he oversees the sanctuary with grace.',
    primaryImageUrl: 'https://picsum.photos/seed/duck2/600/600',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'billie',
    name: 'Billie',
    breed: 'Runner',
    sex: 'female',
    heritageTree: 'Lineage traced back to heritage farms in the North.',
    eggCounter: 142,
    personalityTraits: 'Energetic, vocal, highly social and excellent forager.',
    backstory: 'Arrived after her previous farm closed down. She quickly became the heart of our community.',
    primaryImageUrl: 'https://picsum.photos/seed/duck4/600/600',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mallory',
    name: 'Mallory',
    breed: 'Mallard',
    sex: 'female',
    heritageTree: 'Wild-born ancestry with documented rescue lineage.',
    eggCounter: 98,
    personalityTraits: 'Observant, independent, loves rainy days and fresh greens.',
    backstory: 'Found with a minor wing injury, Mallory chose to stay at the sanctuary after recovery.',
    primaryImageUrl: 'https://picsum.photos/seed/duck3/600/600',
    createdAt: new Date().toISOString(),
  }
];