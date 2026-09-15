import {
  Guitar,
  Lightbulb,
  ListOrdered,
  Mail,
  Plug,
  Ruler,
  SlidersHorizontal,
  Speaker,
  type LucideIcon,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { band, sections, techRider, type RiderSectionIcon } from "@/data/band-data";
import { formatShortDate } from "@/lib/format";
import { buildMailtoHref } from "@/lib/mailto";

const RIDER_ICONS: Record<RiderSectionIcon, LucideIcon> = {
  stage: Ruler,
  power: Plug,
  backline: Guitar,
  foh: SlidersHorizontal,
  monitor: Speaker,
  lights: Lightbulb,
};

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";

const riderRequestHref = buildMailtoHref(band.contactEmail, {
  subject: techRider.requestSubject,
  body: "Buongiorno,\n\nvorrei ricevere il tech rider completo (stage plot, input list e piano luci).\n\nGrazie,",
});

export function TechRider() {
  const [firstSection] = techRider.sections;

  return (
    <section id="rider" aria-labelledby="rider-title" className="section-y">
      <div className="container-page">
        <SectionHeader copy={sections.rider} titleId="rider-title" />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-4">
            <dl className="grid grid-cols-2 gap-px border border-border bg-border">
              {techRider.summary.map((item) => (
                <div key={item.label} className="flex flex-col-reverse gap-3 bg-background p-4 sm:p-6">
                  <dt className={`${monoClassName} text-muted-foreground`}>{item.label}</dt>
                  <dd className="font-display text-4xl font-black leading-none font-stretch-condensed sm:text-5xl">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-8 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {techRider.notes.map((note) => (
                <li key={note} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-accent" />
                  {note}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4">
              <Button asChild variant="outline" size="lg" className="self-start">
                <a href={riderRequestHref}>
                  <Mail />
                  {techRider.requestLabel}
                </a>
              </Button>
              <p className={`${monoClassName} text-muted-foreground`}>
                Rider {techRider.version} · Aggiornato al{" "}
                <time dateTime={techRider.updatedAt}>{formatShortDate(techRider.updatedAt)}</time>
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-8">
            <Accordion
              type="multiple"
              defaultValue={firstSection ? [firstSection.id] : []}
              className="border-t border-foreground"
            >
              {techRider.sections.map((section) => {
                const Icon = RIDER_ICONS[section.icon];

                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger>
                      <span className="flex items-center gap-4">
                        <Icon className="size-5 shrink-0 text-accent-ink" aria-hidden="true" />
                        {section.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <dl className="border-t border-border">
                        {section.items.map((item) => (
                          <div
                            key={item.label}
                            className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
                          >
                            <dt className={`${monoClassName} pt-0.5 text-muted-foreground`}>{item.label}</dt>
                            <dd className="text-base leading-relaxed">{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}

              <AccordionItem value="input-list">
                <AccordionTrigger>
                  <span className="flex items-center gap-4">
                    <ListOrdered className="size-5 shrink-0 text-accent-ink" aria-hidden="true" />
                    Input list
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto border border-border">
                    <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                      <caption className="sr-only">
                        Input list: {techRider.inputList.length} canali
                      </caption>
                      <thead className="bg-surface">
                        <tr className={`${monoClassName} text-muted-foreground`}>
                          <th scope="col" className="w-14 px-4 py-3 font-normal">Ch</th>
                          <th scope="col" className="px-4 py-3 font-normal">Sorgente</th>
                          <th scope="col" className="px-4 py-3 font-normal">Microfono / DI</th>
                          <th scope="col" className="px-4 py-3 font-normal">Asta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {techRider.inputList.map((input) => (
                          <tr
                            key={input.channel}
                            className="border-t border-border transition-colors hover:bg-surface"
                          >
                            <td className="px-4 py-2.5 font-mono tabular-nums text-accent-ink">
                              {String(input.channel).padStart(2, "0")}
                            </td>
                            <th scope="row" className="px-4 py-2.5 font-medium">
                              {input.source}
                            </th>
                            <td className="px-4 py-2.5 text-muted-foreground">{input.microphone}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{input.stand}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
