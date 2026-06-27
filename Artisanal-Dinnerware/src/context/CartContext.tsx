import { useState, createContext, useContext, useCallback, useMemo } from "react";
import type { Product } from "@/data/products";
import { useDiscountTiers } from "@/hooks/useCatalog";

export interface CartItem {
  product: Product;
  quantity: number;
  bundlePrice?: number;
}

import type { DiscountTier } from "@/data/discountTiers";
import { DEFAULT_DISCOUNT_TIERS } from "@/data/discountTiers";

export type { DiscountTier };
export const DISCOUNT_TIERS = DEFAULT_DISCOUNT_TIERS;

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, bundlePrice?: number) => void;
  addBundle: (products: Product[], bundlePrice: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  currentTier: DiscountTier;
  nextTier: DiscountTier | null;
  toNextTier: number;
  discountAmount: number;
  shippingCost: number;
  finalTotal: number;
  savings: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { data: tiersData } = useDiscountTiers();
  const tiers = useMemo(
    () =>
      (tiersData ?? DEFAULT_DISCOUNT_TIERS).map((t) => ({
        ...t,
        icon: t.icon ?? "📦",
      })),
    [tiersData],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: Product, bundlePrice?: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, bundlePrice }];
    });
    setIsOpen(true);
  }, []);

  const addBundle = useCallback((products: Product[], bundlePrice: number) => {
    const perItem = Math.floor(bundlePrice / products.length);
    setItems((prev) => {
      let next = [...prev];
      products.forEach((product) => {
        const existing = next.find((i) => i.product.id === product.id);
        if (existing) {
          next = next.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          next = [...next, { product, quantity: 1, bundlePrice: perItem }];
        }
      });
      return next;
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, i) => {
    const price = i.bundlePrice ?? i.product.price;
    return sum + price * i.quantity;
  }, 0);

  const originalSubtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const computed = useMemo(() => {
    const activeTier = [...tiers].reverse().find((t) => subtotal >= t.threshold) ?? tiers[0];
    const nextIdx = tiers.indexOf(activeTier) + 1;
    const nextTier = nextIdx < tiers.length ? tiers[nextIdx] : null;
    const toNext = nextTier ? nextTier.threshold - subtotal : 0;
    const discountAmount = Math.round((subtotal * activeTier.discountPct) / 100);
    const finalTotal = subtotal - discountAmount + activeTier.shipping;
    const bundleSavings = originalSubtotal - subtotal;
    const tierSavings = discountAmount;
    const originalShipSavings = subtotal >= 999 ? 99 : 0;
    const savings = bundleSavings + tierSavings + (activeTier.shipping === 0 && subtotal > 0 ? originalShipSavings : 0);
    return { activeTier, nextTier, toNext, discountAmount, finalTotal, savings };
  }, [subtotal, originalSubtotal, tiers]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        addBundle,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        currentTier: computed.activeTier,
        nextTier: computed.nextTier,
        toNextTier: computed.toNext,
        discountAmount: computed.discountAmount,
        shippingCost: computed.activeTier.shipping,
        finalTotal: computed.finalTotal,
        savings: computed.savings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
