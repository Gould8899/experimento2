# Guia simple para abrir esta app en tu computadora

Esta app ya puede abrirse en tu PC. No hace falta entender programacion avanzada para verla andando.

## Que significan estas cosas raras

- `Node.js`: es el programa que permite ejecutar herramientas de JavaScript en tu computadora.
- `npm`: es el ayudante que descarga lo que el proyecto necesita para funcionar.
- `npm install`: descarga esas piezas una sola vez.
- `npm run dev`: enciende la app en modo local para verla en el navegador.

No hace falta memorizar nada mas que esto: primero se prepara, despues se enciende.

## La forma mas simple en VS Code

1. Abri la carpeta del proyecto `bandoneon` en VS Code.
2. En el menu superior, entra en `Terminal` -> `New Terminal`.
3. Se abrira una consola abajo.
4. Escribi este comando y apreta Enter:

```bash
cd D:\Compu\HTML\experimento\bandoneon
```

5. La primera vez, escribi esto y apreta Enter:

```bash
npm install
```

6. Cuando termine, escribi esto y apreta Enter:

```bash
npm run dev
```

7. La terminal te va a mostrar una direccion parecida a esta:

```text
http://localhost:5173/
```

8. Abri esa direccion en tu navegador.

## La proxima vez

La proxima vez no hace falta repetir `npm install`, salvo que el proyecto cambie mucho.

Normalmente alcanza con:

```bash
cd D:\Compu\HTML\experimento\bandoneon
npm run dev
```

## Como apagar la app

Cuando termines, volve a la terminal y apreta:

```text
Ctrl + C
```

Eso apaga el servidor local.

## Si te da miedo romper algo

Estos comandos no rompen tu proyecto:

- `npm install`
- `npm run dev`

Solo preparan y abren la app para verla.

## Si algo falla

### Si dice que `npm` no existe

Falta instalar Node.js.

### Si dice que el puerto ya esta en uso

Puede que ya haya una copia de la app abierta en otra terminal.

### Si la pagina queda en blanco

Mira la terminal: casi siempre ahi aparece el error.

## Cuando funciona `localhost:5173`

Esa direccion funciona solo mientras este corriendo `npm run dev` en una terminal abierta.

Cuando el servidor esta encendido, vas a ver algo asi:

```text
http://localhost:5173/
```

Si esa direccion no abre, normalmente significa una de estas dos cosas:

- la terminal con `npm run dev` se cerro,
- o el servidor arranco en otro puerto.

En ese caso, corre otra vez `npm run dev` y usa la direccion exacta que aparezca en la terminal.

## Como esta armado este proyecto

Esta app no es un solo archivo HTML. Es un proyecto hecho con Vue y Vite.

La idea general es esta:

- hay archivos que arrancan la app,
- otros que dibujan la interfaz,
- otros que guardan datos musicales,
- y otros que manejan el estado interno.

Si pensas esto como una casa:

- `src/main.ts` enciende todo,
- `src/App.vue` es la estructura principal,
- `src/pages/` son las pantallas,
- `src/components/` son las piezas visuales,
- `src/data/` son los datos,
- `src/stores/` es la memoria de trabajo de la app.

## Lo mas importante para entender rapido

### `package.json`

Es el archivo de control del proyecto.

Dice:

- como se llama la app,
- que paquetes necesita,
- que comandos existen, por ejemplo `npm run dev` y `npm run build`.

Si queres entender que comandos tiene el proyecto, este archivo es el lugar correcto.

### `src/main.ts`

Es el punto de arranque.

Este archivo:

- crea la aplicacion,
- activa el router,
- activa los idiomas,
- activa el sistema de estado,
- y monta la app en la pagina.

En castellano simple: aca la app "arranca".

### `src/App.vue`

Es el marco general de la aplicacion.

Este archivo pone:

- el encabezado,
- el contenido principal,
- el pie de pagina.

Tambien carga y guarda configuraciones del usuario en el navegador, por ejemplo el idioma o el instrumento elegido.

## Las pantallas principales

### `src/pages/index.vue`

Es la pantalla principal del teclado.

Aca pasa casi todo lo importante para el uso normal:

- se dibujan los botones del teclado,
- se seleccionan notas,
- se muestran acordes y escalas,
- se puede descargar la imagen,
- se puede modificar una seleccion manualmente.

Si queres entender "lo que se ve", este es uno de los archivos mas importantes.

### `src/pages/game.vue`

Es la pantalla del juego para practicar notas.

Usa el mismo teclado, pero con otra logica:

- elige posiciones,
- te hace adivinar,
- guarda aciertos y errores,
- muestra progreso.

## Componentes: piezas reutilizables

La carpeta `src/components/` tiene piezas que se usan en distintos lugares.

Las mas importantes para este proyecto son:

- `SvgKeyboard.vue`: el contenedor del teclado en SVG.
- `SvgButton.vue`: cada boton circular del teclado.
- `SvgPath.vue`: las lineas que dibujan recorridos de escalas.
- `AppSettings.vue`: la parte de opciones, idioma, notacion e instrumento.
- `NavVariant.vue`, `NavTonic.vue`, `NavDisplay.vue`: controles de acordes, tonica y visualizacion.

Pensa estas piezas como bloques Lego: la app arma la pantalla combinandolos.

## Donde estan los datos musicales

La carpeta `src/data/` guarda informacion fija.

### `src/data/instruments/`

Aca estan los instrumentos y sus notas.

Por ejemplo, en esos archivos se define que nota tiene cada boton segun:

- mano izquierda o derecha,
- abrir o cerrar,
- tipo de instrumento.

Esto es muy delicado. Si se cambia mal, se rompe la correspondencia musical.

### `src/data/chords.ts`

Guarda los acordes disponibles que la app sabe mostrar.

### `src/data/index.ts`

Es como una central que junta datos generales:

- lista de instrumentos,
- lista de notas,
- tipos de escala,
- tipos de acordes,
- colores.

### `src/data/layouts/rheinische142.ts`

Este archivo ahora guarda posiciones visuales explicitas del teclado `rheinische142`.

Importante:

- aca se mueve la geometria visual,
- no se cambian las notas,
- sirve para acomodar el dibujo real de los botones.

O sea: este archivo controla "donde se ve cada boton", no "que nota toca".

## Stores: la memoria interna de la app

La carpeta `src/stores/` guarda el estado.

### `src/stores/main.ts`

Es la store principal.

Guarda cosas como:

- lado izquierdo o derecho,
- abrir o cerrar,
- tonica,
- tipo de acorde,
- tipo de escala,
- posiciones del teclado.

Es uno de los archivos mas sensibles del proyecto.

### `src/stores/settings.ts`

Guarda configuraciones del usuario, por ejemplo:

- instrumento,
- idioma,
- tipo de notacion,
- dificultad del juego,
- acordes personalizados.

## Otras carpetas utiles

### `src/locales/`

Tiene los textos en distintos idiomas:

- `en.json`
- `es.json`
- `de.json`

Si queres cambiar palabras de la interfaz, muchas veces es aca.

### `src/composables/`

Tiene logicas reutilizables.

Por ejemplo:

- `useKeyboard.ts`: atajos del teclado de la computadora,
- `useDark.ts`: manejo del modo oscuro.

### `src/utils/`

Tiene funciones auxiliares, por ejemplo para convertir nombres de notas entre distintas notaciones musicales.

### `public/`

Tiene archivos publicos simples, por ejemplo iconos o `robots.txt`.

### `test/`

Tiene pruebas automaticas del proyecto.

## Que cosas conviene no tocar sin cuidado

Si no queres romper nada, trata de no tocar sin revisar mucho estas partes:

- `src/data/instruments/`
- `src/stores/main.ts`
- `src/pages/index.vue`
- `src/pages/game.vue`

No porque sean malas, sino porque ahi se cruzan:

- la logica musical,
- la logica visual,
- la seleccion de notas,
- las escalas,
- y el juego.

## Si quisieras orientarte rapido

Este seria un buen orden para mirar el proyecto:

1. `package.json`
2. `src/main.ts`
3. `src/App.vue`
4. `src/pages/index.vue`
5. `src/components/SvgKeyboard.vue`
6. `src/components/SvgButton.vue`
7. `src/stores/main.ts`
8. `src/data/instruments/`

## Traduccion muy simple de como funciona todo

En una frase:

la app toma datos musicales de `src/data/`, guarda decisiones del usuario en `src/stores/`, dibuja la interfaz con `src/components/`, y muestra todo en las pantallas de `src/pages/`.

## Que es lo importante para vos

Por lo que venimos haciendo, lo mas importante para vos probablemente sea distinguir estas dos cosas:

- `src/data/instruments/`: define las notas reales.
- `src/data/layouts/rheinische142.ts`: define la posicion visual de los botones.

Eso significa que ahora se puede corregir el dibujo del teclado sin cambiar la musica, que era justamente lo delicado.