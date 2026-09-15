# API HTTP REST

Todas las rutas de API reciben y responden JSON. El servidor mantiene las partidas en memoria durante esta etapa; reiniciar el servidor elimina las partidas creadas.

Las rutas públicas de la aplicación son `/api/health`, `/api/echo`, `/api/games`, `/api/games/:id` y `/api/games/:id/action`. Además, existe una ruta exclusiva para las pruebas E2E cuando se inicia el servidor con `ENABLE_TEST_ROUTES=true`.

## `GET /api/health`

Comprueba que Express está disponible. No requiere cuerpo.

### Response `200 OK`

```json
{
  "status": "ok"
}
```

## `POST /api/echo`

Ruta auxiliar que devuelve el cuerpo JSON recibido. No participa en la partida, pero está implementada en el servidor.

### Request

```json
{
  "message": "prueba"
}
```

### Response `200 OK`

```json
{
  "message": "prueba"
}
```

## `POST /api/games`

Crea una partida con los dos personajes ya seleccionados. El orden es parte del contrato: el jugador 1 es Pirata y el jugador 2 es Fantasma. El servidor genera el mapa de `30 × 18`, entre 8 y 15 rocas, las posiciones iniciales y el viento.

### Request

```json
{
  "players": [
    { "id": "ana", "character": "pirate" },
    { "id": "bruno", "character": "ghost" }
  ]
}
```

### Response `201 Created`

```json
{
  "id": "c7819956-1d94-4f4d-9ea1-f0d10b576d57",
  "status": "en_curso",
  "createdAt": "2026-09-14T23:30:00.000Z",
  "players": [
    {
      "id": "ana",
      "number": 1,
      "character": "pirate",
      "shipId": "ship-pirate"
    },
    { "id": "bruno", "number": 2, "character": "ghost", "shipId": "ship-ghost" }
  ],
  "ships": [
    {
      "id": "ship-pirate",
      "playerId": "ana",
      "character": "pirate",
      "position": { "x": 1, "y": 16 },
      "orientation": "north_east",
      "orientationDegrees": 45,
      "targetOrientation": "north_east",
      "targetOrientationDegrees": 45,
      "angularSpeedDegreesPerSecond": 45,
      "speed": "high",
      "baseSpeed": 1.35,
      "effectiveSpeed": 1.35,
      "health": 80,
      "maxHealth": 80,
      "shotDamage": 20
    },
    {
      "id": "ship-ghost",
      "playerId": "bruno",
      "character": "ghost",
      "position": { "x": 28, "y": 1 },
      "orientation": "south_west",
      "orientationDegrees": 225,
      "targetOrientation": "south_west",
      "targetOrientationDegrees": 225,
      "angularSpeedDegreesPerSecond": 45,
      "speed": "medium",
      "baseSpeed": 1.05,
      "effectiveSpeed": 1.05,
      "health": 100,
      "maxHealth": 100,
      "shotDamage": 25
    }
  ],
  "map": {
    "width": 30,
    "height": 18,
    "obstacles": [
      { "id": "rock-1", "position": { "x": 8, "y": 6 }, "kind": "rock" }
    ]
  },
  "wind": {
    "direction": "east",
    "changedAt": "2026-09-14T23:30:00.000Z",
    "nextChangeAt": "2026-09-14T23:30:30.000Z",
    "changedRecently": false
  },
  "activeProjectiles": [],
  "winnerPlayerId": null
}
```

El arreglo `obstacles` real contiene entre 8 y 15 rocas. Sus coordenadas y la dirección del viento cambian en cada partida.

### Response `400 Bad Request`

```json
{
  "error": "Se requieren dos jugadores distintos: primero pirate y segundo ghost."
}
```

## `GET /api/games/:id`

Devuelve el estado completo actual de una partida. El frontend la consulta cada 120 ms mientras la partida está en curso.

### Request

```http
GET /api/games/c7819956-1d94-4f4d-9ea1-f0d10b576d57
```

### Response `200 OK`

Devuelve el mismo esquema completo de estado de `POST /api/games`, incluyendo jugadores, barcos, mapa, viento, proyectiles y ganador. `activeProjectiles` puede contener objetos con `id`, `ownerPlayerId`, `position`, `direction`, `headingDegrees`, `speed`, `damage` y `active`.

### Response `404 Not Found`

```json
{
  "error": "Partida no encontrada."
}
```

## `POST /api/games/:id/action`

Aplica una acción al estado autoritativo del servidor y devuelve la partida actualizada. El barco siempre avanza en su orientación actual: los giros cambian el objetivo de orientación y el bucle del servidor rota progresivamente a `45` grados por segundo.

### Girar 12 grados

```json
{
  "playerId": "ana",
  "action": "turn_right"
}
```

También se admite `turn_left`.

### Orientar hacia una tecla/dirección

Esta variante permite al frontend transformar flechas o WASD en una dirección explícita, sin cambiar instantáneamente el ángulo actual:

```json
{
  "playerId": "ana",
  "action": "turn_to",
  "direction": "north"
}
```

Las direcciones válidas son `north`, `north_east`, `east`, `south_east`, `south`, `south_west`, `west` y `north_west`.

### Disparar

```json
{
  "playerId": "bruno",
  "action": "shoot"
}
```

El servidor crea tres proyectiles con el daño del barco atacante y devuelve el estado completo de la partida con los proyectiles activos.

### Response `200 OK`

Devuelve el mismo esquema completo de `GET /api/games/:id`. Cada barco incluye `orientationDegrees`, `targetOrientation`, `targetOrientationDegrees`, `baseSpeed` y `effectiveSpeed`; cada proyectil incluye `headingDegrees`.

### Errores

| Estado | Situación                                           | Ejemplo                                                                                     |
| ------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `400`  | Cuerpo o acción inválida                            | `{ "error": "Acción inválida. Use turn_left, turn_right, turn_to con direction o shoot." }` |
| `403`  | El `playerId` no pertenece a la partida             | `{ "error": "El jugador no pertenece a esta partida." }`                                    |
| `404`  | El `id` de partida no existe                        | `{ "error": "Partida no encontrada." }`                                                     |
| `409`  | Se intenta actuar, incluso disparar, tras finalizar | `{ "error": "La partida ya finalizó." }`                                                    |

## `POST /api/games/:id/test/finish` (solo pruebas)

Esta ruta se registra únicamente cuando `ENABLE_TEST_ROUTES=true`. Permite terminar una partida de forma determinista para probar la pantalla de resultado.

### Request

```json
{
  "winnerPlayerId": "ana"
}
```

### Response `200 OK`

Devuelve el estado completo de la partida con `status: "finalizada"`, `winnerPlayerId: "ana"` y los proyectiles activos vaciados.

### Errores

```json
{
  "error": "No se pudo finalizar la partida de prueba."
}
```

La ruta responde `404` si la partida no existe y `400` si el ganador no pertenece a la partida o esta ya terminó. No debe habilitarse en producción.

## Decisión técnica: tick con REST

Express ejecuta un tick interno cada `100 ms`. En cada tick, el servidor rota paulatinamente cada barco hacia su objetivo, calcula su velocidad efectiva según la alineación con el viento, lo desplaza hacia delante, mueve proyectiles y resuelve los impactos. El viento se renueva en el servidor cada 30 segundos.

El navegador no simula reglas: envía acciones mediante `fetch` y consulta `GET /api/games/:id` periódicamente para renderizar el estado. Esta decisión respeta la comunicación HTTP REST con JSON y evita que dos clientes produzcan estados distintos sin requerir WebSockets.

Ante una roca, el barco conserva su posición, recibe 10 de daño y rebota invirtiendo de inmediato orientación y objetivo. Es la respuesta más simple que evita que un barco quede aplicando daño repetido contra la misma roca en ticks sucesivos.
