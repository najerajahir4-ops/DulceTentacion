"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  cartItemId: string; // Unique ID including options
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: Record<string, string>; // e.g. { "Fruta": "Fresa", "Helado": "Vainilla" }
};

type CartContextType = {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: any, options?: Record<string, string>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Parse price from string like "$3.50" to float
  const parsePrice = (priceStr: string) => {
    return parseFloat(priceStr.replace("$", ""));
  };

  const addToCart = (item: any, options?: Record<string, string>) => {
    setCartItems((prev) => {
      // Create a unique cart ID by stringifying options
      const optionsString = options ? JSON.stringify(options) : "";
      const cartItemId = `${item.id}-${optionsString}`;

      const existing = prev.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          id: item.id,
          name: item.name,
          price: parsePrice(item.price),
          quantity: 1,
          image: item.image,
          options
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
