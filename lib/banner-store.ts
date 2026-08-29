import fs from "fs";
import path from "path";
import os from "os";

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  image: string;
  badge: string;
  link: string;
  active: boolean;
  imageSize?: "normal" | "large" | "full";
  imageScale?: number;
  imageFit?: "contain" | "cover";
  blendMode?: "none" | "multiply" | "screen";
  layoutMode?: "split" | "full_poster";
}

const DATA_FILE = path.join(process.cwd(), "data", "banners.json");
const TMP_FILE = path.join(os.tmpdir(), "banners.json");

let memoryBannersCache: PromoBanner[] | null = null;

const DEFAULT_BANNERS: PromoBanner[] = [
  {
    id: "banner-1",
    title: "Combo Tentación Familiar",
    subtitle: "2 Waffles Especiales + 2 Frappés a elección con 15% de descuento.",
    price: "14.99",
    image: "/images/new_waffle-bgless.png",
    badge: "OFERTA RECOMENDADA ✦ 15% OFF",
    link: "#menu",
    active: true,
    imageSize: "large",
    imageScale: 1.0,
    imageFit: "contain",
    blendMode: "none",
    layoutMode: "split"
  }
];

export function getAllBanners(): PromoBanner[] {
  if (memoryBannersCache && memoryBannersCache.length > 0) {
    return memoryBannersCache;
  }

  let loadedBanners: PromoBanner[] | null = null;
  let dataMtime = 0;
  let tmpMtime = 0;

  try {
    if (fs.existsSync(DATA_FILE)) {
      dataMtime = fs.statSync(DATA_FILE).mtimeMs;
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedBanners = parsed as PromoBanner[];
      }
    }
  } catch (error) {
    console.error("Error reading data banners file:", error);
  }

  try {
    if (fs.existsSync(TMP_FILE)) {
      tmpMtime = fs.statSync(TMP_FILE).mtimeMs;
      if (tmpMtime >= dataMtime) {
        const data = fs.readFileSync(TMP_FILE, "utf-8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedBanners = parsed as PromoBanner[];
        }
      }
    }
  } catch (error) {
    console.error("Error reading tmp banners file:", error);
  }

  memoryBannersCache = loadedBanners || DEFAULT_BANNERS;
  return memoryBannersCache;
}

export function saveAllBanners(banners: PromoBanner[]): void {
  memoryBannersCache = banners;

  // 1. Try primary data file (Local environment)
  try {
    const dirname = path.dirname(DATA_FILE);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(banners, null, 2), "utf-8");
  } catch (error) {
    // Expected on Vercel Serverless Read-Only File System
  }

  // 2. Also write to /tmp directory (Serverless consistency)
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(banners, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing banners to tmp:", error);
  }
}

export function getBannerById(id: string): PromoBanner | undefined {
  const banners = getAllBanners();
  return banners.find((b) => String(b.id) === String(id));
}

export function addBanner(item: Omit<PromoBanner, "id"> & { id?: string }): PromoBanner {
  const banners = getAllBanners();
  const newId = item.id || `banner-${Date.now()}`;
  const newBanner: PromoBanner = {
    ...item,
    id: String(newId),
    active: item.active !== undefined ? item.active : true,
  };

  banners.unshift(newBanner);
  saveAllBanners(banners);
  return newBanner;
}

export function updateBanner(id: string, updates: Partial<PromoBanner>): PromoBanner | null {
  const banners = getAllBanners();
  const index = banners.findIndex((b) => String(b.id) === String(id));
  if (index === -1) {
    return null;
  }

  banners[index] = {
    ...banners[index],
    ...updates,
    id: banners[index].id,
  };

  saveAllBanners(banners);
  return banners[index];
}

export function deleteBanner(id: string): boolean {
  const banners = getAllBanners();
  const filtered = banners.filter((b) => String(b.id) !== String(id));
  if (filtered.length === banners.length) {
    return false;
  }
  saveAllBanners(filtered);
  return true;
}
