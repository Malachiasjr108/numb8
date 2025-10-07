
// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyDQI4LN01HSst1e3qYI_MJ5fFJDSIQGYf8",
  authDomain: "numb8-c5322.firebaseapp.com",
  projectId: "numb8-c5322",
  storageBucket: "numb8-c5322.firebasestorage.app",
  messagingSenderId: "486097405137",
  appId: "1:486097405137:web:e3eee1b239a422878b71f0",
  measurementId: "G-NDME4WNJ34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
