import { useState, useEffect } from "react";
import { Cookie, X, ChevronDown, ChevronUp, Shield, BarChart2, Megaphone } from "lucide-react";

type ConsentChoice = "accepted" | "declined" | "limited";

interface CookiePrefs {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_LIMITED: CookiePrefs = { necessary: true, analytics: false, marketing: false };
const DEFAULT_ALL: CookiePrefs = { necessary: true, analytics: true, marketing: true };

const STORAGE_KEY = "loc_cookie_consent";

function loadConsent(): ConsentChoice | null {
  try {
    return localStorage.getItem(STORAGE_KEY) as ConsentChoice | null;
  } catch {
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {}
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(DEFAULT_LIMITED);

  useEffect(() => {
    const existing = loadConsent();
    if (!existing) {
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  function handleAcceptAll() {
    saveConsent("accepted");
    setVisible(false);
  }

  function handleDecline() {
    saveConsent("declined");
    setVisible(false);
  }

  function handleSaveLimited() {
    saveConsent("limited");
    setVisible(false);
  }

  function toggle(key: keyof CookiePrefs) {
    if (key === "necessary") return;
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom-4 duration-500"
      role="dialog"
      aria-label="Cookie preferences"
    >
      <div className="max-w-4xl mx-auto m-4 bg-[#2A2700] border border-[#D6CBB7]/20 shadow-2xl">
        {/* top bar */}
        <div className="flex items-start justify-between gap-4 p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#D6CBB7]/10 border border-[#D6CBB7]/20">
              <Cookie size={17} className="text-[#D6CBB7]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#D6CBB7]">We use cookies</p>
              <p className="text-[11px] text-[#D6CBB7]/50 mt-0.5 leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalised content, and analyse
                traffic. Choose what you're comfortable with below.
              </p>
            </div>
          </div>
          <button
            onClick={handleDecline}
            aria-label="Close and decline"
            className="flex-shrink-0 text-[#D6CBB7]/40 hover:text-[#D6CBB7] transition-colors mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* manage panel */}
        {showManage && (
          <div className="px-5 pb-4 space-y-2 border-t border-[#D6CBB7]/10 pt-4">
            {[
              {
                key: "necessary" as const,
                Icon: Shield,
                label: "Necessary",
                desc: "Essential for the site to work — cart, checkout, session. Cannot be disabled.",
                locked: true,
              },
              {
                key: "analytics" as const,
                Icon: BarChart2,
                label: "Analytics",
                desc: "Helps us understand how visitors navigate the site so we can improve it.",
                locked: false,
              },
              {
                key: "marketing" as const,
                Icon: Megaphone,
                label: "Marketing",
                desc: "Used to show you relevant ads and track campaign performance.",
                locked: false,
              },
            ].map(({ key, Icon, label, desc, locked }) => (
              <div
                key={key}
                className="flex items-start justify-between gap-4 py-2.5 border-b border-[#D6CBB7]/8 last:border-0"
              >
                <div className="flex items-start gap-2.5">
                  <Icon size={14} className="text-[#6B6A2A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#D6CBB7]/80">{label}</p>
                    <p className="text-[11px] text-[#D6CBB7]/40 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(key)}
                  disabled={locked}
                  aria-label={`Toggle ${label}`}
                  className={`flex-shrink-0 w-10 h-5 rounded-full relative transition-colors duration-200 ${
                    prefs[key] ? "bg-[#6B6A2A]" : "bg-[#D6CBB7]/15"
                  } ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#D6CBB7] shadow transition-transform duration-200 ${
                      prefs[key] ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* action row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-5 pb-5 pt-1">
          <button
            onClick={() => {
              setShowManage((s) => !s);
              if (!showManage) setPrefs(DEFAULT_LIMITED);
            }}
            className="flex items-center justify-center gap-1.5 text-xs text-[#D6CBB7]/55 hover:text-[#D6CBB7] transition-colors py-2 px-3 border border-[#D6CBB7]/15 hover:border-[#D6CBB7]/35"
          >
            {showManage ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showManage ? "Hide options" : "Manage preferences"}
          </button>

          <div className="flex-1" />

          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold text-[#D6CBB7]/65 border border-[#D6CBB7]/20 hover:text-[#D6CBB7] hover:border-[#D6CBB7]/40 transition-all"
            >
              Decline all
            </button>

            {showManage ? (
              <button
                onClick={handleSaveLimited}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-[#6B6A2A] text-[#D6CBB7] hover:bg-[#6B6A2A]/80 transition-colors"
              >
                Save my choices
              </button>
            ) : (
              <button
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-[#D6CBB7] text-[#3E3A06] hover:bg-[#D6CBB7]/90 transition-colors"
              >
                Accept all
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
