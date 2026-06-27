const LIGHT_ITEMS = [
  "🏺 Kiln-fired at 1260 °C",
  "✦ Free shipping above ₹999",
  "🎁 Every order gift-wrapped",
  "✋ 100 % handcrafted",
  "🌿 Lead-free food-safe glazes",
  "⭐ 4.9 / 5 from 2,400 + buyers",
  "📦 Eco packaging only",
  "🇮🇳 Made in India with love",
  "💎 No two pieces exactly alike",
  "🔥 New drops every month",
  "🏺 Kiln-fired at 1260 °C",
  "✦ Free shipping above ₹999",
  "🎁 Every order gift-wrapped",
  "✋ 100 % handcrafted",
  "🌿 Lead-free food-safe glazes",
  "⭐ 4.9 / 5 from 2,400 + buyers",
  "📦 Eco packaging only",
  "🇮🇳 Made in India with love",
  "💎 No two pieces exactly alike",
  "🔥 New drops every month",
];

const DARK_ITEMS = [
  "🛒 12 people shopping right now",
  "✦ Bundle deals up to 62 % off",
  "🎀 Perfect for gifting",
  "🏅 Artisan certified quality",
  "💌 Personalised note with every bundle",
  "🚀 Orders ship in 24 hours",
  "🔒 100 % secure checkout",
  "♻️ Sustainably sourced clay",
  "🛒 12 people shopping right now",
  "✦ Bundle deals up to 62 % off",
  "🎀 Perfect for gifting",
  "🏅 Artisan certified quality",
  "💌 Personalised note with every bundle",
  "🚀 Orders ship in 24 hours",
  "🔒 100 % secure checkout",
  "♻️ Sustainably sourced clay",
];

interface MarqueeStripProps {
  variant?: "light" | "dark";
  speed?: "slow" | "normal" | "fast";
  reverse?: boolean;
}

export default function MarqueeStrip({
  variant = "light",
  speed = "normal",
  reverse = false,
}: MarqueeStripProps) {
  const items = variant === "dark" ? DARK_ITEMS : LIGHT_ITEMS;
  const duration = speed === "slow" ? "55s" : speed === "fast" ? "28s" : "40s";
  const bg = variant === "dark" ? "bg-[#3E3A06]" : "bg-[#E8E0D0]";
  const textColor = variant === "dark" ? "text-[#D6CBB7]/80" : "text-[#3E3A06]/80";
  const dotColor = variant === "dark" ? "bg-[#D6CBB7]/30" : "bg-[#3E3A06]/25";

  return (
    <div className={`${bg} overflow-hidden py-3 border-y ${variant === "dark" ? "border-[#D6CBB7]/10" : "border-[#6B6A2A]/15"}`}>
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{
          animation: `marquee ${duration} linear infinite ${reverse ? "reverse" : ""}`,
          willChange: "transform",
        }}
      >
        {items.map((item, i) => (
          <span key={i} className={`inline-flex items-center gap-2.5 ${textColor} text-xs font-semibold tracking-wide px-5`}>
            {item}
            <span className={`inline-block w-1 h-1 rounded-full ${dotColor} flex-shrink-0`} />
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
