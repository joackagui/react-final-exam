# Batalla de los Mares

Juego naval top-down local para dos personas. React representa la partida y Express conserva el estado autoritativo: movimiento, viento, daños, proyectiles y victoria.

> **Despliegue:** el frontend se publica en GitHub Pages y el backend Express debe publicarse por separado. La URL final depende del usuario/organización de GitHub y del Web Service de backend.

## Requisitos e instalación

- Node.js 22.x y npm.
- Para E2E headless: `npx playwright install chromium` después de instalar dependencias.
- Para pruebas visuales: Google Chrome instalado localmente.

```bash
npm ci
npx playwright install chromium
```

El frontend usa Vite 6 para evitar dependencias nativas opcionales de Rolldown en
los builds Linux de Render y GitHub Actions. El repositorio usa un único
`package-lock.json` en la raíz; no se debe crear otro dentro de `client/`.

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

## Ejecución local paso a paso

1. Instala Node.js 22 o superior.
2. Clona el repositorio y entra en su carpeta raíz.
3. Instala dependencias con `npm ci`.
4. Inicia el cliente y el servidor con `npm run dev`.
5. Abre `http://localhost:5173`. Vite redirige `/api` y `/Assets` al servidor local en el puerto `3000`.

Para probar el build como producción local:

```bash
npm run build
npm run start
```

Después abre `http://localhost:3000`.

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

| Variable                 | Uso                                                      | Producción                                                                                |
| ------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `PORT`                   | Puerto de Express; por defecto `3000`.                   | Render la proporciona automáticamente.                                                    |
| `NODE_ENV`               | Entorno de ejecución.                                    | Configurar como `production`; el código no lo lee directamente.                           |
| `ENABLE_TEST_ROUTES`     | Habilita el endpoint E2E de finalización.                | No configurar.                                                                            |
| `RENDER_DEPLOY_HOOK_URL` | URL usada por el workflow de despliegue.                 | Secret de GitHub, nunca variable pública.                                                 |
| `VITE_BASE_PATH`         | Prefijo de recursos del frontend.                        | `/react-final-exam/` en Pages; `/` localmente.                                            |
| `VITE_API_URL`           | URL base del backend Express para el build del frontend. | Variable de repositorio, por ejemplo `https://mi-backend.onrender.com`; no es un secreto. |
| `CORS_ORIGIN`            | Origen permitido por Express.                            | URL de Pages; por defecto `*` para desarrollo.                                            |

## GitHub Pages, Render y CI/CD

Se recomienda un único **Web Service** de Render: Express ya sirve API y frontend compilado; Docker no aporta beneficio para esta arquitectura.

```text
Build Command: npm ci && npm run build
Start Command: npm run start
Health Check Path: /api/health
NODE_ENV: production
```

El workflow `.github/workflows/pages.yml` instala dependencias, construye `client/` con base `/react-final-exam/`, sube `client/dist` y lo despliega con Pages. Se activa al hacer push a `main` o manualmente desde **Actions → Deploy to GitHub Pages → Run workflow**.

Para que el juego sea funcional en Pages, primero despliega el backend en Render con `npm ci --include=dev --include=optional && npm run build` y `npm run start`. Luego crea en GitHub una **Repository variable** llamada `VITE_API_URL` con la URL HTTPS del backend. En Render configura `CORS_ORIGIN` con la URL de Pages.

El log con rutas como `/opt/render/project/src` pertenece a Render, aunque el error se haya detectado mientras se configuraba Vercel. Vercel solo publica el frontend mediante `vercel.json`; no ejecuta esta API Express.

No necesitas un secret para GitHub Pages: el workflow usa `GITHUB_TOKEN` y los permisos declarados. `RENDER_DEPLOY_HOOK_URL` es opcional: si existe, `.github/workflows/deploy.yml` lo usa para disparar Render; si no existe, el build pasa pero Render no se dispara desde GitHub Actions. En ese caso Render puede desplegar automáticamente desde su integración con la rama `main`.

**Enlace esperado de GitHub Pages:** `https://<usuario-o-organizacion>.github.io/react-final-exam/`.
