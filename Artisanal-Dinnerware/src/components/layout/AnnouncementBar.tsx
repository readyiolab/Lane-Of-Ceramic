import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnnouncements } from "@/hooks/useCatalog";

export default function AnnouncementBar() {
  const { data: announcements = [] } = useAnnouncements();
  const texts = announcements.map((a) => a.text);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  if (!visible || texts.length === 0) return null;

  return (
    <div className="bg-[#3E3A06] text-[#D6CBB7] text-xs py-2.5 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrent((c) => (c - 1 + texts.length) % texts.length)}
          className="opacity-60 hover:opacity-100 transition-opacity"
          data-testid="button-announcement-prev"
        >
          <ChevronLeft size={14} />
        </button>
        <p className="tracking-wide font-medium text-center">{texts[current]}</p>
        <button
          onClick={() => setCurrent((c) => (c + 1) % texts.length)}
          className="opacity-60 hover:opacity-100 transition-opacity"
          data-testid="button-announcement-next"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        data-testid="button-close-announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
