import { Star } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { band, reviews, sections } from "@/data/band-data";

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";
const MAX_RATING = 5;

function Rating({ value }: { value: number }) {
  return (
    <p role="img" aria-label={`Valutazione: ${value} su ${MAX_RATING}`} className="flex gap-1 text-accent-ink">
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className="size-4"
          fill={index < value ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </p>
  );
}

/** Prove sociali: numeri chiave e recensioni di locali e organizzatori in un carosello a scorrimento. */
export function Reviews() {
  if (reviews.length === 0 && band.stats.length === 0) return null;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="section-y bg-surface">
      <div className="container-page">
        <SectionHeader copy={sections.reviews} titleId="reviews-title" />

        {band.stats.length > 0 && (
          <Reveal className="mt-10 lg:mt-20">
            <dl className="grid grid-cols-2 border-t border-l border-border lg:grid-cols-4">
              {band.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col-reverse justify-end gap-2 border-r border-b border-border p-4 sm:p-6"
                >
                  <dt>
                    <span className={`${monoClassName} block`}>{stat.label}</span>
                    <span className="mt-1.5 hidden text-sm leading-relaxed text-muted-foreground sm:block">
                      {stat.description}
                    </span>
                  </dt>
                  <dd className="font-display text-[clamp(2.75rem,13vw,6rem)] leading-[0.9]">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {reviews.length > 0 && (
          <Reveal className="mt-8 lg:mt-12">
            <div
              role="region"
              aria-label="Recensioni di locali e organizzatori"
              tabIndex={0}
              className="scroll-row pb-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0"
            >
              {reviews.map((review) => (
                <figure
                  key={review.id}
                  className="flex w-[85%] max-w-sm flex-col border border-border bg-background p-5 sm:w-[60%] sm:p-6 lg:w-auto lg:max-w-none"
                >
                  {review.rating !== null && <Rating value={review.rating} />}
                  <blockquote className="mt-4 flex-1 text-lg leading-snug text-pretty">
                    <p>“{review.quote}”</p>
                  </blockquote>
                  <figcaption className="mt-6 border-t border-border pt-4">
                    <span className="block font-display text-xl uppercase leading-none">{review.venue}</span>
                    <span className={`${monoClassName} mt-1.5 block text-muted-foreground`}>
                      {review.author} · {review.city}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            {reviews.length > 1 && (
              <p aria-hidden="true" className={`${monoClassName} mt-3 text-muted-foreground lg:hidden`}>
                Scorri →
              </p>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
