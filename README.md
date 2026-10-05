# Thundra — AC/DC Tribute Show

Sito ufficiale single-page di **Thundra**, tribute band degli AC/DC: date del tour, recensioni, media, manifesto e line-up, setlist, tech rider per promoter e modulo di richiesta disponibilità.

È un'applicazione **React statica** progettata mobile-first per il booking: nessun server, la build produce file HTML/CSS/JS (con la pagina già prerenderizzata) da caricare su qualsiasi hosting.

## Stack

| Ambito     | Tecnologia                                                         |
| ---------- | ------------------------------------------------------------------ |
| UI         | React 19 + TypeScript (strict), prerender statico in build         |
| Build      | Vite 8                                                             |
| Styling    | Tailwind CSS v4 (design token in `src/styles/globals.css`)         |
| Componenti | Primitive Radix UI in stile shadcn/ui                              |
| Animazioni | CSS scroll-driven (`reveal`) + framer-motion, solo transform/opacity |
| Immagini   | WebP responsive generate con sharp (`scripts/vite-plugin-webp.ts`) |
| Icone      | lucide-react (+ icone social SVG dedicate)                         |
| Form       | react-hook-form + zod, toast con sonner                            |
| Font       | Fontsource: Anton (titoli), Geist, Geist Mono                      |

## Design system "Hard Rock"

Tema unico ad alto contrasto, definito come token in `src/styles/globals.css`:

| Token                | Valore    | Uso                                                        |
| -------------------- | --------- | ---------------------------------------------------------- |
| `--background`       | `#09090b` | Sfondo principale                                          |
| `--foreground`       | `#f8fafc` | Testo                                                      |
| `--accent`           | `#dc2626` | CTA, badge, bottom nav Booking                             |
| `--accent-ink`       | `#f87171` | Rosso per testo piccolo su nero (contrasto AA)             |

## Esperienza mobile

- **Navigazione**: sotto i 1024 px la top bar è sostituita da una bottom navigation fissa (Home, Tour, Media, Booking) nella zona del pollice; si ritira mentre la tastiera virtuale è aperta. Tutti i target tattili misurano almeno 48×48 px.
- **Above the fold**: foto live a tutto schermo, CTA rossa "Prossima data" (con data e città del prossimo concerto non esaurito) e CTA secondaria "Prenota la band".
- **Tour**: tag di urgenza basati solo su dati reali: "In esaurimento" (stato impostato dal pannello), "Ultima data" (ultimo concerto in calendario) e conto alla rovescia per i concerti entro 14 giorni.
- **Prove sociali**: numeri chiave e carosello orizzontale di recensioni di locali e organizzatori.
- **Booking**: tre campi (nome, email, data + città) con tastiera virtuale e autocompletamento adatti a ciascun input.
- **Performance**: HTML prerenderizzato (il primo paint non attende il JS), immagini WebP in lazy loading tranne la hero (priorità alta), embed YouTube caricati solo al tocco, animazioni solo su `transform`/`opacity`.

## Avvio

```bash
bun install
```

```bash
bun dev
```

Apri [http://localhost:5173](http://localhost:5173). Il dev server è esposto anche in rete locale: da smartphone usa l'indirizzo `Network` mostrato nel terminale. Funziona anche con `npm` (`npm install`, `npm run dev`).

| Script              | Descrizione                                            |
| ------------------- | ------------------------------------------------------ |
| `bun dev`           | Server di sviluppo con hot reload (WebP generate al volo) |
| `bun run build`     | Typecheck + build statica prerenderizzata in `dist/`   |
| `bun run preview`   | Anteprima locale della build di `dist/`                |
| `bun run lint`      | ESLint                                                 |
| `bun run typecheck` | Controllo dei tipi TypeScript                          |

## Pubblicazione

`bun run build` genera la cartella `dist/`, completamente statica:

- `index.html` con la pagina già renderizzata, title, meta Open Graph e dati strutturati JSON-LD
- `assets/` (JS, CSS, font), `images/` (con le varianti WebP), `favicon.svg`
- `robots.txt` e `sitemap.xml`

Carica il contenuto di `dist/` su qualsiasi hosting statico (Netlify, Vercel, Cloudflare Pages, GitHub Pages, FTP). I percorsi sono relativi, quindi funziona anche in una sottocartella.

> Il prerender usa la data della build per filtrare le date passate; nel browser la lista si aggiorna subito con la data reale. Conviene comunque ripubblicare periodicamente (ogni modifica dal pannello lo fa in automatico).

### Variabili d'ambiente

Imposta l'URL pubblico prima della build (canonical, Open Graph, sitemap, JSON-LD):

```bash
cp .env.example .env.local
```

## Struttura

```
├── .pages.yml               # configurazione del pannello Pages CMS
├── content/                 # contenuti modificabili (JSON)
├── index.html               # shell HTML
├── vite.config.ts
├── scripts/
│   ├── vite-plugin-seo.ts       # meta SEO, JSON-LD, robots.txt, sitemap.xml
│   ├── vite-plugin-prerender.ts # HTML statico della pagina in build
│   └── vite-plugin-webp.ts      # varianti WebP responsive delle immagini
├── public/                  # favicon e immagini mockup
└── src/
    ├── main.tsx             # entry client: font, stili, idratazione
    ├── entry-server.tsx     # entry del prerender
    ├── App.tsx              # composizione della pagina
    ├── components/
    │   ├── layout/          # Navbar (desktop), BottomNav (mobile), Footer
    │   ├── sections/        # Hero, TourDates, Reviews, Media, About, Setlist, TechRider, BookingForm
    │   ├── ui/              # Button, Input, Badge, Accordion, ResponsiveImage, LiteYouTube, Reveal…
    │   └── providers.tsx    # MotionConfig, Toaster
    ├── data/                # band-data.ts (tipi + caricamento), content-schema.ts (validazione)
    ├── hooks/               # useActiveSection, useToday
    ├── lib/                 # booking, date, tour, immagini, mailto, JSON-LD
    └── styles/globals.css
```

## Contenuti modificabili (pannello Pages CMS)

Tutti i contenuti del sito stanno in file JSON nella cartella `content/` e si modificano da un pannello web, senza toccare il codice:

| File                      | Nel pannello        | Contiene                                                        |
| ------------------------- | ------------------- | --------------------------------------------------------------- |
| `content/tour.json`       | Date del tour       | data, apertura porte, locale, città, stato, link biglietti      |
| `content/reviews.json`    | Recensioni          | citazione, autore o ruolo, locale, città, valutazione           |
| `content/media.json`      | Media               | link dei video YouTube, foto dal palco                          |
| `content/band.json`       | Band e contatti     | nome, slogan, bio, manifesto, email, line-up, numeri, social    |
| `content/setlist.json`    | Setlist             | brani, album, anno, durata, tag tecnici                         |
| `content/tech-rider.json` | Tech rider          | riepilogo, sezioni tecniche, input list                         |
| `content/texts.json`      | Testi del sito      | titoli delle sezioni, pulsanti, footer, immagini principali     |

Il pannello è configurato in `.pages.yml`. Comportamenti automatici:

- le **date passate spariscono da sole** e le date vengono ordinate cronologicamente;
- lo stato **"In esaurimento"** mostra un avviso di scarsità: va usato solo quando i biglietti stanno davvero finendo;
- i brani vengono ordinati per anno e raggruppati per album;
- per i video basta incollare il link YouTube: il sito ne ricava l'ID;
- ogni contenuto viene **validato durante la build** (`src/data/content-schema.ts`): se un dato non è valido, il deploy si ferma con un messaggio chiaro e il sito online resta quello precedente.

> Email, social, date, locali, link biglietti e **recensioni** attuali sono **segnaposto**: sostituiscili prima della pubblicazione. Le recensioni devono essere citazioni reali, autorizzate da chi le ha scritte.

### Configurazione iniziale (una volta sola, a cura di chi gestisce il sito)

1. **GitHub**: crea un repository (anche privato) e carica il progetto.
2. **Vercel**: importa il repository da [vercel.com/new](https://vercel.com/new). Vite e bun vengono rilevati in automatico (build `bun run build`, output `dist`). Aggiungi la variabile d'ambiente `VITE_SITE_URL` con l'indirizzo pubblico del sito. Da questo momento ogni modifica al repository pubblica una nuova versione in circa un minuto.
3. **Pages CMS**: vai su [app.pagescms.org](https://app.pagescms.org), accedi con GitHub, installa la GitHub App sul repository e aprilo: il file `.pages.yml` è già pronto.
4. **Invita chi aggiorna i contenuti**: nella sezione collaboratori del progetto su Pages CMS inserisci la sua email. Riceverà un link di accesso: **non serve un account GitHub** né una password.

### Aggiornare i contenuti (per chi modifica il sito)

1. Apri il link ricevuto via email ed entra in Pages CMS.
2. Scegli la sezione dal menu, ad esempio **Date del tour**.
3. Aggiungi o modifica una voce: la data si sceglie dal calendario, lo stato da un menu a tendina.
4. Clicca **Save**. Dopo circa un minuto le modifiche sono online.

### Immagini

Le foto si caricano dal pannello in **JPG, PNG o WebP**: in build ogni immagine di `public/images/` viene convertita automaticamente in WebP a 480, 960 e 1600 px di larghezza (`srcset`), così il telefono scarica solo la dimensione che gli serve.

Le immagini in `public/images/mockup/` sono **illustrazioni SVG segnaposto**:

- `live-stage.svg` (16:9): foto hero, foto live nella sezione Band e galleria Media
- `crowd.svg` (16:9): sfondo della card "La tua città non è in lista?" e galleria Media
- `members/*.svg` (4:5): ritratti della line-up

## Booking engine

Il modulo non richiede backend:

1. Tre campi (nome, email, data + città) con validazione client-side zod ed errori inline accessibili.
2. **Invia richiesta** apre un link `mailto:` precompilato; le righe per locale e budget si completano direttamente nell'email.
3. **Copia testo** copia il messaggio negli appunti (Clipboard API) e mostra un toast.

La Clipboard API richiede un contesto sicuro (HTTPS o `localhost`).
