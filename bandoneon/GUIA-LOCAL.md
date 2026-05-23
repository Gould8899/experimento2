# Guia local

Guia minima para levantar la app, entender la estructura y retomar el proyecto sin perder tiempo.

## Arranque rapido

```bash
cd D:\Compu\HTML\experimento\bandoneon
npm install
npm run dev
```

La app queda disponible en la URL que imprima Vite, normalmente `http://localhost:5173/`.

## Comandos utiles

```bash
npm run dev
npm run build
npm run lint
npm test -- --run
```

## Publicarlo en GitHub Pages

1. Hace commit y push de estos cambios a la rama `main` del repo `Gould8899/experimento2`.
2. En GitHub entra a `Settings > Pages` y en `Build and deployment` elegi `GitHub Actions`.
3. GitHub va a correr el workflow `.github/workflows/deploy-pages.yml` en cada push a `main` y va a publicar el contenido de `dist/`.
4. La URL esperada queda en `https://gould8899.github.io/experimento2/`.

Notas:

- La build ya deja listo `dist/404.html` para que el router SPA no falle al recargar rutas en GitHub Pages.
- La build tambien crea `dist/.nojekyll`, necesario porque Vite genera assets que empiezan con `_`.
- Si en algun momento cambias la rama de despliegue, actualiza el campo `branches` del workflow.

## Como esta armado

- `src/main.ts`: punto de entrada. Crea Vue, router, Pinia, i18n y head manager.
- `src/App.vue`: casco principal. Renderiza header, contenido y footer, y aplica la configuracion persistida.
- `src/pages/index.vue`: vista principal del teclado. Muestra acordes, escalas, colores y exportacion.
- `src/pages/game.vue`: modo juego para practicar notas y octavas.
- `src/components/`: piezas visuales reutilizables. La familia `Svg*` dibuja el instrumento y `Nav*` controla la seleccion.
- `src/composables/`: logica compartida de teclado, modo oscuro y sincronizacion de settings.
- `src/stores/`: estado global de la app. `main` maneja la sesion musical y `settings` las preferencias del usuario.
- `src/data/`: datos musicales fijos, instrumentos y configuraciones auxiliares.
- `src/utils/`: helpers puros para exportacion, layout del teclado y logica reusable facil de testear.
- `src/locales/`: textos traducidos.
- `test/`: pruebas automatizadas de acordes, persistencia, layout, exportacion y transiciones del store.

## Flujo mental recomendado

1. Si queres cambiar la interfaz o la experiencia principal, empeza por `src/pages/index.vue`.
2. Si queres tocar seleccion musical, acordes o posiciones, revisa `src/stores/main.ts`.
3. Si queres sumar un instrumento o corregir notas, entra en `src/data/instruments/`.
4. Si queres agregar preferencias nuevas, revisa `src/stores/settings.ts` y `src/composables/useAppSettings.ts`.
5. Si queres tocar posiciones del teclado o nombre de archivos exportados, empeza por `src/utils/keyboardLayout.ts` y `src/utils/export.ts`.

## Estado actual del proyecto

- La build funciona.
- Los tests actuales pasan.
- El instrumento queda fijo en esta edicion; la persistencia restaura idioma, notacion, sonido, dificultad y voicings del usuario.
- El lint depende de mantener los archivos en formato LF; si aparece ruido de `Delete CR`, corre Prettier sobre los archivos tocados.

## Proximos puntos de crecimiento

- ampliar pruebas mas alla de acordes,
- documentar mejor la relacion entre datos de instrumentos y layout SVG,
- separar aun mas la logica musical de las vistas si el proyecto sigue creciendo.
