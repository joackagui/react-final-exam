# Arquitectura inicial

## Estructura

- `client/`: interfaz React con TypeScript creada con Vite.
- `server/`: API Express con TypeScript y servidor de producción.
- `e2e/`: ubicación reservada para las pruebas end-to-end obligatorias.
- `Assets/`: recursos visuales proporcionados para el juego. Se conservan en su ubicación original.

## Comunicación HTTP

El cliente consulta `GET /api/health` mediante `fetch` al cargar. Durante el desarrollo Vite reenvía las rutas `/api` al servidor Express en el puerto 3000. En producción Express sirve tanto la API como el build de `client/dist` desde un único origen.

## Endpoints iniciales

| Método | Ruta | Entrada JSON | Salida JSON |
| --- | --- | --- | --- |
| GET | `/api/health` | No aplica | `{ "status": "ok" }` |
| POST | `/api/echo` | Cualquier cuerpo JSON | El mismo cuerpo JSON |

La lógica de juego se añadirá después. Cuando exista, el backend asumirá responsabilidades significativas de la partida conforme a la consigna.
