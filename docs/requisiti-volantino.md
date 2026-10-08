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
| Mostrarlo sul sito come locandina | Da valutare (vedi "Proposte") |

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

## Proposte

1. **Mostrarlo sul sito: sì, ma solo nella pagina della serata**, come locandina con il pulsante
   per scaricarla. Non nelle liste: peserebbe sul caricamento senza aggiungere informazioni.
2. **Usarlo come anteprima del link della serata**: condividendo la pagina su WhatsApp o Facebook
   comparirebbe il volantino al posto del logo generico. È il vantaggio più grande di tutta
   l'idea, e non costa lavoro in più per ogni data.
3. **Aggiungere una versione 4:5 per Instagram** oltre all'A4: un A4 nel feed viene tagliato sopra
   e sotto. Sarebbe la stessa grafica, riadattata in automatico.
4. **Codice QR** verso la pagina della serata, solo sulla versione da stampare.

## Da decidere o da ricevere

1. **Blocco grafico della band**: gli esempi usano il logo vecchio dentro un'immagine con i
   fulmini. Si rifà con il logo nuovo? In quel caso serve lo sfondo con i fulmini senza logo, ad
   alta risoluzione, oppure lo genera il sito nello stile dell'hero.
2. **Loghi dei locali**: servono i file originali. Dagli esempi si possono solo ritagliare a
   bassa risoluzione, non adatti alla stampa.
3. **Variante "Matrimoni"**: i matrimoni sono eventi privati e non hanno una data pubblica. È un
   volantino promozionale ("Thundra al tuo matrimonio") invece che il volantino di una serata?
4. **Versione 4:5 e codice QR**: sì o no.
5. **Date passate**: il volantino resta scaricabile nella pagina in archivio?
6. **Orario del Metheglin**: il volantino dice 22:30, sul sito è stato messo 21:30.
