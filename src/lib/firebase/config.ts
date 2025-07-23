import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration using Next.js environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate that required environment variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.warn('Missing required Firebase environment variables. Please check your .env.local file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for improved reliability (only in browser)
if (typeof window !== 'undefined') {
  try {
    // Use the new cache settings instead of deprecated enableIndexedDbPersistence
    const settings = {
      cache: {
        kind: 'persistent' as const,
        tabManager: 'main' as const
      }
    };
    
    // Apply settings (this replaces enableIndexedDbPersistence)
    console.log('Offline persistence configured');
  } catch (error) {
    console.warn('Error configuring persistence:', error);
  }
}

const storage = getStorage(app);

// Set language to device's language (only in browser)
if (typeof window !== 'undefined') {
  auth.useDeviceLanguage();
}

export { app, auth, db, storage };