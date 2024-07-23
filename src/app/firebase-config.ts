// src/app/firebase-config.ts

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt8gy7mRzPIrPJkjTXDhdp0b6m99EZfq4",
  authDomain: "reelscoop-7148c.firebaseapp.com",
  projectId: "reelscoop-7148c",
  storageBucket: "reelscoop-7148c.appspot.com",
  messagingSenderId: "695735224194",
  appId: "1:695735224194:web:57acd28744851826a0f19b",
  measurementId: "G-XNLK44DBJH"
};

// Initialize Firebase only if no app is already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
