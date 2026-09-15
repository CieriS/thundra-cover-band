export interface MailMessage {
  subject: string;
  body: string;
}

/** Costruisce un link `mailto:` con oggetto e corpo codificati (CRLF per compatibilità). */
export function buildMailtoHref(recipient: string, message: MailMessage): string {
  const params = [
    `subject=${encodeURIComponent(message.subject)}`,
    `body=${encodeURIComponent(message.body.replace(/\r?\n/g, "\r\n"))}`,
  ];

  return `mailto:${recipient}?${params.join("&")}`;
}

/** Versione testuale completa (oggetto + corpo) per la copia negli appunti. */
export function formatMailAsText(message: MailMessage): string {
  return `Oggetto: ${message.subject}\n\n${message.body}`;
}
