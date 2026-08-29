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
  logoUrl: "https://res.cloudinary.com/gpjsyq8h/image/upload/v1787927723/menu_restaurante/1787927753492_logo_1787927750680.png",
  logoPublicId: "menu_restaurante/1787927753492_logo_1787927750680",
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

  let loadedData: Partial<SiteSettings> = {};
  let dataMtime = 0;
  let tmpMtime = 0;

  try {
    if (fs.existsSync(DATA_FILE)) {
      dataMtime = fs.statSync(DATA_FILE).mtimeMs;
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      loadedData = JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading data settings file:", error);
  }

  try {
    if (fs.existsSync(TMP_FILE)) {
      tmpMtime = fs.statSync(TMP_FILE).mtimeMs;
      if (tmpMtime >= dataMtime) {
        const content = fs.readFileSync(TMP_FILE, "utf-8");
        loadedData = { ...loadedData, ...JSON.parse(content) };
      }
    }
  } catch (error) {
    console.error("Error reading tmp settings file:", error);
  }

  const loaded: SiteSettings = { ...DEFAULT_SETTINGS, ...loadedData };
  memorySettingsCache = loaded;
  return loaded;
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
  } catch (error) {
    // Expected on Vercel Serverless Read-Only File System
  }

  // 2. Also write to /tmp directory (Serverless consistency)
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing settings to tmp:", error);
  }

  return updated;
}
