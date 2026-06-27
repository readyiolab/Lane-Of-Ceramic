import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/data/products";

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export default function ProductCarousel({
  products,
  title = "You May Also Like",
  subtitle = "More picks from this collection",
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  const CARD_W = 240;
  const GAP = 16;
  const STEP = CARD_W + GAP;

  function updateState() {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    setActiveIdx(Math.round(el.scrollLeft / STEP));
  }

  function scroll(dir: "left" | "right") {
    trackRef.current?.scrollBy({ left: dir === "right" ? STEP * 2 : -STEP * 2, behavior: "smooth" });
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    updateState();
    return () => el.removeEventListener("scroll", updateState);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-[#E8E0D0] overflow-hidden" data-testid="section-product-carousel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#6B6A2A] font-bold mb-1">{subtitle}</p>
            <h3
              className="text-2xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canPrev}
              className={`w-9 h-9 border-2 flex items-center justify-center transition-all ${
                canPrev
                  ? "border-[#3E3A06]/50 text-[#3E3A06] hover:bg-[#3E3A06] hover:text-[#D6CBB7] hover:border-[#3E3A06]"
                  : "border-[#3E3A06]/15 text-[#3E3A06]/25 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canNext}
              className={`w-9 h-9 border-2 flex items-center justify-center transition-all ${
                canNext
                  ? "border-[#3E3A06] bg-[#3E3A06] text-[#D6CBB7] hover:bg-[#6B6A2A]"
                  : "border-[#3E3A06]/15 text-[#3E3A06]/25 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-4 sm:px-6 pb-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`div::-webkit-scrollbar{display:none}`}</style>
          {products.map((p) => (
            <div key={p.id} className="flex-shrink-0" style={{ width: CARD_W }}>
              <ProductCard product={p} />
            </div>
          ))}
          <div className="flex-shrink-0 w-4" />
        </div>
        {canPrev && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-3 w-14 bg-gradient-to-r from-[#E8E0D0] to-transparent" />
        )}
        {canNext && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-14 bg-gradient-to-l from-[#E8E0D0] to-transparent" />
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {products.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === activeIdx ? "w-6 h-1.5 bg-[#3E3A06]" : "w-1.5 h-1.5 bg-[#3E3A06]/25"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
