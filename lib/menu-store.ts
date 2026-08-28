import fs from "fs";
import path from "path";
import os from "os";
import { MENU_CATEGORIES, MenuCategory, MenuItem } from "./menu-types";

export { MENU_CATEGORIES };
export type { MenuCategory, MenuItem };

const DATA_FILE = path.join(process.cwd(), "data", "menu.json");
const TMP_FILE = path.join(os.tmpdir(), "menu.json");

let memoryProductsCache: MenuItem[] | null = null;

const DEFAULT_PRODUCTS: MenuItem[] = [
  // 10 Helados Artesanales
  { id: "1", name: "Helado de Frutos Rojos", category: "Helados Artesanales", description: "Cremoso helado con trozos de fresas y frambuesas naturales.", price: "$3.50", image: "/images/saborfresa-bgless.png", popular: true },
  { id: "2", name: "Cono Doble Choco-Vainilla", category: "Helados Artesanales", description: "Clásico cono con chocolate belga y vainilla.", price: "$4.00", image: "/images/chocolate-bgless.png" },
  { id: "3", name: "Copa Sundae Suprema", category: "Helados Artesanales", description: "Tres bolas de helado, crema chantilly, cereza y full sirope.", price: "$4.50", image: "/images/vainilla-bgless.png" },
  { id: "4", name: "Helado de Pistacho", category: "Helados Artesanales", description: "Pistachos reales italianos molidos en base de crema dulce.", price: "$3.75", image: "/images/vainilla-bgless.png" },
  { id: "5", name: "Cono Simple de Mora", category: "Helados Artesanales", description: "El clásico favorito, ácido y dulce a la vez.", price: "$2.50", image: "/images/saborfresa-bgless.png" },
  { id: "6", name: "Copa Banana Split", category: "Helados Artesanales", description: "Banana entera, tres sabores de helado, chispas y crema.", price: "$5.50", image: "/images/chocolate-bgless.png", popular: true },
  { id: "7", name: "Helado Ron Pasas", category: "Helados Artesanales", description: "Pasas maceradas en ron añejo con base de vainilla cremosa.", price: "$3.50", image: "/images/vainilla-bgless.png" },
  { id: "8", name: "Cono Waffle Gigante", category: "Helados Artesanales", description: "Cono de masa de waffle crujiente con dos bolas inmensas.", price: "$4.25", image: "/images/waffle-bgless.png" },
  { id: "9", name: "Helado Menta Granizada", category: "Helados Artesanales", description: "Menta fresca con crujientes chispas de chocolate amargo.", price: "$3.50", image: "/images/new_icecream-bgless.png" },
  { id: "10", name: "Tarrina Familiar", category: "Helados Artesanales", description: "Un litro entero de tu sabor favorito para llevar a casa.", price: "$9.00", image: "/images/vainilla-bgless.png" },
  
  // 3 Waffles
  { id: "11", name: "Waffle Sencillo", category: "Waffles", description: "Waffle recién horneado con una bola de helado a elección.", price: "$3.50", image: "/images/waffle-bgless.png", hasOptions: true },
  { id: "12", name: "Waffle Especial", category: "Waffles", description: "Waffle con fruta, helado y sirope.", price: "$4.50", image: "/images/new_waffle-bgless.png", popular: true, hasOptions: true },
  { id: "13", name: "Waffle Supremo", category: "Waffles", description: "Doble porción de helado, doble fruta y extra crema.", price: "$6.00", image: "/images/waffle-bgless.png", hasOptions: true },

  // 5 Frappés
  { id: "14", name: "Frappé de Moka", category: "Frappés", description: "Café moka helado con crema batida y chispas.", price: "$4.50", image: "/images/frappe-bgless.png", popular: true },
  { id: "15", name: "Frappé de Fresa", category: "Frappés", description: "Batido refrescante de fresas naturales con crema.", price: "$4.00", image: "/images/frappe-bgless.png" },
  { id: "16", name: "Frappé de Caramelo", category: "Frappés", description: "Dulce caramelo fundido con café y crema.", price: "$4.75", image: "/images/new_frappe-bgless.png", popular: true },
  { id: "17", name: "Frappé de Oreo", category: "Frappés", description: "Galletas Oreo trituradas con leche y vainilla.", price: "$4.50", image: "/images/frappe-bgless.png" },
  { id: "18", name: "Frappé de Vainilla", category: "Frappés", description: "Clásico batido cremoso de vainilla.", price: "$3.75", image: "/images/frappe-bgless.png" },

  // 7 Crepes
  { id: "19", name: "Crepe Nutella Clásico", category: "Crepes", description: "Crepe francés con abundante Nutella.", price: "$3.50", image: "/images/crepe-bgless.png" },
  { id: "20", name: "Crepe Frutos del Bosque", category: "Crepes", description: "Crepe relleno de fresas y chocolate, acompañado de helado.", price: "$4.50", image: "/images/new_crepe-bgless.png", popular: true, hasOptions: true },
  { id: "21", name: "Crepe Tropical", category: "Crepes", description: "Crepe con banano, piña, lechera y coco rallado.", price: "$4.25", image: "/images/crepe-bgless.png", hasOptions: true },
  { id: "22", name: "Crepe Dulce de Leche", category: "Crepes", description: "Abundante manjar (arequipe) con helado a elección.", price: "$4.00", image: "/images/crepe-bgless.png", hasOptions: true },
  { id: "23", name: "Crepe Salado Jamón Queso", category: "Crepes", description: "Crepe salado con jamón ahumado y queso derretido.", price: "$5.00", image: "/images/crepe-bgless.png" },
  { id: "24", name: "Crepe Salado Pollo", category: "Crepes", description: "Pollo con champiñones en salsa blanca.", price: "$5.50", image: "/images/crepe-bgless.png" },
  { id: "25", name: "Crepe Mix Supreme", category: "Crepes", description: "Mitad Nutella, mitad Manjar, con 2 frutas y helado.", price: "$6.50", image: "/images/new_crepe-bgless.png", popular: true, hasOptions: true },
];

export function getAllProducts(): MenuItem[] {
  if (memoryProductsCache && memoryProductsCache.length > 0) {
    return memoryProductsCache;
  }

  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProductsCache = parsed as MenuItem[];
        return memoryProductsCache;
      }
    }

    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProductsCache = parsed as MenuItem[];
        return memoryProductsCache;
      }
    }
  } catch (error) {
    console.error("Error reading menu file:", error);
  }

  memoryProductsCache = DEFAULT_PRODUCTS;
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
    return;
  } catch (error) {
    // Expected on Vercel Serverless Read-Only File System
  }

  // 2. Fallback to /tmp directory (Serverless environment)
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
