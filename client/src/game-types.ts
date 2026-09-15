export type Character = 'pirate' | 'ghost'

export type Direction =
  | 'north'
  | 'north_east'
  | 'east'
  | 'south_east'
  | 'south'
  | 'south_west'
  | 'west'
  | 'north_west'

export interface Position {
  x: number
  y: number
}

export interface Player {
  id: string
  number: 1 | 2
  character: Character
  shipId: string
}

export interface Ship {
  id: string
  playerId: string
  character: Character
  position: Position
  orientation: Direction
  orientationDegrees: number
  targetOrientation: Direction
  speed: 'high' | 'medium'
  health: number
  maxHealth: number
  shotDamage: number
}

export interface Obstacle {
  id: string
  position: Position
  kind: 'rock'
}

export interface Projectile {
  id: string
  ownerPlayerId: string
  position: Position
  direction: Direction
  active: boolean
}

export interface Game {
  id: string
  status: 'esperando' | 'en_curso' | 'finalizada'
  players: Player[]
  ships: Ship[]
  map: {
    width: number
    height: number
    obstacles: Obstacle[]
  }
  wind: {
    direction: Direction
    changedAt: string
    changedRecently: boolean
  }
  activeProjectiles: Projectile[]
  winnerPlayerId: string | null
}
