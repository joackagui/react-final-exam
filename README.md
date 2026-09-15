# Batalla de los Mares

Juego naval top-down local para dos personas. React representa la partida y Express conserva el estado autoritativo: movimiento, viento, daños, proyectiles y victoria.

> **Despliegue:** pendiente de crear el Web Service en Render. La URL pública se añadirá aquí después de publicar el servicio; no se inventó una antes del despliegue.

## Requisitos e instalación

- Node.js 22 o superior y npm.
- Para E2E headless: `npx playwright install chromium` después de instalar dependencias.
- Para pruebas visuales: Google Chrome instalado localmente.

```bash
npm ci
npx playwright install chromium
```

`npm install` también funciona durante el desarrollo cuando se necesita regenerar el lockfile. El comando recomendado para una instalación reproducible es `npm ci`.

## Comandos

| Comando                   | Uso                                                                       |
| ------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`             | Inicia Vite y Express para desarrollo.                                    |
| `npm run build`           | Compila React en `client/dist` y Express en `server/dist`.                |
| `npm run start`           | Sirve API, assets y build de React en `http://localhost:3000`.            |
| `npm run lint`            | Ejecuta ESLint TypeScript en cliente y servidor; warnings también fallan. |
| `npm run test:e2e`        | Ejecuta las cuatro pruebas Playwright en Chromium headless.               |
| `npm run test:e2e:headed` | Ejecuta las pruebas visualmente en Google Chrome.                         |

Para ejecutar solo una prueba o un archivo: `npx playwright test e2e/sea-battle.spec.ts -g "nombre de la prueba"`.

## Arquitectura

```text
client/ (React + TypeScript) --fetch/polling--> server/ (Express + TypeScript)
       renderiza estado                         conserva y actualiza Game en memoria
Assets/ --------------------------------------> Express publica /Assets
```

El cliente hace `POST` para crear/enviar acciones y polling cada 120 ms a `GET /api/games/:id`. Express ejecuta un tick de 100 ms para reglas y, en producción, sirve `client/dist`; hay un solo origen y puerto.

## Endpoints

| Método | Ruta                    | Propósito                                    |
| ------ | ----------------------- | -------------------------------------------- |
| `GET`  | `/api/health`           | Disponibilidad.                              |
| `POST` | `/api/games`            | Crea Pirata vs. Fantasma.                    |
| `GET`  | `/api/games/:id`        | Estado actual.                               |
| `POST` | `/api/games/:id/action` | Giro o disparo de jugador válido.            |
| `POST` | `/api/echo`             | Ruta auxiliar que devuelve el JSON recibido. |

En pruebas también se habilita `POST /api/games/:id/test/finish` con `ENABLE_TEST_ROUTES=true` para forzar un ganador. No se expone en producción.

Ejemplos completos y errores: [docs/api.md](docs/api.md). El resto de documentación está en [docs/](docs/).

## Variables de entorno

| Variable                 | Uso                                       | Producción                                                      |
| ------------------------ | ----------------------------------------- | --------------------------------------------------------------- |
| `PORT`                   | Puerto de Express; por defecto `3000`.    | Render la proporciona automáticamente.                          |
| `NODE_ENV`               | Entorno de ejecución.                     | Configurar como `production`; el código no lo lee directamente. |
| `ENABLE_TEST_ROUTES`     | Habilita el endpoint E2E de finalización. | No configurar.                                                  |
| `RENDER_DEPLOY_HOOK_URL` | URL usada por el workflow de despliegue.  | Secret de GitHub, nunca variable pública.                       |

## Render y CI/CD

Se recomienda un único **Web Service** de Render: Express ya sirve API y frontend compilado; Docker no aporta beneficio para esta arquitectura.

```text
Build Command: npm ci && npm run build
Start Command: npm run start
Health Check Path: /api/health
NODE_ENV: production
```

Crear un Deploy Hook de Render y guardar la URL como secret `RENDER_DEPLOY_HOOK_URL`. El workflow se activa en push a `main` o manualmente con **Actions → Deploy to Render → Run workflow**.

**Enlace al despliegue:** pendiente. Todavía no se ha creado el Web Service público de Render, por lo que no se incluye una URL inventada.
