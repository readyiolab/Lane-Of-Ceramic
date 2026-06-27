import { Link } from "wouter";

export default function StoryBanner() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#D6CBB7]" data-testid="section-story">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700&auto=format&fit=crop&q=80"
            alt="Our craft"
            className="w-full aspect-[4/3] object-cover"
            loading="lazy"
          />
          <div className="absolute -bottom-4 -right-4 bg-[#3E3A06] text-[#D6CBB7] p-6 hidden sm:block">
            <p className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>2016</p>
            <p className="text-xs text-[#D6CBB7]/70 mt-1">Crafting since</p>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-[#6B6A2A] font-medium mb-3">Our Story</p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-5 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Born from a belief that everyday essentials deserve better design.
          </h2>
          <p className="text-sm text-[#6E6E6E] leading-relaxed mb-6">
            At Lane of Ceramic, we don't just sell crockery — we curate experiences that sit right at your table. Our collections are thoughtfully selected for quality, durability, and style — because good taste isn't just about food, it's also about what you serve it on.
          </p>
          <Link
            href="/about"
            className="inline-block px-8 py-3.5 bg-[#3E3A06] text-[#D6CBB7] text-sm font-semibold tracking-wide hover:bg-[#6B6A2A] transition-colors"
            data-testid="link-about-us"
          >
            Our Full Story
          </Link>
        </div>
      </div>
    </section>
  );
}
