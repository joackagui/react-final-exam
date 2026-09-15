# API HTTP REST

Todas las rutas reciben y responden JSON. El servidor mantiene las partidas en memoria durante esta etapa; reiniciar el servidor elimina las partidas creadas.

## `POST /api/games`

Crea una partida con los dos personajes ya seleccionados. El orden es parte del contrato: el jugador 1 es Pirata y el jugador 2 es Fantasma. El servidor genera el mapa de `30 × 18`, 18 rocas, las posiciones iniciales y el viento.

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
    { "id": "ana", "number": 1, "character": "pirate", "shipId": "ship-pirate" },
    { "id": "bruno", "number": 2, "character": "ghost", "shipId": "ship-ghost" }
  ],
  "ships": [
    {
      "id": "ship-pirate",
      "playerId": "ana",
      "character": "pirate",
      "position": { "x": 1, "y": 16 },
      "orientation": "north_east",
      "speed": "high",
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
      "speed": "medium",
      "health": 100,
      "maxHealth": 100,
      "shotDamage": 25
    }
  ],
  "map": {
    "width": 30,
    "height": 18,
    "obstacles": [{ "id": "rock-1", "position": { "x": 8, "y": 6 }, "kind": "rock" }]
  },
  "wind": {
    "direction": "east",
    "changedAt": "2026-09-14T23:30:00.000Z",
    "nextChangeAt": "2026-09-14T23:30:30.000Z"
  },
  "activeProjectiles": [],
  "winnerPlayerId": null
}
```

El arreglo `obstacles` real contiene 18 rocas. Sus coordenadas y la dirección del viento cambian en cada partida.

### Response `400 Bad Request`

```json
{
  "error": "Se requieren dos jugadores distintos: primero pirate y segundo ghost."
}
```

## `GET /api/games/:id`

Devuelve el estado completo actual de una partida. El frontend podrá consultar esta ruta periódicamente cuando se implemente la interfaz jugable.

### Request

```http
GET /api/games/c7819956-1d94-4f4d-9ea1-f0d10b576d57
```

### Response `200 OK`

Devuelve el mismo esquema completo de estado de `POST /api/games`, incluyendo jugadores, barcos, mapa, viento, proyectiles y ganador.

### Response `404 Not Found`

```json
{
  "error": "Partida no encontrada."
}
```
