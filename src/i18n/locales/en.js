// English (British spelling).

const NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const pronoun = (person) => (person.gender === 'f' ? 'her' : 'his');
const rows = (d) => (d === 1 ? 'exactly one row' : `exactly ${NUM[d]} rows`);
const cols = (d) => (d === 1 ? 'exactly one column' : `exactly ${NUM[d]} columns`);

export default {
  code: 'en',
  htmlLang: 'en-GB',
  nativeName: 'English',
  levels: { facil: 'Easy', media: 'Medium', dificil: 'Hard', experto: 'Expert', maestro: 'Master' },
  rooms: {
    cocina: { name: 'Kitchen', in: 'in the kitchen' },
    salon: { name: 'Living room', in: 'in the living room' },
    biblioteca: { name: 'Library', in: 'in the library' },
    dormitorio: { name: 'Bedroom', in: 'in the bedroom' },
    comedor: { name: 'Dining room', in: 'in the dining room' },
    estudio: { name: 'Study', in: 'in the study' },
    vestibulo: { name: 'Hall', in: 'in the hall' },
    invernadero: { name: 'Conservatory', in: 'in the conservatory' },
    despacho: { name: 'Office', in: 'in the office' },
    desvan: { name: 'Attic', in: 'in the attic' },
    bodega: { name: 'Cellar', in: 'in the cellar' },
    galeria: { name: 'Gallery', in: 'in the gallery' },
  },
  objects: {
    silla: { noun: 'chair', a: 'a chair', on: 'on a chair' },
    sofa: { noun: 'sofa', a: 'a sofa', on: 'on a sofa' },
    cama: { noun: 'bed', a: 'a bed', on: 'on a bed' },
    planta: { noun: 'plant', a: 'a plant', on: 'on a plant' },
    estanteria: { noun: 'bookcase', a: 'a bookcase', on: 'on a bookcase' },
    tele: { noun: 'TV', a: 'a TV', on: 'on a TV' },
    piano: { noun: 'piano', a: 'a piano', on: 'on a piano' },
  },
  names: { felix: 'Felix', victor: 'Victor' },
  roles: {
    cook: 'the cook', gardener: 'the gardener', doctor: 'the doctor', mechanic: 'the mechanic',
    painter: 'the painter', butler: 'the butler', grandmother: 'the grandmother', teacher: 'the teacher',
    scientist: 'the scientist', pilot: 'the pilot', firefighter: 'the firefighter', lawyer: 'the lawyer',
    millionaire: 'the millionaire', countess: 'the countess',
  },
  titles: [
    ['The mystery', 'of the last supper'],
    ['Death', 'at the country house'],
    ['The secret', 'of the locked room'],
    ['A crime', 'at teatime'],
    ['The night', 'of the storm'],
    ['The case', 'of the stopped clock'],
    ['Shadows', 'in the attic'],
    ['The poisoned', 'inheritance'],
    ['The family’s', 'final toast'],
    ['Silence', 'in the manor'],
  ],
  story: 'Tonight someone did not leave the house alive. Place everyone involved on the floor plan and work out who was left alone with the victim.',
  rules: [
    'Place each person (the suspects and the victim) on a square: every row and every column holds exactly one person.',
    'People can be on chairs, sofas and beds, but not on squares with plants, bookcases, TVs or pianos.',
    '“Next to” means on an adjacent square (above, below, left or right) in the same room.',
    'North is at the top. “Further north” means on any higher row; “exactly one row” means the neighbouring row.',
    'Every clue is true. The culprit is the only person who was alone with the victim in a room.',
  ],
  clue(type, { a, b, room, object, row, col, distance, count }) {
    switch (type) {
      case 'inRoom': return `${a.name} was ${room.in}.`;
      case 'notInRoom': return `${a.name} was not ${room.in}.`;
      case 'onObject': return object.key === 'cama'
        ? `${a.name} was lying on a bed.`
        : `${a.name} was sitting ${object.on}.`;
      case 'besideObject': return `${a.name} was next to ${object.a}.`;
      case 'onFloor': return `${a.name} was neither sitting nor lying down: there was no furniture on ${pronoun(a)} square.`;
      case 'row': return `${a.name} was in row ${row}.`;
      case 'col': return `${a.name} was in column ${col}.`;
      case 'edge': return `${a.name} was against an outside wall of the house.`;
      case 'notEdge': return `${a.name} was not touching any outside wall of the house.`;
      case 'corner': return `${a.name} was in a corner of the house.`;
      case 'north': return `${a.name} was further north than ${b.name}.`;
      case 'south': return `${a.name} was further south than ${b.name}.`;
      case 'west': return `${a.name} was further west than ${b.name}.`;
      case 'east': return `${a.name} was further east than ${b.name}.`;
      case 'northBy': return `${a.name} was ${rows(distance)} north of ${b.name}.`;
      case 'southBy': return `${a.name} was ${rows(distance)} south of ${b.name}.`;
      case 'westBy': return `${a.name} was ${cols(distance)} west of ${b.name}.`;
      case 'eastBy': return `${a.name} was ${cols(distance)} east of ${b.name}.`;
      case 'sameRoom': return `${a.name} and ${b.name} were in the same room.`;
      case 'differentRoom': return `${a.name} and ${b.name} were in different rooms.`;
      case 'diagonal': return `${a.name} and ${b.name} were on squares that touch diagonally.`;
      case 'roomCount':
        if (count === 0) return `Nobody was ${room.in}.`;
        if (count === 1) return `There was only one person ${room.in}.`;
        return `There were exactly ${NUM[count]} people ${room.in}.`;
      case 'aloneInRoom': return `${a.name} was alone in ${pronoun(a)} room.`;
      case 'emptyRooms':
        if (count === 0) return 'No room was empty.';
        if (count === 1) return 'Exactly one room was empty.';
        return `Exactly ${NUM[count]} rooms were empty.`;
      default: return '';
    }
  },
  ui: {
    metaTitleHome: 'Murdokuer — a mystery on every page',
    metaDescHome: 'A little mystery to print out or play online.',
    metaTitlePlay: 'Murdokuer — play online',
    metaDescPlay: 'Solve a Murdokuer mystery online: place everyone involved on the floor plan and find out who did it.',
    playDocTitle: (title) => `${title} — Murdokuer`,
    homeAria: 'Murdokuer, home',
    language: 'Language',
    headerNote: 'FOR CURIOUS MINDS',
    footerTag: 'MADE FOR SWITCHING OFF AND DEDUCING.',

    eyebrow: 'THE DETECTIVE PUZZLE',
    heroHtml: 'A mystery on<br /><em>every page.</em>',
    heroText: 'A crime, a house full of suspects and a floor plan to solve. Sharpen your pencil: your next case is waiting.',
    playButton: 'Play online',
    playButtonNote: 'no printing needed',
    ctaOr: 'or download a case to print',
    levelsAria: 'Download a case by difficulty',
    downloadNote: 'FREE PDF · CASE + SOLUTION · WANT SEVERAL?',
    downloadNoteLink: 'MAKE A BOOKLET ↓',
    preparing: 'Preparing the case…',
    caseReady: (level) => `Your new case (${level} difficulty) is ready.`,
    pdfError: 'The PDF could not be created. Please try again.',

    bookletKicker: 'PRINT SEVERAL AT ONCE',
    bookletTitle: 'Make a booklet',
    bookletIntro: 'Several cases in a single PDF. Each case takes up one page and its solution the next, so when you print double-sided the solution ends up on the back.',
    tipPrint: 'Print double-sided, flipping on the short edge.',
    tipLoose: 'Each sheet is a complete case: you can hand them out separately.',
    tipOnline: 'Every case comes with its own link to play it online too.',
    bookletLevelLegend: '1. Difficulty',
    bookletCountLabel: '2. Number of cases',
    countMinus: 'One case fewer',
    countPlus: 'One case more',
    countRange: 'Number of cases',
    mixedLabel: 'Mixed',
    mixedDetail: 'from easy to master',
    maxShort: (n) => `max. ${n}`,
    limitRange: (min, max) => `Between ${min} and ${max} cases for this level.`,
    limitAdjusted: (n) => `Set to ${n}: that is the maximum for this level.`,
    limitMax: (n) => `The maximum for this level is ${n}.`,
    summaryCases: (n) => plural(n, 'case', 'cases'),
    mixItem: (level, n) => `${level}: ${n}`,
    summaryRest: (pages, sheets, estimate) => ` · ${pages} pages on ${plural(sheets, 'sheet', 'sheets')}, double-sided · ready in ${estimate}`,
    estimate: (s) => (s < 3 ? 'a few seconds' : s < 60 ? `about ${Math.ceil(s / 5) * 5} s` : 'over a minute'),
    bookletSubmit: 'Download booklet',
    generating: (done, total) => `Creating cases: ${done} of ${total} ready…`,
    assembling: 'Putting the PDF together…',
    assemblingPages: (done, total) => `Putting the PDF together: page ${done} of ${total}…`,
    cancel: 'Cancel',
    bookletDone: (cases, pages, seconds) => `Booklet downloaded: ${plural(cases, 'case', 'cases')}, ${pages} pages (${plural(seconds, 'second', 'seconds')}).`,
    bookletCancelled: 'Booklet cancelled.',
    bookletError: 'The booklet could not be created. Please try again with fewer cases.',
    fileBooklet: (level, n) => `murdokuer-booklet-${level}-${n}-cases.pdf`,
    fileCase: (level, number) => `murdokuer-case-${level}-${number}.pdf`,

    previewKicker: 'A LOOK INSIDE',
    previewTitle: 'Your next case',
    previewLabel: 'PREVIEW',
    paperAria: 'Sample of the first page of the PDF',
    caseLabel: 'THE CASE',
    rulesHeading: '01 / THE RULES',
    cluesHeading: '02 / THE CLUES',
    boardHeading: 'THE FLOOR PLAN',
    thinkCalm: 'TAKE YOUR TIME',
    peopleHeading: '03 / THE PEOPLE INVOLVED',
    paperFooter: 'MURDOKUER · THE ART OF DEDUCTION',
    previewCaption: 'Every download creates a new case, ready to print.',
    playThisCase: 'Play this case online →',
    caseNumber: (n) => `CASE FILE No. ${n}`,
    levelLine: (level, size) => `${level} DIFFICULTY · ${size} × ${size}`,
    boardAria: (size, rooms) => `Floor plan of ${size} by ${size} squares with ${rooms} rooms.`,
    victimTag: 'victim',

    backToPrint: '← CASES TO PRINT',
    playEyebrow: 'PLAY ONLINE',
    loadingTitle: 'Preparing the case…',
    timerAria: 'Time played',
    newCase: 'NEW CASE',
    levelPickerAria: 'New case by difficulty',
    step1: '1. CHOOSE WHO TO PLACE',
    keysHelp: (n) => `Keys 1–${n} · X to rule out`,
    toolsAria: 'People and tools',
    step2: '2. TAP A SQUARE ON THE PLAN',
    boardAriaPlay: 'Floor plan of the house',
    cluesTitle: 'THE CLUES',
    assist: 'Highlight broken clues',
    cluesNote: 'Tap a clue to cross it out once you have used it.',
    undo: '↶ Undo',
    check: '✓ Check',
    hint: '💡 Hint',
    restart: '⟲ Start again',
    reveal: '👁 Show solution',
    pdfThis: '↓ PDF of this case',
    share: '🔗 Copy link',
    rulesTitle: 'THE RULES',
    verdictEyebrow: 'IT ALL FITS',
    verdictQuestion: 'Who did it?',
    verdictPrompt: 'Everything is in place. Point to the person who was alone with the victim.',
    keepLooking: 'Keep looking',
    markTool: 'Rule out',
    markNote: 'cross out squares',
    unplaced: 'not placed',
    toolTitle: (name, role, victim, where) => `${name}, ${role}${victim ? ' (victim)' : ''} · ${where}`,
    cellAria: ({ cell, room, object, person, discarded }) => `${cell}, ${room}${object ? `, ${object}` : ''}${person ? `: ${person}` : discarded ? ', ruled out' : ''}`,
    markMode: 'Rule-out mode: tap squares to cross them out (or right-click).',
    placing: (name) => `Placing ${name}. Tap their square on the plan.`,
    unplacedAgain: (name) => `${name} is no longer placed.`,
    placedAt: (name, cell) => `${name} → ${cell}.`,
    err_locked: 'That person has already been confirmed by a hint.',
    err_lockedCell: 'That square has already been confirmed by a hint.',
    err_blocked: 'Nobody can be on that square: the furniture is in the way.',
    duplicates: 'Everyone is on the plan, but some rows or columns are repeated.',
    mismatch: 'Everyone is on the plan, but something does not match the clues. Check the ones in red.',
    wrongAccuse: (name, victim) => `No: ${name} was not alone with ${victim}. Look at who shares a room with the victim.`,
    solvedTitle: 'Case solved!',
    solvedText: ({ murderer, role, victim, roomIn, time, extras }) => `${murderer}, ${role}, was alone with ${victim} ${roomIn}. Time: ${time} · ${extras}.`,
    extraHints: (n) => plural(n, 'hint', 'hints'),
    extraChecks: (n) => plural(n, 'check', 'checks'),
    noHelp: 'no hints',
    anotherCase: (level) => `Another case (${level})`,
    solvedStatus: (time) => `Case solved in ${time}.`,
    undone: 'Move undone.',
    nothingPlaced: 'You have not placed anyone yet.',
    allCorrect: 'So far, everyone you have placed is in the right square.',
    wrongCount: (n) => (n === 1 ? '1 person is in the wrong square (in red).' : `${n} people are in the wrong square (in red).`),
    hintText: (name, cell) => `Hint: ${name} is on ${cell}.`,
    noHintNeeded: 'No hint needed: everyone is already placed.',
    confirmRestart: 'Clear everything you have placed and start this case again?',
    restarted: 'Case restarted.',
    confirmReveal: 'Are you sure you want to see the solution? The game will end.',
    solutionText: ({ murderer, role, victim, roomIn }) => `Solution: ${murderer}, ${role}, was alone with ${victim} ${roomIn}.`,
    pdfPreparing: 'Preparing the PDF…',
    pdfDone: 'PDF downloaded.',
    linkCopied: 'Link copied: whoever opens it will play this same case.',
    shareLink: (url) => `Share this link: ${url}`,
    loadError: 'The case could not be created. Please try again.',
    alreadySolved: 'You have already solved this case. You can start it again or choose another.',
    resumed: 'Game restored: carry on where you left off.',
    startWith: (name) => `Start by placing ${name}, or whoever you like.`,
    confirmLeave: 'Leave this case and start a new one? Your progress stays saved in this browser.',

    pdfPlayOnline: 'RATHER PLAY ON SCREEN?',
    pdfCaseHeading: (level, size) => `${level} DIFFICULTY · ${size} × ${size} · CONFIDENTIAL`,
    pdfSolutionHeading: 'SOLUTION · NO PEEKING',
    pdfSolution: 'THE SOLUTION',
    pdfCulprit: () => 'CULPRIT',
    pdfCulpritLine: 'THE CULPRIT IS:',
    pdfExplanation: (murderer, victim, roomIn) => `${murderer} was the only person alone with ${victim} ${roomIn}.`,
    pdfWhere: 'WHERE EVERYONE WAS',
    pdfWhereDetail: ({ name, victim, room, on }) => `${name}${victim ? ' (victim)' : ''} · ${room}${on ? `, ${on}` : ''}`,
    pdfSolvedBoard: 'THE SOLVED FLOOR PLAN',
    pdfLegend: 'Green frame: culprit · Red frame: victim',
    pdfStatement: (i, n) => `CASE ${i} / ${n} · PUZZLE`,
    pdfAnswer: (i, n) => `CASE ${i} / ${n} · SOLUTION`,
    pdfDocTitle: (n) => `Murdokuer · ${plural(n, 'case', 'cases')}`,
  },
};
