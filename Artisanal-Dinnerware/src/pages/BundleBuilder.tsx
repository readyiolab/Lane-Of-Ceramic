import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { Check, X, ShoppingBag, Gift, Star, ChevronDown, ArrowLeft } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAllProducts, useBundles } from "@/hooks/useCatalog";

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Products",
  drinkware: "Drinkware",
  tableware: "Tableware",
  serveware: "Serveware",
  kitchenware: "Kitchenware",
};

function SelectableProductCard({
  product,
  selected,
  disabled,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={!disabled || selected ? onToggle : undefined}
      className={`relative group overflow-hidden cursor-pointer transition-all duration-200 ${
        selected
          ? "ring-2 ring-[#3E3A06] shadow-lg"
          : disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:shadow-md hover:-translate-y-0.5"
      }`}
      data-testid={`bundle-product-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-[#E8E0D0]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {selected && (
          <div className="absolute inset-0 bg-[#3E3A06]/25 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#3E3A06] flex items-center justify-center shadow-lg">
              <Check size={20} className="text-[#D6CBB7]" />
            </div>
          </div>
        )}
        {product.tag && !selected && (
          <span className="absolute top-2 left-2 bg-[#3E3A06] text-[#D6CBB7] text-[10px] px-2 py-0.5 font-medium">
            {product.tag}
          </span>
        )}
        {discount > 0 && !selected && (
          <span className="absolute top-2 right-2 bg-green-700 text-white text-[10px] px-1.5 py-0.5 font-bold">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3 bg-[#E8E0D0]">
        <p className="text-xs font-medium text-[#1A1A1A] leading-snug line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star size={10} className="fill-[#6B6A2A] text-[#6B6A2A]" />
          <span className="text-[10px] text-[#6B6A2A] font-medium">{product.rating}</span>
        </div>
        <p className="text-sm font-bold text-[#3E3A06] mt-1">₹{product.price.toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}

export default function BundleBuilder() {
  const { type } = useParams<{ type: string }>();
  const [, setLocation] = useLocation();
  const { addBundle } = useCart();
  const { data: allProductsData, isLoading } = useAllProducts();
  const { data: bundles } = useBundles();
  const allProducts = allProductsData?.data ?? [];

  const bundleFromApi = bundles?.find((b) => b.slug === type);
  const config = {
    count: bundleFromApi?.itemCount ?? (type === "five" ? 5 : 3),
    price: bundleFromApi?.price ?? (type === "five" ? 1499 : 999),
    label: bundleFromApi?.label ?? (type === "five" ? "Pick Any 5" : "Pick Any 3"),
    tagline: bundleFromApi?.tagline ?? "Create Your Bundle",
  };

  const [selected, setSelected] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [added, setAdded] = useState(false);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? allProducts
        : allProducts.filter((p) => p.category === activeCategory),
    [activeCategory, allProducts]
  );

  function toggleProduct(product: Product) {
    setSelected((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= config.count) return prev;
      return [...prev, product];
    });
  }

  function handleAddToCart() {
    if (selected.length !== config.count) return;
    addBundle(selected, config.price);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelected([]);
    }, 2000);
  }

  const originalTotal = selected.reduce((sum, p) => sum + p.price, 0);
  const bundleSaving = originalTotal - config.price;
  const filled = selected.length;
  const remaining = config.count - filled;
  const progress = (filled / config.count) * 100;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#D6CBB7] flex items-center justify-center">
        <p className="text-[#3E3A06]">Loading bundle options...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#D6CBB7]" data-testid="page-bundle-builder">
      <div className="bg-[#3E3A06] text-[#D6CBB7] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-[#D6CBB7]/60 hover:text-[#D6CBB7] transition-colors text-sm mb-6"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#D6CBB7]/60 mb-2">{config.tagline}</p>
              <h1
                className="text-3xl sm:text-4xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {config.label} for{" "}
                <span className="text-[#D6CBB7]">₹{config.price.toLocaleString("en-IN")}</span>
              </h1>
              <p className="text-[#D6CBB7]/60 mt-2 text-sm">
                Mix and match from any category. Save up to ₹{(originalTotal > 0 ? bundleSaving : config.count * 799 - config.price).toLocaleString("en-IN")}+
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Gift size={20} className="text-[#D6CBB7]/60" />
              <span className="text-sm text-[#D6CBB7]/80">Free gift wrapping included</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-[#E8E0D0] border-b border-[#6B6A2A]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="flex justify-between text-xs text-[#6E6E6E] mb-1.5">
                <span className="font-medium text-[#1A1A1A]">
                  {filled} of {config.count} selected
                </span>
                {remaining > 0 ? (
                  <span>Pick {remaining} more</span>
                ) : (
                  <span className="text-green-700 font-semibold">Ready to add!</span>
                )}
              </div>
              <div className="h-2 bg-[#D6CBB7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3E3A06] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selected.map((p) => (
                    <span
                      key={p.id}
                      className="flex items-center gap-1 bg-[#3E3A06] text-[#D6CBB7] text-[10px] px-2 py-1"
                    >
                      {p.name.split(" ").slice(0, 3).join(" ")}
                      <button onClick={() => toggleProduct(p)} className="hover:text-red-300 transition-colors">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {bundleSaving > 0 && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-[#6E6E6E]">You save</p>
                  <p className="text-lg font-bold text-green-700">₹{bundleSaving.toLocaleString("en-IN")}</p>
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={filled < config.count}
                className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all ${
                  added
                    ? "bg-[#6B6A2A] text-[#D6CBB7]"
                    : filled === config.count
                    ? "bg-[#3E3A06] text-[#D6CBB7] hover:bg-[#6B6A2A]"
                    : "bg-[#6E6E6E]/20 text-[#6E6E6E] cursor-not-allowed"
                }`}
                data-testid="button-add-bundle"
              >
                {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                {added
                  ? "Added to Cart!"
                  : filled === config.count
                  ? `Add Bundle · ₹${config.price.toLocaleString("en-IN")}`
                  : `Select ${remaining} more`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 flex-wrap mb-8">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === key
                  ? "bg-[#3E3A06] text-[#D6CBB7]"
                  : "bg-[#E8E0D0] text-[#1A1A1A] hover:bg-[#3E3A06]/10"
              }`}
              data-testid={`filter-category-${key}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map((product) => (
            <SelectableProductCard
              key={product.id}
              product={product}
              selected={selected.some((p) => p.id === product.id)}
              disabled={filled >= config.count}
              onToggle={() => toggleProduct(product)}
            />
          ))}
        </div>

        {filled === config.count && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl animate-bounce" style={{ animationIterationCount: 3 }}>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-3 bg-[#3E3A06] text-[#D6CBB7] px-8 py-4 font-bold text-base hover:bg-[#6B6A2A] transition-colors"
              data-testid="button-add-bundle-float"
            >
              <ShoppingBag size={20} />
              Add Bundle to Cart · ₹{config.price.toLocaleString("en-IN")}
              {bundleSaving > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Save ₹{bundleSaving.toLocaleString("en-IN")}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
