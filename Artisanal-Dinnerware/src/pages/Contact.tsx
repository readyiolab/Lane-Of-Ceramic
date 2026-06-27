import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main data-testid="page-contact">
      <div
        className="relative flex items-end"
        style={{ height: "clamp(180px, 25vh, 280px)" }}
      >
        <img
          src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1400&auto=format&fit=crop&q=80"
          alt="Contact us"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pb-8">
          <p className="text-xs tracking-widest uppercase text-[#D6CBB7]/70 mb-2">Lane of Ceramic</p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Contact Us
          </h1>
        </div>
      </div>

      <section className="bg-[#D6CBB7] py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-xl sm:text-2xl font-bold text-[#3E3A06] text-center mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Get in Touch for Custom Ceramic Orders and Support
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              {submitted ? (
                <div className="bg-[#3E3A06] text-[#D6CBB7] p-8 text-center" data-testid="success-message">
                  <p className="text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Thank You!</p>
                  <p className="text-sm text-[#D6CBB7]/80">We've received your message and will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-contact">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-[#3E3A06] mb-1.5 tracking-wide uppercase">Your Name</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Priya Sharma"
                        className="w-full border border-[#6B6A2A]/40 bg-[#E8E0D0] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#6E6E6E] outline-none focus:border-[#3E3A06] transition-colors"
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#3E3A06] mb-1.5 tracking-wide uppercase">Email Address</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="priya@email.com"
                        className="w-full border border-[#6B6A2A]/40 bg-[#E8E0D0] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#6E6E6E] outline-none focus:border-[#3E3A06] transition-colors"
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#3E3A06] mb-1.5 tracking-wide uppercase">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Custom order enquiry"
                      className="w-full border border-[#6B6A2A]/40 bg-[#E8E0D0] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#6E6E6E] outline-none focus:border-[#3E3A06] transition-colors"
                      data-testid="input-contact-subject"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#3E3A06] mb-1.5 tracking-wide uppercase">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your requirements..."
                      className="w-full border border-[#6B6A2A]/40 bg-[#E8E0D0] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#6E6E6E] outline-none focus:border-[#3E3A06] transition-colors resize-none"
                      data-testid="input-contact-message"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#3E3A06] text-[#D6CBB7] text-sm font-semibold tracking-wide hover:bg-[#6B6A2A] transition-colors"
                    data-testid="button-contact-submit"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Get in Touch
                </h3>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: "Email Us", value: "hello@laneofceramic.com" },
                    { icon: Phone, label: "Call Us", value: "+91 98765 43210" },
                    { icon: MapPin, label: "Location", value: "India — shipping nationwide" },
                    { icon: Clock, label: "Response Time", value: "Within 24 hours on business days" },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div key={i} className="flex gap-4" data-testid={`contact-info-${i}`}>
                      <div className="w-9 h-9 bg-[#3E3A06] text-[#D6CBB7] flex items-center justify-center flex-shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#6E6E6E] uppercase tracking-wide">{label}</p>
                        <p className="text-sm text-[#1A1A1A] mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#3E3A06] p-6">
                <h3 className="text-base font-semibold text-[#D6CBB7] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Wholesale & Bulk Orders
                </h3>
                <p className="text-sm text-[#D6CBB7]/70 leading-relaxed">
                  We supply to hotels, restaurants, cafes, and interior designers. Contact us for bulk pricing, custom branding, and hospitality collections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
