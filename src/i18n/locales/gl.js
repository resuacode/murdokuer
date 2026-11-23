// Galego (norma da Real Academia Galega). Termos revisados no Dicionario da RAG:
// «cela» (cada cadro dunha cuadrícula), «faiado», «estante», «leste», «ligazón», «vítima», «invernadoiro».
// En galego non se usa a preposición «a» diante do complemento directo de persoa («colocar Alba»)
// e os signos de apertura de interrogación e exclamación omítense.

const e = (person) => (person.gender === 'f' ? 'a' : 'o');
const NUM = ['ningunha', 'unha', 'dúas', 'tres', 'catro', 'cinco', 'seis', 'sete', 'oito'];
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const rows = (d) => (d === 1 ? 'xusto unha fila' : `exactamente ${NUM[d]} filas`);
const cols = (d) => (d === 1 ? 'xusto unha columna' : `exactamente ${NUM[d]} columnas`);

export default {
  code: 'gl',
  htmlLang: 'gl',
  nativeName: 'Galego',
  levels: { facil: 'Fácil', media: 'Media', dificil: 'Difícil', experto: 'Experto', maestro: 'Mestre' },
  rooms: {
    cocina: { name: 'Cociña', in: 'na cociña' },
    salon: { name: 'Salón', in: 'no salón' },
    biblioteca: { name: 'Biblioteca', in: 'na biblioteca' },
    dormitorio: { name: 'Dormitorio', in: 'no dormitorio' },
    comedor: { name: 'Comedor', in: 'no comedor' },
    estudio: { name: 'Estudio', in: 'no estudio' },
    vestibulo: { name: 'Vestíbulo', in: 'no vestíbulo' },
    invernadero: { name: 'Invernadoiro', in: 'no invernadoiro' },
    despacho: { name: 'Despacho', in: 'no despacho' },
    desvan: { name: 'Faiado', in: 'no faiado' },
    bodega: { name: 'Adega', in: 'na adega' },
    galeria: { name: 'Galería', in: 'na galería' },
  },
  objects: {
    silla: { noun: 'cadeira', a: 'unha cadeira', on: 'nunha cadeira' },
    sofa: { noun: 'sofá', a: 'un sofá', on: 'nun sofá' },
    cama: { noun: 'cama', a: 'unha cama', on: 'nunha cama' },
    planta: { noun: 'planta', a: 'unha planta', on: 'nunha planta' },
    estanteria: { noun: 'estante', a: 'un estante', on: 'nun estante' },
    tele: { noun: 'televisión', a: 'unha televisión', on: 'nunha televisión' },
    piano: { noun: 'piano', a: 'un piano', on: 'nun piano' },
  },
  names: {},
  roles: {
    cook: 'a cociñeira', gardener: 'o xardineiro', doctor: 'a doutora', mechanic: 'o mecánico',
    painter: 'a pintora', butler: 'o mordomo', grandmother: 'a avoa', teacher: 'o profesor',
    scientist: 'a científica', pilot: 'a piloto', firefighter: 'o bombeiro', lawyer: 'a avogada',
    millionaire: 'o millonario', countess: 'a condesa',
  },
  titles: [
    ['O misterio', 'da última cea'],
    ['Morte', 'na casa de campo'],
    ['O segredo', 'do salón pechado'],
    ['Un crime', 'á hora do té'],
    ['A noite', 'da tempestade'],
    ['O caso', 'do reloxo parado'],
    ['Sombras', 'no faiado'],
    ['A herdanza', 'envelenada'],
    ['O último brinde', 'da familia'],
    ['Silencio', 'no pazo'],
  ],
  story: 'Esta noite alguén non saíu con vida da casa. Coloca os implicados no plano e descobre quen quedou a soas coa vítima.',
  rules: [
    'Coloca cada persoa (os sospeitosos e a vítima) nunha cela: en cada fila e en cada columna hai exactamente unha persoa.',
    'Pódese estar en cadeiras, sofás e camas, pero non en celas con plantas, estantes, televisións ou pianos.',
    '«Xunto a» significa nunha cela contigua (arriba, abaixo, á esquerda ou á dereita) da mesma habitación.',
    'O norte está arriba. «Máis ao norte» significa en calquera fila superior; «xusto unha fila», na fila do lado.',
    'Todas as pistas son certas. A persoa culpable é a única que estaba a soas coa vítima nunha habitación.',
  ],
  clue(type, { a, b, room, object, row, col, distance, count }) {
    switch (type) {
      case 'inRoom': return `${a.name} estaba ${room.in}.`;
      case 'notInRoom': return `${a.name} non estivo ${room.in}.`;
      case 'onObject': return object.key === 'cama'
        ? `${a.name} estaba deitad${e(a)} nunha cama.`
        : `${a.name} estaba sentad${e(a)} ${object.on}.`;
      case 'besideObject': return `${a.name} estaba xunto a ${object.a}.`;
      case 'onFloor': return `${a.name} non estaba nin sentad${e(a)} nin deitad${e(a)}: na súa cela non había ningún moble.`;
      case 'row': return `${a.name} estaba na fila ${row}.`;
      case 'col': return `${a.name} estaba na columna ${col}.`;
      case 'edge': return `${a.name} estaba pegad${e(a)} a unha parede exterior da casa.`;
      case 'notEdge': return `${a.name} non tocaba ningunha parede exterior da casa.`;
      case 'corner': return `${a.name} estaba nun recanto da casa.`;
      case 'north': return `${a.name} estaba máis ao norte que ${b.name}.`;
      case 'south': return `${a.name} estaba máis ao sur que ${b.name}.`;
      case 'west': return `${a.name} estaba máis ao oeste que ${b.name}.`;
      case 'east': return `${a.name} estaba máis ao leste que ${b.name}.`;
      case 'northBy': return `${a.name} estaba ${rows(distance)} máis ao norte que ${b.name}.`;
      case 'southBy': return `${a.name} estaba ${rows(distance)} máis ao sur que ${b.name}.`;
      case 'westBy': return `${a.name} estaba ${cols(distance)} máis ao oeste que ${b.name}.`;
      case 'eastBy': return `${a.name} estaba ${cols(distance)} máis ao leste que ${b.name}.`;
      case 'sameRoom': return `${a.name} e ${b.name} estaban na mesma habitación.`;
      case 'differentRoom': return `${a.name} e ${b.name} estaban en habitacións distintas.`;
      case 'diagonal': return `${a.name} e ${b.name} estaban en celas que se tocan en diagonal.`;
      case 'roomCount':
        if (count === 0) return `Ninguén estivo ${room.in}.`;
        if (count === 1) return `${cap(room.in)} había unha soa persoa.`;
        return `${cap(room.in)} había exactamente ${NUM[count]} persoas.`;
      case 'aloneInRoom': return `${a.name} estaba ${a.gender === 'f' ? 'soa' : 'só'} na súa habitación.`;
      case 'emptyRooms':
        if (count === 0) return 'Ningunha habitación quedou baleira.';
        if (count === 1) return 'Exactamente unha habitación quedou baleira.';
        return `Exactamente ${NUM[count]} habitacións quedaron baleiras.`;
      default: return '';
    }
  },
  ui: {
    metaTitleHome: 'Murdokuer — un misterio en cada páxina',
    metaDescHome: 'Un pequeno misterio para imprimir ou xogar en liña.',
    metaTitlePlay: 'Murdokuer — xoga en liña',
    metaDescPlay: 'Resolve en liña un misterio de Murdokuer: coloca os implicados no plano e descobre quen é culpable.',
    playDocTitle: (title) => `${title} — Murdokuer`,
    homeAria: 'Murdokuer, inicio',
    language: 'Idioma',
    headerNote: 'PARA MENTES CURIOSAS',
    footerTag: 'FEITO PARA DESCONECTAR E DEDUCIR.',

    eyebrow: 'O PASATEMPO DETECTIVESCO',
    heroHtml: 'Un misterio en<br /><em>cada páxina.</em>',
    heroText: 'Un crime, unha casa chea de sospeitosos e un plano por resolver. Afia o lapis: o seguinte caso está á túa espera.',
    playButton: 'Xogar en liña',
    playButtonNote: 'sen imprimir nada',
    ctaOr: 'ou descarga un caso para imprimir',
    levelsAria: 'Descargar un caso segundo a dificultade',
    downloadNote: 'PDF GRATUÍTO · CASO + SOLUCIÓN · VARIOS?',
    downloadNoteLink: 'PREPARA UN CADERNO ↓',
    preparing: 'Preparando o caso…',
    caseReady: (level) => `O teu novo caso (dificultade ${level}) xa está preparado.`,
    pdfError: 'Non se puido xerar o PDF. Téntao de novo.',

    bookletKicker: 'PARA IMPRIMIR VARIOS Á VEZ',
    bookletTitle: 'Prepara un caderno',
    bookletIntro: 'Varios casos nun só PDF. Cada caso ocupa unha páxina e a súa solución a seguinte, así que ao imprimir a dobre cara a solución queda no reverso.',
    tipPrint: 'Imprime a dobre cara, virando a folla polo bordo curto.',
    tipLoose: 'Cada folla é un caso completo: pódese repartir solta.',
    tipOnline: 'Cada caso inclúe a súa ligazón para xogalo tamén en liña.',
    bookletLevelLegend: '1. Dificultade',
    bookletCountLabel: '2. Número de casos',
    countMinus: 'Un caso menos',
    countPlus: 'Un caso máis',
    countRange: 'Número de casos',
    mixedLabel: 'Mestura',
    mixedDetail: 'de fácil a mestre',
    maxShort: (n) => `máx. ${n}`,
    limitRange: (min, max) => `Entre ${min} e ${max} casos para este nivel.`,
    limitAdjusted: (n) => `Axustado a ${n}: é o máximo para este nivel.`,
    limitMax: (n) => `O máximo para este nivel é ${n}.`,
    summaryCases: (n) => plural(n, 'caso', 'casos'),
    mixItem: (level, n) => `${level}: ${n}`,
    summaryRest: (pages, sheets, estimate) => ` · ${pages} páxinas en ${plural(sheets, 'folla', 'follas')} a dobre cara · tempo estimado: ${estimate}`,
    estimate: (s) => (s < 3 ? 'uns segundos' : s < 60 ? `uns ${Math.ceil(s / 5) * 5} s` : 'máis dun minuto'),
    bookletSubmit: 'Descargar o caderno',
    generating: (done, total) => `Xerando casos: ${done} de ${total} preparados…`,
    assembling: 'Montando o PDF…',
    assemblingPages: (done, total) => `Montando o PDF: páxina ${done} de ${total}…`,
    cancel: 'Cancelar',
    bookletDone: (cases, pages, seconds) => `Caderno descargado: ${plural(cases, 'caso', 'casos')}, ${pages} páxinas (${plural(seconds, 'segundo', 'segundos')}).`,
    bookletCancelled: 'Caderno cancelado.',
    bookletError: 'Non se puido preparar o caderno. Téntao de novo con menos casos.',
    fileBooklet: (level, n) => `murdokuer-caderno-${level}-${n}-casos.pdf`,
    fileCase: (level, number) => `murdokuer-caso-${level}-${number}.pdf`,

    previewKicker: 'UNHA OLLADA AO INTERIOR',
    previewTitle: 'O teu próximo caso',
    previewLabel: 'VISTA PREVIA',
    paperAria: 'Exemplo da primeira páxina do PDF',
    caseLabel: 'O CASO',
    rulesHeading: '01 / AS REGRAS',
    cluesHeading: '02 / AS PISTAS',
    boardHeading: 'O PLANO',
    thinkCalm: 'PENSA CON CALMA',
    peopleHeading: '03 / OS IMPLICADOS',
    paperFooter: 'MURDOKUER · A ARTE DE DEDUCIR',
    previewCaption: 'Cada descarga xera un caso novo, preparado para imprimir.',
    playThisCase: 'Xogar este caso en liña →',
    caseNumber: (n) => `EXPEDIENTE Nº ${n}`,
    levelLine: (level, size) => `DIFICULTADE ${level} · ${size} × ${size}`,
    boardAria: (size, rooms) => `Plano de ${size} por ${size} celas con ${rooms} habitacións.`,
    victimTag: 'vítima',

    backToPrint: '← CASOS PARA IMPRIMIR',
    playEyebrow: 'XOGA EN LIÑA',
    loadingTitle: 'Preparando o caso…',
    timerAria: 'Tempo de xogo',
    newCase: 'NOVO CASO',
    levelPickerAria: 'Novo caso segundo a dificultade',
    step1: '1. ESCOLLE A QUEN COLOCAR',
    keysHelp: (n) => `Teclas 1–${n} · X para descartar`,
    toolsAria: 'Persoas e ferramentas',
    step2: '2. TOCA UNHA CELA DO PLANO',
    boardAriaPlay: 'Plano da casa',
    cluesTitle: 'AS PISTAS',
    assist: 'Marcar as pistas que non se cumpren',
    cluesNote: 'Toca unha pista para riscala cando xa a usases.',
    undo: '↶ Desfacer',
    check: '✓ Comprobar',
    hint: '💡 Axuda',
    restart: '⟲ Comezar de novo',
    reveal: '👁 Ver a solución',
    pdfThis: '↓ PDF deste caso',
    share: '🔗 Copiar a ligazón',
    rulesTitle: 'AS REGRAS',
    verdictEyebrow: 'TODO ENCAIXA',
    verdictQuestion: 'Quen é culpable?',
    verdictPrompt: 'As pezas están no seu sitio. Sinala a persoa que estaba a soas coa vítima.',
    keepLooking: 'Seguir mirando',
    markTool: 'Descartar',
    markNote: 'risca celas',
    unplaced: 'sen colocar',
    toolTitle: (name, role, victim, where) => `${name}, ${role}${victim ? ' (vítima)' : ''} · ${where}`,
    cellAria: ({ cell, room, object, person, discarded }) => `${cell}, ${room}${object ? `, ${object}` : ''}${person ? `: ${person}` : discarded ? ', descartada' : ''}`,
    markMode: 'Modo descartar: toca celas para riscalas (tamén co botón dereito do rato).',
    placing: (name) => `Colocando ${name}. Toca a súa cela no plano.`,
    unplacedAgain: (name) => `${name} volve estar sen colocar.`,
    placedAt: (name, cell) => `${name} → ${cell}.`,
    err_locked: 'Esa persoa xa está confirmada por unha axuda.',
    err_lockedCell: 'Esa cela xa está confirmada por unha axuda.',
    err_blocked: 'Ninguén pode estar nesa cela: o moble impídeo.',
    duplicates: 'Todas as persoas están no plano, pero hai filas ou columnas repetidas.',
    mismatch: 'Todas as persoas están no plano, pero algo non encaixa coas pistas. Revisa as marcadas en vermello.',
    wrongAccuse: (name, victim) => `Non: ${name} non estaba a soas con ${victim}. Fíxate en quen comparte habitación coa vítima.`,
    solvedTitle: 'Caso resolto!',
    solvedText: ({ murderer, role, victim, roomIn, time, extras }) => `${murderer}, ${role}, estaba a soas con ${victim} ${roomIn}. Tempo: ${time} · ${extras}.`,
    extraHints: (n) => plural(n, 'axuda', 'axudas'),
    extraChecks: (n) => plural(n, 'comprobación', 'comprobacións'),
    noHelp: 'sen axudas',
    anotherCase: (level) => `Outro caso (${level})`,
    solvedStatus: (time) => `Caso resolto en ${time}.`,
    undone: 'Movemento desfeito.',
    nothingPlaced: 'Aínda non colocaches ninguén.',
    allCorrect: 'Polo de agora, todas as persoas colocadas están no seu sitio.',
    wrongCount: (n) => (n === 1 ? 'Hai 1 persoa mal colocada (en vermello).' : `Hai ${n} persoas mal colocadas (en vermello).`),
    hintText: (name, cell) => `Axuda: ${name} está en ${cell}.`,
    noHintNeeded: 'Non fai falta ningunha axuda: xa está todo colocado.',
    confirmRestart: 'Queres borrar todo o colocado e comezar este caso de novo?',
    restarted: 'Caso reiniciado.',
    confirmReveal: 'Seguro que queres ver a solución? A partida rematará.',
    solutionText: ({ murderer, role, victim, roomIn }) => `Solución: ${murderer}, ${role}, estaba a soas con ${victim} ${roomIn}.`,
    pdfPreparing: 'Preparando o PDF…',
    pdfDone: 'PDF descargado.',
    linkCopied: 'Ligazón copiada: quen a abra xogará este mesmo caso.',
    shareLink: (url) => `Comparte esta ligazón: ${url}`,
    loadError: 'Non se puido xerar o caso. Proba outra vez.',
    alreadySolved: 'Este caso xa o resolviches. Podes comezalo de novo ou escoller outro.',
    resumed: 'Partida recuperada: continúa onde o deixaches.',
    startWith: (name) => `Comeza colocando ${name} ou quen prefiras.`,
    confirmLeave: 'Queres deixar este caso e comezar outro? O teu avance queda gardado neste navegador.',

    pdfPlayOnline: 'PREFIRES XOGAR NA PANTALLA?',
    pdfCaseHeading: (level, size) => `DIFICULTADE ${level} · ${size} × ${size} · CONFIDENCIAL`,
    pdfSolutionHeading: 'SOLUCIÓN · NON LER ANTES DE TEMPO',
    pdfSolution: 'A SOLUCIÓN',
    pdfCulprit: () => 'CULPABLE',
    pdfCulpritLine: 'A PERSOA CULPABLE É:',
    pdfExplanation: (murderer, victim, roomIn) => `${murderer} era a única persoa que estaba a soas con ${victim} ${roomIn}.`,
    pdfWhere: 'ONDE ESTABA CADA PERSOA',
    pdfWhereDetail: ({ name, victim, room, on }) => `${name}${victim ? ' (vítima)' : ''} · ${room}${on ? `, ${on}` : ''}`,
    pdfSolvedBoard: 'O PLANO RESOLTO',
    pdfLegend: 'Marco verde: culpable · Marco vermello: vítima',
    pdfStatement: (i, n) => `CASO ${i} / ${n} · ENUNCIADO`,
    pdfAnswer: (i, n) => `CASO ${i} / ${n} · SOLUCIÓN`,
    pdfDocTitle: (n) => `Murdokuer · ${plural(n, 'caso', 'casos')}`,
  },
};
