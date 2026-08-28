import fs from "fs";
import path from "path";

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

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export function getAllBanners(): PromoBanner[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data) as PromoBanner[];
  } catch (error) {
    console.error("Error al leer archivo de banners:", error);
    return [];
  }
}

export function saveAllBanners(banners: PromoBanner[]): void {
  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(banners, null, 2), "utf-8");
  } catch (error) {
    console.error("Error al guardar banners:", error);
    throw new Error("No se pudo guardar la información de los banners.");
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
