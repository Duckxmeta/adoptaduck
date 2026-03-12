
import { Resident } from './types';

const sharedNarrative = "The story of the Founding Four began in 2022, when they were purchased as seasonal Easter ducklings. After a year of growth, it became clear their initial home wasn't equipped for their long-term needs. In 2023, they were officially rehomed to Decent Ducks Sanctuary. For years now, this bonded group has served as the heart of our mission, proving that with the right environment, every rescue can thrive long-term.";

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: 'joey',
    name: 'Joey',
    breed: 'Pekin',
    sex: 'male',
    personalityTraits: 'Dominant, vigilant, and fiercely protective.',
    backstory: `${sharedNarrative} Today, Joey has taken his second chance and turned it into a mission, serving as the flock's primary protector.`,
    primaryImageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_4297.jpeg?alt=media',
    galleryImageUrls: [],
    createdAt: new Date().toISOString(),
    source: 'Founding',
    isFoundingResident: true,
    generation: 0
  },
  {
    id: 'huey',
    name: 'Huey',
    breed: 'Pekin',
    sex: 'female',
    personalityTraits: 'The loudest voice in the sanctuary and the mother figure of the group.',
    backstory: `${sharedNarrative} Huey uses her loud, charismatic voice to make sure no one ever ignores the needs of the flock again.`,
    primaryImageUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-7482167027-804c1.firebasestorage.app/o/IMG_8640.jpg?alt=media',
    galleryImageUrls: [],
    createdAt: new Date().toISOString(),
    source: 'Founding',
    isFoundingResident: true,
    generation: 0,
    isCommunityDuck: true
  },
  {
    id: 'jordie',
    name: 'Jordie',
    breed: 'Pekin',
    sex: 'female',
    personalityTraits: 'Fast, energetic, and highly motivated by treats.',
    backstory: `${sharedNarrative} Jordie celebrates her freedom by being the fastest runner to the snack bowl every single morning.`,
    primaryImageUrl: 'https://picsum.photos/seed/jordie/600/600',
    galleryImageUrls: [],
    createdAt: new Date().toISOString(),
    source: 'Founding',
    isFoundingResident: true,
    generation: 0
  },
  {
    id: 'cutie-pie',
    name: 'Cutie Pie',
    breed: 'Pekin',
    sex: 'male',
    personalityTraits: 'Quiet, loyal, and observant.',
    backstory: `${sharedNarrative} Cutie Pie remains the silent guardian, staying by Jordie's side to ensure the family he arrived with stays safe.`,
    primaryImageUrl: 'https://picsum.photos/seed/cutiepie/600/600',
    galleryImageUrls: [],
    createdAt: new Date().toISOString(),
    source: 'Founding',
    isFoundingResident: true,
    generation: 0
  }
];
