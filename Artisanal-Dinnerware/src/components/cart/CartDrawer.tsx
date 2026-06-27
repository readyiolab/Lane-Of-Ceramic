import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Tag, Truck, Gift, Flame, Package } from "lucide-react";
import { useLocation } from "wouter";
import { useCart, DISCOUNT_TIERS } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { optimizeImage } from "@/lib/utils";

const TIER_ICONS = [Package, Truck, Gift, Flame];

export default function CartDrawer() {
  const [, setLocation] = useLocation();
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    totalItems, subtotal, currentTier, nextTier, toNextTier,
    discountAmount, shippingCost, finalTotal,
  } = useCart();
  const { user, openAuthSheet } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      openAuthSheet();
      closeCart();
    } else {
      setLocation("/checkout");
      closeCart();
    }
  };

  const bundleSavingsTotal = items.reduce((sum, item) => {
    if (item.bundlePrice !== undefined) {
      return sum + (item.product.price - item.bundlePrice) * item.quantity;
    }
    return sum;
  }, 0);

  const tagSavings = items.reduce((sum, item) => {
    const orig = item.product.originalPrice;
    if (orig) return sum + (orig - item.product.price) * item.quantity;
    return sum;
  }, 0);

  const currentTierIndex = DISCOUNT_TIERS.findIndex((t) => t.threshold === currentTier.threshold);
  const nextTierIndex = nextTier ? DISCOUNT_TIERS.findIndex((t) => t.threshold === nextTier.threshold) : -1;
  const nextMilestoneProgress = nextTier
    ? Math.min(((subtotal - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100, 100)
    : 100;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={closeCart} data-testid="cart-overlay" />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#EAE3D5] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="cart-drawer"
      >
        <div className="flex items-center justify-between px-5 py-4 bg-[#3E3A06] text-[#D6CBB7]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} />
            <h2 className="text-base font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
            </h2>
          </div>
          <button onClick={closeCart} className="opacity-70 hover:opacity-100 transition-opacity" data-testid="button-close-cart" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {totalItems > 0 && (
          <div className="px-5 py-4 bg-[#E0D8C8] border-b border-[#6B6A2A]/15">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-1">
                {DISCOUNT_TIERS.map((tier, i) => {
                  const Icon = TIER_ICONS[i];
                  const achieved = i <= currentTierIndex;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: 60 }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        achieved ? "bg-[#3E3A06] border-[#3E3A06]" : "bg-transparent border-[#6B6A2A]/30"
                      }`}>
                        <Icon size={14} className={achieved ? "text-[#D6CBB7]" : "text-[#6B6A2A]/50"} />
                      </div>
                      <span className={`text-[9px] font-medium text-center leading-tight max-w-[56px] ${
                        achieved ? "text-[#3E3A06]" : "text-[#6E6E6E]/60"
                      }`}>
                        {tier.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative h-1.5 bg-[#D6CBB7] rounded-full overflow-hidden mb-3">
              <div
                className="absolute h-full bg-[#3E3A06] rounded-full transition-all duration-500"
                style={{ width: `${nextMilestoneProgress}%` }}
              />
            </div>

            {nextTier ? (
              <p className="text-xs text-[#3E3A06] font-semibold">
                You're <span className="font-bold">₹{Math.ceil(toNextTier).toLocaleString("en-IN")}</span> away from{" "}
                <span className="font-bold">{nextTier.label}</span>! {nextTier.icon}
              </p>
            ) : (
              <p className="text-xs text-green-700 font-bold">
                🎉 You've unlocked all discounts! {currentTier.icon}
              </p>
            )}

            {(bundleSavingsTotal > 0 || tagSavings > 0 || discountAmount > 0) && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#6B6A2A]/15">
                <Tag size={11} className="text-green-700" />
                <p className="text-[10px] text-green-700 font-semibold">
                  Total savings on this order:{" "}
                  ₹{(bundleSavingsTotal + tagSavings + discountAmount + (shippingCost === 0 && subtotal >= 999 ? 99 : 0)).toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-[#3E3A06]/8 flex items-center justify-center">
              <ShoppingBag size={36} className="text-[#3E3A06]/30" />
            </div>
            <div>
              <p className="text-base font-medium text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your cart is empty
              </p>
              <p className="text-sm text-[#6E6E6E] mt-1">Add some beautiful ceramics to get started.</p>
            </div>
            <button
              onClick={closeCart}
              className="px-6 py-2.5 bg-[#3E3A06] text-[#D6CBB7] text-sm font-medium hover:bg-[#6B6A2A] transition-colors"
              data-testid="button-continue-shopping"
            >
              Browse Collection
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => {
                const displayPrice = item.bundlePrice ?? item.product.price;
                const isBundle = item.bundlePrice !== undefined;
                const discount = item.product.originalPrice
                  ? Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)
                  : 0;

                return (
                  <div key={item.product.id} className="flex gap-3.5 bg-[#D6CBB7] p-3" data-testid={`cart-item-${item.product.id}`}>
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img src={optimizeImage(item.product.image, 150)} alt={item.product.name} className="w-full h-full object-cover" />
                      {isBundle ? (
                        <span className="absolute -top-1 -right-1 bg-[#3E3A06] text-[#D6CBB7] text-[9px] px-1 py-0.5 font-bold">
                          BUNDLE
                        </span>
                      ) : discount > 0 ? (
                        <span className="absolute -top-1 -right-1 bg-green-700 text-white text-[10px] px-1 py-0.5 font-bold">
                          -{discount}%
                        </span>
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] leading-tight">{item.product.name}</p>
                      <p className="text-xs text-[#6E6E6E] capitalize mt-0.5">{item.product.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-bold text-[#3E3A06]">₹{displayPrice.toLocaleString("en-IN")}</p>
                        {(isBundle || item.product.originalPrice) && (
                          <p className="text-xs text-[#6E6E6E] line-through">₹{item.product.price.toLocaleString("en-IN")}</p>
                        )}
                        {isBundle && <span className="text-[9px] bg-[#3E3A06]/10 text-[#3E3A06] px-1.5 py-0.5 font-semibold">Bundle</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-[#6B6A2A]/30 bg-[#EAE3D5]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#3E3A06] hover:bg-[#3E3A06]/5 transition-colors"
                            data-testid={`button-decrease-${item.product.id}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-[#1A1A1A]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#3E3A06] hover:bg-[#3E3A06]/5 transition-colors"
                            data-testid={`button-increase-${item.product.id}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          ₹{(displayPrice * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-[#6E6E6E]/60 hover:text-red-400 transition-colors self-start flex-shrink-0 mt-0.5"
                      data-testid={`button-remove-${item.product.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#E0D8C8] border-t border-[#6B6A2A]/15 px-5 py-5 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-[#6E6E6E]">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-700 font-semibold">
                    <span>{currentTier.label} ({currentTier.discountPct}% off)</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[#6E6E6E]">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 && subtotal > 0 ? "text-green-700 font-semibold" : ""}>
                    {shippingCost === 0 && subtotal > 0 ? "FREE" : `₹${shippingCost}`}
                  </span>
                </div>
                {(bundleSavingsTotal + tagSavings) > 0 && (
                  <div className="flex justify-between text-sm text-green-700 font-medium">
                    <span>Product Savings</span>
                    <span>-₹{(bundleSavingsTotal + tagSavings).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#1A1A1A] pt-2.5 border-t border-[#6B6A2A]/20">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  if (!user) {
                    openAuthSheet();
                  } else {
                    setLocation("/checkout");
                  }
                }}
                className="w-full py-3.5 bg-[#3E3A06] text-[#D6CBB7] font-semibold text-sm tracking-wide hover:bg-[#6B6A2A] transition-colors flex items-center justify-center gap-2"
                data-testid="button-checkout"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>
              <button
                onClick={closeCart}
                className="w-full py-2.5 text-sm text-[#6E6E6E] hover:text-[#1A1A1A] transition-colors"
                data-testid="button-continue-shopping-bottom"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
