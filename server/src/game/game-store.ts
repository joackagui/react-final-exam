import { randomUUID } from 'node:crypto'
import type {
  CreateGameRequest,
  Direction,
  Game,
  GridPosition,
  Obstacle,
  Player,
  Ship,
} from './types.js'

const GRID_WIDTH = 30
const GRID_HEIGHT = 18
const OBSTACLE_COUNT = 18
const WIND_CHANGE_INTERVAL_MS = 30_000

const directions: Direction[] = [
  'north',
  'north_east',
  'east',
  'south_east',
  'south',
  'south_west',
  'west',
  'north_west',
]

const games = new Map<string, Game>()

function randomDirection(): Direction {
  return directions[Math.floor(Math.random() * directions.length)]
}

function generateObstacles(protectedPositions: GridPosition[]): Obstacle[] {
  const obstacles: Obstacle[] = []
  const occupiedCells = new Set(protectedPositions.map(({ x, y }) => `${x},${y}`))

  while (obstacles.length < OBSTACLE_COUNT) {
    const position = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    }
    const cellKey = `${position.x},${position.y}`

    if (occupiedCells.has(cellKey)) {
      continue
    }

    occupiedCells.add(cellKey)
    obstacles.push({ id: randomUUID(), position, kind: 'rock' })
  }

  return obstacles
}

export function createGame(request: CreateGameRequest): Game {
  const createdAt = new Date()
  const piratePosition = { x: 1, y: GRID_HEIGHT - 2 }
  const ghostPosition = { x: GRID_WIDTH - 2, y: 1 }
  const pirateShipId = randomUUID()
  const ghostShipId = randomUUID()

  const piratePlayer: Player = {
    id: request.players[0].id,
    number: 1,
    character: 'pirate',
    shipId: pirateShipId,
  }
  const ghostPlayer: Player = {
    id: request.players[1].id,
    number: 2,
    character: 'ghost',
    shipId: ghostShipId,
  }
  const pirateShip: Ship = {
    id: pirateShipId,
    playerId: piratePlayer.id,
    character: 'pirate',
    position: piratePosition,
    orientation: 'north_east',
    speed: 'high',
    health: 80,
    maxHealth: 80,
    shotDamage: 20,
  }
  const ghostShip: Ship = {
    id: ghostShipId,
    playerId: ghostPlayer.id,
    character: 'ghost',
    position: ghostPosition,
    orientation: 'south_west',
    speed: 'medium',
    health: 100,
    maxHealth: 100,
    shotDamage: 25,
  }

  const game: Game = {
    id: randomUUID(),
    status: 'en_curso',
    createdAt: createdAt.toISOString(),
    players: [piratePlayer, ghostPlayer],
    ships: [pirateShip, ghostShip],
    map: {
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      obstacles: generateObstacles([piratePosition, ghostPosition]),
    },
    wind: {
      direction: randomDirection(),
      changedAt: createdAt.toISOString(),
      nextChangeAt: new Date(createdAt.getTime() + WIND_CHANGE_INTERVAL_MS).toISOString(),
    },
    activeProjectiles: [],
    winnerPlayerId: null,
  }

  games.set(game.id, game)
  return game
}

export function getGame(gameId: string): Game | undefined {
  return games.get(gameId)
}

export function isCreateGameRequest(value: unknown): value is CreateGameRequest {
  if (typeof value !== 'object' || value === null || !('players' in value)) {
    return false
  }

  const { players } = value

  return (
    Array.isArray(players) &&
    players.length === 2 &&
    typeof players[0]?.id === 'string' &&
    players[0].id.trim().length > 0 &&
    players[0].character === 'pirate' &&
    typeof players[1]?.id === 'string' &&
    players[1].id.trim().length > 0 &&
    players[1].character === 'ghost' &&
    players[0].id !== players[1].id
  )
}
