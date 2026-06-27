export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Information We Collect",
      content: `When you use our services, we may collect:
      • Personal Information: Name, phone number, email address, shipping/billing address
      • Payment Details: Processed securely via third-party payment gateways (we do NOT store your card details)
      • Order Information: Products purchased, preferences, transaction details
      • Technical Data: IP address, browser type, device info, cookies`,
    },
    {
      title: "How We Use Your Information",
      content: `We use your information to:
      • Process and deliver your orders
      • Communicate order updates and customer support
      • Improve our products, services, and user experience
      • Send promotional offers (only if you opt in — no spam nonsense)
      • Prevent fraud and ensure secure transactions`,
    },
    {
      title: "Sharing of Information",
      content: `We do not sell your data — we're in ceramics, not data trafficking.

      We may share your data with:
      • Logistics partners (for delivery)
      • Payment processors (for secure transactions)
      • Service providers (website hosting, analytics, etc.)

      All partners are required to handle your data responsibly.`,
    },
    {
      title: "Cookies & Tracking",
      content: `Our website may use cookies to:
      • Enhance browsing experience
      • Remember preferences
      • Analyze website traffic

      You can disable cookies in your browser settings if you prefer.`,
    },
    {
      title: "Data Security",
      content: `We take reasonable steps to protect your information from:
      • Unauthorized access
      • Misuse or disclosure
      • Data loss

      But let's be real — no system is 100% hack-proof. Still, we don't cut corners.`,
    },
    {
      title: "Your Rights",
      content: `You have the right to:
      • Access your personal data
      • Request correction or deletion
      • Opt out of marketing communications

      To exercise your rights, contact us at the details below.`,
    },
    {
      title: "Third-Party Links",
      content: `Our platform may contain links to third-party websites. We are not responsible for their privacy practices — read their policies before sharing data.`,
    },
    {
      title: "Updates to This Policy",
      content: `We may update this Privacy Policy from time to time. Changes will be posted here with an updated effective date.`,
    },
    {
      title: "Contact Us",
      content: `If you have any questions or concerns regarding this Privacy Policy, contact us:

      Lane of Ceramic
      Email: hello@laneofceramic.com
      Phone: +91 98765 43210

      Effective Date: January 2024`,
    },
  ];

  return (
    <main className="bg-[#D6CBB7]" data-testid="page-privacy">
      <div
        className="relative flex items-end"
        style={{ height: "clamp(180px, 25vh, 280px)" }}
      >
        <div className="absolute inset-0 bg-[#3E3A06]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pb-8">
          <p className="text-xs tracking-widest uppercase text-[#D6CBB7]/60 mb-2">Lane of Ceramic</p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-[#D6CBB7]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Privacy Policy
          </h1>
        </div>
      </div>

      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#3E3A06]/10 border border-[#6B6A2A]/20 px-6 py-4 mb-10">
            <p className="text-sm text-[#3E3A06] leading-relaxed">
              At Lane of Ceramic, we respect your privacy like a good host respects their guests — no unnecessary intrusion, no shady business. This Privacy Policy explains how we collect, use, and protect your information when you interact with us.
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <div key={i} data-testid={`privacy-section-${i}`}>
                <h2
                  className="text-lg font-bold text-[#1A1A1A] mb-3 flex items-start gap-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <span className="text-sm font-normal text-[#6B6A2A] mt-1 flex-shrink-0">0{i + 1}</span>
                  {section.title}
                </h2>
                <p className="text-sm text-[#6E6E6E] leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
