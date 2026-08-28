export const MENU_CATEGORIES = [
  "Waffles",
  "Crepes",
  "Gelato",
  "Nuevos",
  "Sabores de Gelato",
  "Bolos Gourmet",
  "Combos",
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: string;
  image: string;
  popular?: boolean;
  isNew?: boolean;
  available: boolean;
  hasOptions?: boolean;
  optionsList?: string[];
  imageSize?: "normal" | "large" | "extra";
  imageScale?: number;
  imageFit?: "contain" | "cover";
}
