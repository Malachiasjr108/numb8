
// Firebase Client Configuration for Next.js
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDQI4LN01HSst1e3qYI_MJ5fFJDSIQGYf8",
  authDomain: "numb8-c5322.firebaseapp.com",
  projectId: "numb8-c5322",
  storageBucket: "numb8-c5322.firebasestorage.app",
  messagingSenderId: "486097405137",
  appId: "1:486097405137:web:e3eee1b239a422878b71f0",
  measurementId: "G-NDME4WNJ34",
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== "undefined") {
  // Client-side only
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
