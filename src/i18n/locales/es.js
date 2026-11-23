// Español (España).

const e = (person) => (person.gender === 'f' ? 'a' : 'o');
const NUM = ['ninguna', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho'];
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const rows = (d) => (d === 1 ? 'justo una fila' : `exactamente ${NUM[d]} filas`);
const cols = (d) => (d === 1 ? 'justo una columna' : `exactamente ${NUM[d]} columnas`);

export default {
  code: 'es',
  htmlLang: 'es',
  nativeName: 'Español',
  levels: { facil: 'Fácil', media: 'Media', dificil: 'Difícil', experto: 'Experto', maestro: 'Maestro' },
  rooms: {
    cocina: { name: 'Cocina', in: 'en la cocina' },
    salon: { name: 'Salón', in: 'en el salón' },
    biblioteca: { name: 'Biblioteca', in: 'en la biblioteca' },
    dormitorio: { name: 'Dormitorio', in: 'en el dormitorio' },
    comedor: { name: 'Comedor', in: 'en el comedor' },
    estudio: { name: 'Estudio', in: 'en el estudio' },
    vestibulo: { name: 'Vestíbulo', in: 'en el vestíbulo' },
    invernadero: { name: 'Invernadero', in: 'en el invernadero' },
    despacho: { name: 'Despacho', in: 'en el despacho' },
    desvan: { name: 'Desván', in: 'en el desván' },
    bodega: { name: 'Bodega', in: 'en la bodega' },
    galeria: { name: 'Galería', in: 'en la galería' },
  },
  objects: {
    silla: { noun: 'silla', a: 'una silla', on: 'en una silla' },
    sofa: { noun: 'sofá', a: 'un sofá', on: 'en un sofá' },
    cama: { noun: 'cama', a: 'una cama', on: 'en una cama' },
    planta: { noun: 'planta', a: 'una planta', on: 'en una planta' },
    estanteria: { noun: 'estantería', a: 'una estantería', on: 'en una estantería' },
    tele: { noun: 'televisión', a: 'una televisión', on: 'en una televisión' },
    piano: { noun: 'piano', a: 'un piano', on: 'en un piano' },
  },
  names: {},
  roles: {
    cook: 'la cocinera', gardener: 'el jardinero', doctor: 'la doctora', mechanic: 'el mecánico',
    painter: 'la pintora', butler: 'el mayordomo', grandmother: 'la abuela', teacher: 'el profesor',
    scientist: 'la científica', pilot: 'la piloto', firefighter: 'el bombero', lawyer: 'la abogada',
    millionaire: 'el millonario', countess: 'la condesa',
  },
  titles: [
    ['El misterio', 'de la última cena'],
    ['Muerte', 'en la casa de campo'],
    ['El secreto', 'del salón cerrado'],
    ['Un crimen', 'a la hora del té'],
    ['La noche', 'de la tormenta'],
    ['El caso', 'del reloj parado'],
    ['Sombras', 'en el desván'],
    ['La herencia', 'envenenada'],
    ['El último brindis', 'de la familia'],
    ['Silencio', 'en la mansión'],
  ],
  story: 'Esta noche alguien no salió con vida de la casa. Ordena a los implicados en el plano y descubre quién se quedó a solas con la víctima.',
  rules: [
    'Coloca a cada persona (los sospechosos y la víctima) en una casilla: en cada fila y en cada columna hay exactamente una persona.',
    'Se puede estar en sillas, sofás y camas, pero no en casillas con plantas, estanterías, televisiones o pianos.',
    '«Junto a» significa en una casilla contigua (arriba, abajo, a la izquierda o a la derecha) de la misma habitación.',
    'El norte está arriba. «Más al norte» significa en cualquier fila superior; «justo una fila», en la fila de al lado.',
    'Todas las pistas son ciertas. La persona culpable es la única que estaba a solas con la víctima en una habitación.',
  ],
  clue(type, { a, b, room, object, row, col, distance, count }) {
    switch (type) {
      case 'inRoom': return `${a.name} estaba ${room.in}.`;
      case 'notInRoom': return `${a.name} no estuvo ${room.in}.`;
      case 'onObject': return object.key === 'cama'
        ? `${a.name} estaba tumbad${e(a)} en una cama.`
        : `${a.name} estaba sentad${e(a)} ${object.on}.`;
      case 'besideObject': return `${a.name} estaba junto a ${object.a}.`;
      case 'onFloor': return `${a.name} no estaba ni sentad${e(a)} ni tumbad${e(a)}: su casilla no tenía muebles.`;
      case 'row': return `${a.name} estaba en la fila ${row}.`;
      case 'col': return `${a.name} estaba en la columna ${col}.`;
      case 'edge': return `${a.name} estaba pegad${e(a)} a una pared exterior de la casa.`;
      case 'notEdge': return `${a.name} no tocaba ninguna pared exterior de la casa.`;
      case 'corner': return `${a.name} estaba en un rincón de la casa.`;
      case 'north': return `${a.name} estaba más al norte que ${b.name}.`;
      case 'south': return `${a.name} estaba más al sur que ${b.name}.`;
      case 'west': return `${a.name} estaba más al oeste que ${b.name}.`;
      case 'east': return `${a.name} estaba más al este que ${b.name}.`;
      case 'northBy': return `${a.name} estaba ${rows(distance)} más al norte que ${b.name}.`;
      case 'southBy': return `${a.name} estaba ${rows(distance)} más al sur que ${b.name}.`;
      case 'westBy': return `${a.name} estaba ${cols(distance)} más al oeste que ${b.name}.`;
      case 'eastBy': return `${a.name} estaba ${cols(distance)} más al este que ${b.name}.`;
      case 'sameRoom': return `${a.name} y ${b.name} estaban en la misma habitación.`;
      case 'differentRoom': return `${a.name} y ${b.name} estaban en habitaciones distintas.`;
      case 'diagonal': return `${a.name} y ${b.name} estaban en casillas que se tocan en diagonal.`;
      case 'roomCount':
        if (count === 0) return `Nadie estuvo ${room.in}.`;
        if (count === 1) return `${cap(room.in)} había una sola persona.`;
        return `${cap(room.in)} había exactamente ${NUM[count]} personas.`;
      case 'aloneInRoom': return `${a.name} estaba sol${e(a)} en su habitación.`;
      case 'emptyRooms':
        if (count === 0) return 'Ninguna habitación quedó vacía.';
        if (count === 1) return 'Exactamente una habitación quedó vacía.';
        return `Exactamente ${NUM[count]} habitaciones quedaron vacías.`;
      default: return '';
    }
  },
  ui: {
    metaTitleHome: 'Murdokuer — un misterio en cada página',
    metaDescHome: 'Un pequeño misterio para imprimir o jugar en línea.',
    metaTitlePlay: 'Murdokuer — juega en línea',
    metaDescPlay: 'Resuelve en línea un misterio de Murdokuer: coloca a los implicados en el plano y descubre quién es culpable.',
    playDocTitle: (title) => `${title} — Murdokuer`,
    homeAria: 'Murdokuer, inicio',
    language: 'Idioma',
    headerNote: 'PARA MENTES CURIOSAS',
    footerTag: 'HECHO PARA DESCONECTAR Y DEDUCIR.',

    eyebrow: 'EL PASATIEMPO DETECTIVESCO',
    heroHtml: 'Un misterio en<br /><em>cada página.</em>',
    heroText: 'Un crimen, una casa llena de sospechosos y un plano por resolver. Afila el lápiz: el siguiente caso te está esperando.',
    playButton: 'Jugar en línea',
    playButtonNote: 'sin imprimir nada',
    ctaOr: 'o descarga un caso para imprimir',
    levelsAria: 'Descargar un caso por dificultad',
    downloadNote: 'PDF GRATIS · CASO + SOLUCIÓN · ¿VARIOS?',
    downloadNoteLink: 'PREPARA UN CUADERNILLO ↓',
    preparing: 'Preparando el caso…',
    caseReady: (level) => `Tu nuevo caso (dificultad ${level}) está listo.`,
    pdfError: 'No se ha podido generar el PDF. Inténtalo de nuevo.',

    bookletKicker: 'PARA IMPRIMIR VARIOS DE UNA VEZ',
    bookletTitle: 'Prepara un cuadernillo',
    bookletIntro: 'Varios casos en un solo PDF. Cada caso ocupa una página y su solución la siguiente, así que al imprimir a doble cara la solución queda en el reverso.',
    tipPrint: 'Imprime a doble cara, volteando por el borde corto.',
    tipLoose: 'Cada hoja es un caso completo: se puede repartir suelta.',
    tipOnline: 'Cada caso trae su enlace para jugarlo también en línea.',
    bookletLevelLegend: '1. Dificultad',
    bookletCountLabel: '2. Número de casos',
    countMinus: 'Un caso menos',
    countPlus: 'Un caso más',
    countRange: 'Número de casos',
    mixedLabel: 'Mezcla',
    mixedDetail: 'de fácil a maestro',
    maxShort: (n) => `máx. ${n}`,
    limitRange: (min, max) => `Entre ${min} y ${max} casos para este nivel.`,
    limitAdjusted: (n) => `Ajustado a ${n}: es el máximo para este nivel.`,
    limitMax: (n) => `El máximo para este nivel es ${n}.`,
    summaryCases: (n) => plural(n, 'caso', 'casos'),
    mixItem: (level, n) => `${level}: ${n}`,
    summaryRest: (pages, sheets, estimate) => ` · ${pages} páginas en ${plural(sheets, 'hoja', 'hojas')} a doble cara · listo en ${estimate}`,
    estimate: (s) => (s < 3 ? 'unos segundos' : s < 60 ? `unos ${Math.ceil(s / 5) * 5} s` : 'más de un minuto'),
    bookletSubmit: 'Descargar cuadernillo',
    generating: (done, total) => `Generando casos: ${done} de ${total} listos…`,
    assembling: 'Montando el PDF…',
    assemblingPages: (done, total) => `Montando el PDF: página ${done} de ${total}…`,
    cancel: 'Cancelar',
    bookletDone: (cases, pages, seconds) => `Cuadernillo descargado: ${plural(cases, 'caso', 'casos')}, ${pages} páginas (${plural(seconds, 'segundo', 'segundos')}).`,
    bookletCancelled: 'Cuadernillo cancelado.',
    bookletError: 'No se ha podido preparar el cuadernillo. Inténtalo de nuevo con menos casos.',
    fileBooklet: (level, n) => `murdokuer-cuadernillo-${level}-${n}-casos.pdf`,
    fileCase: (level, number) => `murdokuer-caso-${level}-${number}.pdf`,

    previewKicker: 'UN VISTAZO AL INTERIOR',
    previewTitle: 'Tu próximo caso',
    previewLabel: 'VISTA PREVIA',
    paperAria: 'Ejemplo de la primera página del PDF',
    caseLabel: 'EL CASO',
    rulesHeading: '01 / LAS REGLAS',
    cluesHeading: '02 / LAS PISTAS',
    boardHeading: 'EL PLANO',
    thinkCalm: 'PIENSA CON CALMA',
    peopleHeading: '03 / LOS IMPLICADOS',
    paperFooter: 'MURDOKUER · EL ARTE DE DEDUCIR',
    previewCaption: 'Cada descarga genera un caso nuevo, listo para imprimir.',
    playThisCase: 'Jugar este caso en línea →',
    caseNumber: (n) => `EXPEDIENTE Nº ${n}`,
    levelLine: (level, size) => `DIFICULTAD ${level} · ${size} × ${size}`,
    boardAria: (size, rooms) => `Plano de ${size} por ${size} casillas con ${rooms} habitaciones.`,
    victimTag: 'víctima',

    backToPrint: '← CASOS PARA IMPRIMIR',
    playEyebrow: 'JUEGA EN LÍNEA',
    loadingTitle: 'Preparando el caso…',
    timerAria: 'Tiempo de juego',
    newCase: 'NUEVO CASO',
    levelPickerAria: 'Nuevo caso por dificultad',
    step1: '1. ELIGE A QUIÉN COLOCAR',
    keysHelp: (n) => `Teclas 1–${n} · X para descartar`,
    toolsAria: 'Personas y herramientas',
    step2: '2. TOCA UNA CASILLA DEL PLANO',
    boardAriaPlay: 'Plano de la casa',
    cluesTitle: 'LAS PISTAS',
    assist: 'Marcar pistas incumplidas',
    cluesNote: 'Toca una pista para tacharla cuando ya la hayas usado.',
    undo: '↶ Deshacer',
    check: '✓ Comprobar',
    hint: '💡 Ayuda',
    restart: '⟲ Empezar de nuevo',
    reveal: '👁 Ver solución',
    pdfThis: '↓ PDF de este caso',
    share: '🔗 Copiar enlace',
    rulesTitle: 'LAS REGLAS',
    verdictEyebrow: 'TODO ENCAJA',
    verdictQuestion: '¿Quién es culpable?',
    verdictPrompt: 'Las piezas están en su sitio. Señala a la persona que estaba a solas con la víctima.',
    keepLooking: 'Seguir mirando',
    markTool: 'Descartar',
    markNote: 'tacha casillas',
    unplaced: 'sin colocar',
    toolTitle: (name, role, victim, where) => `${name}, ${role}${victim ? ' (víctima)' : ''} · ${where}`,
    cellAria: ({ cell, room, object, person, discarded }) => `${cell}, ${room}${object ? `, ${object}` : ''}${person ? `: ${person}` : discarded ? ', descartada' : ''}`,
    markMode: 'Modo descartar: toca casillas para tacharlas (también con clic derecho).',
    placing: (name) => `Colocando a ${name}. Toca su casilla en el plano.`,
    unplacedAgain: (name) => `${name} vuelve a estar sin colocar.`,
    placedAt: (name, cell) => `${name} → ${cell}.`,
    err_locked: 'Esa persona ya está confirmada por una ayuda.',
    err_lockedCell: 'Esa casilla ya está confirmada por una ayuda.',
    err_blocked: 'Nadie puede estar en esa casilla: el mueble lo impide.',
    duplicates: 'Todas las personas están en el plano, pero hay filas o columnas repetidas.',
    mismatch: 'Todas las personas están en el plano, pero algo no encaja con las pistas. Revisa las marcadas en rojo.',
    wrongAccuse: (name, victim) => `No: ${name} no estaba a solas con ${victim}. Mira quién comparte habitación con la víctima.`,
    solvedTitle: '¡Caso resuelto!',
    solvedText: ({ murderer, role, victim, roomIn, time, extras }) => `${murderer}, ${role}, estaba a solas con ${victim} ${roomIn}. Tiempo: ${time} · ${extras}.`,
    extraHints: (n) => plural(n, 'ayuda', 'ayudas'),
    extraChecks: (n) => plural(n, 'comprobación', 'comprobaciones'),
    noHelp: 'sin ayudas',
    anotherCase: (level) => `Otro caso (${level})`,
    solvedStatus: (time) => `Caso resuelto en ${time}.`,
    undone: 'Movimiento deshecho.',
    nothingPlaced: 'Todavía no has colocado a nadie.',
    allCorrect: 'Por ahora, todas las personas colocadas están en su sitio.',
    wrongCount: (n) => (n === 1 ? 'Hay 1 persona mal colocada (en rojo).' : `Hay ${n} personas mal colocadas (en rojo).`),
    hintText: (name, cell) => `Ayuda: ${name} está en ${cell}.`,
    noHintNeeded: 'No hace falta ninguna ayuda: ya está todo colocado.',
    confirmRestart: '¿Borrar todo lo colocado y empezar este caso de nuevo?',
    restarted: 'Caso reiniciado.',
    confirmReveal: '¿Seguro que quieres ver la solución? La partida terminará.',
    solutionText: ({ murderer, role, victim, roomIn }) => `Solución: ${murderer}, ${role}, estaba a solas con ${victim} ${roomIn}.`,
    pdfPreparing: 'Preparando el PDF…',
    pdfDone: 'PDF descargado.',
    linkCopied: 'Enlace copiado: quien lo abra jugará este mismo caso.',
    shareLink: (url) => `Comparte este enlace: ${url}`,
    loadError: 'No se ha podido generar el caso. Prueba otra vez.',
    alreadySolved: 'Este caso ya lo resolviste. Puedes empezarlo de nuevo o elegir otro.',
    resumed: 'Partida recuperada: sigue donde lo dejaste.',
    startWith: (name) => `Empieza colocando a ${name}, o a quien prefieras.`,
    confirmLeave: '¿Dejar este caso y empezar uno nuevo? Tu avance se queda guardado en este navegador.',

    pdfPlayOnline: '¿PREFIERES JUGAR EN PANTALLA?',
    pdfCaseHeading: (level, size) => `DIFICULTAD ${level} · ${size} × ${size} · CONFIDENCIAL`,
    pdfSolutionHeading: 'SOLUCIONARIO · NO LEER ANTES DE TIEMPO',
    pdfSolution: 'LA SOLUCIÓN',
    pdfCulprit: () => 'CULPABLE',
    pdfCulpritLine: 'LA PERSONA CULPABLE ES:',
    pdfExplanation: (murderer, victim, roomIn) => `${murderer} era la única persona a solas con ${victim} ${roomIn}.`,
    pdfWhere: 'DÓNDE ESTABA CADA PERSONA',
    pdfWhereDetail: ({ name, victim, room, on }) => `${name}${victim ? ' (víctima)' : ''} · ${room}${on ? `, ${on}` : ''}`,
    pdfSolvedBoard: 'EL PLANO RESUELTO',
    pdfLegend: 'Marco verde: culpable · Marco rojo: víctima',
    pdfStatement: (i, n) => `CASO ${i} / ${n} · ENUNCIADO`,
    pdfAnswer: (i, n) => `CASO ${i} / ${n} · SOLUCIÓN`,
    pdfDocTitle: (n) => `Murdokuer · ${plural(n, 'caso', 'casos')}`,
  },
};
