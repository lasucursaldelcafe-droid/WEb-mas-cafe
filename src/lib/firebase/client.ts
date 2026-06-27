import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

let clientApp: FirebaseApp | undefined;
let clientDb: Firestore | undefined;

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
}

export function getClientDb(): Firestore | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseClientConfigured()) return null;

  if (!clientApp) {
    const existing = getApps();
    clientApp =
      existing.length > 0
        ? existing[0]
        : initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          });
  }

  if (!clientDb) {
    clientDb = getFirestore(clientApp);
  }

  return clientDb;
}
