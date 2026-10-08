# Volantino automatico per ogni serata: requisiti

Stato: **solo requisiti, niente è stato realizzato.** Raccolti l'8 ottobre 2026.
Manca ancora il volantino di esempio da cui ricavare l'impaginazione.

## Obiettivo

Per ogni data avere un volantino pronto da scaricare e condividere, senza rifarlo a mano ogni
volta: stessi dati della pagina della serata, più il logo del locale.

## Cosa deve fare

1. **Un volantino per ogni data**, generato dai dati già presenti nel file della serata
   (`src/content/events/`): data, giorno della settimana, orario, locale, città, indirizzo, ingresso.
2. **Logo del locale** sul volantino, accanto al logo della band.
3. **Personalizzazione per serata**, tutta facoltativa:
   - titolo o tema della serata (es. "Halloween Party");
   - orario di apertura porte, oltre a quello di inizio;
   - prezzo, formula (es. cena + concerto), consumazione;
   - telefono o link per prenotare un tavolo;
   - una riga libera (es. "Dress code: maschera");
   - foto di sfondo diversa da quella standard.
4. **Scaricabile dalla pagina della serata** con un pulsante, nei formati che servono davvero:
   - post Instagram/Facebook verticale 4:5 (1080×1350);
   - storia 9:16 (1080×1920);
   - copertina dell'evento Facebook 16:9 (1920×1005);
   - stampa A4 (PDF, con margini per la tipografia) — da confermare se serve.
5. **Codice QR** che porta alla pagina della serata (utile soprattutto sulla versione stampata).
6. **Coerente con il sito**: stessi colori, stesso carattere, logo e fulmine della band.
7. **Dati mancanti**: se manca l'orario o l'ingresso il volantino non li mostra (niente
   "da confermare" stampato); se manca il logo del locale esce con il solo nome.

## Tre modi di farlo

| | Come funziona | Pro | Contro |
|---|---|---|---|
| **A. Generato dal sito a ogni aggiornamento** (consigliato) | Il logo del locale si aggiunge come file accanto alla data; il sito crea da solo le immagini e mette i pulsanti di download | Nessun server, sempre allineato ai dati, risultato identico per tutti, zero lavoro per data | Il logo lo carica chi aggiorna il sito, non il locale |
| **B. Personalizzabile nel browser** | Nella pagina della serata il gestore sceglie il proprio logo dal telefono o dal computer e scarica il volantino; il file non lascia il suo dispositivo | Il locale fa da sé, nessun dato inviato | Il volantino personalizzato esiste solo sul dispositivo di chi lo crea; qualità del logo fuori controllo |
| **C. Caricamento sul sito** | Il locale invia il logo e il sito lo conserva | Tutto centralizzato | Serve un server con accessi e archivio: il sito oggi è statico, costo e manutenzione sproporzionati |

Proposta: **A come base**, ed eventualmente **B** in un secondo momento per i locali che vogliono
fare da sé. **C** sconsigliato.

## Dati nuovi da aggiungere al file della serata (con la soluzione A)

- `title`: tema della serata;
- `doorsTime`: apertura porte;
- `venueLogo`: file del logo del locale;
- `flyerNote`: riga libera;
- `flyerBackground`: foto di sfondo alternativa.

Titolo, apertura porte e riga libera servirebbero anche alla pagina della serata, non solo al volantino.

## Vincoli

- Il logo del locale si usa solo se fornito dal locale stesso, così com'è.
- Nessun logo, scritta o grafica degli AC/DC; nessun testo di canzone.
- Testo leggibile anche sul telefono: dimensioni minime e contrasto come sul sito.
- I loghi dei locali arrivano in forme e colori diversi: serve un riquadro neutro che li
  ospiti senza deformarli (anche loghi scuri su fondo scuro).
- Nessun dato inventato: sul volantino finisce solo ciò che è nel file della serata.

## Da decidere

1. Chi crea il volantino: chi gestisce il sito (A) o anche il locale da solo (B)?
2. Quali formati servono davvero? Serve la stampa?
3. Un solo modello o più varianti (es. una per Halloween, una standard)?
4. Il volantino deve poter esistere anche per le date passate (archivio)?
5. Va mostrato sul sito come locandina della serata, oltre che scaricabile?
