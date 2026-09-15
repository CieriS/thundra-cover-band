import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { band, navigationOrder, sections, type SectionId } from "@/data/band-data";
import { useActiveSection } from "@/hooks/use-active-section";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

const OBSERVED_SECTIONS: readonly SectionId[] = ["top", ...navigationOrder];
const DESKTOP_QUERY = "(min-width: 64rem)";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeSection = useActiveSection(OBSERVED_SECTIONS);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 24));

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    const handleBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleBreakpoint);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleBreakpoint);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500",
          isScrolled || isMenuOpen
            ? "border-border bg-background/85 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Navigazione principale"
          className="container-page flex h-16 items-center justify-between gap-6 sm:h-18"
        >
          <a
            href="#top"
            onClick={closeMenu}
            className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-8 place-items-center bg-foreground text-background transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
              <Zap className="size-4" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            </span>
            <span className="font-display text-2xl font-black uppercase leading-none tracking-tight font-stretch-condensed">
              {band.name}
            </span>
          </a>

          <ul className="hidden items-center gap-8 lg:flex">
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

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
              <a href="#booking">{sections.booking.navLabel}</a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col overflow-y-auto bg-background sm:top-18 lg:hidden"
          >
            <ul className="container-page flex flex-1 flex-col justify-center py-10">
              {navigationOrder.map((id, index) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.6, ease: easeOutExpo }}
                >
                  <a
                    href={`#${id}`}
                    onClick={closeMenu}
                    className="group flex items-baseline gap-4 border-b border-border py-4 outline-none focus-visible:text-accent-ink"
                  >
                    <span className="font-mono text-xs text-accent-ink">{sections[id].index}</span>
                    <span className="font-display text-5xl font-extrabold uppercase leading-none font-stretch-condensed transition-colors group-hover:text-accent-ink">
                      {sections[id].navLabel}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="container-page flex flex-col gap-4 border-t border-border py-6">
              <a
                href={`mailto:${band.contactEmail}`}
                className="link-underline self-start font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground"
              >
                {band.contactEmail}
              </a>
              <Button asChild variant="accent" size="lg" className="sm:hidden">
                <a href="#booking" onClick={closeMenu}>
                  {sections.booking.eyebrow}
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
