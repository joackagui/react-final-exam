# Arquitectura inicial

## Estructura

- `client/`: interfaz React con TypeScript creada con Vite.
- `server/`: API Express con TypeScript y servidor de producción.
- `e2e/`: ubicación reservada para las pruebas end-to-end obligatorias.
- `Assets/`: recursos visuales proporcionados para el juego. Se conservan en su ubicación original.

## Comunicación HTTP

El cliente consulta `GET /api/health` mediante `fetch` al cargar. Durante el desarrollo Vite reenvía las rutas `/api` al servidor Express en el puerto 3000. En producción Express sirve tanto la API como el build de `client/dist` desde un único origen.

## Interfaz del juego

La interfaz usa componentes React y elementos HTML posicionados absolutamente para el mapa, rocas, barcos y proyectiles. Esta opción mantiene el renderizado sincronizado de forma declarativa con el estado JSON que entrega Express, sin introducir un motor de juego ni un canvas imperativo.

Las imágenes proporcionadas se conservan en `Assets/`. Express las publica en `/Assets` y Vite reenvía esa ruta al servidor durante el desarrollo; el cliente las referencia directamente, sin copiar, modificar ni generar recursos nuevos. Mientras una partida está en curso, React hace polling de `GET /api/games/:id` cada 120 ms y transmite acciones de teclado con `POST /api/games/:id/action` usando `fetch` nativo.

## Mapa y viento

Al crear una partida, el servidor genera entre 8 y 15 rocas en celdas aleatorias no ocupadas. También excluye un radio de cuatro celdas alrededor de las posiciones iniciales para que las embarcaciones puedan comenzar a moverse sin quedar bloqueadas.

El servidor guarda `wind.changedAt` y `wind.nextChangeAt` como fechas ISO. En cada tick de 100 ms compara el reloj actual con `nextChangeAt`; al alcanzarlo, elige una de ocho direcciones, actualiza ambas fechas y aplica el nuevo vector al avance de barcos y proyectiles. `wind.changedRecently` es verdadero únicamente durante los tres segundos posteriores a `changedAt`, por lo que el cliente muestra el aviso temporal sin calcular su propio tiempo.

Esta decisión mantiene al servidor como autoridad de la simulación y funciona con REST y polling. El calendario no se persiste: las partidas viven en memoria, así que reiniciar Express elimina las partidas activas y sus próximos cambios de viento. Para recuperarlas después de un reinicio sería necesario persistir el estado y sus marcas de tiempo en una base de datos.

## Endpoints iniciales

| Método | Ruta | Entrada JSON | Salida JSON |
| --- | --- | --- | --- |
| GET | `/api/health` | No aplica | `{ "status": "ok" }` |
| POST | `/api/echo` | Cualquier cuerpo JSON | El mismo cuerpo JSON |

La lógica de juego se añadirá después. Cuando exista, el backend asumirá responsabilidades significativas de la partida conforme a la consigna.
