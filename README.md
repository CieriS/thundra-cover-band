# Thundra — AC/DC Tribute Band

Sito ufficiale di **Thundra**, tribute band degli AC/DC attiva tra Bologna, Modena e Reggio Emilia.
Due obiettivi, in quest'ordine: **booking** (convincere gestori e organizzatori a ingaggiare la band)
e **pubblico** (portare i fan alle date e sui social).

Sito statico, mobile-first, solo dark. Nessun server, nessun cookie, nessun tracciamento.

> Tribute band non affiliata agli AC/DC. Tutti i marchi appartengono ai rispettivi proprietari.

## Stack

| Ambito     | Tecnologia                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Framework  | Astro 7, output statico                                                    |
| Stile      | Tailwind CSS v4, configurazione CSS-first (token in `@theme`)              |
| Linguaggio | TypeScript strict                                                          |
| Contenuti  | Content Collections (un file YAML per voce, validato in build)             |
| Immagini   | `<Picture>` di Astro: AVIF/WebP, `srcset`, `sizes`                         |
| Font       | Fontsource, self-hosted: Anton (titoli), Archivo Variable (testo)          |
| Animazioni | CSS, scroll-driven animations, Web Animations API, SVG. Nessuna libreria   |
| Test       | `bun test` sulla logica pura                                               |

JavaScript lato client: un solo file di circa 2 KB gzip, tutto progressive enhancement.

## Avvio

```bash
bun install
```

```bash
bun run dev
```

Apri <http://localhost:4322>. Gli script funzionano anche con `npm run <script>`.

| Script                 | Cosa fa                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `bun run dev`          | Server di sviluppo                                                   |
| `bun run build`        | Controllo dei tipi (`astro check`) + build statica in `dist/`        |
| `bun run preview`      | Anteprima locale della build                                         |
| `bun run typecheck`    | Solo controllo dei tipi                                              |
| `bun run lint`         | ESLint                                                               |
| `bun test`             | Test unitari                                                         |
| `bun run todo`         | Elenca i segnaposto ancora da compilare (`file:riga`)                |
| `bun run placeholders` | Rigenera immagini segnaposto, grana, anteprima link e PDF segnaposto |

Prima di considerare finita una modifica:

```bash
bun run lint && bun test && bun run build
```

## Struttura

```
src/
├── assets/
│   ├── brand/            # logo ufficiale (solo da qui, mai ridisegnato)
│   └── placeholders/     # immagini segnaposto generate
├── config/
│   ├── site.ts           # dati della band: fonte unica di verità
│   ├── copy.ts           # testi delle sezioni
│   └── images.ts         # manifest delle immagini e dei segnaposto
├── content/              # collection: events, members, setlist, gallery, videos
├── content.config.ts     # schemi delle collection
├── lib/                  # logica pura e testata (date, eventi, .ics, contatti, JSON-LD)
├── components/
│   ├── layout/           # BaseLayout, Header, Footer, MobileActionBar, Brand
│   ├── sections/         # Hero, NextShow, Tour, Live, Band, Setlist, Booking, Gallery, Social, FinalCTA
│   └── ui/               # Button, EventCard, ResponsiveImage, VideoFacade, Marquee, RevealText, LightningSVG…
├── pages/                # /, /date, /archivio, /booking, /privacy, 404, /date/<id>.ics, robots.txt
├── scripts/site.ts       # l'unico script lato client
└── styles/
    ├── global.css        # design token (@theme), base, componenti
    └── motion.css        # tutte le animazioni
```

Regole dell'architettura:

- **Nessun dato nei componenti.** I dati stanno in `src/config/site.ts` e nelle collection, i testi in
  `src/config/copy.ts`.
- **Logica pura in `src/lib/`**, senza dipendenze da Astro e coperta da test. Gli unici file di `lib`
  che leggono le collection sono `content.ts` e `seo.ts`.
- **Design token in un solo punto**: il blocco `@theme` di `src/styles/global.css` (colori, scala
  tipografica, spaziature, durate, easing). Le coppie testo/sfondo sono verificate da
  `src/styles/contrast.test.ts` (WCAG AA).

## Segnaposto

I dati non ancora noti sono marcati `[DA COMPILARE]` (o `[VERIFICARE]`) e sul sito compaiono in un
riquadro tratteggiato azzurro, così non passano inosservati. Per l'elenco completo:

```bash
bun run todo
```

Non inventare mai dati: se un'informazione manca, resta il segnaposto.

## Cosa si modifica dove

Tutto ciò che cambia nel tempo sta in file separati dal codice. Non serve toccare i componenti.

| Voglio cambiare…                                   | File                                                        |
| -------------------------------------------------- | ----------------------------------------------------------- |
| Date dei concerti                                  | `src/content/events/` (un file per data)                    |
| Brani in scaletta (e la striscia dei titoli)       | `src/content/setlist/scaletta-tipo.yaml`                    |
| Membri della band, ruoli, ordine, foto             | `src/content/members/` (un file per persona)                |
| Foto della galleria                                | `src/content/gallery/` (un file per foto)                   |
| Video                                              | `src/content/videos/` (un file per video)                   |
| Recensioni                                         | `src/content/reviews/` (un file per recensione)             |
| Telefono, WhatsApp, email, social, zona, durata    | `src/config/site.ts`                                        |
| Tutti i testi: titoli, frasi, pulsanti, etichette  | `src/config/copy.ts`                                        |
| Titoli e descrizioni per Google e anteprime        | `src/config/copy.ts`, blocco `seo`                          |
| Foto fisse (hero, gruppo, booking, social)         | `src/config/images.ts`                                      |
| Colori, caratteri, dimensioni, tempi delle animazioni | blocco `@theme` in `src/styles/global.css`               |
| Logo, favicon, anteprima dei link                  | `src/assets/brand/` + `node scripts/build-logo.mjs`         |
| Scheda tecnica                                     | `public/docs/scheda-tecnica-thundra.pdf`                    |

Restano scritti nelle pagine solo i testi lunghi di `/privacy` e `/accessibilita`.

## Aggiungere una data

Crea **un file** in `src/content/events/`, con nome `AAAA-MM-GG-nome-locale.yaml`:

```yaml
date: 2027-04-17
time: "22:00" # facoltativo: senza orario il sito mostra "Orario da confermare"
venue: Nome del Locale
city: Bologna
province: BO
address: Via Esempio 1 # facoltativo
mapsUrl: https://maps.app.goo.gl/... # facoltativo: se manca, ricerca per nome e città
admission: free # facoltativo: free | paid
price: 10 € # facoltativo, solo con admission: paid
bookingUrl: https://... # facoltativo: prenotazione tavolo o biglietti
bookingLabel: Prenota un tavolo # facoltativo
poster: ../../assets/events/locandina.jpg # facoltativo
note: Serata speciale # facoltativo
status: scheduled # facoltativo: scheduled | cancelled | postponed
```

Non serve altro. Dalla build successiva la data compare in home e in `/date`, ha la **sua pagina**
(`/date/<nome-del-file>/`, creata da sola: titolo, descrizione e dati per Google compresi), entra
nella sitemap, ottiene il suo file
`.ics` ("Aggiungi al calendario"), il link "Come arrivare" e i dati strutturati `MusicEvent` per Google.
Se è la più vicina, diventa "Prossimo concerto" con il conto alla rovescia.

**Date passate.** Il giorno dopo il concerto la data esce da sola dalle sezioni Tour e finisce in
`/archivio`. Il filtro avviene **in build** (fuso orario Europe/Rome), quindi serve una build al giorno:
vedi [Rebuild giornaliera](#rebuild-giornaliera).

Se non ci sono date future, il sito mostra "Nuove date in arrivo" con l'invito a seguire Instagram.

## Foto

Le immagini vanno in `src/assets/` (mai in `public/`, altrimenti non vengono ottimizzate) in JPG o PNG,
alla dimensione più grande che hai: le varianti AVIF/WebP le genera la build.

| Dove                 | Proporzioni | Lato lungo consigliato | Come si collega                                                  |
| -------------------- | ----------- | ---------------------- | ---------------------------------------------------------------- |
| Hero mobile          | 9:16        | 1920 px                | `src/config/images.ts` → `images.hero.mobile`                    |
| Hero desktop         | 16:9        | 2400 px                | `src/config/images.ts` → `images.hero.desktop`                   |
| Foto di gruppo       | 3:2         | 1800 px                | `src/config/images.ts` → `images.band`                           |
| Foto sezione Booking | 3:2         | 1800 px                | `src/config/images.ts` → `images.booking`                        |
| Griglia Social (×4)  | 1:1         | 1080 px                | `src/config/images.ts` → `images.social`                         |
| Ritratti dei membri  | 4:5         | 1500 px                | campo `photo` in `src/content/members/<nome>.yaml`               |
| Galleria             | 3:2         | 1800 px                | campo `image` in `src/content/gallery/<nome>.yaml`               |
| Copertina video      | 16:9        | 1280 px                | campo `poster` in `src/content/videos/<nome>.yaml`               |
| Locandina di una data | 3:4        | 1500 px                | campo `poster` in `src/content/events/<data>.yaml`               |
| Anteprima dei link   | 1200×630    | —                      | sostituisci `public/og.jpg`                                      |

In `images.ts` sostituisci l'import del segnaposto con quello della foto e usa un oggetto
`{ src, alt, placeholder: false }` con un testo alternativo vero. Nelle collection il percorso è
relativo al file YAML, ad esempio `photo: ../../assets/members/lauro-mingucci.jpg`.

Per aggiungere una foto alla galleria crea un file in `src/content/gallery/`:

```yaml
image: ../../assets/gallery/live-07.jpg
alt: Il cantante al microfono sotto le luci rosse
caption: Metheglin Pub, ottobre 2026 # facoltativo
order: 7
```

### Logo

Il logo è quello fornito dalla band: `src/assets/brand/logo-original.jpg` (rosso pieno su fondo
bianco). Da quel file `scripts/build-logo.mjs` toglie lo sfondo e separa le parti, senza ridisegnare
nulla:

- `logo-compact.png` (solo il nome) per intestazione, menu e footer;
- `bolt.png` (il fulmine) per il titolo dell'hero, le animazioni e l'icona del sito;
- `logo.png` (logo completo su trasparente), usato per l'anteprima dei link;
- `public/favicon.png` e `public/apple-touch-icon.png`: il fulmine su fondo scuro. Il logo intero
  a 16 pixel non si legge, per questo l'icona è solo il fulmine;
- `public/og.jpg`: il logo su fondo scuro, per le anteprime su WhatsApp e social.

Per cambiare logo sostituisci il file originale e lancia `node scripts/build-logo.mjs`.

Lo script aggiunge anche la finitura "vissuta" (graffi, crepe, macchie): è generata da un seme
fisso, quindi a ogni esecuzione esce identica. Le icone restano pulite, perché a 16 pixel i graffi
diventano rumore. Produce inoltre `distress.webp`, la maschera che graffia il titolo dell'hero.

Il titolo dell'hero non è l'immagine del logo: è il nome della band nel carattere dei titoli del
sito, attraversato dal fulmine del logo.

### Firma

In fondo al footer c'è la firma di chi ha fatto il sito: un piccolo simbolo monocromatico che prende
il colore del testo attorno. Nome e link in `site.credit` (`src/config/site.ts`), simbolo in
`src/assets/credit/`.

## Video

Solo materiale registrato da Thundra. Crea un file in `src/content/videos/`:

```yaml
title: Titolo del video
youtube: https://www.youtube.com/watch?v=XXXXXXXXXXX
poster: ../../assets/videos/copertina.jpg # facoltativo, 16:9
order: 1
```

La home mostra i primi tre. Il player (`youtube-nocookie.com`) viene caricato solo dopo il tocco:
prima c'è soltanto un'immagine statica, quindi nessun cookie e nessun banner.

### Video di sfondo nell'hero (facoltativo)

In `src/config/site.ts` imposta `hero.video.enabled: true` e metti in `public/video/` quattro file:
`hero-mobile.webm`, `hero-mobile.mp4` (verticale), `hero-desktop.webm`, `hero-desktop.mp4`
(orizzontale). Requisiti: loop di 10–15 secondi, senza traccia audio, MP4 H.264 + WebM, circa 2 MB
al massimo ciascuno. La foto dell'hero resta sempre come poster. Il video non viene caricato con
"riduci movimento" attivo, con il risparmio dati o su connessioni lente.

## Membri, scaletta, contatti

- **Membri**: un file per persona in `src/content/members/` (`name`, `role`, `order`, `photo`).
- **Scaletta**: `src/content/setlist/scaletta-tipo.yaml`. Solo titoli dei brani.
- **Contatti, social, durata dello show, zona**: `src/config/site.ts`.
- **Scheda tecnica**: sostituisci `public/docs/scheda-tecnica-thundra.pdf` e imposta
  `techRider.isPlaceholder: false` in `src/config/site.ts`.
- **Testi**: `src/config/copy.ts`.

## Vincoli su marchi e copyright

- Nessun logo AC/DC, nessuna copertina, nessuna foto della band originale, nessun merchandising.
- Nessun testo di canzone, nemmeno un verso. I titoli dei brani in scaletta sono ammessi.
- Nessun audio o video originale degli AC/DC.
- Il riferimento agli AC/DC è solo descrittivo ("tributo agli AC/DC"), mai presentato come
  affiliazione. Il disclaimer nel footer non va rimosso.
- Nessun numero inventato ("100 concerti", "migliaia di fan").

## Animazioni e accessibilità

Tutte le animazioni stanno in `src/styles/motion.css`, sopra un sito che funziona anche senza.

- Si animano solo `transform`, `opacity`, `clip-path` e `stroke-dashoffset`.
- Gli stati iniziali nascosti esistono solo sotto `html.js`: senza JavaScript niente è nascosto.
- Un solo `IntersectionObserver` condiviso; ogni elemento viene de-registrato dopo il reveal.
- Il contenuto sopra la piega non aspetta mai JavaScript.
- **Fotosensibilità**: nessun elemento lampeggia più di due volte in un secondo, i bagliori sono
  confinati ad aree piccole, niente flash a tutto schermo.
- `prefers-reduced-motion: reduce`: niente fulmini né bagliori, solo dissolvenze brevi.
- Menu e lightbox usano `<dialog>` nativo: focus trap e chiusura con Esc inclusi.

## Deploy

Il sito è una cartella statica (`dist/`). Su **Vercel**:

1. Importa il repository: Astro e bun vengono riconosciuti da soli (build `bun run build`, output `dist`).
2. L'indirizzo pubblico per canonical, Open Graph, sitemap e JSON-LD viene preso dal dominio di
   produzione del progetto. Per forzarlo imposta la variabile d'ambiente `SITE_URL`
   (vedi `.env.example`).
3. Ogni branch ha la sua anteprima; le anteprime hanno `noindex` e non finiscono su Google.

Su Netlify o Cloudflare Pages: comando `bun run build` (o `npm run build`), cartella `dist`,
variabile `SITE_URL` obbligatoria.

### Dominio e sitemap

La sitemap (`/sitemap-index.xml`) si genera da sola a ogni build con tutte le pagine, comprese quelle
delle singole date, ed è dichiarata in `/robots.txt`. La pagina Archivio ci entra solo quando contiene
almeno una data.

Indirizzi della sitemap, canonical e anteprime dei link usano il dominio del sito. Quando arriva il
dominio definitivo:

1. collegalo al progetto su Vercel (Settings → Domains) e impostalo come dominio di produzione;
2. se serve forzarlo, imposta la variabile d'ambiente `SITE_URL` (es. `https://www.esempio.it`);
3. in Google Search Console aggiungi la proprietà del dominio e invia `https://<dominio>/sitemap-index.xml`.

### Rebuild giornaliera

Le date passate si spostano in archivio solo quando il sito viene ricostruito. Serve una build
automatica ogni notte.

**Vercel (consigliato)**: Project Settings → Git → Deploy Hooks → crea un hook sul branch di
produzione e copia l'URL. Poi, su GitHub, salvalo come secret del repository con nome
`DEPLOY_HOOK_URL` (Settings → Secrets and variables → Actions). Il workflow
`.github/workflows/daily-rebuild.yml` lo chiama ogni notte alle 03:15 UTC; senza il secret non fa nulla.

**Netlify**: Site configuration → Build & deploy → Build hooks, poi lo stesso secret
`DEPLOY_HOOK_URL`: il workflow è identico.

**Cloudflare Pages**: Settings → Builds & deployments → Deploy hooks, poi lo stesso secret.

Per provare subito: scheda Actions su GitHub → "Daily rebuild" → Run workflow.
