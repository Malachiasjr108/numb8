
// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let app: App;
let db: Firestore;
let auth: Auth;

// Initialize Firebase Admin
if (!getApps().length) {
  // For now, use the client config - in production, you should use a service account
  app = initializeApp({
    credential: cert({
      projectId: "numb8-c5322",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
    }),
    projectId: "numb8-c5322",
  });
} else {
  app = getApps()[0];
}

db = getFirestore(app);
auth = getAuth(app);

export { app, db, auth };
