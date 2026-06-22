"use client";

/**
 * CartContext
 * ────────────
 * Provides add / remove / update / clear operations and persists the cart
 * to localStorage so it survives page reloads.
 *
 * Import via the `useCart()` hook — never read CartContext directly.
 *
 * SECURITY: CartItem.priceAmount is display-only.  The actual charge is
 * always re-derived server-side from SEED_PRODUCTS by slug.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { CartItem } from "@/types/cart";

// ── State & reducer ───────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  /** Slide-over drawer open/close */
  drawerOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; slug: string }
  | { type: "UPDATE_QTY"; slug: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.slug === action.item.slug);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.slug === action.item.slug
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.slug !== action.slug) };
    case "UPDATE_QTY":
      if (action.quantity < 1) {
        return { ...state, items: state.items.filter((i) => i.slug !== action.slug) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.slug === action.slug ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN_DRAWER":
      return { ...state, drawerOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, drawerOpen: false };
    case "HYDRATE":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  /** Total number of individual units in the cart */
  itemCount: number;
  /** Cart subtotal in USD */
  subtotal: number;
  /** Formatted subtotal string e.g. "$97.50" */
  subtotalFormatted: string;
  drawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (slug: string) => void;
  updateQty: (slug: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "owl-cart-v1";

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    drawerOpen: false,
  });

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {
      // ignore parse errors — stale / corrupt cart
    }
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // private browsing / storage full — silently skip
    }
  }, [state.items]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", item });
    dispatch({ type: "OPEN_DRAWER" });
  }, []);

  const removeItem = useCallback((slug: string) => {
    dispatch({ type: "REMOVE_ITEM", slug });
  }, []);

  const updateQty = useCallback((slug: string, quantity: number) => {
    dispatch({ type: "UPDATE_QTY", slug, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const openDrawer = useCallback(() => dispatch({ type: "OPEN_DRAWER" }), []);
  const closeDrawer = useCallback(() => dispatch({ type: "CLOSE_DRAWER" }), []);

  const itemCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.priceAmount * i.quantity, 0),
    [state.items]
  );

  const subtotalFormatted = useMemo(
    () => `$${subtotal.toFixed(2)}`,
    [subtotal]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount,
      subtotal,
      subtotalFormatted,
      drawerOpen: state.drawerOpen,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      openDrawer,
      closeDrawer,
    }),
    [
      state.items,
      state.drawerOpen,
      itemCount,
      subtotal,
      subtotalFormatted,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      openDrawer,
      closeDrawer,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
