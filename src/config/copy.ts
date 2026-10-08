/**
 * Site copy, grouped by section. Italian, short sentences.
 * Rules: no song lyrics (not even one line), no invented numbers.
 */
export const copy = {
  hero: {
    claim: 'Due ore di rock’n’roll a tutto volume.',
    ctaFans: 'Prossime date',
    ctaBooking: 'Porta Thundra nel tuo locale',
    nextLabel: 'Prossima data',
  },
  nextShow: {
    eyebrow: 'Prossimo concerto',
    title: ['Segnatelo.', 'Poi vieni.'],
    timeUnknown: 'Orario da confermare',
    calendar: 'Aggiungi al calendario',
    directions: 'Come arrivare',
    today: 'È stasera. Ci vediamo lì.',
  },
  tour: {
    eyebrow: 'Tour',
    title: ['Date', 'live'],
    intro: 'Data, locale, città. Il resto lo diciamo dal palco.',
    all: 'Tutte le date',
    archive: 'Date passate',
    emptyTitle: 'Nuove date in arrivo',
    emptyText: 'Le annunciamo prima su Instagram. Seguici e tieniti libero.',
    emptyCta: 'Seguici su Instagram',
  },
  live: {
    eyebrow: 'Live',
    title: ['Dal vivo,', 'senza filtri'],
    intro: 'Le parole contano poco. Guarda come suona una serata con Thundra.',
    comingSoon: 'I primi video dal palco stanno arrivando. Nel frattempo seguici sui social.',
    play: 'Riproduci il video',
    consent: 'Il video si carica da YouTube solo dopo il tuo tocco.',
  },
  reviews: {
    eyebrow: 'Dicono di noi',
    title: ['Chi c’era', 'lo racconta'],
  },
  band: {
    eyebrow: 'La band',
    title: ['Cinque.', 'Forte.'],
    text: [
      'Cinque musicisti e una fissazione in comune: gli AC/DC.',
      'Li suoniamo come vanno suonati: forte, precisi, senza fronzoli. I pantaloncini corti restano facoltativi.',
    ],
  },
  setlist: {
    eyebrow: 'Scaletta tipo',
    title: ['I pezzi', 'che aspetti'],
    intro: 'I classici che tutti vogliono sentire, più qualche chicca per chi i dischi li ha consumati.',
  },
  booking: {
    eyebrow: 'Per gestori e organizzatori',
    title: ['Porta Thundra', 'nel tuo locale'],
    intro:
      'Uno show completo dedicato agli AC/DC, dal primo riff all’ultimo bis. Noi pensiamo al palco. Tu pensi al bancone.',
    benefitsTitle: 'Cosa ottiene il locale',
    benefits: [
      {
        title: 'Sala piena',
        text: 'Il repertorio degli AC/DC lo conoscono tutti: richiama pubblico di ogni età, dai fan storici a chi viene per curiosità.',
      },
      {
        title: 'Consumazioni',
        text: 'Uno show lungo e coinvolgente tiene le persone nel locale per tutta la serata.',
      },
      {
        title: 'Una serata che si ricorda',
        text: 'Il tipo di concerto che i clienti raccontano il giorno dopo, e per cui tornano.',
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
    contactTitle: 'Chiedi una data',
    contactIntro:
      'Scrivici su WhatsApp o chiamaci: rispondiamo con disponibilità e condizioni. Nessun impegno.',
    whatsappCta: 'Scrivici su WhatsApp',
    callCta: 'Chiama',
    emailCta: 'Scrivi una email',
    form: {
      title: 'Oppure compila qui',
      hint: 'Il modulo non invia nulla al sito: prepara il messaggio e apre WhatsApp, dove lo confermi tu.',
      venue: 'Nome del locale',
      city: 'Città',
      date: 'Data ipotizzata',
      contact: 'Il tuo nome e un recapito',
      submit: 'Apri WhatsApp con il messaggio',
    },
    pageCta: 'Tutto per i gestori',
  },
  gallery: {
    eyebrow: 'Galleria',
    title: ['Visti da', 'sotto il palco'],
    open: 'Ingrandisci la foto',
    close: 'Chiudi',
    previous: 'Foto precedente',
    next: 'Foto successiva',
  },
  social: {
    eyebrow: 'Social',
    title: ['Seguici'],
    text: 'Date nuove, dietro le quinte e video dal palco: sui social arrivano prima.',
  },
  finalCta: {
    title: ['Ci vediamo', 'sotto il palco'],
    text: 'Fan o gestore, la strada è la stessa: scegli una data oppure creane una.',
  },
  archive: {
    title: ['Archivio', 'date'],
    intro: 'I palchi su cui siamo già saliti.',
    empty: 'L’archivio si riempie da solo: ogni data, il giorno dopo il concerto, finisce qui.',
  },
  placeholderBadge: 'Immagine segnaposto',
} as const;
