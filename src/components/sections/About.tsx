import { Reveal } from "@/components/ui/reveal";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SectionHeader } from "@/components/ui/section-header";
import { band, media, sections } from "@/data/band-data";

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.16em]";

export function About() {
  const [lead, ...paragraphs] = band.manifesto;
  const { liveStage } = media;

  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <div className="container-page">
        <SectionHeader copy={sections.about} titleId="about-title" />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-12 lg:items-end lg:gap-10">
          <Reveal className="lg:col-span-7">
            <figure>
              <div className="group relative aspect-video overflow-hidden border border-border bg-surface">
                <ResponsiveImage
                  image={liveStage}
                  sizes="(min-width: 64rem) 58vw, 100vw"
                  className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <figcaption className={`${monoClassName} mt-3 flex justify-between gap-4 text-muted-foreground`}>
                {liveStage.caption && <span>{liveStage.caption}</span>}
                <span>
                  {band.baseCity}, {band.countryCode}
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal className="lg:col-span-4 lg:col-start-9">
            <p className="text-xl leading-snug text-balance sm:text-2xl">{lead}</p>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground text-pretty">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-16 lg:mt-28">
          <Reveal className="flex items-end justify-between gap-4 border-b border-border pb-4">
            <h3 className="font-display text-3xl uppercase leading-none sm:text-4xl">Line-up</h3>
            <p className={`${monoClassName} text-muted-foreground`}>{band.members.length} musicisti</p>
          </Reveal>

          <Reveal className="mt-6">
            <ul
              aria-label="Musicisti"
              tabIndex={0}
              className="scroll-row outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:px-0"
            >
              {band.members.map((member, index) => (
                <li key={member.name} className="group w-[42%] sm:w-[30%] lg:w-auto">
                  <div className="relative aspect-[4/5] overflow-hidden border border-border bg-surface">
                    <ResponsiveImage
                      image={member.image}
                      sizes="(min-width: 64rem) 18vw, (min-width: 40rem) 30vw, 42vw"
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <span className="absolute top-3 left-3 font-mono text-[11px] tabular-nums text-white/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-3 font-display text-2xl uppercase leading-none text-balance">{member.name}</p>
                  <p className={`${monoClassName} mt-1.5 text-muted-foreground`}>{member.role}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
