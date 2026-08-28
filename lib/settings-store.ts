import fs from "fs";
import path from "path";
import os from "os";

export interface SiteSettings {
  logoUrl: string;
  logoPublicId?: string;
  heroImageUrl?: string;
  heroImagePublicId?: string;
  heroImageScale?: number;
  heroImageFit?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "settings.json");
const TMP_FILE = path.join(os.tmpdir(), "settings.json");

let memorySettingsCache: SiteSettings | null = null;

const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: "/images/logo-transparent.png",
  logoPublicId: "",
  heroImageUrl: "/images/new_waffle-bgless.png",
  heroImagePublicId: "",
  heroImageScale: 1.0,
  heroImageFit: "contain",
  heroTitle: "Una Dulce Tentación",
  heroSubtitle: "Hecha Arte",
  heroDescription: "Descubre el placer incomparable de nuestros waffles crujientes recién horneados, crepes esponjosos y gelato artesanal elaborados con ingredientes 100% naturales.",
};

export function getSettings(): SiteSettings {
  if (memorySettingsCache) {
    return memorySettingsCache;
  }

  try {
    if (fs.existsSync(TMP_FILE)) {
      const content = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed = JSON.parse(content);
      const loaded: SiteSettings = { ...DEFAULT_SETTINGS, ...parsed };
      memorySettingsCache = loaded;
      return loaded;
    }

    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      const loaded: SiteSettings = { ...DEFAULT_SETTINGS, ...parsed };
      memorySettingsCache = loaded;
      return loaded;
    }
  } catch (error) {
    console.error("Error reading settings file:", error);
  }

  memorySettingsCache = DEFAULT_SETTINGS;
  return DEFAULT_SETTINGS;
}

export function updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
  const current = getSettings();
  const updated: SiteSettings = { ...current, ...newSettings };
  memorySettingsCache = updated;

  // 1. Try primary data file (Local environment)
  try {
    const dirname = path.dirname(DATA_FILE);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (error) {
    // Expected on Vercel Serverless Read-Only File System
  }

  // 2. Fallback to /tmp directory (Serverless environment)
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing settings to tmp:", error);
  }

  return updated;
}
