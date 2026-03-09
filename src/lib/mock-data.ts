import { Resident } from './types';

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: '1',
    name: 'Captain Quack',
    breed: 'Pekin',
    sex: 'male',
    heritage_tree: ['Sir Waddles I', 'Lady Puddles'],
    egg_counter: 0,
    personality_traits: ['Fearless Leader', 'Loves Peas', 'Early Riser'],
    backstory: 'Captain Quack was found navigating the high seas of a suburban pond. Now he leads our sanctuary with a stern but fair beak.',
    image_url: 'https://picsum.photos/seed/duck2/600/600',
    health_notes: [{ date: '2024-01-15', note: 'Annual checkup: Perfect health.' }],
    created_at: Date.now(),
  },
  {
    id: '2',
    name: 'Billie',
    breed: 'Runner',
    sex: 'female',
    heritage_tree: ['Zoomie', 'Dash'],
    egg_counter: 124,
    personality_traits: ['Speedster', 'Social Butterfly', 'Worm Connoisseur'],
    backstory: 'Billie doesn\'t just walk, she glides. She arrived after winning the local 50-meter waddle sprint three years running.',
    image_url: 'https://picsum.photos/seed/duck4/600/600',
    health_notes: [],
    created_at: Date.now() - 100000,
  },
  {
    id: '3',
    name: 'Mallory',
    breed: 'Mallard',
    sex: 'female',
    heritage_tree: ['Willow', 'Fern'],
    egg_counter: 85,
    personality_traits: ['Artist', 'Quiet Observer', 'Rain Lover'],
    backstory: 'Mallory spent her youth painting abstract patterns in the mud. She joined us for a peaceful retirement and a constant supply of organic seeds.',
    image_url: 'https://picsum.photos/seed/duck3/600/600',
    health_notes: [{ date: '2024-02-10', note: 'Feather regrowth looking great after seasonal moult.' }],
    created_at: Date.now() - 200000,
  }
];