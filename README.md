# Murdokuer

Generador de pasatiempos detectivescos para imprimir. Cada descarga crea un sudoku
de 6 × 6 con solución única; la casilla marcada identifica al culpable entre los
seis sospechosos. El PDF contiene un único acertijo en una página A4 horizontal,
con las pistas a la izquierda y el tablero a la derecha.

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

Cada push a `main` ejecuta las pruebas, compila y publica el resultado con
GitHub Actions. En los ajustes del repositorio, selecciona **GitHub Actions**
como origen de Pages. Para servir la aplicación en
<https://resuacode.es/murdokuer/>, el dominio personalizado `resuacode.es`
debe estar configurado y verificado en el sitio de GitHub Pages de la cuenta,
con su DNS correspondiente. La aplicación usa `/murdokuer/` como ruta base.
