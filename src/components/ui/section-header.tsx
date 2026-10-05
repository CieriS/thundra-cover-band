import type { SectionCopy } from "@/data/band-data";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  copy: SectionCopy;
  titleId: string;
  className?: string;
}

export function SectionHeader({ copy, titleId, className }: SectionHeaderProps) {
  return (
    <div
      className={cn("reveal grid gap-4 border-t border-border pt-5 md:grid-cols-12 md:gap-10 md:pt-6", className)}
    >
      <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground md:col-span-3">
        <span className="tabular-nums text-accent-ink">{copy.index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-border" />
        <span>{copy.eyebrow}</span>
      </p>

      <div className="md:col-span-9 xl:col-span-8">
        <h2
          id={titleId}
          className="font-display text-[clamp(2.75rem,12vw,6.5rem)] uppercase leading-[0.92] text-balance"
        >
          {copy.title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:mt-6 sm:text-lg">
          {copy.description}
        </p>
      </div>
    </div>
  );
}
