export default function About() {
  return (
    <main data-testid="page-about">
      <div
        className="relative flex items-end"
        style={{ height: "clamp(200px, 30vh, 320px)" }}
      >
        <img
          src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1400&auto=format&fit=crop&q=80"
          alt="About Lane of Ceramic"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pb-8">
          <p className="text-xs tracking-widest uppercase text-[#D6CBB7]/70 mb-2">Lane of Ceramic</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            About Us
          </h1>
        </div>
      </div>

      <section className="bg-[#D6CBB7] py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#6B6A2A] font-medium mb-3">Our Mission</p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Bringing Traditional Pottery to Modern Lifestyles
            </h2>
            <div className="space-y-4 text-sm text-[#6E6E6E] leading-relaxed">
              <p>
                At Lane of Ceramic, we don't just sell crockery — we curate experiences that sit right at your table.
              </p>
              <p>
                Born from a simple idea that everyday essentials deserve better design, we bring together timeless craftsmanship and modern aesthetics. From elegant dinnerware and durable hotelware to statement décor pieces that quietly steal attention, everything we offer is built to elevate spaces — homes, cafés, and everything in between.
              </p>
              <p>
                We believe ceramics should do more than just exist on a shelf. They should tell a story, complement your lifestyle, and occasionally make your guests ask, "Where did you get that?"
              </p>
              <p>
                Our collections are thoughtfully selected for quality, durability, and style — because good taste isn't just about food, it's also about what you serve it on.
              </p>
              <p>
                Whether you're setting up your dream dining table, upgrading your hospitality space, or just adding a little character to your home, Lane of Ceramic is where function meets finesse.
              </p>
              <p className="font-medium text-[#3E3A06]">
                Because ordinary tableware is boring — and we don't do boring.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&auto=format&fit=crop&q=80"
              alt="Our ceramics"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-[#3E3A06] text-[#D6CBB7] p-6 hidden sm:block">
              <p className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>2016</p>
              <p className="text-xs text-[#D6CBB7]/70 mt-1">Est. India</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#3E3A06] py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            { stat: "10,000+", label: "Happy Customers" },
            { stat: "200+", label: "Unique Designs" },
            { stat: "9 Years", label: "Of Craftsmanship" },
          ].map((item, i) => (
            <div key={i} data-testid={`stat-${i}`}>
              <p
                className="text-4xl font-bold text-[#D6CBB7]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {item.stat}
              </p>
              <p className="text-sm text-[#D6CBB7]/60 mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#E8E0D0] py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-10 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our Craft Process
          </h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Sourcing Clay", desc: "We start with ethically sourced, high-grade stoneware clay." },
              { step: "02", title: "Hand Throwing", desc: "Each piece is individually shaped on a wheel by skilled potters." },
              { step: "03", title: "Glazing", desc: "Non-toxic, food-safe glazes are applied by hand for unique finishes." },
              { step: "04", title: "Kiln Firing", desc: "Pieces are fired at high temperature for durability and strength." },
            ].map((step, i) => (
              <div key={i} className="text-center" data-testid={`process-step-${i}`}>
                <p
                  className="text-4xl font-bold text-[#3E3A06]/20 mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {step.step}
                </p>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">{step.title}</h3>
                <p className="text-xs text-[#6E6E6E] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
