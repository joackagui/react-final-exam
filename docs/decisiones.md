# Decisiones técnicas

## Arquitectura y estado autoritativo

Se eligió un monorepo npm: `client/` para Vite + React, `server/` para Express y `Assets/` como fuente original. Express publica `/Assets` y, en producción, entrega `client/dist` junto a la API desde un único origen. El objeto `Game` vive en un `Map` del servidor; React manda acciones y renderiza JSON, pero no decide colisiones, daño ni ganador.

## Tick y polling en lugar de WebSockets

Express ejecuta un tick cada 100 ms para rotar barcos, aplicar viento, mover proyectiles y comprobar impactos. React consulta `GET /api/games/:id` cada 120 ms. Elegimos polling REST porque el alcance pedía `fetch` nativo y las actualizaciones son pequeñas. El costo es hasta unos 120 ms de desfase; WebSockets serían una mejora para más jugadores o menor latencia, pero agregan reconexión y un protocolo de eventos innecesarios aquí.

El viento usa `changedAt` y `nextChangeAt` ISO. Cada tick compara la hora del servidor con `nextChangeAt`; al vencer, selecciona una dirección y programa 30 segundos más. Su influencia es deliberadamente moderada: modifica hasta 10 % la velocidad del barco y la velocidad de giro, y aplica una deriva pequeña a los proyectiles. La conducción usa una velocidad base de 1.35 para Pirata y 1.05 para Fantasma, con giro de 45 grados por segundo. `changedRecently` vale `true` solo durante tres segundos. El estado no es persistente: reiniciar Express elimina partidas; una futura base de datos debería guardar `Game` y sus fechas.

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

Los proyectiles se representan como balas de cañón oscuras mediante CSS: el cuerpo negro busca una apariencia más realista y el borde y la estela naranja conservan una referencia visual a la pólvora. Así se mantiene la visibilidad sobre el mar sin agregar una librería de gráficos.

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
| Giros poco naturales            | Cada pulsación produce un único giro; no se acumulan órdenes mientras se mantiene la tecla.                   |

## Cambios relevantes

1. De salud/eco inicial a partidas con tick, daño, proyectiles y ganador.
2. De 18 rocas a 8–15 aleatorias con zonas iniciales protegidas.
3. Viento con fechas y `changedRecently` para el aviso temporal.
4. Frontend con selector, mapa, HUD, impacto, resultado y polling.
5. Playwright, ESLint y workflows independientes de lint, E2E y despliegue.
6. Workflow adicional de GitHub Pages con base `/react-final-exam/` y assets incluidos en el artefacto estático.

## Registro de uso de IA

La IA se utilizó como apoyo puntual y no como fuente principal del desarrollo. La mayor parte de la implementación, las decisiones de diseño, la integración React-Express y las pruebas fueron realizadas y verificadas por el estudiante. Se consultó para aclarar errores, revisar alternativas y obtener sugerencias concretas; cada propuesta incorporada se adaptó al proyecto y se comprobó localmente.

| Uso puntual      | Para qué se consultó                            | Qué se incorporó                                 | Qué verificó el estudiante                                  |
| ---------------- | ----------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| Revisión técnica | Errores de workflow, despliegue y documentación | Ajustes menores en Actions, README y documentos  | Build, lint, pruebas E2E y ejecución local.                 |
| Revisión visual  | Alternativas para representar la bala           | Bala negra con borde y estela naranja de pólvora | Interfaz compilada y comportamiento visual en el navegador. |
