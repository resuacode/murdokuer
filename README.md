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
Hay tres niveles:

| Nivel   | Plano | Personas | Pistas |
|---------|-------|----------|--------|
| Fácil   | 4 × 4 | 4 | Directas (habitación, mueble, fila, columna) |
| Media   | 5 × 5 | 5 | Añade «junto a», «no estuvo en» y «misma habitación» |
| Difícil | 6 × 6 | 6 | Sin filas ni columnas; añade posiciones relativas (norte, este…) y diagonales |

El PDF (A4 horizontal) tiene dos hojas: el caso, con las reglas, las pistas, el plano y
los implicados, y el solucionario, con el plano resuelto y la persona culpable.

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
