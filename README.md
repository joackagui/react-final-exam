# React Final Exam

Base de un juego naval top-down para dos jugadores en el mismo dispositivo. Esta primera etapa configura React + TypeScript, Express + TypeScript y comunicación HTTP REST con JSON; todavía no incorpora lógica de juego.

## Requisitos

- Node.js 20 o posterior.
- npm.

## Comandos

```bash
npm run dev
npm run build
npm run start
```

`npm run dev` inicia Vite para el cliente y Express para la API. `npm run build` compila ambos proyectos. `npm run start` sirve `client/dist` y la API mediante Express en `http://localhost:3000`.

## API inicial

- `GET /api/health` devuelve `{ "status": "ok" }`.
- `POST /api/echo` recibe JSON y devuelve el mismo contenido.

La documentación técnica inicial se encuentra en [docs/arquitectura.md](docs/arquitectura.md). No se requieren variables de entorno para esta etapa.
