import { randomUUID } from 'node:crypto'
import type {
  CreateGameRequest,
  Direction,
  Game,
  GameActionRequest,
  GridPosition,
  Obstacle,
  Player,
  Projectile,
  Ship,
} from './types.js'

const GRID_WIDTH = 30
const GRID_HEIGHT = 18
const MIN_OBSTACLE_COUNT = 8
const MAX_OBSTACLE_COUNT = 15
const STARTING_AREA_RADIUS = 4
const WIND_CHANGE_INTERVAL_MS = 30_000
const WIND_NOTICE_DURATION_MS = 3_000
const TICK_MS = 100
const PROJECTILE_SPEED = 6
const WIND_PROJECTILE_INFLUENCE = 0.5
const SHIP_COLLISION_DAMAGE = 10

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

const directionAngles: Record<Direction, number> = {
  north: 0,
  north_east: 45,
  east: 90,
  south_east: 135,
  south: 180,
  south_west: 225,
  west: 270,
  north_west: 315,
}

const games = new Map<string, Game>()

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360
}

function directionFromAngle(angle: number): Direction {
  const normalized = normalizeAngle(angle)
  return directions.reduce((closest, direction) => {
    const candidateDistance = Math.abs(normalizeAngle(directionAngles[direction] - normalized + 180) - 180)
    const closestDistance = Math.abs(normalizeAngle(directionAngles[closest] - normalized + 180) - 180)
    return candidateDistance < closestDistance ? direction : closest
  }, directions[0])
}

function vectorFromAngle(angle: number): GridPosition {
  const radians = (normalizeAngle(angle) * Math.PI) / 180
  return { x: Math.sin(radians), y: -Math.cos(radians) }
}

function randomDirection(): Direction {
  return directions[Math.floor(Math.random() * directions.length)]
}

function isNearStartingArea(position: GridPosition, startingPositions: GridPosition[]): boolean {
  return startingPositions.some(
    (startingPosition) => Math.hypot(position.x - startingPosition.x, position.y - startingPosition.y) < STARTING_AREA_RADIUS,
  )
}

function generateObstacles(protectedPositions: GridPosition[]): Obstacle[] {
  const obstacles: Obstacle[] = []
  const occupiedCells = new Set(protectedPositions.map(({ x, y }) => `${x},${y}`))
  const obstacleCount = MIN_OBSTACLE_COUNT + Math.floor(Math.random() * (MAX_OBSTACLE_COUNT - MIN_OBSTACLE_COUNT + 1))

  while (obstacles.length < obstacleCount) {
    const position = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    }
    const cellKey = `${position.x},${position.y}`

    if (occupiedCells.has(cellKey) || isNearStartingArea(position, protectedPositions)) {
      continue
    }

    occupiedCells.add(cellKey)
    obstacles.push({ id: randomUUID(), position, kind: 'rock' })
  }

  return obstacles
}

function makeShip(
  id: string,
  playerId: string,
  character: Ship['character'],
  position: GridPosition,
  orientation: Direction,
): Ship {
  const isPirate = character === 'pirate'
  const orientationDegrees = directionAngles[orientation]

  return {
    id,
    playerId,
    character,
    position,
    orientation,
    orientationDegrees,
    targetOrientation: orientation,
    targetOrientationDegrees: orientationDegrees,
    angularSpeedDegreesPerSecond: 180,
    speed: isPirate ? 'high' : 'medium',
    baseSpeed: isPirate ? 2.4 : 1.8,
    effectiveSpeed: isPirate ? 2.4 : 1.8,
    health: isPirate ? 80 : 100,
    maxHealth: isPirate ? 80 : 100,
    shotDamage: isPirate ? 20 : 25,
  }
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

  const game: Game = {
    id: randomUUID(),
    status: 'en_curso',
    createdAt: createdAt.toISOString(),
    players: [piratePlayer, ghostPlayer],
    ships: [
      makeShip(pirateShipId, piratePlayer.id, 'pirate', piratePosition, 'north_east'),
      makeShip(ghostShipId, ghostPlayer.id, 'ghost', ghostPosition, 'south_west'),
    ],
    map: {
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      obstacles: generateObstacles([piratePosition, ghostPosition]),
    },
    wind: {
      direction: randomDirection(),
      changedAt: createdAt.toISOString(),
      nextChangeAt: new Date(createdAt.getTime() + WIND_CHANGE_INTERVAL_MS).toISOString(),
      changedRecently: false,
    },
    activeProjectiles: [],
    winnerPlayerId: null,
  }

  games.set(game.id, game)
  return game
}

export function getGame(gameId: string): Game | undefined {
  const game = games.get(gameId)

  if (game) {
    updateWindNotice(game, new Date())
  }

  return game
}

function rotateShip(ship: Ship, elapsedSeconds: number): void {
  const difference = normalizeAngle(ship.targetOrientationDegrees - ship.orientationDegrees + 180) - 180
  const maximumRotation = ship.angularSpeedDegreesPerSecond * elapsedSeconds

  if (Math.abs(difference) <= maximumRotation) {
    ship.orientationDegrees = ship.targetOrientationDegrees
  } else {
    ship.orientationDegrees = normalizeAngle(ship.orientationDegrees + Math.sign(difference) * maximumRotation)
  }

  ship.orientation = directionFromAngle(ship.orientationDegrees)
}

function speedWithWind(ship: Ship, windDirection: Direction): number {
  const shipVector = vectorFromAngle(ship.orientationDegrees)
  const windVector = vectorFromAngle(directionAngles[windDirection])
  const alignment = shipVector.x * windVector.x + shipVector.y * windVector.y
  return ship.baseSpeed * (1 + alignment * 0.25)
}

function isInsideMap(position: GridPosition, map: Game['map']): boolean {
  return position.x >= 0 && position.x < map.width && position.y >= 0 && position.y < map.height
}

function isRockAt(position: GridPosition, obstacles: Obstacle[]): boolean {
  return obstacles.some(
    (obstacle) => Math.abs(position.x - obstacle.position.x) < 0.5 && Math.abs(position.y - obstacle.position.y) < 0.5,
  )
}

function reverseShip(ship: Ship): void {
  ship.orientationDegrees = normalizeAngle(ship.orientationDegrees + 180)
  ship.targetOrientationDegrees = ship.orientationDegrees
  ship.orientation = directionFromAngle(ship.orientationDegrees)
  ship.targetOrientation = ship.orientation
}

function damageShip(game: Game, ship: Ship, damage: number): void {
  ship.health = Math.max(0, ship.health - damage)

  if (ship.health === 0) {
    game.status = 'finalizada'
    game.winnerPlayerId = game.players.find((player) => player.id !== ship.playerId)?.id ?? null
    game.activeProjectiles = []
  }
}

function moveShip(game: Game, ship: Ship, elapsedSeconds: number): void {
  rotateShip(ship, elapsedSeconds)
  ship.effectiveSpeed = speedWithWind(ship, game.wind.direction)
  const direction = vectorFromAngle(ship.orientationDegrees)
  const nextPosition = {
    x: ship.position.x + direction.x * ship.effectiveSpeed * elapsedSeconds,
    y: ship.position.y + direction.y * ship.effectiveSpeed * elapsedSeconds,
  }

  if (!isInsideMap(nextPosition, game.map)) {
    reverseShip(ship)
    return
  }

  if (isRockAt(nextPosition, game.map.obstacles)) {
    damageShip(game, ship, SHIP_COLLISION_DAMAGE)
    reverseShip(ship)
    return
  }

  ship.position = nextPosition
}

function moveProjectile(game: Game, projectile: Projectile, elapsedSeconds: number): void {
  const projectileVector = vectorFromAngle(projectile.headingDegrees)
  const windVector = vectorFromAngle(directionAngles[game.wind.direction])
  const nextPosition = {
    x: projectile.position.x + (projectileVector.x * projectile.speed + windVector.x * WIND_PROJECTILE_INFLUENCE) * elapsedSeconds,
    y: projectile.position.y + (projectileVector.y * projectile.speed + windVector.y * WIND_PROJECTILE_INFLUENCE) * elapsedSeconds,
  }

  if (!isInsideMap(nextPosition, game.map) || isRockAt(nextPosition, game.map.obstacles)) {
    projectile.active = false
    return
  }

  projectile.position = nextPosition
  const target = game.ships.find(
    (ship) => ship.playerId !== projectile.ownerPlayerId && Math.hypot(ship.position.x - nextPosition.x, ship.position.y - nextPosition.y) < 0.6,
  )

  if (target) {
    damageShip(game, target, projectile.damage)
    projectile.active = false
  }
}

function changeWindIfNeeded(game: Game, now: Date): void {
  if (now.getTime() >= new Date(game.wind.nextChangeAt).getTime()) {
    game.wind.direction = randomDirection()
    game.wind.changedAt = now.toISOString()
    game.wind.nextChangeAt = new Date(now.getTime() + WIND_CHANGE_INTERVAL_MS).toISOString()
    game.wind.changedRecently = true
  }

  updateWindNotice(game, now)
}

function updateWindNotice(game: Game, now: Date): void {
  const changedAt = new Date(game.wind.changedAt).getTime()
  game.wind.changedRecently = now.getTime() - changedAt < WIND_NOTICE_DURATION_MS
}

function tickGame(game: Game, elapsedSeconds: number, now: Date): void {
  if (game.status !== 'en_curso') {
    return
  }

  changeWindIfNeeded(game, now)
  for (const ship of game.ships) {
    moveShip(game, ship, elapsedSeconds)
    if (game.winnerPlayerId !== null) {
      return
    }
  }

  for (const projectile of game.activeProjectiles) {
    moveProjectile(game, projectile, elapsedSeconds)
    if (game.winnerPlayerId !== null) {
      return
    }
  }

  game.activeProjectiles = game.activeProjectiles.filter((projectile) => projectile.active)
}

export function startGameLoop(): void {
  setInterval(() => {
    const now = new Date()
    for (const game of games.values()) {
      tickGame(game, TICK_MS / 1_000, now)
    }
  }, TICK_MS)
}

export function applyAction(game: Game, request: GameActionRequest): void {
  const ship = game.ships.find((candidate) => candidate.playerId === request.playerId)

  if (!ship) {
    throw new Error('El jugador no pertenece a esta partida.')
  }

  if (game.status === 'finalizada') {
    throw new Error('La partida ya finalizó.')
  }

  if (request.action === 'turn_left') {
    ship.targetOrientationDegrees = normalizeAngle(ship.targetOrientationDegrees - 90)
    ship.targetOrientation = directionFromAngle(ship.targetOrientationDegrees)
    return
  }

  if (request.action === 'turn_right') {
    ship.targetOrientationDegrees = normalizeAngle(ship.targetOrientationDegrees + 90)
    ship.targetOrientation = directionFromAngle(ship.targetOrientationDegrees)
    return
  }

  if (request.action === 'turn_to') {
    ship.targetOrientation = request.direction as Direction
    ship.targetOrientationDegrees = directionAngles[request.direction as Direction]
    return
  }

  const bullets = Array.from({ length: 3 }, (): Projectile => ({
    id: randomUUID(),
    ownerPlayerId: ship.playerId,
    position: { ...ship.position },
    direction: ship.orientation,
    headingDegrees: ship.orientationDegrees,
    speed: PROJECTILE_SPEED,
    damage: ship.shotDamage,
    active: true,
  }))
  game.activeProjectiles.push(...bullets)
}

/** Solo se invoca desde las pruebas E2E habilitadas explícitamente. */
export function forceFinishGame(game: Game, winnerPlayerId: string): boolean {
  const winner = game.ships.find((ship) => ship.playerId === winnerPlayerId)
  const loser = game.ships.find((ship) => ship.playerId !== winnerPlayerId)

  if (!winner || !loser || game.status === 'finalizada') {
    return false
  }

  damageShip(game, loser, loser.health)
  return true
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

export function isGameActionRequest(value: unknown): value is GameActionRequest {
  if (typeof value !== 'object' || value === null || !('playerId' in value) || !('action' in value)) {
    return false
  }

  const candidate = value as { playerId: unknown; action: unknown; direction?: unknown }
  const { playerId, action, direction } = candidate
  const isDirection = typeof direction === 'string' && directions.includes(direction as Direction)

  return (
    typeof playerId === 'string' &&
    playerId.trim().length > 0 &&
    (action === 'turn_left' || action === 'turn_right' || action === 'shoot' || (action === 'turn_to' && isDirection))
  )
}
