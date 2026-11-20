# Murdokuer

Generador de pasatiempos detectivescos para imprimir, al estilo de los «sudokus de
asesinatos». Cada caso es el plano de una casa dividido en habitaciones, con muebles,
varias personas sospechosas y una víctima, todas representadas con emojis.

## Reglas del pasatiempo

1. Cada persona (sospechosos y víctima) ocupa una casilla: en cada fila y en cada
   columna hay exactamente una persona.
2. Se puede estar en sillas, sofás y camas, pero no en casillas con plantas,
   estanterías, televisiones o pianos.
3. «Junto a» significa en una casilla contigua (no en diagonal) de la misma habitación.
4. Todas las pistas son ciertas. La persona culpable es la única que está a solas con
   la víctima en una habitación.

El generador ([src/puzzle.js](src/puzzle.js)) crea el plano, coloca a las personas,
elige pistas y comprueba con un solucionador que el caso tiene una única solución.
Cada caso sale de una semilla (el número de expediente): el mismo nivel y la misma
semilla dan siempre el mismo caso. Hay cinco niveles:

| Nivel   | Plano | Personas | Pistas |
|---------|-------|----------|--------|
| Fácil   | 4 × 4 | 4 | Directas: habitación, mueble, fila, columna, esquina |
| Media   | 5 × 5 | 5 | Añade «junto a», «no estuvo en», «misma habitación», paredes y recuentos |
| Difícil | 6 × 6 | 6 | Sin filas ni columnas; añade norte/sur/este/oeste, diagonales, «a solas», «habitaciones distintas» |
| Experto | 7 × 7 | 7 | Añade distancias exactas («justo una fila más al norte») y habitaciones vacías |
| Maestro | 8 × 8 | 8 | Todas las anteriores, con más peso para las pistas de relación |

## Dos formas de jugar

- **En papel:** la portada descarga un PDF A4 horizontal de dos hojas: el caso (reglas,
  pistas, plano e implicados) y el solucionario. El pie de la primera hoja enlaza al
  mismo caso en línea.
- **Cuadernillo:** varios casos en un solo PDF (de 2 a 30 según el nivel, o una mezcla
  de fácil a maestro). Cada caso ocupa una página y su solución la siguiente, para
  imprimir a doble cara (volteo por el borde corto) con la solución en el reverso. Los
  límites (30 fácil/media, 25 difícil, 15 experto, 10 maestro, 20 mezcla) mantienen la
  espera en pocos segundos; se generan en paralelo con varios Web Workers, con barra de
  progreso y opción de cancelar.
- **En línea** (`jugar.html?nivel=…&caso=…`): se elige a una persona (o teclas 1–8) y se
  toca su casilla; con «Descartar» (tecla X o clic derecho) se tachan casillas. Marca
  las filas y columnas repetidas y, si se quiere, las pistas incumplidas. Incluye
  deshacer, comprobar, ayudas, ver la solución, descargar el PDF y copiar el enlace.
  Al completar el plano se acusa a la persona culpable. El avance se guarda en el
  navegador.

## Estructura

| Archivo | Contenido |
|---|---|
| [src/puzzle.js](src/puzzle.js) | Generador, pistas y solucionador (sin DOM) |
| [src/game.js](src/game.js) | Reglas de una partida en línea (sin DOM) |
| [src/board.js](src/board.js) | Reglas, textos y pintado del plano compartidos |
| [src/pdf.js](src/pdf.js) | PDF con jsPDF (los emojis se insertan como imágenes) |
| [src/booklet.js](src/booklet.js) | Límites, reparto de niveles y estimación de tiempo de los cuadernillos |
| [src/generate.js](src/generate.js), [src/puzzle.worker.js](src/puzzle.worker.js) | Generación en un Web Worker para no bloquear la página |
| [src/main.js](src/main.js), [index.html](index.html) | Portada y descargas |
| [src/play.js](src/play.js), [jugar.html](jugar.html), [src/play.css](src/play.css) | Juego en línea |

## Desarrollo

Requiere Node.js 22.

```sh
npm ci
npm run dev
```

La aplicación local está disponible en la dirección que muestra Vite, bajo
`/murdokuer/`. Para comprobar el generador y compilar:

```sh
npm test
npm run build
```

## Publicación

Cada push a `master` ejecuta las pruebas, compila y publica el resultado con
GitHub Actions. En los ajustes del repositorio, selecciona **GitHub Actions**
como origen de Pages. Para servir la aplicación en
<https://resuacode.es/murdokuer/>, el dominio personalizado `resuacode.es`
debe estar configurado y verificado en el sitio de GitHub Pages de la cuenta,
con su DNS correspondiente. La aplicación usa `/murdokuer/` como ruta base.
