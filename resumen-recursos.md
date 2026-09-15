# Resumen de Tecnologías, Importaciones y Recursos

**Curso:** Frontend con React (UPB, Ingeniería de Sistemas Computacionales)
**Fuente:** notas de las clases contenidas en la carpeta `Documents` (14 archivos PDF).

Este documento resume los lenguajes, herramientas, bibliotecas, importaciones, paquetes, scripts, archivos de configuración, recursos externos y APIs encontrados en el material del curso.

---

## 1. Tecnologías y lenguajes usados en el curso

| Tecnología | Uso en el curso |
| --- | --- |
| **HTML5** | Estructura de documentos, HTML semántico, formularios, multimedia, accesibilidad. |
| **CSS** | Presentación: selectores, modelo de caja, colores, tipografía, positioning, Flexbox y Grid. |
| **JavaScript (ECMAScript)** | Comportamiento: variables, operadores, funciones, DOM, eventos, Promises, `fetch`, asincronía. |
| **TypeScript** | JavaScript con tipos: anotaciones, clases, `interface`, `type`, uniones, `enum`. |
| **React** | Biblioteca de componentes de UI: JSX, componentes, `createRoot`, `useState`, `useEffect`. |
| **Node.js** | Ejecución de JavaScript en terminal (v20 LTS y v22). |
| **npm / npx** | Gestión de paquetes y ejecución de scripts. |
| **Vite** | Herramienta de desarrollo: plantillas React/React+TS, servidor local, build y proxy. |
| **Express** | Servidor HTTP backend con Node.js y TypeScript. |
| **ESLint** | Validación de calidad del código JavaScript en CI. |
| **Git / GitHub** | Control de versiones, repositorios y platforma de automatización. |
| **GitHub Actions** | Automatización: validación, build, artefactos y despliegue. |
| **GitHub Pages** | Publicación del build de la aplicación. |
| **YAML** | Sintaxis de los archivos de workflows de GitHub Actions. |

---

## 2. Contenido por clase (archivos analizados)

1. `clase-01-2026-07-30.pdf` — Internet, clientes/servidores, DNS, URL, HTTP/HTTPS, modelo OSI.
2. `clase-02-2026-07-31.pdf` — HTML semántico, accesibilidad, estructura mínima, enlaces, imágenes, formularios.
3. `clase-03-2026-08-03.pdf` — Formularios HTML y validación nativa.
4. `clase-04-2026-08-04.pdf` — CSS: reglas, selectores, modelo de caja, cascada.
5. `clase-05-2026-08-05.pdf` — CSS: dimensiones, unidades, colores, tipografía, pseudoclases. Mini juegos de emojis.
6. `clase-06-2026-08-10.pdf` — CSS: positioning y Flexbox.
7. `clase-08-2026-08-12.pdf` — Introducción a JavaScript y al DOM.
8. `clase-08-2026-08-17.pdf` — GitHub Actions: validación con ESLint.
9. `clase-12-2026-08-18.pdf` — JavaScript: DOM y eventos.
10. `clase-12-2026-08-21.pdf` — TypeScript: tipos, clases y Buscaminas.
11. `clase-18-2026-08-26.pdf` — React: JSX, componentes y renderizado (CDN + Vite, 3 en raya estático).
12. `clase-19-2026-08-27.pdf` — React: estado, eventos, renderizado condicional, 3 en raya interactivo.
13. `clase-20-2026-08-31.pdf` — Efectos y datos: `useEffect`, `fetch`, Express, Minimax.
14. `clase-23-2026-09-02.pdf` — Juego de bloques: tiempo (`setInterval`), teclado y estado en React.

---

## 3. HTML: elementos y atributos empleados

### Estructura y semántica

`<!doctype html>`, `<html lang="es">`, `<head>`, `<body>`, `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`, `<div>`, `<span>`.

### Head / metadatos

`<meta charset="UTF-8">`, `<meta name="viewport">`, `<meta name="description">`, `<title>`, `<link rel="stylesheet">`, `<link rel="icon">`, `<style>`, `<script src="...">`, `<script type="module">`.

### Texto y contenido

`h1`–`h6`, `p`, `br`, `hr`, `strong`, `em`, `mark`, `code`, `q`, `blockquote`, `<cite>`, `ul`, `ol`, `li`, `dl`, `dt`, `dd`.

### Enlaces, imágenes y multimedia

`<a href>`, `<img src alt>` (con `width`/`height`), `<figure>`, `<figcaption>`, `<video controls>`, `<source>` (video/mp4), `<iframe>` (con `title`).

### Tablas (datos tabulares, no layout)

`<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope>`, `<td>`.

### Formularios

`<form>` (`action`, `method="get|post"`, `autocomplete`, `novalidate`), `<label for>`, `<fieldset>`, `<legend>`, `<input>` (tipos: `text`, `email`, `tel`, `number`, `date`, `password`, `checkbox`, `radio`, `file`, `search`), `<select>`, `<option>`, `<textarea>`, `<button>` (`type="submit|reset|button"`), `<details>`, `<summary>`, `<progress>`, `<meter>`.

### Atributos clave

`id`, `class`, `lang`, `href`, `src`, `alt`, `name`, `required`, `min`, `max`, `step`, `minlength`, `maxlength`, `value`, `pattern`, `inputmode`, `aria-label`, `aria-describedby`, `title`.

### Entidades HTML

`&lt;`, `&gt;`, `&amp;`, y entidades numéricas de emojis (ej. `&#128163;`, `&#11088;`, `\u274c`, `\u2b55` en JSX).

---

## 4. CSS: selectores, propiedades y unidades

### Selectores

Tipo (`p`), clase (`.clase`), `id` (`#id`), atributo (`input[required]`), agrupación, descendencia (`.entrada h2`), combinador de hermanos posteriores (`input:checked ~ .estado`).

### Pseudoclases

`:hover`, `:focus`, `:active`, `:checked`, `:invalid`, `:focus-visible`.

### Propiedades frecuentes

`color`, `background-color`, `background`, `border`, `border-collapse`, `border-radius`, `border-bottom`, `padding`, `margin`, `width`, `height`, `max-width`, `min-height`, `font-family`, `font-size`, `font-weight`, `font: inherit`, `line-height`, `text-align`, `vertical-align`, `box-sizing`, `display` (`block`, `inline`, `none`, `flex`, `grid`), `position` (`static`, `relative`, `absolute`, `fixed`, `sticky`), `top`, `right`, `bottom`, `left`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `align-self`, `gap`, `flex: 1 1 14rem`, `grid-template-columns`, `place-content`, `transition`, `cursor`, `overflow`, `transform`, `margin-left: auto`.

### Unidades

`px`, `rem`, `em`, `%`, `vw`, `vh`.

### Colores

Nombres (`white`, `navy`), hexadecimal (`#FF0000`), `rgb()`, `hsl()`, y variables CSS en `:root` (`--azul`, `--tinta`, `--fondo`) con `var(...)`.

### Modelo de caja

Contenido, `padding`, `border`, `margin`; `box-sizing: border-box`.

---

## 5. JavaScript: APIs del navegador y del lenguaje

### APIs del navegador (web APIs)

`window`, `document`, `document.body`, `document.documentElement`, `document.head`, `document.getElementById`, `document.querySelector`, `document.querySelectorAll`, `document.createElement`, `element.append`, `element.textContent`, `element.style`, `element.classList` (`add`, `contains`), `element.addEventListener`, `element.hidden`, `alert`, `prompt`, `console.log`, `console.warn`, `console.error`, `fetch`, `Response.ok`, `Response.status`, `Response.text()`, `Response.json()`, `Response.headers`, `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `globalThis`, `KeyboardEvent.code` (`'Space'`), evento `keydown`, `AbortController`.

### Sintaxis y tipos del lenguaje

`const`, `let`, `var`, `string`, `number`, `boolean`, `null`, `undefined`, `typeof` por inferencia, comparaciones con `===` / `!==` / `==`.

### Operadores

Aritméticos (`+`, `-`, `*`, `/`, `%`, `**`), asignación (`=`, `+=`), comparación (`===`, `!==`, `<=`, `>=`), lógicos (`&&`, `||`, `!`), spread (`...`), módulo (`%`), ternario (`condición ? a : b`).

### Estructuras y funciones

`if/else if/else`, `for`, `for...of`, funciones declaradas, arrow functions `() =>`, parámetros, `return`, alcance global/función/bloque, clases.

### Métodos de arreglos

`map()`, `filter()`, `slice()`, `fill()`, `findIndex()`, `includes()`, `every()`, `forEach()`, `push()`, `pop()`, `Array<T>(n)`.

### Otros

`Math.random()`, `Math.floor()`, `Math.max()`, `Math.min()`, `Math.abs` (implícito), `JSON.stringify()`, `Number()`, `new Error()`, Promises (`resolve`, `reject`, `then`, `catch`), `async`/`await`, `void`, `Promise<void>`.

---

## 6. Importaciones (import) encontradas

### React (desde CDN de módulos ES)

```js
import React from 'https://esm.sh/react@19.2.8';
import { createRoot } from 'https://esm.sh/react-dom@19.2.8/client';
```

### React (proyecto local)

```js
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { useEffect } from 'react';
import './style.css';          // o './index.css'
import Contador from './Contador';        // o TresEnRaya / App
```

### Vite

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
```

### ESLint

```js
import js from '@eslint/js';
import globals from 'globals';
export default [ ... ];   // js.configs.recommended, globals.browser
```

### Express (backend)

```js
import express from 'express';
import { mejorMovimiento, type Tablero } from './servicios/minimax.js';
```

---

## 7. Paquetes npm y dependencias

### Proyecto frontend (React)

Instalados por la plantilla de Vite (`npm install`): `react`, `react-dom`, `@types/react`, `@types/react-dom`, `vite`, `@vitejs/plugin-react`, `typescript` (plantilla `react-ts`).

### Proyecto backend (Express)

```bash
npm init -y
npm install express
npm install --save-dev typescript tsx @types/node @types/express
npx tsc --init
```

### ESLint (validación JS)

```bash
npm install --save-dev eslint @eslint/js globals
```

### TypeScript (solo) para `typecheck`

```bash
npm install --save-dev typescript        # luego npx tsc
```

---

## 8. Scripts (package.json)

| Script | Comando | Ámbito |
| --- | --- | --- |
| `check:js` | `eslint .` | Proyecto JS (CI) |
| `typecheck` | `tsc --noEmit` | Proyecto TypeScript |
| `dev` | `tsx watch src/server.ts` | Backend Express |
| `build` | `tsc` | Backend Express |
| `start` | `node dist/server.js` | Backend Express |
| `dev` | `vite` | Frontend Vite |
| `build` | `tsc -b && vite build` | Frontend Vite (React+TS) |
| `preview` | `vite preview` | Frontend Vite |

---

## 9. Archivos de configuración

- `package.json` y `package-lock.json` (dependencias y lockfile versionado).
- `eslint.config.mjs` (configuración de ESLint con `js.configs.recommended` y `globals.browser`).
- `tsconfig.json` (frontend: `lib: ["dom","es2020"]`, `strict`, `target: "es2020"`, `noEmitOnError`; backend: `module/moduleResolution: NodeNext`, `esModuleInterop`, `strict`, `outDir: "dist"`, `include: ["src"]`).
- `vite.config.ts` (`plugins: [react()]`, `base: '/nombre-repositorio/'`, `server.proxy: { '/api': 'http://localhost:3000' }`).
- `index.html` (con `<div id="root">` y `<script type="module" src="/src/main.tsx">`).
- `src/main.tsx`, `src/App.tsx`, `src/Contador.tsx`, `src/TresEnRaya.jsx/.tsx`, `src/index.css`, `src/ListaPublicaciones.tsx`.
- Backend: `src/server.ts`, `src/servicios/minimax.ts`.

---

## 10. GitHub Actions: workflows y recursos

### Carpetas y archivos

`.github/workflows/` con archivos `.yml`/`.yaml`: `hello.yml`, `javascript-check.yml`, `typecheck.yml`, `build-artifact.yml`, `deploy-pages.yml`.

### Eventos (`on`)

`push`, `pull_request`, `workflow_dispatch`.

### Trabajos y runner

`jobs`.`,`runs-on: ubuntu-latest`, pasos`uses` (actions reutilizables) y `run` (comandos shell), `working-directory`,`with` (parámetros como `node-version`,`cache`,`path`,`cache-dependency-path`),`permissions`,`concurrency`,`environment` (nombre `github-pages`,`url`).

### Acciones reutilizables usadas

| Acción | Versión | Propósito |
| --- | --- | --- |
| `actions/checkout` | `@v4` | Descarga el repositorio en el runner |
| `actions/setup-node` | `@v4` | Configura Node.js (v20 o v22) y caché de npm |
| `actions/upload-artifact` | `@v4` | Publica artefacto ZIP (build) |
| `actions/configure-pages` | `@v5` | Configura GitHub Pages |
| `actions/upload-pages-artifact` | `@v4` | Sube `dist` para Pages |
| `actions/deploy-pages` | `@v4` | Despliega el sitio en GitHub Pages |

### Cadena típica de un workflow

`checkout` → `setup-node` → `npm ci` / `npm install` → comando de validación o build (`npm run check:js`, `npm run typecheck`, `npm run build`) → artefacto o despliegue.

---

## 11. Recursos externos y APIs consumidas

### CDN

- `https://esm.sh/react@19.2.8`
- `https://esm.sh/react-dom@19.2.8/client`
- `esm.sh` y `esm.unpkg.com` (CDNs de módulos ES mencionadas).

### APIs remotas

- JSONPlaceholder: `https://jsonplaceholder.typicode.com/posts` (con `?_limit=5`).

### Servidores locales (desarrollo)

- Frontend Vite: `http://localhost:5173`
- Backend Express: `http://localhost:3000`

### Rutas del servidor Express

- `GET /api/saludo` → texto plano.
- `GET /api/saludo-json` → JSON (`{ mensaje, tecnologia }`).
- `POST /api/jugada` → calcula la jugada de la PC con Minimax (recibe `{ tablero, turno }`, responde `{ tablero, turno, estado }`; inicialmente respondía `501`).

### Métodos HTTP documentados

`GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `TRACE`, `CONNECT`; códigos de estado `1xx`–`5xx` (200, 201, 301/302, 400, 401, 403, 404, 500, 503); headers `Content-Type` y `Accept`.

### Herramientas de terminal

- `dig`, `nslookup` — consulta DNS.
- `curl` (`-I`, `-i`, `-X POST/PUT/PATCH/DELETE/OPTIONS`, `-H`, `-d`) — solicitudes HTTP.
- `Invoke-WebRequest` (PowerShell).
- `node`, `npm`, `npx`, `tsc`, `tsx`.

---

## 12. Algoritmos y conceptos de programación

- Algoritmo **Minimax** con evaluación recursiva (puntajes `1` / `-1` / `0`) para la jugada de la PC en 3 en raya (índice `-Infinity`/`Math.max`).
- Motivo `ganador`, `resultado`, `oponente`, `mejorMovimiento`.
- Modelado de datos: tipos unión (`type Marca = 'X' | 'O'`), `type Celda`, `type Tablero = Celda[]`, `enum EstadoJuego`.
- React: inmutabilidad del estado (copia con `map()` y `spread`), clave `key` en listas, renderizado condicional con `if`, `&&` y ternario, `useState` con actualización funcional, `useEffect` con limpieza (`clearInterval`, `removeEventListener`, `AbortController`).

---

## 13. Versiones y requisitos de entorno

- **React 19.2.8** (línea estable mencionada en el curso).
- **Node.js**: v20 LTS (ESLint), v22 (TypeScript/build), mínimo Vite `20.19` o `22.12`.
- **TypeScript** `^5.6.3` (ejemplo en clase).
- **Git**: instalación verificada con `git --version`.
