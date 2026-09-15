import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Send } from "lucide-react";
import { useState, type HTMLAttributes } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { Textarea } from "@/components/ui/textarea";
import { band, bookingContent, sections } from "@/data/band-data";
import {
  NOTES_MAX_LENGTH,
  bookingDefaultValues,
  bookingSchema,
  buildBookingMessage,
  type BookingFormInput,
  type BookingFormValues,
} from "@/lib/booking";
import { getTodayIsoDate } from "@/lib/format";
import { buildMailtoHref, formatMailAsText } from "@/lib/mailto";
import { cn } from "@/lib/utils";

type TextFieldName = Exclude<keyof BookingFormInput, "notes">;

interface TextFieldConfig {
  name: TextFieldName;
  label: string;
  type: "text" | "email" | "tel" | "date";
  autoComplete: string;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}

const TEXT_FIELDS: readonly TextFieldConfig[] = [
  {
    name: "organizerName",
    label: "Nome richiedente / organizzatore",
    type: "text",
    autoComplete: "name",
    placeholder: "Mario Rossi",
  },
  {
    name: "venueName",
    label: "Nome locale / festival",
    type: "text",
    autoComplete: "organization",
    placeholder: "Rock Club Milano",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "nome@dominio.it",
    inputMode: "email",
  },
  {
    name: "phone",
    label: "Telefono",
    type: "tel",
    autoComplete: "tel",
    placeholder: "+39 333 123 4567",
    inputMode: "tel",
  },
  { name: "eventDate", label: "Data presunta evento", type: "date", autoComplete: "off" },
  {
    name: "city",
    label: "Città",
    type: "text",
    autoComplete: "address-level2",
    placeholder: "Milano",
  },
];

const monoClassName = "font-mono text-[11px] uppercase tracking-[0.14em]";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="font-mono text-xs text-danger">
      {message}
    </p>
  );
}

export function BookingForm() {
  // Data minima selezionabile, calcolata una sola volta al mount.
  const [minEventDate] = useState(getTodayIsoDate);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: bookingDefaultValues,
    mode: "onTouched",
  });

  const notes = useWatch({ control, name: "notes" });

  const handleInvalid = () => {
    toast.error("Controlla i campi evidenziati", {
      description: "Alcune informazioni mancano o non sono nel formato corretto.",
    });
  };

  const handleSendEmail: SubmitHandler<BookingFormValues> = (values) => {
    const message = buildBookingMessage(values, band.name);
    window.location.assign(buildMailtoHref(band.contactEmail, message));
    toast.success("Apertura del client email…", {
      description: "Se non si apre nulla, usa “Copia testo richiesta” e incollalo in una nuova email.",
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

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <Reveal className="flex flex-col gap-10 lg:col-span-4">
            <ol className="border-t border-border">
              {bookingContent.steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-border py-5">
                  <span className="font-mono text-xs tabular-nums text-accent-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-extrabold uppercase leading-none font-stretch-condensed">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div>
              <p className={`${monoClassName} text-muted-foreground`}>{bookingContent.directContactLabel}</p>
              <a
                href={`mailto:${band.contactEmail}`}
                className="link-underline mt-3 inline font-display text-2xl font-bold leading-tight [overflow-wrap:anywhere] font-stretch-condensed sm:text-3xl"
              >
                {band.contactEmail}
              </a>
              <p className="mt-3 text-sm text-muted-foreground">Risposta entro {band.responseTime}.</p>
            </div>

            <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted-foreground">
              {bookingContent.note}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Richiesta disponibilità</CardTitle>
                <CardDescription>
                  I campi contrassegnati con <span className="text-accent-ink">*</span> sono obbligatori.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form
                  noValidate
                  aria-labelledby="booking-title"
                  onSubmit={handleSubmit(handleSendEmail, handleInvalid)}
                  className="grid gap-6"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    {TEXT_FIELDS.map((field) => {
                      const error = errors[field.name]?.message;
                      const errorId = `${field.name}-error`;

                      return (
                        <div key={field.name} className="grid content-start gap-2">
                          <Label htmlFor={field.name}>
                            {field.label}
                            <span aria-hidden="true" className="text-accent-ink">
                              {" "}
                              *
                            </span>
                          </Label>
                          <Input
                            id={field.name}
                            type={field.type}
                            autoComplete={field.autoComplete}
                            placeholder={field.placeholder}
                            inputMode={field.inputMode}
                            min={field.type === "date" ? minEventDate : undefined}
                            aria-required="true"
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? errorId : undefined}
                            {...register(field.name)}
                          />
                          <FieldError id={errorId} message={error} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <Label htmlFor="notes">Note aggiuntive / budget</Label>
                      <span
                        className={cn(
                          "font-mono text-[11px] tabular-nums",
                          notes.length > NOTES_MAX_LENGTH ? "text-danger" : "text-muted-foreground",
                        )}
                      >
                        {notes.length}/{NOTES_MAX_LENGTH}
                      </span>
                    </div>
                    <Textarea
                      id="notes"
                      rows={5}
                      placeholder="Tipologia di evento, orari di palco, budget indicativo, service audio/luci disponibile…"
                      aria-invalid={errors.notes ? true : undefined}
                      aria-describedby={errors.notes ? "notes-error" : undefined}
                      {...register("notes")}
                    />
                    <FieldError id="notes-error" message={errors.notes?.message} />
                  </div>

                  <div className="flex flex-col gap-6 border-t border-border pt-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
                    <p className="text-xs leading-relaxed text-muted-foreground 2xl:max-w-xs">
                      {bookingContent.privacyNote}
                    </p>
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleSubmit(handleCopy, handleInvalid)}
                      >
                        <Copy />
                        Copia testo richiesta
                      </Button>
                      <Button type="submit" variant="accent" size="lg">
                        <Send />
                        Invia via email
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
