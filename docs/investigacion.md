# Investigación técnica

## Playwright

Se investigó Playwright para cumplir las pruebas E2E visuales y automatizadas. La documentación oficial lo presenta como un framework E2E con runner, aserciones, aislamiento y ejecución headless o headed; también documenta `webServer` y `baseURL` para arrancar la app antes de probarla.

La configuración real en `playwright.config.ts` construye el proyecto, inicia Express aislado en el puerto 3001 con `ENABLE_TEST_ROUTES=true`, espera `/api/health` y usa Chromium para CI. El proyecto `chrome` permite ejecución visual. Las pruebas cubren selector, creación, barcos, `POST /api/games`, resultado forzado y reinicio.

Ejecución local verificada:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

El resultado comprobado fue **4 pruebas aprobadas**. Para defensa visual: `npm run test:e2e:headed`. El Mac de desarrollo no tenía Google Chrome en `/Applications`, por lo que debe instalarse para este modo. La primera descarga dejó incompleto Chromium headless; Playwright informó el ejecutable faltante y se resolvió instalando `chromium-headless-shell` antes de repetir la suite.

Fuentes: [Playwright Installation](https://playwright.dev/docs/intro) y [Playwright Web server](https://playwright.dev/docs/test-webserver).

## GitHub Pages y Render

GitHub Pages se eligió para publicar el frontend Vite como un artefacto estático mediante GitHub Actions. El workflow usa `configure-pages`, `upload-pages-artifact` y `deploy-pages`, y construye con `VITE_BASE_PATH=/react-final-exam/` para que los recursos funcionen bajo la URL del repositorio.

GitHub Pages no ejecuta Node.js ni Express. Por eso el backend debe mantenerse en un Web Service separado, para el que Render es una opción adecuada: soporta Express, permite build/start commands, asigna URL pública y usa `PORT`. El frontend recibe esa URL mediante la variable de repositorio `VITE_API_URL`; Express acepta el origen de Pages mediante `CORS_ORIGIN`.

La configuración del backend es `npm ci && npm run build`, `npm run start` y health check `/api/health`. Render provee `PORT`; se configura `NODE_ENV=production`, `CORS_ORIGIN` con la URL de Pages y no `ENABLE_TEST_ROUTES`. El workflow separado puede llamar al Deploy Hook guardado en el secret `RENDER_DEPLOY_HOOK_URL`; `workflow_dispatch` permite dispararlo manualmente.

Limitaciones: Pages por sí solo muestra la interfaz pero no puede crear partidas sin `VITE_API_URL`; el backend conserva el estado en memoria y lo pierde al redeploy; además, un plan gratuito puede introducir inicio en frío. La URL concreta de Pages depende del propietario real del repositorio.

Fuente: [Render Web Services](https://render.com/docs/web-services).
Fuente: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
