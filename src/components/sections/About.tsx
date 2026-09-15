import { Reveal, StaggerItem, StaggerList } from "@/components/ui/reveal";
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

        <div className="mt-14 grid grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-12 lg:items-end lg:gap-10">
          <Reveal className="lg:col-span-7">
            <figure>
              <div className="group relative aspect-video overflow-hidden border border-border bg-surface">
                <img
                  src={liveStage.src}
                  alt={liveStage.alt}
                  width={liveStage.width}
                  height={liveStage.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <figcaption className={`${monoClassName} mt-3 flex justify-between gap-4 text-muted-foreground`}>
                <span>{liveStage.caption}</span>
                <span>
                  {band.baseCity}, {band.countryCode}
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <p className="text-xl leading-snug text-balance sm:text-2xl">{lead}</p>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground text-pretty">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-20 lg:mt-28">
          <Reveal className="flex items-end justify-between gap-4 border-b border-border pb-4">
            <h3 className="font-display text-3xl font-extrabold uppercase leading-none font-stretch-condensed sm:text-4xl">
              Line-up
            </h3>
            <p className={`${monoClassName} text-muted-foreground`}>{band.members.length} musicisti</p>
          </Reveal>

          <StaggerList className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
            {band.members.map((member, index) => (
              <StaggerItem key={member.name} className="group">
                <div className="relative aspect-[4/5] overflow-hidden border border-border bg-surface">
                  <img
                    src={member.image.src}
                    alt={member.image.alt}
                    width={member.image.width}
                    height={member.image.height}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover grayscale-[40%] transition duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                  />
                  <span className="absolute top-3 left-3 font-mono text-[11px] tabular-nums text-white/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 font-display text-2xl font-extrabold uppercase leading-none text-balance font-stretch-condensed">
                  {member.name}
                </p>
                <p className={`${monoClassName} mt-1.5 text-muted-foreground`}>{member.role}</p>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>

        <StaggerList className="mt-20 grid grid-cols-2 border-t border-l border-border lg:mt-28 lg:grid-cols-4">
          {band.stats.map((stat) => (
            <StaggerItem
              key={stat.label}
              className="group flex flex-col border-r border-b border-border p-4 transition-colors duration-500 hover:bg-surface sm:p-8"
            >
              <span className="font-display text-[clamp(3rem,10vw,6.5rem)] font-black leading-[0.85] tracking-tight font-stretch-condensed transition-colors duration-300 group-hover:text-accent-ink">
                {stat.value}
              </span>
              <span className={`${monoClassName} mt-4`}>{stat.label}</span>
              <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.description}</span>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
