import fs from "fs";
import path from "path";

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
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
  } catch (error) {
    console.error("Error reading settings.json:", error);
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
  try {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
    return updated;
  } catch (error) {
    console.error("Error updating settings.json:", error);
    throw error;
  }
}
