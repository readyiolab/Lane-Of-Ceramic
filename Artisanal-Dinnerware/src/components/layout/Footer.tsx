import { useState } from "react";
import { Link } from "wouter";
import { Instagram, Facebook, Twitter, Youtube, Flame, Leaf, Heart, Award, ArrowRight, MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
const LOGO_SRC = "/logo.webp";

const PROMISES = [
  { icon: "🏺", label: "Kiln-Fired", desc: "Every piece high-fired at 1260 °C for lasting strength" },
  { icon: "🌿", label: "Lead-Free Glazes", desc: "100 % food-safe, non-toxic finishes on all ceramics" },
  { icon: "✋", label: "Artisan Made", desc: "Shaped and painted by hand — no two pieces identical" },
  { icon: "📦", label: "Eco Packaging", desc: "Recycled kraft paper, zero single-use plastic" },
];

const CARE_TIPS = [
  { emoji: "🚿", tip: "Hand wash preferred" },
  { emoji: "🌡️", tip: "Microwave safe" },
  { emoji: "❄️", tip: "Freezer safe" },
  { emoji: "🍽️", tip: "Dishwasher top rack" },
];

const NAV = [
  { heading: "Collections", links: [["Drinkware", "/drinkware"], ["Tableware", "/tableware"], ["Serveware", "/serveware"], ["Kitchenware", "/kitchenware"], ["Bundle Deals", "/bundles/trio"]] },
  { heading: "Us", links: [["Our Story", "/about"], ["Privacy Policy", "/privacy"]] },
];

function WaveDivider() {
  return (
    <svg viewBox="0 0 1440 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: 28 }}>
      <path
        d="M0 14 C180 0 360 28 540 14 C720 0 900 28 1080 14 C1260 0 1380 24 1440 14 L1440 28 L0 28 Z"
        fill="#3E3A06"
      />
    </svg>
  );
}

function RimPattern() {
  return (
    <div className="flex items-center justify-center gap-0 overflow-hidden opacity-20 select-none" aria-hidden>
      {Array.from({ length: 72 }).map((_, i) => (
        <span
          key={i}
          className="inline-block w-[14px] h-[6px] rounded-full"
          style={{
            background: i % 3 === 0 ? "#D6CBB7" : i % 3 === 1 ? "#6B6A2A" : "#A8A060",
            transform: `scaleY(${i % 5 === 0 ? 1.6 : 1}) rotate(${i % 2 === 0 ? 2 : -2}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) { setJoined(true); setEmail(""); }
  }

  return (
    <footer>
      <WaveDivider />

      <div className="bg-[#3E3A06]">
        <div className="border-b border-[#D6CBB7]/10 py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <RimPattern />
            <p className="text-center text-[10px] tracking-[0.3em] uppercase text-[#D6CBB7]/35 mt-3 mb-8 font-medium">
              Our Craft Promise
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {PROMISES.map(({ icon, label, desc }) => (
                <div
                  key={label}
                  className="group flex flex-col items-center text-center gap-2 px-3 py-4 border border-[#D6CBB7]/10 hover:border-[#D6CBB7]/30 hover:bg-[#D6CBB7]/5 transition-all cursor-default"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
                  <p className="text-xs font-bold tracking-wider uppercase text-[#D6CBB7] mt-1">{label}</p>
                  <p className="text-[11px] text-[#D6CBB7]/50 leading-relaxed hidden sm:block">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-10">

            {/* Brand + social */}
            <div className="lg:col-span-3">
              <img src={LOGO_SRC} alt="Lane of Ceramic" className="h-16 md:h-20 w-auto mb-5" />
              <p className="text-[#D6CBB7]/65 text-sm leading-7" style={{ fontFamily: "'Playfair Display', serif" }}>
                "From wet clay to your table — every curve, every glaze, every imperfection is intentional."
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CARE_TIPS.map(({ emoji, tip }) => (
                  <div key={tip} className="flex items-center gap-1.5 text-[11px] text-[#D6CBB7]/60 bg-[#D6CBB7]/8 px-2.5 py-1.5 border border-[#D6CBB7]/12">
                    <span>{emoji}</span><span>{tip}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5 mt-5">
                {[
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Twitter, label: "Twitter" },
                  { Icon: Youtube, label: "YouTube" },
                ].map(({ Icon, label }) => (
                  <a key={label} href="#" aria-label={label}
                    className="w-9 h-9 border border-[#D6CBB7]/25 flex items-center justify-center text-[#D6CBB7]/55 hover:text-[#D6CBB7] hover:border-[#D6CBB7]/55 hover:bg-[#D6CBB7]/8 transition-all">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Collections + Us */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-1 gap-8">
              {NAV.map(({ heading, links }) => (
                <div key={heading}>
                  <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D6CBB7]/40 mb-4">{heading}</h4>
                  <ul className="space-y-2.5">
                    {links.map(([label, path]) => (
                      <li key={path}>
                        <Link href={path} className="text-sm text-[#D6CBB7]/65 hover:text-[#D6CBB7] hover:pl-1.5 transition-all duration-200 block">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact us */}
            <div className="lg:col-span-3">
              <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D6CBB7]/40 mb-5">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={15} className="text-[#6B6A2A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#D6CBB7]/80 leading-snug">Lane of Ceramic Studio</p>
                    <p className="text-[11px] text-[#D6CBB7]/50 leading-relaxed mt-0.5">
                      Plot 14, Pottery Lane, Sanganer<br />
                      Jaipur, Rajasthan — 302 029<br />
                      India
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={14} className="text-[#6B6A2A] flex-shrink-0" />
                  <a href="tel:+919876543210" className="text-sm text-[#D6CBB7]/65 hover:text-[#D6CBB7] transition-colors">
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={14} className="text-[#6B6A2A] flex-shrink-0" />
                  <a href="mailto:hello@laneofceramic.com" className="text-sm text-[#D6CBB7]/65 hover:text-[#D6CBB7] transition-colors break-all">
                    hello@laneofceramic.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={14} className="text-[#6B6A2A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#D6CBB7]/65">Mon – Sat · 10 AM – 6 PM IST</p>
                    <p className="text-[11px] text-[#D6CBB7]/35 mt-0.5">We reply within 24 hours on business days</p>
                  </div>
                </li>
              </ul>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/25 transition-colors"
              >
                <MessageCircle size={14} />
                Chat on WhatsApp
              </a>
            </div>

            {/* From the Kiln + Newsletter */}
            <div className="lg:col-span-4">
              <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D6CBB7]/40 mb-4">From the Kiln</h4>
              <div className="space-y-3 mb-6">
                <div className="border-l-2 border-[#6B6A2A] pl-3 py-0.5">
                  <p className="text-xs font-semibold text-[#D6CBB7]/80">New: Monsoon Matte Collection</p>
                  <p className="text-[11px] text-[#D6CBB7]/45 mt-0.5">Earthy tones inspired by the first rains</p>
                </div>
                <div className="border-l-2 border-[#6B6A2A]/50 pl-3 py-0.5">
                  <p className="text-xs font-semibold text-[#D6CBB7]/70">Care Guide: Seasoning your ceramic</p>
                  <p className="text-[11px] text-[#D6CBB7]/40 mt-0.5">5-minute ritual that doubles longevity</p>
                </div>
                <div className="border-l-2 border-[#6B6A2A]/30 pl-3 py-0.5">
                  <p className="text-xs font-semibold text-[#D6CBB7]/60">Behind the Studio: Meet our potters</p>
                  <p className="text-[11px] text-[#D6CBB7]/35 mt-0.5">Families who have thrown clay for generations</p>
                </div>
              </div>

              <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#D6CBB7]/40 mb-3">Stay in the Loop</h4>
              {joined ? (
                <div className="flex items-center gap-2.5 text-sm text-[#D6CBB7]/80 py-3 border border-[#D6CBB7]/20 px-4 bg-[#D6CBB7]/5">
                  <Heart size={14} className="text-[#D6CBB7] fill-[#D6CBB7]" />
                  <span>You're in! Welcome to the Lane.</span>
                </div>
              ) : (
                <form onSubmit={handleJoin} className="flex" data-testid="form-newsletter">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent border border-[#D6CBB7]/25 px-3 py-2.5 text-sm text-[#D6CBB7] placeholder:text-[#D6CBB7]/35 outline-none focus:border-[#D6CBB7]/55 transition-colors"
                    data-testid="input-newsletter-email"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#D6CBB7] text-[#3E3A06] text-sm font-bold hover:bg-[#D6CBB7]/90 transition-colors flex items-center gap-1.5"
                    data-testid="button-newsletter-submit"
                  >
                    Join <ArrowRight size={13} />
                  </button>
                </form>
              )}
              <p className="text-[10px] text-[#D6CBB7]/30 mt-2">Collections, kiln stories & care tips. No spam, ever.</p>
            </div>

          </div>
        </div>

        <div className="border-t border-[#D6CBB7]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-[#D6CBB7]/35">&copy; {new Date().getFullYear()} Lane of Ceramic — All rights reserved</p>

            <div className="flex items-center gap-2 text-[11px] text-[#D6CBB7]/35">
              <Flame size={11} className="text-[#6B6A2A]" />
              <span>Kiln-fired in India with love</span>
              <Leaf size={11} className="text-[#6B6A2A]" />
              <span>Sustainably made</span>
              <Award size={11} className="text-[#6B6A2A]" />
              <span>Artisan certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
