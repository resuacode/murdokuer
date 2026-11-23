// Français (France). Vouvoiement, espace insécable avant « : ? ! » et élision de « que ».

const NB = ' ';
const e = (person) => (person.gender === 'f' ? 'e' : '');
const NUM = ['aucune', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit'];
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
// « que » s'élide devant une voyelle ou un h muet : « qu'Hugo », « qu'Inès ».
const que = (name) => (/^[aeiouyhàâäéèêëîïôöûüAEIOUYHÀÂÉÈÊÎÔÛ]/.test(name) ? `qu’${name}` : `que ${name}`);
const rows = (d) => (d === 1 ? 'exactement une ligne' : `exactement ${NUM[d]} lignes`);
const cols = (d) => (d === 1 ? 'exactement une colonne' : `exactement ${NUM[d]} colonnes`);

export default {
  code: 'fr',
  htmlLang: 'fr',
  nativeName: 'Français',
  levels: { facil: 'Facile', media: 'Moyen', dificil: 'Difficile', experto: 'Expert', maestro: 'Maître' },
  rooms: {
    cocina: { name: 'Cuisine', in: 'dans la cuisine' },
    salon: { name: 'Salon', in: 'dans le salon' },
    biblioteca: { name: 'Bibliothèque', in: 'dans la bibliothèque' },
    dormitorio: { name: 'Chambre', in: 'dans la chambre' },
    comedor: { name: 'Salle à manger', in: 'dans la salle à manger' },
    estudio: { name: 'Bureau', in: 'dans le bureau' },
    vestibulo: { name: 'Entrée', in: 'dans l’entrée' },
    invernadero: { name: 'Serre', in: 'dans la serre' },
    despacho: { name: 'Cabinet', in: 'dans le cabinet' },
    desvan: { name: 'Grenier', in: 'dans le grenier' },
    bodega: { name: 'Cave', in: 'dans la cave' },
    galeria: { name: 'Galerie', in: 'dans la galerie' },
  },
  objects: {
    silla: { noun: 'chaise', a: 'une chaise', of: 'd’une chaise', on: 'sur une chaise' },
    sofa: { noun: 'canapé', a: 'un canapé', of: 'd’un canapé', on: 'sur un canapé' },
    cama: { noun: 'lit', a: 'un lit', of: 'd’un lit', on: 'sur un lit' },
    planta: { noun: 'plante', a: 'une plante', of: 'd’une plante', on: 'sur une plante' },
    estanteria: { noun: 'étagère', a: 'une étagère', of: 'd’une étagère', on: 'sur une étagère' },
    tele: { noun: 'télévision', a: 'une télévision', of: 'd’une télévision', on: 'sur une télévision' },
    piano: { noun: 'piano', a: 'un piano', of: 'd’un piano', on: 'sur un piano' },
  },
  names: { elena: 'Hélène', ines: 'Inès', marcos: 'Marc', victor: 'Victor', rosalia: 'Rosalie' },
  roles: {
    cook: 'la cuisinière', gardener: 'le jardinier', doctor: 'la médecin', mechanic: 'le mécanicien',
    painter: 'la peintre', butler: 'le majordome', grandmother: 'la grand-mère', teacher: 'le professeur',
    scientist: 'la scientifique', pilot: 'la pilote', firefighter: 'le pompier', lawyer: 'l’avocate',
    millionaire: 'le millionnaire', countess: 'la comtesse',
  },
  titles: [
    ['Le mystère', 'du dernier dîner'],
    ['Mort', 'à la maison de campagne'],
    ['Le secret', 'du salon fermé à clé'],
    ['Un crime', 'à l’heure du thé'],
    ['La nuit', 'de l’orage'],
    ['L’affaire', 'de l’horloge arrêtée'],
    ['Des ombres', 'au grenier'],
    ['L’héritage', 'empoisonné'],
    ['Le dernier toast', 'de la famille'],
    ['Silence', 'au manoir'],
  ],
  story: 'Cette nuit, quelqu’un n’est pas sorti vivant de la maison. Placez les personnes impliquées sur le plan et découvrez qui s’est retrouvé seul avec la victime.',
  rules: [
    `Placez chaque personne (les suspects et la victime) sur une case${NB}: chaque ligne et chaque colonne contient exactement une personne.`,
    'On peut se trouver sur une chaise, un canapé ou un lit, mais pas sur une case occupée par une plante, une étagère, une télévision ou un piano.',
    `«${NB}À côté de${NB}» signifie sur une case voisine (au-dessus, en dessous, à gauche ou à droite) dans la même pièce.`,
    `Le nord est en haut. «${NB}Plus au nord${NB}» signifie sur n’importe quelle ligne plus haute${NB}; «${NB}exactement une ligne${NB}», sur la ligne voisine.`,
    'Tous les indices sont vrais. La personne coupable est la seule qui se trouvait seule avec la victime dans une pièce.',
  ],
  clue(type, { a, b, room, object, row, col, distance, count }) {
    switch (type) {
      case 'inRoom': return `${a.name} était ${room.in}.`;
      case 'notInRoom': return `${a.name} n’était pas ${room.in}.`;
      case 'onObject': return object.key === 'cama'
        ? `${a.name} était allongé${e(a)} sur un lit.`
        : `${a.name} était assis${e(a)} ${object.on}.`;
      case 'besideObject': return `${a.name} était à côté ${object.of}.`;
      case 'onFloor': return `${a.name} n’était ni assis${e(a)} ni allongé${e(a)}${NB}: il n’y avait aucun meuble sur sa case.`;
      case 'row': return `${a.name} était sur la ligne ${row}.`;
      case 'col': return `${a.name} était dans la colonne ${col}.`;
      case 'edge': return `${a.name} était contre un mur extérieur de la maison.`;
      case 'notEdge': return `${a.name} ne touchait aucun mur extérieur de la maison.`;
      case 'corner': return `${a.name} était dans un coin de la maison.`;
      case 'north': return `${a.name} était plus au nord ${que(b.name)}.`;
      case 'south': return `${a.name} était plus au sud ${que(b.name)}.`;
      case 'west': return `${a.name} était plus à l’ouest ${que(b.name)}.`;
      case 'east': return `${a.name} était plus à l’est ${que(b.name)}.`;
      case 'northBy': return `${a.name} était ${rows(distance)} plus au nord ${que(b.name)}.`;
      case 'southBy': return `${a.name} était ${rows(distance)} plus au sud ${que(b.name)}.`;
      case 'westBy': return `${a.name} était ${cols(distance)} plus à l’ouest ${que(b.name)}.`;
      case 'eastBy': return `${a.name} était ${cols(distance)} plus à l’est ${que(b.name)}.`;
      case 'sameRoom': return `${a.name} et ${b.name} étaient dans la même pièce.`;
      case 'differentRoom': return `${a.name} et ${b.name} étaient dans des pièces différentes.`;
      case 'diagonal': return `${a.name} et ${b.name} étaient sur des cases qui se touchent en diagonale.`;
      case 'roomCount':
        if (count === 0) return `Personne n’était ${room.in}.`;
        if (count === 1) return `Il n’y avait qu’une seule personne ${room.in}.`;
        return `Il y avait exactement ${NUM[count]} personnes ${room.in}.`;
      case 'aloneInRoom': return `${a.name} était seul${e(a)} dans sa pièce.`;
      case 'emptyRooms':
        if (count === 0) return 'Aucune pièce n’était vide.';
        if (count === 1) return 'Exactement une pièce était vide.';
        return `Exactement ${NUM[count]} pièces étaient vides.`;
      default: return '';
    }
  },
  ui: {
    metaTitleHome: 'Murdokuer — un mystère à chaque page',
    metaDescHome: 'Une petite énigme policière à imprimer ou à jouer en ligne.',
    metaTitlePlay: 'Murdokuer — jouer en ligne',
    metaDescPlay: 'Résolvez en ligne une énigme Murdokuer\u00a0: placez les personnes impliquées sur le plan et trouvez le coupable.',
    playDocTitle: (title) => `${title} — Murdokuer`,
    homeAria: 'Murdokuer, accueil',
    language: 'Langue',
    headerNote: 'POUR LES ESPRITS CURIEUX',
    footerTag: 'CONÇU POUR DÉCONNECTER ET DÉDUIRE.',

    eyebrow: 'LE CASSE-TÊTE POLICIER',
    heroHtml: 'Un mystère à<br /><em>chaque page.</em>',
    heroText: 'Un crime, une maison pleine de suspects et un plan à résoudre. Taillez votre crayon\u00a0: la prochaine affaire vous attend.',
    playButton: 'Jouer en ligne',
    playButtonNote: 'sans rien imprimer',
    ctaOr: 'ou téléchargez une affaire à imprimer',
    levelsAria: 'Télécharger une affaire par niveau',
    downloadNote: `PDF GRATUIT · AFFAIRE + SOLUTION · PLUSIEURS${NB}?`,
    downloadNoteLink: 'PRÉPAREZ UN CAHIER ↓',
    preparing: 'Préparation de l’affaire…',
    caseReady: (level) => `Votre nouvelle affaire (niveau ${level}) est prête.`,
    pdfError: 'Impossible de créer le PDF. Veuillez réessayer.',

    bookletKicker: 'POUR EN IMPRIMER PLUSIEURS D’UN COUP',
    bookletTitle: 'Préparez un cahier',
    bookletIntro: 'Plusieurs affaires dans un seul PDF. Chaque affaire occupe une page et sa solution la suivante\u00a0: en imprimant en recto verso, la solution se retrouve au verso.',
    tipPrint: 'Imprimez en recto verso, reliure sur le bord court.',
    tipLoose: 'Chaque feuille est une affaire complète\u00a0: on peut la distribuer seule.',
    tipOnline: 'Chaque affaire comporte son lien pour y jouer aussi en ligne.',
    bookletLevelLegend: '1. Niveau',
    bookletCountLabel: '2. Nombre d’affaires',
    countMinus: 'Une affaire de moins',
    countPlus: 'Une affaire de plus',
    countRange: 'Nombre d’affaires',
    mixedLabel: 'Mélange',
    mixedDetail: 'de facile à maître',
    maxShort: (n) => `max. ${n}`,
    limitRange: (min, max) => `Entre ${min} et ${max} affaires pour ce niveau.`,
    limitAdjusted: (n) => `Ramené à ${n}${NB}: c’est le maximum pour ce niveau.`,
    limitMax: (n) => `Le maximum pour ce niveau est de ${n}.`,
    summaryCases: (n) => plural(n, 'affaire', 'affaires'),
    mixItem: (level, n) => `${level}${NB}: ${n}`,
    summaryRest: (pages, sheets, estimate) => ` · ${pages} pages sur ${plural(sheets, 'feuille', 'feuilles')} en recto verso · prêt en ${estimate}`,
    estimate: (s) => (s < 3 ? 'quelques secondes' : s < 60 ? `environ ${Math.ceil(s / 5) * 5}${NB}s` : 'plus d’une minute'),
    bookletSubmit: 'Télécharger le cahier',
    generating: (done, total) => `Création des affaires${NB}: ${done} sur ${total} prêtes…`,
    assembling: 'Assemblage du PDF…',
    assemblingPages: (done, total) => `Assemblage du PDF${NB}: page ${done} sur ${total}…`,
    cancel: 'Annuler',
    bookletDone: (cases, pages, seconds) => `Cahier téléchargé${NB}: ${plural(cases, 'affaire', 'affaires')}, ${pages} pages (${plural(seconds, 'seconde', 'secondes')}).`,
    bookletCancelled: 'Cahier annulé.',
    bookletError: 'Impossible de préparer le cahier. Réessayez avec moins d’affaires.',
    fileBooklet: (level, n) => `murdokuer-cahier-${level}-${n}-affaires.pdf`,
    fileCase: (level, number) => `murdokuer-affaire-${level}-${number}.pdf`,

    previewKicker: 'UN COUP D’ŒIL À L’INTÉRIEUR',
    previewTitle: 'Votre prochaine affaire',
    previewLabel: 'APERÇU',
    paperAria: 'Exemple de la première page du PDF',
    caseLabel: 'L’AFFAIRE',
    rulesHeading: '01 / LES RÈGLES',
    cluesHeading: '02 / LES INDICES',
    boardHeading: 'LE PLAN',
    thinkCalm: 'PRENEZ VOTRE TEMPS',
    peopleHeading: '03 / LES PERSONNES IMPLIQUÉES',
    paperFooter: 'MURDOKUER · L’ART DE LA DÉDUCTION',
    previewCaption: 'Chaque téléchargement crée une nouvelle affaire, prête à imprimer.',
    playThisCase: 'Jouer cette affaire en ligne →',
    caseNumber: (n) => `DOSSIER N° ${n}`,
    levelLine: (level, size) => `NIVEAU ${level} · ${size} × ${size}`,
    boardAria: (size, rooms) => `Plan de ${size} cases sur ${size} avec ${rooms} pièces.`,
    victimTag: 'victime',

    backToPrint: '← AFFAIRES À IMPRIMER',
    playEyebrow: 'JOUER EN LIGNE',
    loadingTitle: 'Préparation de l’affaire…',
    timerAria: 'Temps de jeu',
    newCase: 'NOUVELLE AFFAIRE',
    levelPickerAria: 'Nouvelle affaire par niveau',
    step1: '1. CHOISISSEZ QUI PLACER',
    keysHelp: (n) => `Touches 1–${n} · X pour écarter`,
    toolsAria: 'Personnes et outils',
    step2: '2. TOUCHEZ UNE CASE DU PLAN',
    boardAriaPlay: 'Plan de la maison',
    cluesTitle: 'LES INDICES',
    assist: 'Signaler les indices non respectés',
    cluesNote: 'Touchez un indice pour le barrer une fois utilisé.',
    undo: '↶ Annuler',
    check: '✓ Vérifier',
    hint: '💡 Aide',
    restart: '⟲ Recommencer',
    reveal: '👁 Voir la solution',
    pdfThis: '↓ PDF de cette affaire',
    share: '🔗 Copier le lien',
    rulesTitle: 'LES RÈGLES',
    verdictEyebrow: 'TOUT CONCORDE',
    verdictQuestion: `Qui est coupable${NB}?`,
    verdictPrompt: 'Toutes les pièces sont en place. Désignez la personne qui se trouvait seule avec la victime.',
    keepLooking: 'Continuer à chercher',
    markTool: 'Écarter',
    markNote: 'barre des cases',
    unplaced: 'à placer',
    toolTitle: (name, role, victim, where) => `${name}, ${role}${victim ? ' (victime)' : ''} · ${where}`,
    cellAria: ({ cell, room, object, person, discarded }) => `${cell}, ${room}${object ? `, ${object}` : ''}${person ? `${NB}: ${person}` : discarded ? ', écartée' : ''}`,
    markMode: `Mode écarter${NB}: touchez des cases pour les barrer (ou clic droit).`,
    placing: (name) => `Placement de ${name}. Touchez sa case sur le plan.`,
    unplacedAgain: (name) => `${name} n’est plus sur le plan.`,
    placedAt: (name, cell) => `${name} → ${cell}.`,
    err_locked: 'Cette personne a déjà été confirmée par une aide.',
    err_lockedCell: 'Cette case a déjà été confirmée par une aide.',
    err_blocked: `Personne ne peut se trouver sur cette case${NB}: le meuble l’en empêche.`,
    duplicates: 'Tout le monde est sur le plan, mais certaines lignes ou colonnes sont en double.',
    mismatch: 'Tout le monde est sur le plan, mais quelque chose ne colle pas avec les indices. Vérifiez ceux en rouge.',
    wrongAccuse: (name, victim, gender) => `Non${NB}: ${name} n’était pas seul${gender === 'f' ? 'e' : ''} avec ${victim}. Regardez qui partage la pièce de la victime.`,
    solvedTitle: `Affaire résolue${NB}!`,
    solvedText: ({ murderer, role, victim, roomIn, time, extras, gender }) => `${murderer}, ${role}, était seul${gender === 'f' ? 'e' : ''} avec ${victim} ${roomIn}. Temps${NB}: ${time} · ${extras}.`,
    extraHints: (n) => plural(n, 'aide', 'aides'),
    extraChecks: (n) => plural(n, 'vérification', 'vérifications'),
    noHelp: 'sans aide',
    anotherCase: (level) => `Une autre affaire (${level})`,
    solvedStatus: (time) => `Affaire résolue en ${time}.`,
    undone: 'Coup annulé.',
    nothingPlaced: 'Vous n’avez encore placé personne.',
    allCorrect: 'Pour l’instant, toutes les personnes placées sont à la bonne place.',
    wrongCount: (n) => (n === 1 ? '1 personne est mal placée (en rouge).' : `${n} personnes sont mal placées (en rouge).`),
    hintText: (name, cell) => `Aide${NB}: ${name} est en ${cell}.`,
    noHintNeeded: `Aucune aide nécessaire${NB}: tout le monde est déjà placé.`,
    confirmRestart: `Effacer tout ce qui est placé et recommencer cette affaire${NB}?`,
    restarted: 'Affaire recommencée.',
    confirmReveal: `Voulez-vous vraiment voir la solution${NB}? La partie sera terminée.`,
    solutionText: ({ murderer, role, victim, roomIn, gender }) => `Solution${NB}: ${murderer}, ${role}, était seul${gender === 'f' ? 'e' : ''} avec ${victim} ${roomIn}.`,
    pdfPreparing: 'Préparation du PDF…',
    pdfDone: 'PDF téléchargé.',
    linkCopied: `Lien copié${NB}: la personne qui l’ouvrira jouera cette même affaire.`,
    shareLink: (url) => `Partagez ce lien${NB}: ${url}`,
    loadError: 'Impossible de créer l’affaire. Réessayez.',
    alreadySolved: 'Vous avez déjà résolu cette affaire. Vous pouvez la recommencer ou en choisir une autre.',
    resumed: `Partie récupérée${NB}: reprenez où vous en étiez.`,
    startWith: (name) => `Commencez par placer ${name}, ou qui vous voulez.`,
    confirmLeave: `Quitter cette affaire et en commencer une autre${NB}? Votre progression reste enregistrée dans ce navigateur.`,

    pdfPlayOnline: `VOUS PRÉFÉREZ JOUER À L’ÉCRAN${NB}?`,
    pdfCaseHeading: (level, size) => `NIVEAU ${level} · ${size} × ${size} · CONFIDENTIEL`,
    pdfSolutionHeading: 'SOLUTION · À NE PAS LIRE TROP TÔT',
    pdfSolution: 'LA SOLUTION',
    pdfCulprit: () => 'COUPABLE',
    pdfCulpritLine: `LA PERSONNE COUPABLE EST${NB}:`,
    pdfExplanation: (murderer, victim, roomIn) => `${murderer} était la seule personne à se trouver seule avec ${victim} ${roomIn}.`,
    pdfWhere: 'OÙ SE TROUVAIT CHAQUE PERSONNE',
    pdfWhereDetail: ({ name, victim, room, on }) => `${name}${victim ? ' (victime)' : ''} · ${room}${on ? `, ${on}` : ''}`,
    pdfSolvedBoard: 'LE PLAN RÉSOLU',
    pdfLegend: `Cadre vert${NB}: coupable · Cadre rouge${NB}: victime`,
    pdfStatement: (i, n) => `AFFAIRE ${i} / ${n} · ÉNONCÉ`,
    pdfAnswer: (i, n) => `AFFAIRE ${i} / ${n} · SOLUTION`,
    pdfDocTitle: (n) => `Murdokuer · ${plural(n, 'affaire', 'affaires')}`,
  },
};
