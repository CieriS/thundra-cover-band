/**
 * Every text of the site, grouped by section: edit here, nothing is written in the components.
 * Italian, short sentences, one idea per line, every block ends on an action.
 * Rules: no song lyrics (not even one line), no invented numbers or facts.
 * `word` is the giant outlined word that slides behind a section.
 */
export const copy = {
  hero: {
    claim: 'Tutti i classici degli AC/DC. Dal vivo.',
    /** Followed by the cities of site.area: "Tra Bologna, Modena, Reggio Emilia e dintorni." */
    areaPrefix: 'Tra',
    ctaFans: 'Vedi le date',
    ctaBooking: 'Porta Thundra nel tuo locale',
    nextLabel: 'Prossima data',
  },
  nextShow: {
    eyebrow: 'Prossimo concerto',
    title: ['Ci vediamo', 'qui'],
    timeUnknown: 'Orario da confermare',
    calendar: 'Salva la data',
    directions: 'Come arrivare',
    share: 'Invita gli amici',
    /** Text of the WhatsApp invitation; date, venue and link are added automatically. */
    shareMessage: 'Vieni con me a sentire i Thundra, tributo agli AC/DC?',
    today: 'È stasera. Ci vediamo lì.',
  },
  tour: {
    word: 'Tour',
    eyebrow: 'Tour',
    title: ['Prossime', 'date'],
    intro: 'Scegli la serata, salvala in calendario e porta chi vuoi.',
    all: 'Tutte le date',
    archive: 'Date passate',
    emptyTitle: 'Nuove date in arrivo',
    emptyText: 'Le annunciamo prima su Instagram. Seguici e tieniti libero.',
    emptyCta: 'Seguici su Instagram',
  },
  live: {
    word: 'Live',
    eyebrow: 'Live',
    title: ['Senti', 'come suona'],
    intro: 'Prima di venire, o prima di chiamarci: guarda una serata vera.',
    comingSoon: 'I video dal palco sono in arrivo. Su Instagram escono prima.',
    play: 'Riproduci il video',
    consent: 'Il video si carica da YouTube solo dopo il tuo tocco.',
    soon: 'Presto online',
  },
  reviews: {
    word: 'Rock',
    eyebrow: 'Dicono di noi',
    title: ['Chi c’era', 'lo racconta'],
  },
  band: {
    word: 'Band',
    eyebrow: 'La band',
    title: ['Cinque.', 'Forte.'],
    text: [
      'Cinque musicisti e una fissazione in comune: gli AC/DC.',
      'Li suoniamo come vanno suonati: forte, precisi, senza fronzoli. I pantaloncini corti restano facoltativi.',
    ],
    lineup: 'Formazione',
  },
  setlist: {
    word: 'Loud',
    eyebrow: 'Scaletta tipo',
    title: ['I pezzi', 'che aspetti'],
    intro: 'Quelli che canti dal primo accordo. E qualche chicca per chi i dischi li ha consumati.',
  },
  booking: {
    word: 'Book',
    eyebrow: 'Per locali ed eventi',
    title: ['Porta Thundra', 'nel tuo locale'],
    intro:
      'Una serata AC/DC chiavi in mano: i classici che tutti conoscono, dal primo riff all’ultimo bis. Tu apri le porte, al palco pensiamo noi.',
    /** First call to action, right under the intro: on a phone the contact panel is far below. */
    quickCta: 'Chiedi disponibilità su WhatsApp',
    quickNote: 'Risponde la band, senza intermediari. Nessun impegno.',
    benefitsTitle: 'Cosa ottiene il locale',
    benefits: [
      {
        title: 'Sala piena',
        text: 'Il repertorio degli AC/DC lo conoscono tutti: richiama pubblico di ogni età, dai fan storici a chi viene per curiosità.',
      },
      {
        title: 'Più consumazioni',
        text: 'Uno show lungo e coinvolgente tiene le persone nel locale per tutta la serata.',
      },
      {
        title: 'Clienti che tornano',
        text: 'Il tipo di concerto che si racconta il giorno dopo, e per cui si chiede quando è il prossimo.',
      },
    ],
    reliabilityTitle: 'Come lavoriamo',
    reliability: [
      'Orari concordati prima e rispettati: arrivo, montaggio, soundcheck, inizio.',
      'Un solo referente per tutta l’organizzazione, raggiungibile al telefono.',
      'La data viene annunciata sui nostri canali social.',
    ],
    factsTitle: 'Lo show in breve',
    facts: {
      duration: 'Durata',
      sets: 'Set',
      ownPa: 'Impianto audio e luci',
      experience: 'Esperienza',
      area: 'Zona',
    },
    riderCta: 'Scarica la scheda tecnica (PDF)',
    riderPlaceholder: 'Il PDF attuale è un segnaposto.',
    contactTitle: 'Chiedi disponibilità',
    contactIntro: 'Dicci data e locale: ti rispondiamo con disponibilità e condizioni. Senza impegno.',
    whatsappCta: 'Scrivici su WhatsApp',
    callCta: 'Chiama',
    emailCta: 'Scrivi una email',
    form: {
      title: 'Preferisci un modulo?',
      hint: 'Il modulo non invia nulla al sito: prepara il messaggio e apre WhatsApp, dove lo confermi tu.',
      venue: 'Nome del locale',
      city: 'Città',
      date: 'Data che hai in mente',
      contact: 'Il tuo nome e un recapito',
      submit: 'Invia la richiesta su WhatsApp',
    },
  },
  gallery: {
    word: 'Foto',
    eyebrow: 'Galleria',
    title: ['Visti da', 'sotto il palco'],
    open: 'Ingrandisci la foto',
    close: 'Chiudi',
    previous: 'Foto precedente',
    next: 'Foto successiva',
  },
  social: {
    eyebrow: 'Social',
    title: ['Non perderti', 'la prossima'],
    text: 'Le date nuove escono prima sui social. Seguici e sei a posto.',
  },
  finalCta: {
    title: ['Ci vediamo', 'sotto il palco'],
    text: 'Vieni a sentirci. Oppure portaci nel tuo locale.',
  },
  archive: {
    title: ['Archivio', 'date'],
    intro: 'I palchi su cui siamo già saliti.',
    empty: 'L’archivio si riempie da solo: ogni data, il giorno dopo il concerto, finisce qui.',
  },
  /** Small interface texts shared by several components. */
  ui: {
    skip: 'Vai al contenuto',
    menu: 'Menu',
    close: 'Chiudi',
    navTitle: 'Naviga',
    contactsTitle: 'Contatti',
    barDates: 'Date',
    barBooking: 'Booking',
    quickActions: 'Azioni rapide',
    pauseMarquee: 'Ferma lo scorrimento',
    startsAt: 'Inizio ore',
    book: 'Prenota',
    cancelled: 'Annullato',
    postponed: 'Rinviato',
    opensMaps: '(apre Google Maps in una nuova scheda)',
    opensNewTab: '(apre una nuova scheda)',
    creditLabel: 'Sito realizzato da',
  },
} as const;
