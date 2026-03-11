import { Resident } from './types';

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: 'joey',
    name: 'Joey',
    breed: 'Pekin',
    sex: 'male',
    eggCounter: 0,
    personalityTraits: 'Dominant, vigilant, and fiercely protective.',
    backstory: 'Joey is the one who watches the skies and the fence line. He ensures every member of the Founding Four is safe before he even thinks about himself.',
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
    eggCounter: 120,
    personalityTraits: 'The loudest voice in the sanctuary and the mother figure of the group.',
    backstory: 'Huey leads with her heart (and her voice). She keeps the flock in check with her big personality and makes sure no one is ever left out of the conversation.',
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
    eggCounter: 85,
    personalityTraits: 'Fast, energetic, and highly motivated by treats.',
    backstory: 'If there’s a snack bowl in the vicinity, Jordie is already there. She’s the group\'s "first responder" to anything delicious and the fastest runner in the sanctuary.',
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
    eggCounter: 0,
    personalityTraits: 'Quiet, loyal, and observant.',
    backstory: 'While he isn\'t as loud as Huey, his actions speak for him. He is Jordie’s shadow, sticking by her side at all times to ensure she’s safe while she’s busy being the first at the snack bowl.',
    primaryImageUrl: 'https://picsum.photos/seed/cutiepie/600/600',
    galleryImageUrls: [],
    createdAt: new Date().toISOString(),
    source: 'Founding',
    isFoundingResident: true,
    generation: 0
  }
];
