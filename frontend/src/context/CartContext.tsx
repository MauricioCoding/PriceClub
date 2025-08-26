import { createContext, useContext, useMemo, useState } from "react";
import type { CartItem, Product } from "../types";

type CartCtx = {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  update: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (product: Product, qty = 1) => {
    if (qty <= 0) return;
    setItems(prev => {
      const idx = prev.findIndex(ci => ci.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(next[idx].quantity + qty, product.stock) };
        return next;
      }
      return [...prev, { product, quantity: Math.min(qty, product.stock) }];
    });
  };

  const update = (productId: number, qty: number) => {
    setItems(prev =>
      prev
        .map(ci => (ci.product.id === productId ? { ...ci, quantity: Math.max(0, Math.min(qty, ci.product.stock)) } : ci))
        .filter(ci => ci.quantity > 0)
    );
  };

  const remove = (productId: number) => setItems(prev => prev.filter(ci => ci.product.id !== productId));
  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.product.price) * it.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((acc, it) => acc + it.quantity, 0), [items]);

  const value = useMemo<CartCtx>(() => ({ items, add, update, remove, clear, subtotal, count }), [items, subtotal, count]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
