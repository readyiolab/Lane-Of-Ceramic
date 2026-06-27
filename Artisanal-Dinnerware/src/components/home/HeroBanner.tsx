import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "Artisanal Ceramic",
    subtitle: "Dinnerware",
    description: "Handcrafted pieces that bring warmth and character to your table, every single day.",
    cta: "Shop Tableware",
    ctaPath: "/tableware",
    bg: "from-[#1A1A1A]/80 to-[#3E3A06]/40",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    title: "Morning Ritual",
    subtitle: "Drinkware Collection",
    description: "Begin every morning with a mug that feels as good in your hands as the coffee inside it.",
    cta: "Explore Drinkware",
    ctaPath: "/drinkware",
    bg: "from-[#3E3A06]/90 to-[#3E3A06]/40",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1400&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    title: "Host with Intention",
    subtitle: "Serveware",
    description: "Beautiful serving pieces that make every gathering feel like a celebration worth remembering.",
    cta: "Discover Serveware",
    ctaPath: "/serveware",
    bg: "from-[#1A1A1A]/80 to-[#6B6A2A]/40",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1400&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    title: "Organised Beauty",
    subtitle: "Kitchenware",
    description: "Ceramic jars, canisters, and tools that turn your kitchen counter into a curated display.",
    cta: "Shop Kitchenware",
    ctaPath: "/kitchenware",
    bg: "from-[#3E3A06]/80 to-[#6B6A2A]/30",
    image: "https://images.unsplash.com/photo-1493894473891-0f6e7b36b73e?w=1400&auto=format&fit=crop&q=80",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 300);
  }, [transitioning]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "clamp(420px, 60vh, 680px)" }} data-testid="hero-banner">
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${transitioning ? "opacity-0" : "opacity-100"}`}
      >
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`} />
      </div>

      <div
        className={`absolute inset-0 flex items-center transition-all duration-500 ${
          transitioning ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="max-w-lg">
            <p className="text-[#D6CBB7]/80 text-sm font-medium tracking-widest uppercase mb-3">
              {slide.subtitle}
            </p>
            <h1
              className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {slide.title}
            </h1>
            <p className="text-[#D6CBB7]/90 text-base leading-relaxed mb-8 max-w-sm">
              {slide.description}
            </p>
            <Link
              href={slide.ctaPath}
              className="inline-block px-8 py-3.5 bg-[#D6CBB7] text-[#3E3A06] text-sm font-semibold tracking-wide hover:bg-white transition-colors"
              data-testid="link-hero-cta"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#D6CBB7]/20 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-[#D6CBB7]/40 transition-all"
        data-testid="button-banner-prev"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#D6CBB7]/20 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-[#D6CBB7]/40 transition-all"
        data-testid="button-banner-next"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-6 h-2 bg-[#D6CBB7]" : "w-2 h-2 bg-[#D6CBB7]/40"
            }`}
            data-testid={`button-banner-dot-${i}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
