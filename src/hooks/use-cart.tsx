import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  id: string;
  brand: string;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
};

const KEY = "wd_cart";
const EVT = "wd_cart_changed";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    const cur = read();
    const existing = cur.find((c) => c.id === item.id);
    const next = existing
      ? cur.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      : [...cur, { ...item, qty: 1 }];
    write(next);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((c) => c.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.qty * i.price, 0);

  return { items, count, total, add, remove, clear };
}
