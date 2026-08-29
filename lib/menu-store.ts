import fs from "fs";
import path from "path";
import os from "os";
import { MENU_CATEGORIES, MenuCategory, MenuItem } from "./menu-types";

export { MENU_CATEGORIES };
export type { MenuCategory, MenuItem };

const DATA_FILE = path.join(process.cwd(), "data", "menu.json");
const TMP_FILE = path.join(os.tmpdir(), "menu.json");

let memoryProductsCache: MenuItem[] | null = null;

const DEFAULT_PRODUCTS: MenuItem[] = [];

export function getAllProducts(): MenuItem[] {
  if (memoryProductsCache && memoryProductsCache.length > 0) {
    return memoryProductsCache;
  }

  let loadedProducts: MenuItem[] | null = null;
  let dataMtime = 0;
  let tmpMtime = 0;

  try {
    if (fs.existsSync(DATA_FILE)) {
      dataMtime = fs.statSync(DATA_FILE).mtimeMs;
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedProducts = parsed as MenuItem[];
      }
    }
  } catch (error) {
    console.error("Error reading data menu file:", error);
  }

  try {
    if (fs.existsSync(TMP_FILE)) {
      tmpMtime = fs.statSync(TMP_FILE).mtimeMs;
      if (tmpMtime >= dataMtime) {
        const data = fs.readFileSync(TMP_FILE, "utf-8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedProducts = parsed as MenuItem[];
        }
      }
    }
  } catch (error) {
    console.error("Error reading tmp menu file:", error);
  }

  memoryProductsCache = loadedProducts || DEFAULT_PRODUCTS;
  return memoryProductsCache;
}

export function saveAllProducts(products: MenuItem[]): void {
  memoryProductsCache = products;

  // 1. Try primary data file (Local environment)
  try {
    const dirname = path.dirname(DATA_FILE);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (error) {
    // Expected on Vercel Serverless Read-Only File System
  }

  // 2. Also write to /tmp directory (Serverless consistency)
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing menu to tmp:", error);
  }
}

export function getProductById(id: string): MenuItem | undefined {
  const products = getAllProducts();
  return products.find((p) => String(p.id) === String(id));
}

export function addProduct(
  item: Omit<MenuItem, "id"> & { id?: string }
): MenuItem {
  const products = getAllProducts();
  const newId =
    item.id ||
    `${item.category.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
  const newProduct: MenuItem = {
    ...item,
    id: String(newId),
    available: item.available !== undefined ? item.available : true,
  };

  products.unshift(newProduct);
  saveAllProducts(products);
  return newProduct;
}

export function updateProduct(
  id: string,
  updates: Partial<MenuItem>
): MenuItem | null {
  const products = getAllProducts();
  const index = products.findIndex((p) => String(p.id) === String(id));
  if (index === -1) {
    return null;
  }

  products[index] = {
    ...products[index],
    ...updates,
    id: products[index].id, // protect ID
  };

  saveAllProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getAllProducts();
  const filtered = products.filter((p) => String(p.id) !== String(id));
  if (filtered.length === products.length) {
    return false;
  }
  saveAllProducts(filtered);
  return true;
}
