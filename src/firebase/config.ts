import firebaseConfigImport from '../../firebase-applet-config.json';

export const firebaseConfig = {
  ...firebaseConfigImport,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "studio-7482167027-804c1.firebasestorage.app"
};
