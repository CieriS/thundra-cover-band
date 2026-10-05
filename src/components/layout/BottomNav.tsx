import { CalendarDays, Clapperboard, House, Zap, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { sectionOrder, sections, type SectionId } from "@/data/band-data";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: SectionId;
  label: string;
  icon: LucideIcon;
  /** Sezioni in cui la voce risulta attiva. */
  activeIn: readonly SectionId[];
}

const ITEMS: readonly BottomNavItem[] = [
  { href: "top", label: "Home", icon: House, activeIn: ["top"] },
  { href: "tour", label: sections.tour.navLabel, icon: CalendarDays, activeIn: ["tour", "reviews"] },
  { href: "media", label: sections.media.navLabel, icon: Clapperboard, activeIn: ["media"] },
  { href: "booking", label: sections.booking.navLabel, icon: Zap, activeIn: ["booking"] },
];

const OBSERVED_SECTIONS: readonly SectionId[] = ["top", ...sectionOrder];

const TEXT_ENTRY_SELECTOR =
  "input:not([type='checkbox'], [type='radio'], [type='button'], [type='submit']), textarea, select";

function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof Element && target.matches(TEXT_ENTRY_SELECTOR);
}

/**
 * Navigazione mobile fissa nella zona del pollice (legge di Fitts): quattro target
 * da almeno 48×48 px, Booking in rosso all'estremità destra. Si ritira mentre la
 * tastiera virtuale è aperta, così non copre i campi del form.
 */
export function BottomNav() {
  const activeSection = useActiveSection(OBSERVED_SECTIONS);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      if (isTextEntry(event.target)) setIsTyping(true);
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (!isTextEntry(event.relatedTarget)) setIsTyping(false);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <nav
      aria-label="Navigazione rapida"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background pb-(--safe-bottom) transition-transform duration-300 ease-out lg:hidden",
        isTyping && "translate-y-full",
      )}
    >
      <ul className="grid h-(--bottom-nav-height) grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection !== null && item.activeIn.includes(activeSection);
          const isBooking = item.href === "booking";

          return (
            <li key={item.href} className="flex">
              <a
                href={`#${item.href}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "relative flex min-h-12 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] outline-none",
                  "transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  isBooking ? "bg-accent text-accent-foreground" : isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-4 top-0 h-0.5 transition-transform duration-300",
                    isBooking ? "bg-accent-foreground" : "bg-accent",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
                <Icon
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={isActive || isBooking ? 2.25 : 1.75}
                  fill={isBooking ? "currentColor" : "none"}
                />
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
