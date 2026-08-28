import fs from "fs";
import path from "path";
import { MENU_CATEGORIES, MenuCategory, MenuItem } from "./menu-types";

export { MENU_CATEGORIES };
export type { MenuCategory, MenuItem };

const DATA_FILE = path.join(process.cwd(), "data", "menu.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export function getAllProducts(): MenuItem[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data) as MenuItem[];
  } catch (error) {
    console.error("Error reading menu file:", error);
    return [];
  }
}

export function saveAllProducts(products: MenuItem[]): void {
  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing menu file:", error);
    throw new Error("No se pudo guardar la información del menú.");
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
