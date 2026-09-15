import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyAction,
  createGame,
  forceFinishGame,
  getGame,
  isCreateGameRequest,
  isGameActionRequest,
  startGameLoop,
} from './game/game-store.js'

const app = express()
const port = Number(process.env.PORT) || 3000
const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const clientBuildDirectory = path.resolve(currentDirectory, '../../client/dist')
const gameAssetsDirectory = path.resolve(currentDirectory, '../../Assets')

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

app.post('/api/games/:id/action', (request, response) => {
  const game = getGame(request.params.id)

  if (!game) {
    response.status(404).json({ error: 'Partida no encontrada.' })
    return
  }

  if (!isGameActionRequest(request.body)) {
    response.status(400).json({
      error: 'Acción inválida. Use turn_left, turn_right, turn_to con direction o shoot.',
    })
    return
  }

  if (!game.players.some((player) => player.id === request.body.playerId)) {
    response.status(403).json({ error: 'El jugador no pertenece a esta partida.' })
    return
  }

  if (game.status === 'finalizada') {
    response.status(409).json({ error: 'La partida ya finalizó.' })
    return
  }

  applyAction(game, request.body)
  response.json(game)
})

if (process.env.ENABLE_TEST_ROUTES === 'true') {
  app.post('/api/games/:id/test/finish', (request, response) => {
    const game = getGame(request.params.id)
    const winnerPlayerId = request.body?.winnerPlayerId

    if (!game) {
      response.status(404).json({ error: 'Partida no encontrada.' })
      return
    }

    if (typeof winnerPlayerId !== 'string' || !forceFinishGame(game, winnerPlayerId)) {
      response.status(400).json({ error: 'No se pudo finalizar la partida de prueba.' })
      return
    }

    response.json(game)
  })
}

app.use('/Assets', express.static(gameAssetsDirectory))
app.use(express.static(clientBuildDirectory))

app.get('/{*path}', (_request, response) => {
  response.sendFile(path.join(clientBuildDirectory, 'index.html'))
})

startGameLoop()

app.listen(port, () => {
  console.log(`Servidor disponible en http://localhost:${port}`)
})
