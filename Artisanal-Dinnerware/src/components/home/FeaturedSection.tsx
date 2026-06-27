import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { featuredProducts } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import { useFeaturedProducts } from "@/hooks/useCatalog";

export default function FeaturedSection() {
  const { data: products, isLoading } = useFeaturedProducts();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const CARD_WIDTH = 280;
  const GAP = 20;
  const STEP = CARD_WIDTH + GAP;

  function updateState() {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    setActiveIdx(Math.round(el.scrollLeft / STEP));
  }

  function scroll(dir: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? STEP * 2 : -STEP * 2, behavior: "smooth" });
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    updateState();
    return () => el.removeEventListener("scroll", updateState);
  }, []);

  if (isLoading || !products) {
    return (
      <section className="py-16 bg-[#D6CBB7] overflow-hidden min-h-[400px] flex items-center justify-center" data-testid="section-featured">
        <p className="text-[#3E3A06]">Loading featured pieces...</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#D6CBB7] overflow-hidden" data-testid="section-featured">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#6B6A2A] font-semibold mb-2">Handpicked for You</p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Featured Pieces
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canPrev}
                className={`w-10 h-10 border-2 flex items-center justify-center transition-all ${
                  canPrev
                    ? "border-[#3E3A06]/50 text-[#3E3A06] hover:bg-[#3E3A06] hover:text-[#D6CBB7] hover:border-[#3E3A06]"
                    : "border-[#3E3A06]/15 text-[#3E3A06]/25 cursor-not-allowed"
                }`}
                data-testid="button-featured-prev"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canNext}
                className={`w-10 h-10 border-2 flex items-center justify-center transition-all ${
                  canNext
                    ? "border-[#3E3A06] bg-[#3E3A06] text-[#D6CBB7] hover:bg-[#6B6A2A]"
                    : "border-[#3E3A06]/15 text-[#3E3A06]/25 cursor-not-allowed"
                }`}
                data-testid="button-featured-next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <Link
              href="/tableware"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#3E3A06] hover:text-[#6B6A2A] transition-colors group"
              data-testid="link-view-all"
            >
              View All
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable track — bleeds past container edges */}
      <div className="relative">
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto scroll-smooth px-4 sm:px-6 pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            maxWidth: "100vw",
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0"
              style={{ width: CARD_WIDTH }}
            >
              <ProductCard product={product} />
            </div>
          ))}
          {/* Trailing spacer */}
          <div className="flex-shrink-0 w-4" />
        </div>

        {/* Left fade */}
        {canPrev && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-[#D6CBB7] to-transparent" />
        )}
        {/* Right fade */}
        {canNext && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#D6CBB7] to-transparent" />
        )}
      </div>

      {/* Progress dots — mobile */}
      <div className="flex items-center justify-center gap-1.5 mt-5 sm:hidden">
        {products.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === activeIdx ? "w-6 h-1.5 bg-[#3E3A06]" : "w-1.5 h-1.5 bg-[#3E3A06]/25"
            }`}
          />
        ))}
      </div>

      <div className="text-center mt-8 px-4">
        <Link
          href="/tableware"
          className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#3E3A06] text-[#3E3A06] text-sm font-bold tracking-wide hover:bg-[#3E3A06] hover:text-[#D6CBB7] transition-all group"
          data-testid="link-explore-all"
        >
          Explore All Collections
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
