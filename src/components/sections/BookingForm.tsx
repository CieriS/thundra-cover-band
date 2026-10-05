import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Send } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { band, bookingContent, sections } from "@/data/band-data";
import { useToday } from "@/hooks/use-today";
import {
  bookingDefaultValues,
  bookingSchema,
  buildBookingMessage,
  type BookingFormInput,
  type BookingFormValues,
} from "@/lib/booking";
import { buildMailtoHref, formatMailAsText } from "@/lib/mailto";

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-danger">
      {message}
    </p>
  );
}

export function BookingForm() {
  // Data minima selezionabile: coincide tra prerender e idratazione (vedi useToday).
  const minEventDate = useToday();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: bookingDefaultValues,
    mode: "onTouched",
  });

  const errorProps = (name: keyof BookingFormInput) => {
    const hasError = Boolean(errors[name]);
    return {
      "aria-invalid": hasError || undefined,
      "aria-describedby": hasError ? `${name}-error` : undefined,
    };
  };

  const handleInvalid = () => {
    toast.error("Controlla i campi evidenziati", {
      description: "Alcune informazioni mancano o non sono nel formato corretto.",
    });
  };

  const handleSendEmail: SubmitHandler<BookingFormValues> = (values) => {
    const message = buildBookingMessage(values, band.name);
    window.location.assign(buildMailtoHref(band.contactEmail, message));
    toast.success("Apertura del client email…", {
      description: "Se non si apre nulla, usa “Copia testo” e incollalo in una nuova email.",
    });
  };

  const handleCopy: SubmitHandler<BookingFormValues> = async (values) => {
    const message = buildBookingMessage(values, band.name);

    try {
      await navigator.clipboard.writeText(formatMailAsText(message));
      toast.success("Richiesta copiata negli appunti", {
        description: `Incollala in una email indirizzata a ${band.contactEmail}.`,
      });
    } catch {
      toast.error("Impossibile copiare negli appunti", {
        description: "Il browser ha bloccato l'accesso. Usa il pulsante di invio email.",
      });
    }
  };

  return (
    <section id="booking" aria-labelledby="booking-title" className="section-y">
      <div className="container-page">
        <SectionHeader copy={sections.booking} titleId="booking-title" />

        <div className="mt-8 grid gap-10 lg:mt-20 lg:grid-cols-12">
          {/* Su mobile il form viene subito dopo il titolo; su desktop sta a destra. */}
          <Reveal className="lg:col-span-8 lg:col-start-5 lg:row-start-1">
            <form
              noValidate
              aria-labelledby="booking-title"
              onSubmit={handleSubmit(handleSendEmail, handleInvalid)}
              className="grid gap-5 border border-border bg-surface p-4 sm:gap-6 sm:p-8"
            >
              <div className="grid gap-2">
                <Label htmlFor="booking-name">Nome</Label>
                <Input
                  id="booking-name"
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  placeholder="Mario Rossi"
                  aria-required="true"
                  {...errorProps("name")}
                  {...register("name")}
                />
                <FieldError id="name-error" message={errors.name?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="booking-email">Email</Label>
                <Input
                  id="booking-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  placeholder="nome@locale.it"
                  aria-required="true"
                  {...errorProps("email")}
                  {...register("email")}
                />
                <FieldError id="email-error" message={errors.email?.message} />
              </div>

              <fieldset className="grid gap-2">
                <legend className={`${monoClassName} mb-2 text-muted-foreground`}>Quando e dove</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid min-w-0 gap-1.5">
                    <Label htmlFor="booking-date">Data</Label>
                    <Input
                      id="booking-date"
                      type="date"
                      min={minEventDate}
                      autoComplete="off"
                      enterKeyHint="next"
                      aria-required="true"
                      {...errorProps("eventDate")}
                      {...register("eventDate")}
                    />
                  </div>
                  <div className="grid min-w-0 gap-1.5">
                    <Label htmlFor="booking-city">Città</Label>
                    <Input
                      id="booking-city"
                      type="text"
                      autoComplete="address-level2"
                      autoCapitalize="words"
                      enterKeyHint="send"
                      placeholder="Bergamo"
                      aria-required="true"
                      {...errorProps("city")}
                      {...register("city")}
                    />
                  </div>
                </div>
                <FieldError id="eventDate-error" message={errors.eventDate?.message} />
                <FieldError id="city-error" message={errors.city?.message} />
              </fieldset>

              <div className="grid gap-2 pt-1 sm:grid-cols-[1fr_auto] sm:items-center">
                <Button type="submit" variant="accent" size="lg" className="w-full">
                  <Send aria-hidden="true" />
                  Invia richiesta
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className="w-full text-muted-foreground sm:w-auto"
                  onClick={handleSubmit(handleCopy, handleInvalid)}
                >
                  <Copy aria-hidden="true" />
                  Copia testo
                </Button>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {bookingContent.privacyNote} Risposta entro {band.responseTime}.
              </p>
            </form>

            <noscript>
              <p className="mt-4 text-sm text-muted-foreground">
                Il modulo richiede JavaScript: scrivici a{" "}
                <a href={`mailto:${band.contactEmail}`} className="underline">
                  {band.contactEmail}
                </a>
                .
              </p>
            </noscript>
          </Reveal>

          <Reveal className="flex flex-col gap-8 lg:col-span-4 lg:col-start-1 lg:row-start-1">
            <ol className="hidden border-t border-border lg:block">
              {bookingContent.steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-border py-5">
                  <span className="font-mono text-xs tabular-nums text-accent-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl uppercase leading-none">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div>
              <p className={`${monoClassName} text-muted-foreground`}>{bookingContent.directContactLabel}</p>
              <a
                href={`mailto:${band.contactEmail}`}
                className="mt-2 inline-flex min-h-12 items-center font-display text-3xl leading-tight underline decoration-accent decoration-2 underline-offset-[6px] [overflow-wrap:anywhere] sm:text-4xl"
              >
                {band.contactEmail}
              </a>
            </div>

            <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted-foreground">
              {bookingContent.note}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
