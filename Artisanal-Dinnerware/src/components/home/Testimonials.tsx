import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    avatar: "PS",
    avatarBg: "#6B6A2A",
    rating: 5,
    tag: "Verified Buyer",
    product: "6-Piece Dinner Set",
    text: "I ordered the 6-piece dinner set as a wedding gift and honestly couldn't bring myself to give it away. The quality is stunning — heavy, smooth, and the glaze catches light beautifully. Ended up ordering one for myself too.",
  },
  {
    name: "Rahul Mehra",
    location: "Bengaluru",
    avatar: "RM",
    avatarBg: "#3E3A06",
    rating: 5,
    tag: "Verified Buyer",
    product: "Handcrafted Coffee Mug",
    text: "My morning coffee hits different in the Lane of Ceramic mug. It keeps my coffee warm longer and the weight of it just feels right. Friends keep asking where I got it. Ordered three more as gifts.",
  },
  {
    name: "Ananya Krishnan",
    location: "Chennai",
    avatar: "AK",
    avatarBg: "#5a5820",
    rating: 5,
    tag: "Repeat Buyer",
    product: "Large Serving Bowl",
    text: "The serving bowl I ordered is the centrepiece of my dining table. Every time I host, at least three people ask me about it. Delivery was fast and packed so beautifully it looked like a luxury gift.",
  },
  {
    name: "Kabir Nair",
    location: "Delhi",
    avatar: "KN",
    avatarBg: "#3E3A06",
    rating: 5,
    tag: "Business Buyer",
    product: "Canister Set · Bulk Order",
    text: "Bought the canister set for my café and my customers comment on it every day. The quality is consistent, the design is timeless. Ordering more for our second location next month.",
  },
  {
    name: "Meera Iyer",
    location: "Pune",
    avatar: "MI",
    avatarBg: "#6B6A2A",
    rating: 5,
    tag: "Bundle Buyer",
    product: "Pick Any 5 Bundle",
    text: "The five-piece bundle was incredible value. I mixed drinkware and serveware — everything matched perfectly. The gift wrapping was chef's kiss. This brand understands aesthetics.",
  },
  {
    name: "Arjun Kapoor",
    location: "Hyderabad",
    avatar: "AK",
    avatarBg: "#4a4810",
    rating: 5,
    tag: "Verified Buyer",
    product: "Tea Set",
    text: "Gifted this to my mom for her birthday and she cried — in the best way. The craftsmanship is evident in every detail. Weight, finish, colour — all perfect. Will be a loyal customer.",
  },
];

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < n ? "fill-amber-400 text-amber-400" : "text-[#6E6E6E]/20 fill-[#6E6E6E]/20"} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const VISIBLE = 2;
  const total = TESTIMONIALS.length;

  const advance = useCallback(() => {
    setActive((p) => (p + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setActive((p) => (p - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(advance, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, advance]);

  const visible = [active, (active + 1) % total];

  return (
    <section
      className="py-16 px-4 sm:px-6 bg-[#E8E0D0] overflow-hidden"
      data-testid="section-testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#6B6A2A] font-semibold mb-2">Customer Stories</p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What People Are Saying
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 border-2 border-[#3E3A06]/30 flex items-center justify-center text-[#3E3A06] hover:bg-[#3E3A06] hover:text-[#D6CBB7] hover:border-[#3E3A06] transition-all"
              data-testid="button-testimonial-prev"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={advance}
              className="w-10 h-10 border-2 border-[#3E3A06] bg-[#3E3A06] flex items-center justify-center text-[#D6CBB7] hover:bg-[#6B6A2A] transition-all"
              data-testid="button-testimonial-next"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cards — 2 visible on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visible.map((idx, pos) => {
            const t = TESTIMONIALS[idx];
            return (
              <div
                key={`${idx}-${pos}`}
                className="bg-[#D6CBB7] p-7 flex flex-col gap-5 relative overflow-hidden transition-all duration-500"
                style={{ animationDelay: `${pos * 0.1}s` }}
              >
                <Quote size={32} className="absolute top-5 right-5 text-[#3E3A06]/8" />

                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-[#D6CBB7] text-sm font-bold flex-shrink-0"
                    style={{ background: t.avatarBg }}
                  >
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-[#1A1A1A]">{t.name}</p>
                      <span className="text-[10px] bg-[#3E3A06]/10 text-[#3E3A06] px-1.5 py-0.5 font-semibold">{t.tag}</span>
                    </div>
                    <p className="text-xs text-[#6E6E6E] mt-0.5">{t.location} · {t.product}</p>
                    <StarRow n={t.rating} />
                  </div>
                </div>

                <p className="text-sm text-[#1A1A1A]/80 leading-relaxed italic flex-1">
                  "{t.text}"
                </p>

                <div className="h-0.5 w-8 bg-[#6B6A2A]/40" />
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${
                i === active
                  ? "w-7 h-2 bg-[#3E3A06]"
                  : "w-2 h-2 bg-[#3E3A06]/25 hover:bg-[#3E3A06]/50"
              }`}
              data-testid={`dot-testimonial-${i}`}
              aria-label={`Go to testimonial slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-10 border-t border-[#6B6A2A]/20 pt-10">
          {[
            { number: "2,400+", label: "Happy customers" },
            { number: "4.9 / 5", label: "Average rating" },
            { number: "98 %", label: "Would recommend" },
          ].map(({ number, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#3E3A06]" style={{ fontFamily: "'Playfair Display', serif" }}>{number}</p>
              <p className="text-xs text-[#6E6E6E] font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
