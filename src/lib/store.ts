import { readFile, writeFile } from "fs/promises";
import path from "path";
import {
  COLLECTIONS,
  DOC_IDS,
  getAdminDb,
  isFirebaseConfigured,
} from "./firebase/admin";
import type {
  AnalyticsEvent,
  AnalyticsSummary,
  SiteContent,
  SiteSettings,
  SyncLog,
  SystemHealth,
} from "./types";

const CONTENT_PATH = path.join(process.cwd(), "content", "site.json");
const SETTINGS_PATH = path.join(process.cwd(), "content", "settings.json");

const DEFAULT_SETTINGS: SiteSettings = {
  accessMode: "public",
  godaddyReady: false,
  firebaseEnabled: false,
  googleDriveFolderId: "153OUmu9lChpCk2NiiirUwI_Z5EDQQNtC",
};

export function getContentProvider(): "firestore" | "json" {
  return isFirebaseConfigured() ? "firestore" : "json";
}

async function readJsonContent(): Promise<SiteContent> {
  const raw = await readFile(CONTENT_PATH, "utf-8");
  return JSON.parse(raw) as SiteContent;
}

async function writeJsonContent(content: SiteContent): Promise<void> {
  await writeFile(CONTENT_PATH, JSON.stringify(content, null, 2), "utf-8");
}

export async function getContent(): Promise<SiteContent> {
  const db = getAdminDb();
  if (db) {
    const snap = await db
      .collection(COLLECTIONS.siteContent)
      .doc(DOC_IDS.mainContent)
      .get();
    if (snap.exists) {
      return snap.data() as SiteContent;
    }
    const fallback = await readJsonContent();
    await db
      .collection(COLLECTIONS.siteContent)
      .doc(DOC_IDS.mainContent)
      .set({ ...fallback, updatedAt: Date.now() });
    return fallback;
  }
  return readJsonContent();
}

export async function saveContent(content: SiteContent): Promise<void> {
  const db = getAdminDb();
  if (db) {
    await db
      .collection(COLLECTIONS.siteContent)
      .doc(DOC_IDS.mainContent)
      .set({ ...content, updatedAt: Date.now() });
  }
  await writeJsonContent(content);
}

export async function getSettings(): Promise<SiteSettings> {
  const db = getAdminDb();
  if (db) {
    const snap = await db
      .collection(COLLECTIONS.settings)
      .doc(DOC_IDS.mainSettings)
      .get();
    if (snap.exists) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as SiteSettings) };
    }
  }

  try {
    const raw = await readFile(SETTINGS_PATH, "utf-8");
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as SiteSettings) };
  } catch {
    return {
      ...DEFAULT_SETTINGS,
      firebaseEnabled: isFirebaseConfigured(),
    };
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const db = getAdminDb();
  const payload = { ...settings, firebaseEnabled: isFirebaseConfigured() };
  if (db) {
    await db
      .collection(COLLECTIONS.settings)
      .doc(DOC_IDS.mainSettings)
      .set({ ...payload, updatedAt: Date.now() });
  }
  await writeFile(SETTINGS_PATH, JSON.stringify(payload, null, 2), "utf-8");
}

export async function trackAnalyticsEvent(
  event: Omit<AnalyticsEvent, "id" | "timestamp">,
): Promise<void> {
  const full: AnalyticsEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };

  const db = getAdminDb();
  if (db) {
    await db.collection(COLLECTIONS.analytics).doc(full.id).set(full);
    return;
  }

  const logPath = path.join(process.cwd(), "content", "analytics.json");
  let events: AnalyticsEvent[] = [];
  try {
    const raw = await readFile(logPath, "utf-8");
    events = JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    events = [];
  }
  events.push(full);
  if (events.length > 500) events = events.slice(-500);
  await writeFile(logPath, JSON.stringify(events, null, 2), "utf-8");
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = getAdminDb();
  let events: AnalyticsEvent[] = [];

  if (db) {
    const snap = await db
      .collection(COLLECTIONS.analytics)
      .orderBy("timestamp", "desc")
      .limit(200)
      .get();
    events = snap.docs.map((d) => d.data() as AnalyticsEvent);
  } else {
    try {
      const raw = await readFile(
        path.join(process.cwd(), "content", "analytics.json"),
        "utf-8",
      );
      events = JSON.parse(raw) as AnalyticsEvent[];
    } catch {
      events = [];
    }
  }

  const now = Date.now();
  const dayAgo = now - 86_400_000;
  const weekAgo = now - 7 * 86_400_000;
  const pageViews = events.filter((e) => e.type === "page_view");

  const pageCounts = pageViews.reduce<Record<string, number>>((acc, e) => {
    acc[e.path] = (acc[e.path] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalViews: pageViews.length,
    viewsToday: pageViews.filter((e) => e.timestamp >= dayAgo).length,
    viewsWeek: pageViews.filter((e) => e.timestamp >= weekAgo).length,
    topPages: Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    recentEvents: events.slice(0, 20),
  };
}

export async function addSyncLog(
  log: Omit<SyncLog, "id" | "timestamp">,
): Promise<SyncLog> {
  const entry: SyncLog = {
    ...log,
    id: `sync_${Date.now()}`,
    timestamp: Date.now(),
  };

  const db = getAdminDb();
  if (db) {
    await db.collection(COLLECTIONS.syncLogs).doc(entry.id).set(entry);
  }

  return entry;
}

export async function getSyncLogs(limit = 10): Promise<SyncLog[]> {
  const db = getAdminDb();
  if (db) {
    const snap = await db
      .collection(COLLECTIONS.syncLogs)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as SyncLog);
  }
  return [];
}


export async function runHealthCheck(): Promise<SystemHealth> {
  const content = await getContent();
  const envMissing: string[] = [];

  if (!isFirebaseConfigured()) {
    envMissing.push("FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    envMissing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!process.env.APPS_SCRIPT_SECRET) {
    envMissing.push("APPS_SCRIPT_SECRET");
  }

  const imagePaths = new Set<string>();
  for (const p of content.products) imagePaths.add(p.image);
  for (const e of content.experiences) imagePaths.add(e.image);
  for (const b of content.blog) imagePaths.add(b.image);

  const brokenAssets: string[] = [];
  const publicDir = path.join(process.cwd(), "public");

  for (const img of imagePaths) {
    if (!img.startsWith("/")) continue;
    const filePath = path.join(publicDir, img);
    try {
      await readFile(filePath);
    } catch {
      brokenAssets.push(img);
    }
  }

  return {
    status:
      brokenAssets.length > 0
        ? "error"
        : envMissing.length > 3
          ? "warning"
          : "ok",
    provider: getContentProvider(),
    brokenAssets,
    brokenRoutes,
    envMissing: envMissing.filter((v, i, a) => a.indexOf(v) === i),
    lastCheck: Date.now(),
  };
}
