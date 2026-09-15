import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createGame, getGame, isCreateGameRequest } from './game/game-store.js'

const app = express()
const port = Number(process.env.PORT) || 3000
const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const clientBuildDirectory = path.resolve(currentDirectory, '../../client/dist')

app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.post('/api/echo', (request, response) => {
  response.json(request.body)
})

app.post('/api/games', (request, response) => {
  if (!isCreateGameRequest(request.body)) {
    response.status(400).json({
      error: 'Se requieren dos jugadores distintos: primero pirate y segundo ghost.',
    })
    return
  }

  response.status(201).json(createGame(request.body))
})

app.get('/api/games/:id', (request, response) => {
  const game = getGame(request.params.id)

  if (!game) {
    response.status(404).json({ error: 'Partida no encontrada.' })
    return
  }

  response.json(game)
})

app.use(express.static(clientBuildDirectory))

app.get('/{*path}', (_request, response) => {
  response.sendFile(path.join(clientBuildDirectory, 'index.html'))
})

app.listen(port, () => {
  console.log(`Servidor disponible en http://localhost:${port}`)
})
