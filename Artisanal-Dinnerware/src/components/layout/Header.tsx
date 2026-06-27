import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
const LOGO_SRC = "/logo.webp";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Drinkware", path: "/drinkware" },
  { label: "Tableware", path: "/tableware" },
  { label: "Serveware", path: "/serveware" },
  { label: "Kitchenware", path: "/kitchenware" },
  { label: "About", path: "/about" },
];

export default function Header() {
  const [location] = useLocation();
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-[#D6CBB7] sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[4.25rem] md:h-[5.25rem]">
          <Link href="/" className="flex-shrink-0" data-testid="link-logo">
            <img src={LOGO_SRC} alt="Lane of Ceramic" className="h-14 md:h-[4.25rem] w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8" data-testid="nav-desktop">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium tracking-wide transition-colors relative group ${
                  location === link.path
                    ? "text-[#3E3A06]"
                    : "text-[#6E6E6E] hover:text-[#3E3A06]"
                }`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#3E3A06] transition-all duration-200 ${
                    location === link.path ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#3E3A06] hover:text-[#6B6A2A] transition-colors p-1"
              data-testid="button-search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={openCart}
              className="relative text-[#3E3A06] hover:text-[#6B6A2A] transition-colors p-1"
              data-testid="button-cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#3E3A06] text-[#D6CBB7] text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium leading-none" data-testid="text-cart-count">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-[#3E3A06] hover:text-[#6B6A2A] transition-colors p-1"
              data-testid="button-mobile-menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-4 px-1" data-testid="search-bar">
            <input
              autoFocus
              type="search"
              placeholder="Search ceramics..."
              className="w-full border border-[#6B6A2A]/40 bg-[#E8E0D0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#6E6E6E] outline-none focus:border-[#3E3A06] transition-colors"
              data-testid="input-search"
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#D6CBB7] md:hidden flex flex-col"
            data-testid="nav-mobile-fullscreen"
          >
            <div className="flex items-center justify-between p-4 sm:px-6 h-[4.25rem] border-b border-[#6B6A2A]/20">
              <span className="text-xl font-medium tracking-wide text-[#3E3A06]">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[#3E3A06] hover:text-[#6B6A2A] transition-colors p-1"
              >
                <X size={28} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-2xl font-light tracking-wide transition-colors ${
                    location === link.path ? "text-[#3E3A06] font-medium" : "text-[#6E6E6E] hover:text-[#3E3A06]"
                  }`}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="p-6 border-t border-[#6B6A2A]/20">
               <div className="text-sm text-[#6E6E6E]">
                 &copy; {new Date().getFullYear()} Lane of Ceramic
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
