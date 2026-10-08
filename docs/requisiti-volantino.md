# Volantini automatici: requisiti

Stato: **solo requisiti, niente è stato realizzato.** Aggiornati l'8 ottobre 2026 con le
decisioni di Samuele e con i quattro volantini di esempio (in `docs/volantino-esempi/`).

## Obiettivo

Per ogni data avere un volantino pronto da scaricare, stampare e condividere, senza rifarlo a
mano ogni volta: nasce dagli stessi dati della pagina della serata, più il logo del locale.

## Decisioni prese

| Domanda | Decisione |
|---|---|
| Chi crea il volantino | Solo chi gestisce il sito. Niente caricamenti da parte dei locali |
| Formati | A4, scaricabile e stampabile. Usi: post sui social, stampa da appendere, condivisione |
| Varianti | Otto: base, Halloween, Natale, Capodanno, Epifania, Summer, Winter, Matrimoni |
| Mostrarlo sul sito come locandina | Sì, senza cambiare il sito com'è ora (vedi "Dove compare sul sito") |
| Anteprima del link della serata | Sì: il volantino diventa l'immagine che compare condividendo la pagina |
| Versione 4:5 per Instagram | Sì, oltre all'A4 |
| Codice QR | Sì, sulla versione da stampare |
| Grafica della band | Rifatta con il logo nuovo; lo sfondo con i fulmini lo fa generare Samuele da un'AI |
| Matrimoni | Entrambe le cose: variante per la serata privata e volantino promozionale |

Di conseguenza il volantino lo genera il sito a ogni aggiornamento: il logo del locale si aggiunge
come file accanto alla data, senza server e senza moduli di caricamento.

## Cosa si ricava dagli esempi

### Volantino della serata (A4 verticale)

Tre esempi: Osteria Cellulosa, Music Station Live Club, Metheglin Pub (Halloween).

Struttura fissa, dall'alto:

1. **Blocco grafico della band** (circa il 70% dell'altezza): fondo scuro con fulmini, logo,
   scritta "Tribute Band", in basso i profili Instagram e Facebook.
2. **Fascia nera** con i dati della serata, centrati:
   - titolo del tema, solo se c'è (es. "Halloween Party", in arancione con carattere a tema);
   - **data** in rosso, grande, in maiuscolo: "30 GENNAIO 2027";
   - **orario**, solo se c'è, in bianco accanto alla data: "ORE 22:30" (in quel caso l'anno
     non compare: "31 OTTOBRE ORE 22:30");
   - **logo del locale** in un riquadro, bianco o scuro a seconda del logo;
   - **località** in bianco maiuscolo: "LAMA DI RENO (BO)", "CORNIANO DI BIBBIANO (RE)".

### Manifesto con l'elenco delle date (4:5)

Un esempio: "DATE 2026 / 2027".

- Titolo in oro con gli anni coperti dalle date in programma.
- Blocco grafico della band al centro.
- Una riga per data: riquadro con il logo del locale, data in rosso (31-10-2026), nome del locale
  in bianco, località in azzurro.
- In fondo: "DATE IN AGGIORNAMENTO".

È un secondo prodotto, non previsto nella prima stesura: **va generato anche questo**, dall'elenco
delle date future, e rifatto da solo a ogni data aggiunta o passata.

## Requisiti

### Contenuto

1. Volantino della serata per ogni data, dai dati del file in `src/content/events/`.
2. Manifesto con l'elenco delle date future, aggiornato da solo.
3. Logo del locale su entrambi; se manca, al suo posto il nome del locale in grande.
4. Profili social presi dalla configurazione del sito, non scritti nell'immagine.
5. Un dato mancante non viene stampato (niente "da confermare" sul volantino).
6. Nessun dato inventato: sul volantino finisce solo ciò che è nel file della serata.

### Personalizzazione per serata (tutta facoltativa)

- variante grafica (una delle otto);
- titolo o tema della serata;
- orario di inizio e apertura porte;
- prezzo o formula (es. cena + concerto), contatto per prenotare;
- una riga libera;
- sfondo del riquadro del logo: bianco o scuro.

### Varianti

Stessa struttura per tutte; cambiano colore d'accento, carattere del titolo del tema ed eventuali
decorazioni. Base, Halloween, Natale, Capodanno, Epifania, Summer, Winter, Matrimoni.

### Formati e uso

- **A4 verticale** in due file: PDF per la stampa e immagine per la condivisione.
- Stampa: risoluzione da tipografia (2480×3508 pixel), testo lontano dai bordi.
- Scaricabili dalla pagina della serata; il manifesto delle date dalla pagina "Date".

### Tecnica

- Generati durante la build, come le immagini del sito: nessun server.
- Il risultato non deve dipendere dai caratteri installati sul computer che fa la build
  (su Vercel non ci sono): i caratteri vanno incorporati.
- Un solo modello di impaginazione con le varianti come parametri, non otto modelli separati.

## Vincoli

- Il logo del locale si usa solo se fornito dal locale, così com'è, senza deformarlo.
- Nessun logo, scritta o grafica degli AC/DC; nessun testo di canzone.
- Testo leggibile anche sul telefono: dimensioni minime e contrasto come sul sito.
- I caratteri a tema devono avere una licenza che ne permetta l'uso.

## Dove compare sul sito

La home e le liste delle date restano come sono. Si aggiunge solo:

- **Pagina della serata** (`/date/<data>/`): un blocco "Locandina" sotto il conto alla rovescia e
  il pulsante "Invita gli amici", prima di "Altre date". Miniatura del volantino con i pulsanti
  per scaricarlo (A4 da stampare, A4 immagine, 4:5 per Instagram).
- **Pagina "Date"** (`/date/`): in fondo all'elenco, un pulsante per scaricare il manifesto con
  tutte le date.
- **Anteprima dei link**: non si vede sul sito; compare quando la pagina della serata viene
  condivisa su WhatsApp, Facebook o altrove.

## Matrimoni ed eventi privati

Un matrimonio non va pubblicizzato. Servono due cose distinte:

1. **Serata privata**: una data segnata come privata non compare in home, nelle liste, nella
   sitemap né nei dati per Google, ma il suo volantino (variante Matrimoni) si genera lo stesso e
   si scarica da un indirizzo non elencato, da dare agli sposi.
2. **Volantino promozionale** "Thundra al tuo matrimonio": senza data né locale, con i contatti
   per il booking. Scaricabile dalla pagina Booking.

## Materiale ricevuto

Loghi dei locali, in `src/assets/venues/`:

| Locale | File | Note |
|---|---|---|
| Metheglin Pub | `metheglin-pub.jpg` (900×900) | Scuro su fondo bianco: va nel riquadro bianco. Adatto alla stampa |
| Osteria Cellulosa | `osteria-cellulosa.jpg` (1500×1500) | Solo il simbolo del riccio, senza la scritta "Cellulosa Osteria" che c'era sul volantino di esempio |
| Music Station Live Club | `music-station-live-club.jpg` (561×240) | Piccolo e sfocato: va bene a schermo, in stampa A4 esce sgranato |

## Da decidere o da ricevere

1. **Sfondo con i fulmini** senza logo né scritte, ad alta risoluzione: lo genera Samuele con il
   prompt concordato.
2. **Logo completo dell'Osteria Cellulosa** (simbolo + scritta). In mancanza, il nome si scrive
   accanto al simbolo con il carattere del volantino.
3. **Logo del Music Station** in versione più grande, per la stampa.
4. **Orario del Metheglin**: il volantino di esempio dice 22:30, sul sito c'è 21:30.
5. **Date passate**: il volantino resta scaricabile nella pagina in archivio?
