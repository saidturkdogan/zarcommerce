"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (product: { id: number; name: string; price: number; imageUrl: string | null; category: string | null }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "zc_cart";

const CartContext = createContext<CartCtx | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load on mount
  useEffect(() => {
    setItems(loadCart());
  }, []);

  // Persist on change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback(
    (product: { id: number; name: string; price: number; imageUrl: string | null; category: string | null }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [...prev, { productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, category: product.category, quantity: 1 }];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalCount, totalPrice, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
