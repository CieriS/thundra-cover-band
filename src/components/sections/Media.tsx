import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiteYouTube } from "@/components/ui/lite-youtube";
import { Reveal } from "@/components/ui/reveal";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SectionHeader } from "@/components/ui/section-header";
import { SocialIcon } from "@/components/ui/social-icon";
import { band, mediaContent, sections } from "@/data/band-data";
import { cn } from "@/lib/utils";

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";
const rowClassName =
  "scroll-row outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:mx-0 lg:grid lg:gap-6 lg:overflow-visible lg:px-0";

export function Media() {
  const { videos, photos } = mediaContent;

  return (
    <section id="media" aria-labelledby="media-title" className="section-y">
      <div className="container-page">
        <SectionHeader copy={sections.media} titleId="media-title" />

        {videos.length > 0 && (
          <Reveal className="mt-10 lg:mt-20">
            <div role="region" aria-label="Video live" tabIndex={0} className={cn(rowClassName, "lg:grid-cols-2")}>
              {videos.map((video) => (
                <LiteYouTube key={video.id} video={video} className="w-[88%] sm:w-[70%] lg:w-auto" />
              ))}
            </div>
          </Reveal>
        )}

        {photos.length > 0 && (
          <Reveal className={videos.length > 0 ? "mt-6 lg:mt-10" : "mt-10 lg:mt-20"}>
            <div role="region" aria-label="Foto dal palco" tabIndex={0} className={cn(rowClassName, "lg:grid-cols-3")}>
              {photos.map((photo) => (
                <figure key={photo.src} className="w-[78%] sm:w-[48%] lg:w-auto">
                  <div className="aspect-[4/5] overflow-hidden border border-border bg-surface lg:aspect-video">
                    <ResponsiveImage
                      image={photo}
                      sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 48vw, 78vw"
                      className="size-full object-cover"
                    />
                  </div>
                  {photo.caption && (
                    <figcaption className={`${monoClassName} mt-3 text-muted-foreground`}>{photo.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal className="mt-10">
          <ul aria-label="Segui la band" className="grid gap-3 sm:grid-cols-3">
            {band.socials.map((social) => (
              <li key={social.platform}>
                <Button asChild variant="outline" size="md" className="w-full justify-between">
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    <span className="flex items-center gap-3">
                      <SocialIcon platform={social.platform} className="size-5" />
                      {social.label}
                    </span>
                    <ArrowUpRight aria-hidden="true" />
                    <span className="sr-only">(si apre in una nuova scheda)</span>
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
