import type { App } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

export function getAdminDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;

  if (!adminApp) {
    const existing = getApps();
    adminApp =
      existing.length > 0
        ? existing[0]
        : initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
          });
  }

  if (!adminDb) {
    adminDb = getFirestore(adminApp);
  }

  return adminDb;
}

export const COLLECTIONS = {
  siteContent: "site_content",
  analytics: "analytics_events",
  syncLogs: "sync_logs",
  settings: "site_settings",
} as const;

export const DOC_IDS = {
  mainContent: "main",
  mainSettings: "main",
} as const;
