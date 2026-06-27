import { useState, useMemo } from "react";
import { SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import ProductCarousel from "@/components/home/ProductCarousel";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import type { Product } from "@/data/products";

interface CategoryPageProps {
  title: string;
  subtitle: string;
  h2: string;
  products: Product[];
  heroImage: string;
  isLoading?: boolean;
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const TAG_OPTIONS = ["Bestseller", "New", "Set"];

function PriceRangeSlider({
  min, max, value, onChange,
}: {
  min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className="px-1">
      <div className="flex justify-between text-xs text-[#6E6E6E] mb-3">
        <span>&#8377;{value[0].toLocaleString("en-IN")}</span>
        <span>&#8377;{value[1].toLocaleString("en-IN")}</span>
      </div>
      <div className="relative h-1.5 bg-[#6B6A2A]/20 rounded-full">
        <div
          className="absolute h-1.5 bg-[#3E3A06] rounded-full"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        <input
          type="range" min={min} max={max} step={50} value={value[0]}
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[1] - 50), value[1]])}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
        />
        <input
          type="range" min={min} max={max} step={50} value={value[1]}
          onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0] + 50)])}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
        />
        <div
          className="absolute w-4 h-4 bg-[#3E3A06] rounded-full -translate-y-1/2 top-1/2 border-2 border-[#D6CBB7] shadow cursor-pointer"
          style={{ left: `calc(${pct(value[0])}% - 8px)` }}
        />
        <div
          className="absolute w-4 h-4 bg-[#3E3A06] rounded-full -translate-y-1/2 top-1/2 border-2 border-[#D6CBB7] shadow cursor-pointer"
          style={{ left: `calc(${pct(value[1])}% - 8px)` }}
        />
      </div>
    </div>
  );
}

export default function CategoryPage({ title, subtitle, h2, products, heroImage, isLoading }: CategoryPageProps) {
  const priceMin = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
  const priceMax = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 10000;

  const [sort, setSort] = useState("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([priceMin, priceMax]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const filtered = useMemo(() => {
    let result = [...products];
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (activeTags.length > 0) result = result.filter((p) => p.tag && activeTags.includes(p.tag));
    if (inStockOnly) result = result.filter((p) => p.inStock);
    if (onSaleOnly) result = result.filter((p) => !!p.originalPrice);
    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    return result;
  }, [products, priceRange, activeTags, inStockOnly, onSaleOnly, sort]);

  const activeFilterCount =
    (priceRange[0] !== priceMin || priceRange[1] !== priceMax ? 1 : 0) +
    activeTags.length +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0);

  function clearFilters() {
    setPriceRange([priceMin, priceMax]);
    setActiveTags([]);
    setInStockOnly(false);
    setOnSaleOnly(false);
  }

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Featured";

  const FilterPanel = () => (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-[#6B6A2A] font-medium hover:text-[#3E3A06] transition-colors flex items-center gap-1" data-testid="button-clear-filters">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-[#3E3A06] uppercase tracking-wide mb-4">Price Range</p>
        <PriceRangeSlider min={priceMin} max={priceMax} value={priceRange} onChange={setPriceRange} />
      </div>

      <div>
        <p className="text-xs font-semibold text-[#3E3A06] uppercase tracking-wide mb-3">Collection Type</p>
        <div className="space-y-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                activeTags.includes(tag)
                  ? "bg-[#3E3A06] text-[#D6CBB7]"
                  : "bg-[#D6CBB7] text-[#1A1A1A] hover:bg-[#3E3A06]/10"
              }`}
              data-testid={`filter-tag-${tag.toLowerCase()}`}
            >
              <span>{tag}</span>
              {activeTags.includes(tag) && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#3E3A06] uppercase tracking-wide mb-3">Availability</p>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                inStockOnly ? "bg-[#3E3A06] border-[#3E3A06]" : "border-[#6B6A2A]/40 group-hover:border-[#3E3A06]"
              }`}
              onClick={() => setInStockOnly(!inStockOnly)}
              data-testid="filter-in-stock"
            >
              {inStockOnly && <Check size={12} className="text-[#D6CBB7]" />}
            </div>
            <span className="text-sm text-[#1A1A1A]">In Stock Only</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                onSaleOnly ? "bg-[#3E3A06] border-[#3E3A06]" : "border-[#6B6A2A]/40 group-hover:border-[#3E3A06]"
              }`}
              onClick={() => setOnSaleOnly(!onSaleOnly)}
              data-testid="filter-on-sale"
            >
              {onSaleOnly && <Check size={12} className="text-[#D6CBB7]" />}
            </div>
            <span className="text-sm text-[#1A1A1A]">On Sale</span>
          </label>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#3E3A06] uppercase tracking-wide mb-3">Rating</p>
        <div className="space-y-2">
          {[4, 3].map((r) => (
            <button
              key={r}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6E6E6E] hover:text-[#1A1A1A] hover:bg-[#3E3A06]/5 transition-colors"
              data-testid={`filter-rating-${r}`}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${i < r ? "fill-[#6B6A2A] text-[#6B6A2A]" : "text-[#6B6A2A]/20"}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>{r}+ Stars</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main data-testid="page-category">
      <div className="relative w-full flex items-end" style={{ height: "clamp(200px, 30vh, 340px)" }}>
        <img src={heroImage} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pb-8">
          <p className="text-xs tracking-widest uppercase text-[#D6CBB7]/70 font-medium mb-2">{subtitle}</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
        </div>
      </div>

      <section className="py-8 px-4 sm:px-6 bg-[#D6CBB7] border-b border-[#6B6A2A]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-base sm:text-lg text-[#3E3A06] font-medium text-center max-w-2xl mx-auto" style={{ fontFamily: "'Playfair Display', serif" }}>{h2}</h2>
        </div>
      </section>

      <section className="bg-[#D6CBB7] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border transition-colors relative ${
                  showFilters || activeFilterCount > 0
                    ? "bg-[#3E3A06] text-[#D6CBB7] border-[#3E3A06]"
                    : "border-[#6B6A2A]/40 text-[#1A1A1A] hover:border-[#3E3A06]"
                }`}
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-[#D6CBB7] text-[#3E3A06] rounded-full text-xs flex items-center justify-center font-bold" data-testid="text-filter-count">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeTags.map((tag) => (
                <span key={tag} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#3E3A06]/10 text-[#3E3A06] text-xs font-medium">
                  {tag}
                  <button onClick={() => toggleTag(tag)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                </span>
              ))}
              {inStockOnly && (
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#3E3A06]/10 text-[#3E3A06] text-xs font-medium">
                  In Stock
                  <button onClick={() => setInStockOnly(false)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                </span>
              )}
              {onSaleOnly && (
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#3E3A06]/10 text-[#3E3A06] text-xs font-medium">
                  On Sale
                  <button onClick={() => setOnSaleOnly(false)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                </span>
              )}

              <span className="text-sm text-[#6E6E6E]">{filtered.length} products</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm border border-[#6B6A2A]/40 text-[#1A1A1A] hover:border-[#3E3A06] transition-colors whitespace-nowrap"
                data-testid="button-sort"
              >
                <span className="hidden sm:inline text-[#6E6E6E]">Sort by:</span>
                <span className="font-medium">{currentSortLabel}</span>
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-[#E8E0D0] border border-[#6B6A2A]/20 shadow-lg z-20 min-w-[200px]" data-testid="sort-dropdown">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                        sort === opt.value ? "bg-[#3E3A06] text-[#D6CBB7]" : "text-[#1A1A1A] hover:bg-[#3E3A06]/5"
                      }`}
                      data-testid={`sort-option-${opt.value}`}
                    >
                      {opt.label}
                      {sort === opt.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-8">
            {showFilters && (
              <div className="hidden lg:block w-64 flex-shrink-0" data-testid="filter-panel-desktop">
                <div className="bg-[#E8E0D0] p-6 sticky top-24">
                  <FilterPanel />
                </div>
              </div>
            )}

            <div className="flex-1">
              {isLoading ? (
                <div className="py-20 flex justify-center items-center">
                  <p className="text-[#3E3A06] font-medium text-lg animate-pulse">Loading products...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[#6E6E6E] mb-4">No products match your filters.</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-[#3E3A06] text-[#D6CBB7] text-sm font-medium hover:bg-[#6B6A2A] transition-colors"
                    data-testid="button-clear-filters-empty"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`grid gap-4 sm:gap-5 ${showFilters ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 flex" data-testid="filter-panel-mobile">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="relative ml-auto w-72 h-full bg-[#E8E0D0] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-[#1A1A1A]">Filters</h3>
                  <button onClick={() => setShowFilters(false)} data-testid="button-close-filters"><X size={20} /></button>
                </div>
                <FilterPanel />
                <div className="sticky bottom-0 bg-[#E8E0D0] pt-4 mt-6 border-t border-[#6B6A2A]/20">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3 bg-[#3E3A06] text-[#D6CBB7] text-sm font-semibold"
                    data-testid="button-apply-filters"
                  >
                    Show {filtered.length} Products
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <MarqueeStrip variant="dark" speed="normal" />
      {!isLoading && products.length > 0 && (
        <ProductCarousel
          products={products.slice(0, 8)}
          title="You May Also Like"
          subtitle="More from this collection"
        />
      )}
    </main>
  );
}
