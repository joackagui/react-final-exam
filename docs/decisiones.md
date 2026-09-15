# Decisiones técnicas

## Arquitectura y estado autoritativo

Se eligió un monorepo npm: `client/` para Vite + React, `server/` para Express y `Assets/` como fuente original. Express publica `/Assets` y, en producción, entrega `client/dist` junto a la API desde un único origen. El objeto `Game` vive en un `Map` del servidor; React manda acciones y renderiza JSON, pero no decide colisiones, daño ni ganador.

## Tick y polling en lugar de WebSockets

Express ejecuta un tick cada 100 ms para rotar barcos, aplicar viento, mover proyectiles y comprobar impactos. React consulta `GET /api/games/:id` cada 120 ms. Elegimos polling REST porque el alcance pedía `fetch` nativo y las actualizaciones son pequeñas. El costo es hasta unos 120 ms de desfase; WebSockets serían una mejora para más jugadores o menor latencia, pero agregan reconexión y un protocolo de eventos innecesarios aquí.

El viento usa `changedAt` y `nextChangeAt` ISO. Cada tick compara la hora del servidor con `nextChangeAt`; al vencer, selecciona una dirección y programa 30 segundos más. `changedRecently` vale `true` solo durante tres segundos. El estado no es persistente: reiniciar Express elimina partidas; una futura base de datos debería guardar `Game` y sus fechas.

## Boceto de pantalla

```text
+--------------------------------------------------------------+
| [Vida Pirata]                                  [Vida Fantasma]|
|    roca       Pirata -->         proyectiles -->             |
|                                  <-- Fantasma                 |
|                 aviso de viento temporal                     |
+--------------------------------------------------------------+
```

Se usaron elementos HTML absolutos y CSS en vez de canvas. Para un mapa pequeño, React puede declarar rocas, barcos y proyectiles desde el estado; CSS rota sprites y anima el impacto sin añadir un ciclo de dibujo imperativo.

## Riesgos y mitigaciones

| Riesgo                          | Mitigación                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Estado visual atrasado          | Polling moderado y servidor como única autoridad.                                                             |
| Daño repetido dentro de roca    | No se acepta la posición y se invierte orientación.                                                           |
| Inicio bloqueado                | Radio seguro de cuatro celdas al generar rocas.                                                               |
| E2E de finalización aleatorio   | Ruta de prueba solo con `ENABLE_TEST_ROUTES=true`.                                                            |
| Fallo E2E sin evidencia         | Actions publica `playwright-report/` y `test-results/`.                                                       |
| Ruta de prueba expuesta         | No se registra sin la variable de entorno exacta.                                                             |
| Reinicio borra partida          | Limitación documentada; persistencia futura.                                                                  |
| GitHub Pages no ejecuta Express | Pages publica solo `client/dist`; `VITE_API_URL` apunta a un backend separado y CORS permite la comunicación. |

## Cambios relevantes

1. De salud/eco inicial a partidas con tick, daño, proyectiles y ganador.
2. De 18 rocas a 8–15 aleatorias con zonas iniciales protegidas.
3. Viento con fechas y `changedRecently` para el aviso temporal.
4. Frontend con selector, mapa, HUD, impacto, resultado y polling.
5. Playwright, ESLint y workflows independientes de lint, E2E y despliegue.
6. Workflow adicional de GitHub Pages con base `/react-final-exam/` y assets incluidos en el artefacto estático.

## Registro de uso de IA

| Prompt/etapa       | Qué se le pidió                               | Qué se incorporó                                             | Qué verifiqué                                                                                          |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Lógica de acciones | Movimiento, disparos, colisiones, tick y REST | `Game`, acciones, tick de 100 ms, proyectiles y errores HTTP | Build y solicitudes locales: 404, 403 y tres proyectiles.                                              |
| Frontend           | Selector, mapa, HUD, controles y assets       | React con polling de 120 ms, teclas, sprites y pantallas     | Build de Vite exitoso.                                                                                 |
| Mapa y viento      | Rocas aleatorias y aviso temporal             | 8–15 rocas, radio seguro, fechas y `changedRecently`         | Partida con 10 rocas, inicio protegido y viento inicial.                                               |
| E2E                | Playwright y finalización controlada          | Cuatro pruebas y ruta de prueba condicionada                 | `npm run test:e2e`: 4 pruebas aprobadas; también se comprobó la prueba específica de barcos y nombres. |
| Calidad y CI/CD    | ESLint, Actions y Render                      | ESLint TS, workflows y Deploy Hook                           | `npm run lint`, build y E2E aprobados.                                                                 |
