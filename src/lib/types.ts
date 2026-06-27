export type BrandValue = {
  title: string;
  text: string;
};

export type Brand = {
  name: string;
  descriptor: string;
  tagline: string;
  headline: string;
  subheadline: string;
  website: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  hours: string;
  social: {
    instagram: string;
    facebook: string;
  };
  purpose: string;
  mission: string;
  vision: string;
  values: BrandValue[];
};

export type Experience = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  layout: "left" | "right";
};

export type Product = {
  id: string;
  name: string;
  variety: string;
  origin: string;
  region: string;
  farmer?: string;
  farm?: string;
  altitude?: string;
  price: number;
  weight: string;
  roast: string;
  grind: string;
  notes: string[];
  image: string;
  subscription: boolean;
  featured: boolean;
};

export type MenuItem = {
  name: string;
  description?: string;
  price: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  published: boolean;
};

export type SiteContent = {
  brand: Brand;
  experiences: Experience[];
  products: Product[];
  menu: MenuCategory[];
  blog: BlogPost[];
  marquee: string[];
};

export type AnalyticsEvent = {
  id: string;
  type: "page_view" | "product_click" | "contact_click" | "admin_login";
  path: string;
  label?: string;
  timestamp: number;
  sessionId?: string;
  userAgent?: string;
};

export type AnalyticsSummary = {
  totalViews: number;
  viewsToday: number;
  viewsWeek: number;
  topPages: { path: string; count: number }[];
  recentEvents: AnalyticsEvent[];
};

export type SyncLog = {
  id: string;
  source: "google_apps_script" | "manual" | "admin";
  status: "success" | "error" | "partial";
  message: string;
  filesProcessed?: number;
  timestamp: number;
};

export type SystemHealth = {
  status: "ok" | "warning" | "error";
  provider: "firestore" | "json";
  brokenAssets: string[];
  brokenRoutes: string[];
  envMissing: string[];
  lastCheck: number;
};

export type AdminUser = {
  username: string;
  password: string;
  name: string;
  role: "admin" | "editor";
};

export type SiteSettings = {
  accessMode: "public";
  maintenanceMessage?: string;
  godaddyReady: boolean;
  firebaseEnabled: boolean;
  lastSyncAt?: number;
  googleDriveFolderId?: string;
};
