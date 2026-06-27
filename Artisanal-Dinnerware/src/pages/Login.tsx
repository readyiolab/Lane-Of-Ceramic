import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Phone, ArrowRight } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(fullName, email, password, phone);
      }
      
      // Parse query params to find redirect URL
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/";
      setLocation(redirect);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-[#D6CBB7] px-4 py-12">
      <div className="w-full max-w-md bg-[#E8E0D0] p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-[#3E3A06] text-center mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-center text-[#6E6E6E] text-sm mb-8">
          {isLogin ? "Enter your credentials to access your account." : "Join us to manage your orders and track shipments."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E6E]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-[#D6CBB7] border border-[#6B6A2A]/25 text-[#1A1A1A] text-sm focus:outline-none focus:border-[#3E3A06] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E6E]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-[#D6CBB7] border border-[#6B6A2A]/25 text-[#1A1A1A] text-sm focus:outline-none focus:border-[#3E3A06] transition-colors"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E6E]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-[#D6CBB7] border border-[#6B6A2A]/25 text-[#1A1A1A] text-sm focus:outline-none focus:border-[#3E3A06] transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wide mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E6E]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-[#D6CBB7] border border-[#6B6A2A]/25 text-[#1A1A1A] text-sm focus:outline-none focus:border-[#3E3A06] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 bg-[#3E3A06] text-[#D6CBB7] font-bold text-sm tracking-wide hover:bg-[#6B6A2A] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-[#3E3A06] hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}
