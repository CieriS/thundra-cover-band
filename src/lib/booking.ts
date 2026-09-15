import { z } from "zod";

import { formatLongDate, getTodayIsoDate, isValidIsoDate } from "@/lib/format";
import type { MailMessage } from "@/lib/mailto";

export const NOTES_MAX_LENGTH = 1000;

const PHONE_PATTERN = /^\+?[\d\s().-]+$/;

export const bookingSchema = z.object({
  organizerName: z
    .string()
    .trim()
    .min(2, "Inserisci nome e cognome del referente")
    .max(80, "Massimo 80 caratteri"),
  venueName: z
    .string()
    .trim()
    .min(2, "Inserisci il nome del locale o del festival")
    .max(120, "Massimo 120 caratteri"),
  email: z
    .string()
    .trim()
    .min(1, "L'indirizzo email è obbligatorio")
    .pipe(z.email("Formato email non valido")),
  phone: z
    .string()
    .trim()
    .min(1, "Il numero di telefono è obbligatorio")
    .regex(PHONE_PATTERN, "Usa solo cifre, spazi e prefisso (es. +39 333 123 4567)")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 6 && digits <= 15;
    }, "Il numero deve contenere tra 6 e 15 cifre"),
  eventDate: z
    .string()
    .min(1, "Seleziona la data presunta dell'evento")
    .refine(isValidIsoDate, { error: "Data non valida", abort: true })
    .refine((value) => value >= getTodayIsoDate(), "La data non può essere nel passato"),
  city: z
    .string()
    .trim()
    .min(2, "Inserisci la città dell'evento")
    .max(80, "Massimo 80 caratteri"),
  notes: z.string().trim().max(NOTES_MAX_LENGTH, `Massimo ${NOTES_MAX_LENGTH} caratteri`),
});

export type BookingFormInput = z.input<typeof bookingSchema>;
export type BookingFormValues = z.output<typeof bookingSchema>;

export const bookingDefaultValues: BookingFormInput = {
  organizerName: "",
  venueName: "",
  email: "",
  phone: "",
  eventDate: "",
  city: "",
  notes: "",
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Genera oggetto e corpo formali della richiesta di disponibilità. */
export function buildBookingMessage(values: BookingFormValues, bandName: string): MailMessage {
  const eventDate = capitalize(formatLongDate(values.eventDate));

  const subject = `Richiesta disponibilità ${bandName} — ${values.venueName}, ${values.city} (${eventDate})`;

  const body = [
    `Gentile staff ${bandName},`,
    "",
    `con la presente desidero verificare la disponibilità della band per un evento presso ${values.venueName} (${values.city}).`,
    "",
    "DETTAGLI EVENTO",
    `• Locale / Festival: ${values.venueName}`,
    `• Città: ${values.city}`,
    `• Data presunta: ${eventDate}`,
    "",
    "REFERENTE",
    `• Nome: ${values.organizerName}`,
    `• Email: ${values.email}`,
    `• Telefono: ${values.phone}`,
    "",
    "NOTE E BUDGET",
    values.notes.length > 0 ? values.notes : "Nessuna nota aggiuntiva.",
    "",
    "Resto in attesa di un vostro cortese riscontro.",
    "",
    "Cordiali saluti,",
    values.organizerName,
  ].join("\n");

  return { subject, body };
}
