import { useLocation } from "wouter";
import { ArrowRight, Gift, Star, Flame, Sparkles } from "lucide-react";

const TRIO_PREVIEWS = [
  "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=120&h=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=120&h=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&auto=format&fit=crop&q=80",
];

const FIVE_PREVIEWS = [
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=120&h=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=120&h=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=120&h=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1484766280341-87861644c80d?w=120&h=120&auto=format&fit=crop&q=80",
];

const REVIEWS = [
  { name: "Priya M.", text: "Gifted the trio set — it looked absolutely stunning unwrapped!", stars: 5 },
  { name: "Rahul T.", text: "Five-piece bundle saved me ₹2,400. Best value on the internet.", stars: 5 },
];

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function SavingsStamp({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="relative w-[88px] h-[88px] flex-shrink-0">
      <svg viewBox="0 0 88 88" className="absolute inset-0 w-full h-full animate-[spin_18s_linear_infinite]">
        <path
          id="circle-text"
          d="M 44,44 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0"
          fill="none"
        />
        <text fontSize="8.2" fontWeight="700" letterSpacing="2.5" fill="#D6CBB7" opacity="0.85">
          <textPath href="#circle-text">SAVE BIG • GIFT WRAPPED • SAVE BIG • </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold text-[#D6CBB7]/70 uppercase tracking-wide leading-none">{sub}</span>
        <span className="text-xl font-black text-[#D6CBB7] leading-tight">{text}</span>
      </div>
    </div>
  );
}

export default function BundleSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative overflow-hidden bg-[#2C2800]" data-testid="section-bundles">
      {/* Decorative ceramic texture dots */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle, #D6CBB7 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Warm top gradient from previous section */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#D6CBB7] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#D6CBB7]/10 border border-[#D6CBB7]/20 px-4 py-1.5 mb-5">
            <Flame size={13} className="text-amber-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#D6CBB7]/80">Limited Time Offer</span>
            <Flame size={13} className="text-amber-400" />
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#D6CBB7] leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Build Your Perfect Set
          </h2>
          <p className="text-[#D6CBB7]/55 text-base max-w-lg mx-auto leading-relaxed">
            Handpick your favourite ceramics and get them at one unbeatable price —<br className="hidden sm:block" />
            we'll gift-wrap them beautifully.
          </p>
        </div>

        {/* Bundle cards */}
        <div className="flex flex-col gap-6">

          {/* CARD 1 — TRIO */}
          <div
            className="group relative overflow-hidden cursor-pointer"
            style={{ minHeight: 340 }}
            onClick={() => setLocation("/bundles/trio")}
            data-testid="bundle-card-trio"
          >
            <div className="grid lg:grid-cols-[45%_55%] h-full">

              {/* Image side */}
              <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
                <img
                  src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&auto=format&fit=crop&q=85"
                  alt="Ceramic mug trio bundle"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient right-to-content */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#2C2800] hidden lg:block" />
                {/* Gradient bottom for mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2800] via-[#2C2800]/40 to-transparent lg:hidden" />

                {/* Badge */}
                <div className="absolute top-5 left-5">
                  <span className="bg-[#D6CBB7] text-[#3E3A06] text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5">
                    ★ Most Popular
                  </span>
                </div>

                {/* Mini product previews */}
                <div className="absolute bottom-5 left-5 flex gap-2">
                  {TRIO_PREVIEWS.map((src, i) => (
                    <div key={i} className="w-12 h-12 overflow-hidden border-2 border-[#D6CBB7]/60 shadow-lg">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-12 h-12 border-2 border-[#D6CBB7]/40 bg-[#D6CBB7]/10 flex items-center justify-center text-[#D6CBB7]/70 text-xs font-bold">
                    +21
                  </div>
                </div>
              </div>

              {/* Content side */}
              <div className="relative bg-[#2C2800] lg:bg-transparent flex flex-col justify-center px-8 py-10 lg:py-8">
                {/* Savings stamp — absolute on desktop at left edge */}
                <div className="hidden lg:flex absolute -left-11 top-1/2 -translate-y-1/2 z-10">
                  <SavingsStamp text="₹1,400" sub="Save" />
                </div>

                <div className="max-w-md">
                  <p className="text-[#D6CBB7]/50 text-xs font-semibold tracking-widest uppercase mb-1">Create Your Bundle</p>
                  <h3
                    className="text-3xl sm:text-4xl font-bold text-[#D6CBB7] leading-snug mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Pick Any 3
                  </h3>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-5xl font-black text-[#D6CBB7]">₹999</span>
                    <div>
                      <p className="text-[#D6CBB7]/40 text-sm line-through">Worth ₹2,397+</p>
                      <p className="text-green-400 text-xs font-bold">You save ₹1,400</p>
                    </div>
                  </div>

                  <div className="w-12 h-0.5 bg-[#6B6A2A] my-5" />

                  <ul className="space-y-2.5 mb-7">
                    {[
                      { icon: "🎁", text: "Free gift wrapping on every box" },
                      { icon: "✉️", text: "Personalised handwritten note card" },
                      { icon: "🏺", text: "Mix freely — any category, any style" },
                    ].map(({ icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-sm text-[#D6CBB7]/75">
                        <span className="text-base">{icon}</span>
                        {text}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="flex items-center gap-3 bg-[#D6CBB7] text-[#2C2800] px-8 py-4 font-bold text-sm tracking-wide hover:bg-[#D6CBB7]/90 transition-all group/btn"
                    data-testid="button-build-box-trio"
                  >
                    <Gift size={16} />
                    Build Your Box
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2 — FIVE PACK */}
          <div
            className="group relative overflow-hidden cursor-pointer"
            style={{ minHeight: 340 }}
            onClick={() => setLocation("/bundles/five")}
            data-testid="bundle-card-five"
          >
            <div className="grid lg:grid-cols-[55%_45%] h-full">

              {/* Content side — left on desktop */}
              <div className="relative bg-[#3E3A06] flex flex-col justify-center px-8 py-10 lg:py-8 order-2 lg:order-1">
                <div className="hidden lg:flex absolute -right-11 top-1/2 -translate-y-1/2 z-10">
                  <SavingsStamp text="₹2,500" sub="Save" />
                </div>

                <div className="max-w-md">
                  <p className="text-[#D6CBB7]/50 text-xs font-semibold tracking-widest uppercase mb-1">Best Value Bundle</p>
                  <h3
                    className="text-3xl sm:text-4xl font-bold text-[#D6CBB7] leading-snug mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Pick Your Favourite Five!
                  </h3>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-5xl font-black text-[#D6CBB7]">₹1,499</span>
                    <div>
                      <p className="text-[#D6CBB7]/40 text-sm line-through">Worth ₹3,995+</p>
                      <p className="text-green-400 text-xs font-bold">You save ₹2,500</p>
                    </div>
                  </div>

                  <div className="w-12 h-0.5 bg-[#D6CBB7]/30 my-5" />

                  <ul className="space-y-2.5 mb-7">
                    {[
                      { icon: "🎀", text: "Premium gift box + satin ribbon" },
                      { icon: "💌", text: "Personalised message card of your choice" },
                      { icon: "🌿", text: "Eco-wrapped in recycled kraft paper" },
                      { icon: "🏺", text: "Mix freely — any category, any style" },
                    ].map(({ icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-sm text-[#D6CBB7]/75">
                        <span className="text-base">{icon}</span>
                        {text}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      className="flex items-center gap-3 bg-[#D6CBB7] text-[#3E3A06] px-8 py-4 font-bold text-sm tracking-wide hover:bg-[#D6CBB7]/90 transition-all group/btn"
                      data-testid="button-build-box-five"
                    >
                      <Sparkles size={16} />
                      Build Your Box
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-xs text-[#D6CBB7]/40 hidden sm:block">Only ₹300/piece ✦</span>
                  </div>
                </div>
              </div>

              {/* Image side — right on desktop */}
              <div className="relative overflow-hidden order-1 lg:order-2" style={{ minHeight: 280 }}>
                <img
                  src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&auto=format&fit=crop&q=85"
                  alt="Ceramic five-piece bundle"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#3E3A06] hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E3A06] via-[#3E3A06]/40 to-transparent lg:hidden" />

                <div className="absolute top-5 right-5">
                  <span className="bg-amber-400 text-[#2C2800] text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5">
                    ★ Best Value
                  </span>
                </div>

                {/* Mini product previews */}
                <div className="absolute bottom-5 right-5 flex flex-wrap gap-1.5 justify-end" style={{ maxWidth: 180 }}>
                  {FIVE_PREVIEWS.map((src, i) => (
                    <div key={i} className="w-10 h-10 overflow-hidden border-2 border-[#D6CBB7]/60 shadow-lg">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof row */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-[#D6CBB7]/7 border border-[#D6CBB7]/12 px-5 py-4">
              <StarRow n={r.stars} />
              <p className="text-[#D6CBB7]/70 text-xs leading-relaxed mt-2 italic">"{r.text}"</p>
              <p className="text-[#D6CBB7]/40 text-[10px] font-semibold mt-2 uppercase tracking-wide">— {r.name}, verified buyer</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-[#D6CBB7]/30 mt-6 tracking-wide">
          Mix &amp; match across all categories · Kiln-fired · Free shipping above ₹999
        </p>
      </div>
    </section>
  );
}
