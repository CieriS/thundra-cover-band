# Thundra — AC/DC Tribute Show

Sito ufficiale single-page di **Thundra**, tribute band degli AC/DC: manifesto e line-up, date del tour, setlist, tech rider per promoter e modulo di richiesta disponibilità.

È un'applicazione **React statica**: nessun server, la build produce file HTML/CSS/JS da caricare su qualsiasi hosting.

## Stack

| Ambito     | Tecnologia                                            |
| ---------- | ----------------------------------------------------- |
| UI         | React 19 + TypeScript (strict)                        |
| Build      | Vite 8                                                |
| Styling    | Tailwind CSS v4 (design token in `src/styles/globals.css`) |
| Componenti | Primitive Radix UI in stile shadcn/ui                 |
| Animazioni | framer-motion (`whileInView`, `viewport.once`)        |
| Icone      | lucide-react (+ icone social SVG dedicate)            |
| Tema       | next-themes (light/dark persistente, default scuro)   |
| Form       | react-hook-form + zod, toast con sonner               |
| Font       | Fontsource: Archivo (asse width), Geist, Geist Mono   |

## Avvio

```bash
bun install
```

```bash
bun dev
```

Apri [http://localhost:5173](http://localhost:5173). Il dev server è esposto anche in rete locale: da smartphone usa l'indirizzo `Network` mostrato nel terminale. Funziona anche con `npm` (`npm install`, `npm run dev`).

| Script              | Descrizione                                  |
| ------------------- | -------------------------------------------- |
| `bun dev`           | Server di sviluppo con hot reload            |
| `bun run build`     | Typecheck + build statica in `dist/`         |
| `bun run preview`   | Anteprima locale della build di `dist/`      |
| `bun run lint`      | ESLint                                       |
| `bun run typecheck` | Controllo dei tipi TypeScript                |

## Pubblicazione

`bun run build` genera la cartella `dist/`, completamente statica:

- `index.html` con title, meta Open Graph e dati strutturati JSON-LD già inclusi
- `assets/` (JS, CSS, font), `images/`, `favicon.svg`
- `robots.txt` e `sitemap.xml`

Carica il contenuto di `dist/` su qualsiasi hosting statico (Netlify, Vercel, Cloudflare Pages, GitHub Pages, FTP). I percorsi sono relativi, quindi funziona anche in una sottocartella.

### Variabili d'ambiente

Imposta l'URL pubblico prima della build (canonical, Open Graph, sitemap, JSON-LD):

```bash
cp .env.example .env.local
```

## Struttura

```
├── .pages.yml               # configurazione del pannello Pages CMS
├── content/                 # contenuti modificabili (JSON)
├── index.html               # shell HTML (tema anti-flash, noscript)
├── vite.config.ts
├── scripts/vite-plugin-seo.ts   # meta SEO, JSON-LD, robots.txt, sitemap.xml
├── public/                  # favicon e immagini mockup
└── src/
    ├── main.tsx             # entry: font, stili, provider
    ├── App.tsx              # composizione della pagina
    ├── components/
    │   ├── layout/          # Navbar, Footer, ThemeToggle
    │   ├── sections/        # Hero, About, TourDates, Setlist, TechRider, BookingForm
    │   ├── ui/              # Button, Input, Textarea, Label, Card, Badge, Accordion, Reveal…
    │   └── providers.tsx    # ThemeProvider, MotionConfig, Toaster
    ├── data/                # band-data.ts (tipi + caricamento), content-schema.ts (validazione)
    ├── hooks/               # useActiveSection
    ├── lib/                 # schema booking, date, mailto, JSON-LD
    └── styles/globals.css
```

## Contenuti modificabili (pannello Pages CMS)

Tutti i contenuti del sito stanno in file JSON nella cartella `content/` e si modificano da un pannello web, senza toccare il codice:

| File                      | Nel pannello       | Contiene                                                      |
| ------------------------- | ------------------ | ------------------------------------------------------------- |
| `content/tour.json`       | Date del tour      | data, apertura porte, locale, città, stato, link biglietti    |
| `content/band.json`       | Band e contatti    | nome, slogan, bio, manifesto, email, line-up con foto, social |
| `content/setlist.json`    | Setlist            | brani, album, anno, durata, tag tecnici                       |
| `content/tech-rider.json` | Tech rider         | riepilogo, sezioni tecniche, input list                       |
| `content/texts.json`      | Testi del sito     | titoli delle sezioni, pulsanti, footer, immagini principali   |

Il pannello è configurato in `.pages.yml`. Comportamenti automatici:

- le **date passate spariscono da sole** e le date vengono ordinate cronologicamente;
- i brani vengono ordinati per anno e raggruppati per album;
- ogni contenuto viene **validato durante la build** (`src/data/content-schema.ts`): se un dato non è valido, il deploy si ferma con un messaggio chiaro e il sito online resta quello precedente.

> Email, social, date, locali e link biglietti attuali sono **segnaposto**: sostituiscili prima della pubblicazione.

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

Le immagini in `public/images/mockup/` sono **illustrazioni SVG segnaposto**:

- `live-stage.svg` (16:9): foto live nella sezione Band
- `crowd.svg` (16:9): sfondo della card "La tua città non è in lista?"
- `members/*.svg` (4:5): ritratti della line-up

Le foto reali si caricano direttamente dal pannello (campo **Foto**), rispettando le proporzioni indicate: vengono salvate in `public/images/`.

## Booking engine

Il modulo non richiede backend:

1. Validazione client-side con zod ed errori inline accessibili.
2. **Invia via email** apre un link `mailto:` precompilato con oggetto e corpo formali.
3. **Copia testo richiesta** copia il messaggio negli appunti (Clipboard API) e mostra un toast.

La Clipboard API richiede un contesto sicuro (HTTPS o `localhost`).
