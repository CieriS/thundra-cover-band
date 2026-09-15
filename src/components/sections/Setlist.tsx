import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import {
  eraFilters,
  sections,
  setlist,
  songTagLabels,
  type EraFilter,
  type EraId,
  type Song,
} from "@/data/band-data";
import { durationToSeconds, formatRuntime } from "@/lib/format";
import { easeOutExpo } from "@/lib/motion";

interface NumberedSong {
  song: Song;
  position: number;
}

interface AlbumGroup {
  key: string;
  album: string;
  year: number;
  songs: NumberedSong[];
  runtimeSeconds: number;
}

function matchesEra(song: Song, filter: EraFilter): boolean {
  if (!filter.range) return true;
  const { from, to } = filter.range;
  return song.year >= from && (to === null || song.year <= to);
}

/**
 * Raggruppa i brani per album (i brani arrivano già ordinati per anno) e li numera
 * nell'ordine mostrato. I brani di uno stesso album possono essere inseriti in
 * qualsiasi punto del pannello.
 */
function groupByAlbum(songs: readonly Song[]): AlbumGroup[] {
  const groups = new Map<string, AlbumGroup>();

  for (const song of songs) {
    const key = `${song.year}-${song.album.trim().toLowerCase()}`;
    const group = groups.get(key) ?? { key, album: song.album, year: song.year, songs: [], runtimeSeconds: 0 };
    const entry: NumberedSong = { song, position: 0 };

    group.songs.push(entry);
    group.runtimeSeconds += durationToSeconds(song.duration);
    groups.set(key, group);
  }

  const ordered = [...groups.values()];
  let position = 0;
  for (const group of ordered) {
    for (const entry of group.songs) entry.position = ++position;
  }

  return ordered;
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";

export function Setlist() {
  const [activeEra, setActiveEra] = useState<EraId>("ALL");

  const activeFilter = eraFilters.find((filter) => filter.id === activeEra) ?? eraFilters[0];
  const groups = groupByAlbum(setlist.filter((song) => matchesEra(song, activeFilter)));
  const songCount = groups.reduce((total, group) => total + group.songs.length, 0);
  const runtime = groups.reduce((total, group) => total + group.runtimeSeconds, 0);

  return (
    <section id="setlist" aria-labelledby="setlist-title" className="section-y bg-surface">
      <div className="container-page">
        <SectionHeader copy={sections.setlist} titleId="setlist-title" />

        <Reveal className="mt-14 flex flex-col gap-4 border-b border-foreground pb-4 md:flex-row md:items-center md:justify-between lg:mt-20">
          <div role="group" aria-label="Filtra per era" className="flex flex-wrap gap-2">
            {eraFilters.map((filter) => {
              const isActive = filter.id === activeEra;
              return (
                <Button
                  key={filter.id}
                  type="button"
                  size="sm"
                  variant={isActive ? "primary" : "outline"}
                  aria-pressed={isActive}
                  onClick={() => setActiveEra(filter.id)}
                >
                  {filter.label}
                  <span className="hidden opacity-60 sm:inline">{filter.period}</span>
                </Button>
              );
            })}
          </div>

          <p className={`${monoClassName} text-muted-foreground`} aria-live="polite">
            <span className="text-foreground">{songCount}</span> brani ·{" "}
            <span className="text-foreground">{formatRuntime(runtime)}</span> di musica
          </p>
        </Reveal>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeEra}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
          >
            {groups.map((group) => {
              const headingId = `album-${toSlug(group.key)}`;

              return (
                <article
                  key={group.key}
                  aria-labelledby={headingId}
                  className="grid gap-6 border-b border-border py-8 md:grid-cols-12 md:gap-10 md:py-12"
                >
                  <header className="md:col-span-4 lg:col-span-5">
                    <p className="font-mono text-xs tabular-nums text-accent-ink">{group.year}</p>
                    <h3
                      id={headingId}
                      className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] text-balance font-stretch-condensed sm:text-4xl lg:text-5xl"
                    >
                      {group.album}
                    </h3>
                    <p className={`${monoClassName} mt-3 text-muted-foreground`}>
                      {group.songs.length} {group.songs.length === 1 ? "brano" : "brani"} ·{" "}
                      {formatRuntime(group.runtimeSeconds)}
                    </p>
                  </header>

                  <ol className="md:col-span-8 lg:col-span-7">
                    {group.songs.map(({ song, position }) => (
                      <li
                        key={song.id}
                        className="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0"
                      >
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {String(position).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-lg font-medium leading-snug transition-colors duration-300 group-hover:text-accent-ink sm:text-xl">
                            {song.title}
                          </p>
                          {song.tags.length > 0 && (
                            <ul aria-label="Tag tecnici" className="mt-2 flex flex-wrap gap-1.5">
                              {song.tags.map((tag) => (
                                <li key={tag}>
                                  <Badge variant="tag">{songTagLabels[tag]}</Badge>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <span className="font-mono text-sm tabular-nums text-muted-foreground">
                          <span className="sr-only">Durata </span>
                          {song.duration}
                        </span>
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
