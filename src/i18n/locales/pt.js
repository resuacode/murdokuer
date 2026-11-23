// Português europeu (pt-PT, Acordo Ortográfico de 1990).
// «Divisão» para cada espaço da casa e «quadrícula» para cada quadrado do mapa;
// usa-se «mapa» (e não «planta») para não confundir com a planta, o objeto.

const e = (person) => (person.gender === 'f' ? 'a' : 'o');
const NUM = ['nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito'];
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const rows = (d) => (d === 1 ? 'exatamente uma linha' : `exatamente ${NUM[d]} linhas`);
const cols = (d) => (d === 1 ? 'exatamente uma coluna' : `exatamente ${NUM[d]} colunas`);

export default {
  code: 'pt',
  htmlLang: 'pt-PT',
  nativeName: 'Português',
  levels: { facil: 'Fácil', media: 'Média', dificil: 'Difícil', experto: 'Especialista', maestro: 'Mestre' },
  rooms: {
    cocina: { name: 'Cozinha', in: 'na cozinha' },
    salon: { name: 'Sala de estar', in: 'na sala de estar' },
    biblioteca: { name: 'Biblioteca', in: 'na biblioteca' },
    dormitorio: { name: 'Quarto', in: 'no quarto' },
    comedor: { name: 'Sala de jantar', in: 'na sala de jantar' },
    estudio: { name: 'Escritório', in: 'no escritório' },
    vestibulo: { name: 'Átrio', in: 'no átrio' },
    invernadero: { name: 'Estufa', in: 'na estufa' },
    despacho: { name: 'Gabinete', in: 'no gabinete' },
    desvan: { name: 'Sótão', in: 'no sótão' },
    bodega: { name: 'Adega', in: 'na adega' },
    galeria: { name: 'Galeria', in: 'na galeria' },
  },
  objects: {
    silla: { noun: 'cadeira', a: 'uma cadeira', on: 'numa cadeira' },
    sofa: { noun: 'sofá', a: 'um sofá', on: 'num sofá' },
    cama: { noun: 'cama', a: 'uma cama', on: 'numa cama' },
    planta: { noun: 'planta', a: 'uma planta', on: 'numa planta' },
    estanteria: { noun: 'estante', a: 'uma estante', on: 'numa estante' },
    tele: { noun: 'televisão', a: 'uma televisão', on: 'numa televisão' },
    piano: { noun: 'piano', a: 'um piano', on: 'num piano' },
  },
  names: { elena: 'Helena', gloria: 'Glória', ines: 'Inês', julia: 'Júlia', victor: 'Vítor', rosalia: 'Rosália' },
  roles: {
    cook: 'a cozinheira', gardener: 'o jardineiro', doctor: 'a médica', mechanic: 'o mecânico',
    painter: 'a pintora', butler: 'o mordomo', grandmother: 'a avó', teacher: 'o professor',
    scientist: 'a cientista', pilot: 'a piloto', firefighter: 'o bombeiro', lawyer: 'a advogada',
    millionaire: 'o milionário', countess: 'a condessa',
  },
  titles: [
    ['O mistério', 'da última ceia'],
    ['Morte', 'na casa de campo'],
    ['O segredo', 'da sala fechada'],
    ['Um crime', 'à hora do chá'],
    ['A noite', 'da tempestade'],
    ['O caso', 'do relógio parado'],
    ['Sombras', 'no sótão'],
    ['A herança', 'envenenada'],
    ['O último brinde', 'da família'],
    ['Silêncio', 'na mansão'],
  ],
  story: 'Esta noite, alguém não saiu com vida da casa. Coloca os envolvidos no mapa e descobre quem ficou sozinho com a vítima.',
  rules: [
    'Coloca cada pessoa (os suspeitos e a vítima) numa quadrícula: em cada linha e em cada coluna há exatamente uma pessoa.',
    'Pode-se estar em cadeiras, sofás e camas, mas não em quadrículas com plantas, estantes, televisões ou pianos.',
    '«Ao lado de» significa numa quadrícula contígua (acima, abaixo, à esquerda ou à direita) da mesma divisão.',
    'O norte fica em cima. «Mais a norte» significa em qualquer linha acima; «exatamente uma linha», na linha vizinha.',
    'Todas as pistas são verdadeiras. A pessoa culpada é a única que estava sozinha com a vítima numa divisão.',
  ],
  clue(type, { a, b, room, object, row, col, distance, count }) {
    switch (type) {
      case 'inRoom': return `${a.name} estava ${room.in}.`;
      case 'notInRoom': return `${a.name} não esteve ${room.in}.`;
      case 'onObject': return object.key === 'cama'
        ? `${a.name} estava deitad${e(a)} numa cama.`
        : `${a.name} estava sentad${e(a)} ${object.on}.`;
      case 'besideObject': return `${a.name} estava ao lado de ${object.a}.`;
      case 'onFloor': return `${a.name} não estava sentad${e(a)} nem deitad${e(a)}: a sua quadrícula não tinha móveis.`;
      case 'row': return `${a.name} estava na linha ${row}.`;
      case 'col': return `${a.name} estava na coluna ${col}.`;
      case 'edge': return `${a.name} estava encostad${e(a)} a uma parede exterior da casa.`;
      case 'notEdge': return `${a.name} não tocava em nenhuma parede exterior da casa.`;
      case 'corner': return `${a.name} estava num canto da casa.`;
      case 'north': return `${a.name} estava mais a norte do que ${b.name}.`;
      case 'south': return `${a.name} estava mais a sul do que ${b.name}.`;
      case 'west': return `${a.name} estava mais a oeste do que ${b.name}.`;
      case 'east': return `${a.name} estava mais a leste do que ${b.name}.`;
      case 'northBy': return `${a.name} estava ${rows(distance)} mais a norte do que ${b.name}.`;
      case 'southBy': return `${a.name} estava ${rows(distance)} mais a sul do que ${b.name}.`;
      case 'westBy': return `${a.name} estava ${cols(distance)} mais a oeste do que ${b.name}.`;
      case 'eastBy': return `${a.name} estava ${cols(distance)} mais a leste do que ${b.name}.`;
      case 'sameRoom': return `${a.name} e ${b.name} estavam na mesma divisão.`;
      case 'differentRoom': return `${a.name} e ${b.name} estavam em divisões diferentes.`;
      case 'diagonal': return `${a.name} e ${b.name} estavam em quadrículas que se tocam na diagonal.`;
      case 'roomCount':
        if (count === 0) return `Ninguém esteve ${room.in}.`;
        if (count === 1) return `${cap(room.in)} havia apenas uma pessoa.`;
        return `${cap(room.in)} havia exatamente ${NUM[count]} pessoas.`;
      case 'aloneInRoom': return `${a.name} estava sozinh${e(a)} na sua divisão.`;
      case 'emptyRooms':
        if (count === 0) return 'Nenhuma divisão ficou vazia.';
        if (count === 1) return 'Exatamente uma divisão ficou vazia.';
        return `Exatamente ${NUM[count]} divisões ficaram vazias.`;
      default: return '';
    }
  },
  ui: {
    metaTitleHome: 'Murdokuer — um mistério em cada página',
    metaDescHome: 'Um pequeno mistério para imprimir ou jogar online.',
    metaTitlePlay: 'Murdokuer — jogar online',
    metaDescPlay: 'Resolve online um mistério do Murdokuer: coloca os envolvidos no mapa e descobre quem é o culpado.',
    playDocTitle: (title) => `${title} — Murdokuer`,
    homeAria: 'Murdokuer, início',
    language: 'Idioma',
    headerNote: 'PARA MENTES CURIOSAS',
    footerTag: 'FEITO PARA DESLIGAR E DEDUZIR.',

    eyebrow: 'O PASSATEMPO DETETIVESCO',
    heroHtml: 'Um mistério em<br /><em>cada página.</em>',
    heroText: 'Um crime, uma casa cheia de suspeitos e um mapa por resolver. Afia o lápis: o próximo caso está à tua espera.',
    playButton: 'Jogar online',
    playButtonNote: 'sem imprimir nada',
    ctaOr: 'ou descarrega um caso para imprimir',
    levelsAria: 'Descarregar um caso por dificuldade',
    downloadNote: 'PDF GRATUITO · CASO + SOLUÇÃO · VÁRIOS?',
    downloadNoteLink: 'PREPARA UM CADERNO ↓',
    preparing: 'A preparar o caso…',
    caseReady: (level) => `O teu novo caso (dificuldade ${level}) está pronto.`,
    pdfError: 'Não foi possível gerar o PDF. Tenta novamente.',

    bookletKicker: 'PARA IMPRIMIR VÁRIOS DE UMA VEZ',
    bookletTitle: 'Prepara um caderno',
    bookletIntro: 'Vários casos num só PDF. Cada caso ocupa uma página e a respetiva solução a seguinte; assim, ao imprimir em frente e verso, a solução fica no verso.',
    tipPrint: 'Imprime em frente e verso, virando pela margem curta.',
    tipLoose: 'Cada folha é um caso completo: pode ser distribuída solta.',
    tipOnline: 'Cada caso inclui a respetiva ligação para o jogar também online.',
    bookletLevelLegend: '1. Dificuldade',
    bookletCountLabel: '2. Número de casos',
    countMinus: 'Menos um caso',
    countPlus: 'Mais um caso',
    countRange: 'Número de casos',
    mixedLabel: 'Mistura',
    mixedDetail: 'de fácil a mestre',
    maxShort: (n) => `máx. ${n}`,
    limitRange: (min, max) => `Entre ${min} e ${max} casos para este nível.`,
    limitAdjusted: (n) => `Ajustado para ${n}: é o máximo para este nível.`,
    limitMax: (n) => `O máximo para este nível é ${n}.`,
    summaryCases: (n) => plural(n, 'caso', 'casos'),
    mixItem: (level, n) => `${level}: ${n}`,
    summaryRest: (pages, sheets, estimate) => ` · ${pages} páginas em ${plural(sheets, 'folha', 'folhas')} em frente e verso · pronto em ${estimate}`,
    estimate: (s) => (s < 3 ? 'poucos segundos' : s < 60 ? `cerca de ${Math.ceil(s / 5) * 5} s` : 'mais de um minuto'),
    bookletSubmit: 'Descarregar caderno',
    generating: (done, total) => `A gerar casos: ${done} de ${total} prontos…`,
    assembling: 'A montar o PDF…',
    assemblingPages: (done, total) => `A montar o PDF: página ${done} de ${total}…`,
    cancel: 'Cancelar',
    bookletDone: (cases, pages, seconds) => `Caderno descarregado: ${plural(cases, 'caso', 'casos')}, ${pages} páginas (${plural(seconds, 'segundo', 'segundos')}).`,
    bookletCancelled: 'Caderno cancelado.',
    bookletError: 'Não foi possível preparar o caderno. Tenta novamente com menos casos.',
    fileBooklet: (level, n) => `murdokuer-caderno-${level}-${n}-casos.pdf`,
    fileCase: (level, number) => `murdokuer-caso-${level}-${number}.pdf`,

    previewKicker: 'UMA ESPREITADELA AO INTERIOR',
    previewTitle: 'O teu próximo caso',
    previewLabel: 'PRÉ-VISUALIZAÇÃO',
    paperAria: 'Exemplo da primeira página do PDF',
    caseLabel: 'O CASO',
    rulesHeading: '01 / AS REGRAS',
    cluesHeading: '02 / AS PISTAS',
    boardHeading: 'O MAPA',
    thinkCalm: 'PENSA COM CALMA',
    peopleHeading: '03 / OS ENVOLVIDOS',
    paperFooter: 'MURDOKUER · A ARTE DE DEDUZIR',
    previewCaption: 'Cada descarga gera um caso novo, pronto a imprimir.',
    playThisCase: 'Jogar este caso online →',
    caseNumber: (n) => `PROCESSO N.º ${n}`,
    levelLine: (level, size) => `DIFICULDADE ${level} · ${size} × ${size}`,
    boardAria: (size, rooms) => `Mapa de ${size} por ${size} quadrículas com ${rooms} divisões.`,
    victimTag: 'vítima',

    backToPrint: '← CASOS PARA IMPRIMIR',
    playEyebrow: 'JOGAR ONLINE',
    loadingTitle: 'A preparar o caso…',
    timerAria: 'Tempo de jogo',
    newCase: 'NOVO CASO',
    levelPickerAria: 'Novo caso por dificuldade',
    step1: '1. ESCOLHE QUEM COLOCAR',
    keysHelp: (n) => `Teclas 1–${n} · X para descartar`,
    toolsAria: 'Pessoas e ferramentas',
    step2: '2. TOCA NUMA QUADRÍCULA DO MAPA',
    boardAriaPlay: 'Mapa da casa',
    cluesTitle: 'AS PISTAS',
    assist: 'Assinalar pistas não cumpridas',
    cluesNote: 'Toca numa pista para a riscar quando já a tiveres usado.',
    undo: '↶ Anular',
    check: '✓ Verificar',
    hint: '💡 Ajuda',
    restart: '⟲ Recomeçar',
    reveal: '👁 Ver a solução',
    pdfThis: '↓ PDF deste caso',
    share: '🔗 Copiar ligação',
    rulesTitle: 'AS REGRAS',
    verdictEyebrow: 'TUDO BATE CERTO',
    verdictQuestion: 'Quem é o culpado?',
    verdictPrompt: 'As peças estão no lugar. Aponta a pessoa que estava sozinha com a vítima.',
    keepLooking: 'Continuar a ver',
    markTool: 'Descartar',
    markNote: 'risca quadrículas',
    unplaced: 'por colocar',
    toolTitle: (name, role, victim, where) => `${name}, ${role}${victim ? ' (vítima)' : ''} · ${where}`,
    cellAria: ({ cell, room, object, person, discarded }) => `${cell}, ${room}${object ? `, ${object}` : ''}${person ? `: ${person}` : discarded ? ', descartada' : ''}`,
    markMode: 'Modo descartar: toca nas quadrículas para as riscar (também com o botão direito do rato).',
    placing: (name) => `A colocar ${name}. Toca na respetiva quadrícula do mapa.`,
    unplacedAgain: (name) => `${name} volta a estar por colocar.`,
    placedAt: (name, cell) => `${name} → ${cell}.`,
    err_locked: 'Essa pessoa já foi confirmada por uma ajuda.',
    err_lockedCell: 'Essa quadrícula já foi confirmada por uma ajuda.',
    err_blocked: 'Ninguém pode estar nessa quadrícula: o móvel impede-o.',
    duplicates: 'Todas as pessoas estão no mapa, mas há linhas ou colunas repetidas.',
    mismatch: 'Todas as pessoas estão no mapa, mas algo não bate certo com as pistas. Revê as que estão a vermelho.',
    wrongAccuse: (name, victim, gender) => `Não: ${name} não estava sozinh${gender === 'f' ? 'a' : 'o'} com ${victim}. Vê quem partilha a divisão com a vítima.`,
    solvedTitle: 'Caso resolvido!',
    solvedText: ({ murderer, role, victim, roomIn, time, extras, gender }) => `${murderer}, ${role}, estava sozinh${gender === 'f' ? 'a' : 'o'} com ${victim} ${roomIn}. Tempo: ${time} · ${extras}.`,
    extraHints: (n) => plural(n, 'ajuda', 'ajudas'),
    extraChecks: (n) => plural(n, 'verificação', 'verificações'),
    noHelp: 'sem ajudas',
    anotherCase: (level) => `Outro caso (${level})`,
    solvedStatus: (time) => `Caso resolvido em ${time}.`,
    undone: 'Jogada anulada.',
    nothingPlaced: 'Ainda não colocaste ninguém.',
    allCorrect: 'Por agora, todas as pessoas colocadas estão no sítio certo.',
    wrongCount: (n) => (n === 1 ? 'Há 1 pessoa mal colocada (a vermelho).' : `Há ${n} pessoas mal colocadas (a vermelho).`),
    hintText: (name, cell) => `Ajuda: ${name} está em ${cell}.`,
    noHintNeeded: 'Não é precisa nenhuma ajuda: já está tudo colocado.',
    confirmRestart: 'Apagar tudo o que colocaste e recomeçar este caso?',
    restarted: 'Caso recomeçado.',
    confirmReveal: 'Tens a certeza de que queres ver a solução? O jogo terminará.',
    solutionText: ({ murderer, role, victim, roomIn, gender }) => `Solução: ${murderer}, ${role}, estava sozinh${gender === 'f' ? 'a' : 'o'} com ${victim} ${roomIn}.`,
    pdfPreparing: 'A preparar o PDF…',
    pdfDone: 'PDF descarregado.',
    linkCopied: 'Ligação copiada: quem a abrir vai jogar este mesmo caso.',
    shareLink: (url) => `Partilha esta ligação: ${url}`,
    loadError: 'Não foi possível gerar o caso. Tenta outra vez.',
    alreadySolved: 'Já resolveste este caso. Podes recomeçá-lo ou escolher outro.',
    resumed: 'Jogo recuperado: continua onde paraste.',
    startWith: (name) => `Começa por colocar ${name} ou quem preferires.`,
    confirmLeave: 'Deixar este caso e começar outro? O teu progresso fica guardado neste navegador.',

    pdfPlayOnline: 'PREFERES JOGAR NO ECRÃ?',
    pdfCaseHeading: (level, size) => `DIFICULDADE ${level} · ${size} × ${size} · CONFIDENCIAL`,
    pdfSolutionHeading: 'SOLUÇÃO · NÃO LER ANTES DO TEMPO',
    pdfSolution: 'A SOLUÇÃO',
    pdfCulprit: (gender) => (gender === 'f' ? 'CULPADA' : 'CULPADO'),
    pdfCulpritLine: 'A PESSOA CULPADA É:',
    pdfExplanation: (murderer, victim, roomIn) => `${murderer} era a única pessoa sozinha com ${victim} ${roomIn}.`,
    pdfWhere: 'ONDE ESTAVA CADA PESSOA',
    pdfWhereDetail: ({ name, victim, room, on }) => `${name}${victim ? ' (vítima)' : ''} · ${room}${on ? `, ${on}` : ''}`,
    pdfSolvedBoard: 'O MAPA RESOLVIDO',
    pdfLegend: 'Moldura verde: culpado · Moldura vermelha: vítima',
    pdfStatement: (i, n) => `CASO ${i} / ${n} · ENUNCIADO`,
    pdfAnswer: (i, n) => `CASO ${i} / ${n} · SOLUÇÃO`,
    pdfDocTitle: (n) => `Murdokuer · ${plural(n, 'caso', 'casos')}`,
  },
};
