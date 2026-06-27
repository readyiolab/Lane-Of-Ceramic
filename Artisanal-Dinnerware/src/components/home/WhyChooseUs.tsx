const FEATURES = [
  {
    icon: "🏺",
    title: "Handcrafted",
    desc: "Every piece is individually thrown, shaped, and glazed by skilled artisans — no two are ever exactly the same.",
  },
  {
    icon: "🌿",
    title: "Eco-Friendly",
    desc: "We use sustainable, non-toxic glazes and fire our pieces in energy-efficient kilns. Good for your table, good for the earth.",
  },
  {
    icon: "♨️",
    title: "Microwave Safe",
    desc: "All our pieces are tested for microwave and dishwasher safety — beauty that works as hard as you do.",
  },
  {
    icon: "📦",
    title: "Carefully Packed",
    desc: "Each order is wrapped by hand with care to ensure it arrives safely — and looks beautiful when it does.",
  },
  {
    icon: "✏️",
    title: "Custom Orders",
    desc: "Looking for something specific? We take custom orders for sets, colours, and bulk hospitality needs.",
  },
  {
    icon: "🇮🇳",
    title: "Made in India",
    desc: "Proudly supporting traditional Indian pottery craft — every purchase supports local artisan communities.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#3E3A06]" data-testid="section-why-us">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-widest uppercase text-[#D6CBB7]/60 font-medium mb-2">Our Promise</p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#D6CBB7]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Why Choose Handcrafted Ceramic Dinnerware?
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="flex gap-4"
              data-testid={`feature-${i}`}
            >
              <div className="text-3xl flex-shrink-0 mt-0.5">{feature.icon}</div>
              <div>
                <h3 className="text-base font-semibold text-[#D6CBB7] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#D6CBB7]/65 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
