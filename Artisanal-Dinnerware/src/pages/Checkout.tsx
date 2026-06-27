import { useState, useId } from "react";
import { useLocation } from "wouter";
import {
  Check, ChevronRight, MapPin, CreditCard, Package, ShoppingBag,
  Phone, Mail, Home, Briefcase, Edit2, Truck, Shield, Clock,
  CheckCircle2, Copy, ChevronDown, ChevronUp,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createAddress, AddressPayload } from "@/api/addresses";
import { createOrder } from "@/api/orders";
import { addToCart } from "@/api/cart";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

interface Address {
  fullName: string;
  phone: string;
  email: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  type: "Home" | "Work" | "Other";
}

interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "upi", label: "UPI", icon: "📱", desc: "Pay via GPay, PhonePe, Paytm or any UPI app" },
  { id: "card", label: "Debit / Credit Card", icon: "💳", desc: "Visa, Mastercard, Rupay — all cards accepted" },
  { id: "netbanking", label: "Net Banking", icon: "🏦", desc: "All major Indian banks supported" },
  { id: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives at your door" },
];

function generateOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = (n: number) => Math.floor(Math.random() * n);
  return `LOC${chars[rand(26)]}${chars[rand(10) + 26]}${rand(9)}${rand(9)}${rand(9)}${rand(9)}${rand(9)}${rand(9)}`;
}

function getDeliveryDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
      done ? "bg-[#3E3A06] border-[#3E3A06] text-[#D6CBB7]"
           : active ? "bg-[#D6CBB7] border-[#3E3A06] text-[#3E3A06]"
           : "bg-transparent border-[#6B6A2A]/30 text-[#6E6E6E]"
    }`}>
      {done ? <Check size={14} /> : n}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required = true, half = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; half?: boolean;
}) {
  const id = useId();
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label htmlFor={id} className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[#D6CBB7] border border-[#6B6A2A]/25 text-[#1A1A1A] text-sm placeholder-[#6E6E6E]/50 focus:outline-none focus:border-[#3E3A06] transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  const id = useId();
  return (
    <div className="col-span-1">
      <label htmlFor={id} className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide mb-1.5">
        {label}<span className="text-red-400 ml-0.5">*</span>
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-[#D6CBB7] border border-[#6B6A2A]/25 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3E3A06] transition-colors appearance-none"
        >
          <option value="">Select {label}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E6E] pointer-events-none" />
      </div>
    </div>
  );
}

function OrderSummaryPanel({
  items, subtotal, discountAmount, shippingCost, finalTotal, currentTier, collapsed, setCollapsed,
}: any) {
  return (
    <div className="bg-[#E8E0D0] sticky top-24">
      <button
        className="w-full flex items-center justify-between px-5 py-4 border-b border-[#6B6A2A]/20 lg:cursor-default"
        onClick={() => setCollapsed((p: boolean) => !p)}
      >
        <h3 className="font-bold text-[#1A1A1A] text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
          Order Summary ({items.reduce((s: number, i: any) => s + i.quantity, 0)} items)
        </h3>
        <span className="font-bold text-[#3E3A06] flex items-center gap-2">
          ₹{finalTotal.toLocaleString("en-IN")}
          <span className="lg:hidden">{collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</span>
        </span>
      </button>

      <div className={`${collapsed ? "hidden lg:block" : ""}`}>
        <div className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto">
          {items.map((item: any) => {
            const price = item.bundlePrice ?? item.product.price;
            return (
              <div key={item.product.id} className="flex gap-3">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#3E3A06] text-[#D6CBB7] rounded-full text-[10px] flex items-center justify-center font-bold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A1A1A] leading-tight line-clamp-2">{item.product.name}</p>
                  <p className="text-xs text-[#6E6E6E] capitalize mt-0.5">{item.product.category}</p>
                  {item.bundlePrice && <span className="text-[9px] bg-[#3E3A06]/10 text-[#3E3A06] px-1 py-0.5 font-bold">BUNDLE</span>}
                </div>
                <p className="text-sm font-semibold text-[#3E3A06] flex-shrink-0">₹{(price * item.quantity).toLocaleString("en-IN")}</p>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-[#6B6A2A]/15 space-y-2.5 text-sm">
          <div className="flex justify-between text-[#6E6E6E]">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-700 font-semibold">
              <span>{currentTier.label} ({currentTier.discountPct}% off)</span>
              <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-[#6E6E6E]">
            <span>Shipping</span>
            <span className={shippingCost === 0 ? "text-green-700 font-semibold" : ""}>
              {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-[#1A1A1A] text-base pt-2 border-t border-[#6B6A2A]/20">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-2">
          {[
            { icon: Truck, text: "Free delivery above ₹999" },
            { icon: Shield, text: "Secure 256-bit SSL checkout" },
            { icon: Package, text: "Packed in eco-friendly boxes" },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[#6E6E6E]">
              <Icon size={12} className="text-[#3E3A06]" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, subtotal, discountAmount, shippingCost, finalTotal, currentTier, clearCart } = useCart() as any;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState<Address>({
    fullName: "", phone: "", email: "", pincode: "", addressLine1: "",
    addressLine2: "", city: "", state: "", type: "Home",
  });
  const [payment, setPayment] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [summaryCollapsed, setSummaryCollapsed] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [copying, setCopying] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#D6CBB7]">
        <ShoppingBag size={40} className="text-[#3E3A06]/40" />
        <p className="text-[#6E6E6E]">Your cart is empty.</p>
        <button onClick={() => setLocation("/")} className="px-6 py-2.5 bg-[#3E3A06] text-[#D6CBB7] text-sm font-medium hover:bg-[#6B6A2A] transition-colors">
          Continue Shopping
        </button>
      </div>
    );
  }

  function validateAddress(): boolean {
    const errs: Partial<Record<keyof Address, string>> = {};
    if (!address.fullName.trim()) errs.fullName = "Required";
    if (!address.phone.match(/^[6-9]\d{9}$/)) errs.phone = "Enter valid 10-digit mobile number";
    if (address.email && !address.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Enter valid email";
    if (!address.pincode.match(/^\d{6}$/)) errs.pincode = "Enter valid 6-digit pincode";
    if (!address.addressLine1.trim()) errs.addressLine1 = "Required";
    if (!address.city.trim()) errs.city = "Required";
    if (!address.state) errs.state = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleAddressContinue() {
    if (validateAddress()) setStep(2);
  }

  async function handlePlaceOrder() {
    if (!validateAddress()) {
      setStep(1);
      return;
    }
    
    setIsPlacingOrder(true);
    try {
      // 1. Create Address
      const addressPayload: AddressPayload = {
        fullName: address.fullName,
        mobileNumber: address.phone,
        email: address.email || undefined,
        pincode: address.pincode,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        addressType: address.type.toUpperCase() as "HOME" | "WORK" | "OTHER",
      };

      const addressRes = await createAddress(addressPayload);
      
      // 1.5 Sync Local Cart to Backend Cart
      await Promise.all(
        items.map((item: any) => {
          const pId = item.product.numericId || parseInt(item.product.id.replace(/\D/g, '')) || 1;
          return addToCart({
            productId: pId,
            quantity: item.quantity,
          }).catch(err => {
            console.warn("Failed to sync item to cart", item, err);
          });
        })
      );

      // 2. Create Order
      // For now we map any payment method to COD if it's COD, otherwise ONLINE
      const paymentMethod = payment === "cod" ? "COD" : "ONLINE";
      
      const orderRes = await createOrder({
        addressId: addressRes.id,
        paymentMethod,
      });

      // 3. Complete
      setOrderId((orderRes as any).order_number || orderRes.orderId || "SUCCESS");
      clearCart();
      setStep(3);
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  function handleCopyOrderId() {
    navigator.clipboard.writeText(orderId).catch(() => {});
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }

  const STEPS = [
    { n: 1, label: "Delivery Address" },
    { n: 2, label: "Payment" },
    { n: 3, label: "Confirmation" },
  ];

  return (
    <main className="min-h-screen bg-[#D6CBB7]" data-testid="page-checkout">
      {step < 3 && (
        <div className="bg-[#3E3A06] text-[#D6CBB7] px-4 sm:px-6 py-5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-6">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 sm:gap-3">
                  <StepBadge n={s.n} active={step === s.n} done={step > s.n} />
                  <span className={`text-xs sm:text-sm font-medium hidden sm:block ${step === s.n ? "text-[#D6CBB7]" : step > s.n ? "text-[#D6CBB7]/70" : "text-[#D6CBB7]/40"}`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight size={14} className="text-[#D6CBB7]/30 ml-1 sm:ml-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 ? (
        <div className="min-h-screen bg-[#D6CBB7] flex flex-col items-center justify-center px-4 py-16" data-testid="section-order-confirmed">
          <div className="max-w-lg w-full bg-[#E8E0D0] shadow-lg">
            <div className="bg-[#3E3A06] p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#D6CBB7]/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} className="text-[#D6CBB7]" />
              </div>
              <h1 className="text-2xl font-bold text-[#D6CBB7] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Order Placed!
              </h1>
              <p className="text-[#D6CBB7]/70 text-sm">Thank you, {address.fullName}! Your ceramics are on their way.</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-[#D6CBB7] p-4">
                <p className="text-xs text-[#6E6E6E] uppercase tracking-wide font-semibold mb-2">Order ID</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold text-[#1A1A1A] tracking-wider font-mono">{orderId}</span>
                  <button
                    onClick={handleCopyOrderId}
                    className="flex items-center gap-1.5 text-xs text-[#3E3A06] font-medium hover:text-[#6B6A2A] transition-colors"
                    data-testid="button-copy-order-id"
                  >
                    {copying ? <Check size={12} /> : <Copy size={12} />}
                    {copying ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#D6CBB7] p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={13} className="text-[#3E3A06]" />
                    <p className="text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide">Expected Delivery</p>
                  </div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{getDeliveryDate(5)}</p>
                  <p className="text-xs text-[#6E6E6E]">to {getDeliveryDate(7)}</p>
                </div>
                <div className="bg-[#D6CBB7] p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={13} className="text-[#3E3A06]" />
                    <p className="text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide">Payment</p>
                  </div>
                  <p className="text-sm font-bold text-[#1A1A1A] capitalize">
                    {PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? payment}
                  </p>
                  <p className="text-xs text-[#6E6E6E] font-medium text-green-700">₹{finalTotal.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="bg-[#D6CBB7] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-[#3E3A06]" />
                  <p className="text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide">Delivering to</p>
                  <span className="text-[10px] bg-[#3E3A06] text-[#D6CBB7] px-1.5 py-0.5 font-bold">{address.type}</span>
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A]">{address.fullName}</p>
                <p className="text-xs text-[#6E6E6E] mt-0.5">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
                <p className="text-xs text-[#6E6E6E]">{address.city}, {address.state} — {address.pincode}</p>
                <p className="text-xs text-[#6E6E6E] mt-1">📞 {address.phone}</p>
              </div>

              <div className="bg-[#D6CBB7] p-4">
                <p className="text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide mb-3">Items Ordered</p>
                <div className="space-y-2.5">
                  {items.map((item: any) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#1A1A1A] truncate">{item.product.name}</p>
                        <p className="text-xs text-[#6E6E6E]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-[#3E3A06]">
                        ₹{((item.bundlePrice ?? item.product.price) * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-3.5 flex items-start gap-2.5">
                <Truck size={16} className="text-green-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-green-800">Your order is confirmed!</p>
                  <p className="text-xs text-green-700 mt-0.5">You will receive an SMS & email update at each step. Track your order using the Order ID above.</p>
                </div>
              </div>

              <button
                onClick={() => { setLocation("/"); }}
                className="w-full py-3.5 bg-[#3E3A06] text-[#D6CBB7] font-semibold text-sm hover:bg-[#6B6A2A] transition-colors"
                data-testid="button-continue-shopping-confirmation"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="lg:hidden mb-4">
            <OrderSummaryPanel
              items={items} subtotal={subtotal} discountAmount={discountAmount}
              shippingCost={shippingCost} finalTotal={finalTotal} currentTier={currentTier}
              collapsed={summaryCollapsed} setCollapsed={setSummaryCollapsed}
            />
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
              {step === 1 && (
                <div className="bg-[#E8E0D0] p-6 sm:p-8" data-testid="section-address">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin size={20} className="text-[#3E3A06]" />
                    <h2 className="text-lg font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Delivery Address
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" value={address.fullName} onChange={(v) => setAddress({ ...address, fullName: v })} placeholder="As on your ID" />
                    <Field label="Mobile Number" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} placeholder="10-digit number" type="tel" half />
                    <Field label="Email Address" value={address.email} onChange={(v) => setAddress({ ...address, email: v })} placeholder="For order updates" type="email" required={false} half />
                    <Field label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} placeholder="6-digit PIN" half />
                    <Field label="Address Line 1" value={address.addressLine1} onChange={(v) => setAddress({ ...address, addressLine1: v })} placeholder="House / Flat No., Building Name" />
                    <Field label="Address Line 2" value={address.addressLine2} onChange={(v) => setAddress({ ...address, addressLine2: v })} placeholder="Locality / Area / Street" required={false} />
                    <Field label="City / Town" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} placeholder="City" half />
                    <SelectField label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} options={STATES} />
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-red-600 space-y-1">
                      {Object.entries(errors).map(([field, msg]) => (
                        <p key={field}>• {field.replace(/([A-Z])/g, " $1")}: {msg}</p>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <p className="text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide mb-3">Address Type</p>
                    <div className="flex gap-3">
                      {(["Home", "Work", "Other"] as const).map((type) => {
                        const Icon = type === "Home" ? Home : type === "Work" ? Briefcase : MapPin;
                        return (
                          <button
                            key={type}
                            onClick={() => setAddress({ ...address, type })}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-2 font-medium transition-colors ${
                              address.type === type
                                ? "bg-[#3E3A06] border-[#3E3A06] text-[#D6CBB7]"
                                : "bg-[#D6CBB7] border-[#6B6A2A]/30 text-[#1A1A1A] hover:border-[#3E3A06]"
                            }`}
                            data-testid={`address-type-${type.toLowerCase()}`}
                          >
                            <Icon size={15} />
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleAddressContinue}
                    className="mt-8 w-full py-4 bg-[#3E3A06] text-[#D6CBB7] font-bold text-sm tracking-wide hover:bg-[#6B6A2A] transition-colors flex items-center justify-center gap-2"
                    data-testid="button-continue-to-payment"
                  >
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4" data-testid="section-payment">
                  <div className="bg-[#E8E0D0] p-4 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-[#3E3A06] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          {address.fullName}
                          <span className="ml-2 text-xs bg-[#3E3A06] text-[#D6CBB7] px-1.5 py-0.5 font-bold">{address.type}</span>
                        </p>
                        <p className="text-xs text-[#6E6E6E] mt-0.5">
                          {address.addressLine1}, {address.city}, {address.state} — {address.pincode}
                        </p>
                        <p className="text-xs text-[#6E6E6E]">📞 {address.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setStep(1); setErrors({}); }}
                      className="flex items-center gap-1.5 text-xs text-[#3E3A06] font-semibold hover:text-[#6B6A2A] transition-colors"
                      data-testid="button-change-address"
                    >
                      <Edit2 size={12} /> Change
                    </button>
                  </div>

                  <div className="bg-[#E8E0D0] p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard size={20} className="text-[#3E3A06]" />
                      <h2 className="text-lg font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Select Payment Method
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => (
                        <div
                          key={method.id}
                          className={`border-2 cursor-pointer transition-all ${
                            payment === method.id ? "border-[#3E3A06] bg-[#3E3A06]/5" : "border-[#6B6A2A]/20 hover:border-[#3E3A06]/40"
                          }`}
                          onClick={() => setPayment(method.id)}
                          data-testid={`payment-method-${method.id}`}
                        >
                          <div className="flex items-start gap-4 p-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                              payment === method.id ? "border-[#3E3A06] bg-[#3E3A06]" : "border-[#6B6A2A]/40"
                            }`}>
                              {payment === method.id && <div className="w-2 h-2 rounded-full bg-[#D6CBB7]" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{method.icon}</span>
                                <span className="text-sm font-semibold text-[#1A1A1A]">{method.label}</span>
                              </div>
                              <p className="text-xs text-[#6E6E6E] mt-0.5">{method.desc}</p>

                              {payment === method.id && method.id === "upi" && (
                                <div className="mt-3">
                                  <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="yourname@upi"
                                    className="w-full max-w-xs px-3 py-2 text-sm bg-[#D6CBB7] border border-[#6B6A2A]/25 focus:outline-none focus:border-[#3E3A06] transition-colors"
                                    data-testid="input-upi-id"
                                  />
                                </div>
                              )}
                              {payment === method.id && method.id === "card" && (
                                <div className="mt-3 grid grid-cols-2 gap-2.5">
                                  <input placeholder="Card Number" className="col-span-2 px-3 py-2 text-sm bg-[#D6CBB7] border border-[#6B6A2A]/25 focus:outline-none focus:border-[#3E3A06]" />
                                  <input placeholder="MM / YY" className="px-3 py-2 text-sm bg-[#D6CBB7] border border-[#6B6A2A]/25 focus:outline-none focus:border-[#3E3A06]" />
                                  <input placeholder="CVV" className="px-3 py-2 text-sm bg-[#D6CBB7] border border-[#6B6A2A]/25 focus:outline-none focus:border-[#3E3A06]" />
                                  <input placeholder="Name on Card" className="col-span-2 px-3 py-2 text-sm bg-[#D6CBB7] border border-[#6B6A2A]/25 focus:outline-none focus:border-[#3E3A06]" />
                                </div>
                              )}
                              {payment === method.id && method.id === "cod" && (
                                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 flex items-start gap-2">
                                  <span>⚠️</span>
                                  <span>₹50 COD handling charge applies. Collected at delivery.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-[#D6CBB7] flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#6E6E6E]">Amount to pay</p>
                        <p className="text-xl font-bold text-[#3E3A06]">₹{(finalTotal + (payment === "cod" ? 50 : 0)).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6E6E6E]">
                        <Shield size={12} className="text-[#3E3A06]" />
                        <span>100% secure payment</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="mt-4 w-full py-4 bg-[#3E3A06] text-[#D6CBB7] font-bold text-sm tracking-wide hover:bg-[#6B6A2A] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                      data-testid="button-place-order"
                    >
                      {isPlacingOrder ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <Package size={16} />
                          Place Order · ₹{(finalTotal + (payment === "cod" ? 50 : 0)).toLocaleString("en-IN")}
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-[#6E6E6E] mt-3">
                      By placing your order, you agree to our{" "}
                      <button onClick={() => setLocation("/privacy")} className="underline hover:text-[#3E3A06]">Privacy Policy</button>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <OrderSummaryPanel
                items={items} subtotal={subtotal} discountAmount={discountAmount}
                shippingCost={shippingCost} finalTotal={finalTotal} currentTier={currentTier}
                collapsed={false} setCollapsed={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
