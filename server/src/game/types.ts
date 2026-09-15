export type Character = "pirate" | "ghost";

export type GameStatus = "esperando" | "en_curso" | "finalizada";

export type Direction =
  | "north"
  | "north_east"
  | "east"
  | "south_east"
  | "south"
  | "south_west"
  | "west"
  | "north_west";

export type WindDirection = "north" | "east" | "south" | "west";

export interface GridPosition {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  number: 1 | 2;
  character: Character;
  shipId: string;
}

export interface Ship {
  id: string;
  playerId: string;
  character: Character;
  position: GridPosition;
  orientation: Direction;
  orientationDegrees: number;
  targetOrientation: Direction;
  targetOrientationDegrees: number;
  angularSpeedDegreesPerSecond: number;
  speed: "high" | "medium";
  baseSpeed: number;
  effectiveSpeed: number;
  health: number;
  maxHealth: number;
  shotDamage: number;
}

export interface Obstacle {
  id: string;
  position: GridPosition;
  kind: "rock";
}

export interface Wind {
  direction: WindDirection | null;
  active: boolean;
  changedAt: string;
  nextChangeAt: string;
  changedRecently: boolean;
}

export interface Projectile {
  id: string;
  ownerPlayerId: string;
  position: GridPosition;
  direction: Direction;
  headingDegrees: number;
  speed: number;
  damage: number;
  active: boolean;
}

export interface GameMap {
  width: number;
  height: number;
  obstacles: Obstacle[];
}

export interface Game {
  id: string;
  status: GameStatus;
  createdAt: string;
  players: [Player, Player];
  ships: [Ship, Ship];
  map: GameMap;
  wind: Wind;
  activeProjectiles: Projectile[];
  winnerPlayerId: string | null;
}

export interface CreateGameRequest {
  players: [
    { id: string; character: "pirate" },
    { id: string; character: "ghost" },
  ];
}

export type GameAction = "turn_left" | "turn_right" | "turn_to" | "shoot";

export interface GameActionRequest {
  playerId: string;
  action: GameAction;
  direction?: Direction;
}
