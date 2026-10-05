import { useMotionValueEvent, useScroll } from "framer-motion";
import { Zap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { band, hero, navigationOrder, sections, type SectionId } from "@/data/band-data";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";

const OBSERVED_SECTIONS: readonly SectionId[] = ["top", ...navigationOrder];

/** Top bar solo desktop: su mobile la navigazione è la `BottomNav`, a portata di pollice. */
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const activeSection = useActiveSection(OBSERVED_SECTIONS);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 24));

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden lg:block">
      {/* Sfondo in dissolvenza via opacity: nessun repaint né backdrop-blur. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 border-b border-border bg-background/95 transition-opacity duration-500",
          isScrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <nav
        aria-label="Navigazione principale"
        className="container-page relative flex h-18 items-center justify-between gap-6"
      >
        <a
          href="#top"
          className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid size-8 place-items-center bg-accent text-accent-foreground">
            <Zap className="size-4" fill="currentColor" strokeWidth={0} aria-hidden="true" />
          </span>
          <span className="font-display text-2xl uppercase leading-none">{band.name}</span>
        </a>

        <ul className="flex items-center gap-8">
          {navigationOrder.map((id) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "link-underline py-1 font-mono text-[11px] uppercase tracking-[0.16em] outline-none",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="mr-1.5 text-accent-ink">{sections[id].index}</span>
                  {sections[id].navLabel}
                </a>
              </li>
            );
          })}
        </ul>

        <Button asChild variant="accent" size="sm">
          <a href="#booking">{hero.bookingCta}</a>
        </Button>
      </nav>
    </header>
  );
}
