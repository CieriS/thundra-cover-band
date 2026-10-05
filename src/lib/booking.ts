import { z } from "zod";

import { formatLongDate, getTodayIsoDate, isValidIsoDate } from "@/lib/format";
import type { MailMessage } from "@/lib/mailto";

/** Solo tre informazioni essenziali: locale, budget e orari si concordano via email. */
export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome").max(80, "Massimo 80 caratteri"),
  email: z
    .string()
    .trim()
    .min(1, "Inserisci la tua email")
    .pipe(z.email("Controlla l'indirizzo email")),
  eventDate: z
    .string()
    .min(1, "Scegli una data")
    .refine(isValidIsoDate, { error: "Data non valida", abort: true })
    .refine((value) => value >= getTodayIsoDate(), "La data è già passata"),
  city: z.string().trim().min(2, "Inserisci la città").max(80, "Massimo 80 caratteri"),
});

export type BookingFormInput = z.input<typeof bookingSchema>;
export type BookingFormValues = z.output<typeof bookingSchema>;

export const bookingDefaultValues: BookingFormInput = {
  name: "",
  email: "",
  eventDate: "",
  city: "",
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Genera oggetto e corpo della richiesta di disponibilità. Le righe lasciate vuote
 * (locale, budget) si completano direttamente nel client email, senza allungare il form.
 */
export function buildBookingMessage(values: BookingFormValues, bandName: string): MailMessage {
  const eventDate = capitalize(formatLongDate(values.eventDate));

  const subject = `Richiesta disponibilità ${bandName} — ${values.city}, ${eventDate}`;

  const body = [
    `Gentile staff ${bandName},`,
    "",
    `vorrei verificare la disponibilità della band per un evento a ${values.city}.`,
    "",
    "DETTAGLI EVENTO",
    `• Data: ${eventDate}`,
    `• Città: ${values.city}`,
    "• Locale / festival: ",
    "• Budget indicativo: ",
    "",
    "REFERENTE",
    `• Nome: ${values.name}`,
    `• Email: ${values.email}`,
    "",
    "Resto in attesa di un vostro riscontro.",
    "",
    "Cordiali saluti,",
    values.name,
  ].join("\n");

  return { subject, body };
}
