import { Reveal } from "@/components/ui/reveal";
import type { SectionCopy } from "@/data/band-data";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  copy: SectionCopy;
  titleId: string;
  className?: string;
}

export function SectionHeader({ copy, titleId, className }: SectionHeaderProps) {
  return (
    <Reveal
      className={cn("grid gap-6 border-t border-border pt-6 md:grid-cols-12 md:gap-10", className)}
    >
      <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground md:col-span-3">
        <span className="tabular-nums text-accent-ink">{copy.index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-border" />
        <span>{copy.eyebrow}</span>
      </p>

      <div className="md:col-span-9 xl:col-span-8">
        <h2
          id={titleId}
          className="font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em] text-balance font-stretch-condensed"
        >
          {copy.title}
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
          {copy.description}
        </p>
      </div>
    </Reveal>
  );
}
