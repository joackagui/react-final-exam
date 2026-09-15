import { randomUUID } from "node:crypto";
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
  WindDirection,
} from "./types.js";

const GRID_WIDTH = 30;
const GRID_HEIGHT = 18;
const MIN_OBSTACLE_COUNT = 15;
const MAX_OBSTACLE_COUNT = 15;
const STARTING_AREA_RADIUS = 4;
const WIND_CHANGE_INTERVAL_MS = 15_000;
const WIND_NOTICE_DURATION_MS = 3_000;
const TICK_MS = 100;
const PROJECTILE_SPEED = 6;
const WIND_PROJECTILE_INFLUENCE = 1.5;
const WIND_SPEED_INFLUENCE = 0.6;
const WIND_TURN_INFLUENCE = 0.65;
const WIND_DRIFT_DEGREES_PER_SECOND = 10;
const TURN_STEP_DEGREES = 12;
const SHIP_COLLISION_DAMAGE = 10;

const directions: Direction[] = [
  "north",
  "north_east",
  "east",
  "south_east",
  "south",
  "south_west",
  "west",
  "north_west",
];

const directionAngles: Record<Direction, number> = {
  north: 0,
  north_east: 45,
  east: 90,
  south_east: 135,
  south: 180,
  south_west: 225,
  west: 270,
  north_west: 315,
};

const windDirections: WindDirection[] = ["north", "east", "south", "west"];

const games = new Map<string, Game>();

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function directionFromAngle(angle: number): Direction {
  const normalized = normalizeAngle(angle);
  return directions.reduce((closest, direction) => {
    const candidateDistance = Math.abs(
      normalizeAngle(directionAngles[direction] - normalized + 180) - 180,
    );
    const closestDistance = Math.abs(
      normalizeAngle(directionAngles[closest] - normalized + 180) - 180,
    );
    return candidateDistance < closestDistance ? direction : closest;
  }, directions[0]);
}

function vectorFromAngle(angle: number): GridPosition {
  const radians = (normalizeAngle(angle) * Math.PI) / 180;
  return { x: Math.sin(radians), y: -Math.cos(radians) };
}

function randomWindDirection(): WindDirection {
  return windDirections[Math.floor(Math.random() * windDirections.length)];
}

function isNearStartingArea(
  position: GridPosition,
  startingPositions: GridPosition[],
): boolean {
  return startingPositions.some(
    (startingPosition) =>
      Math.hypot(
        position.x - startingPosition.x,
        position.y - startingPosition.y,
      ) < STARTING_AREA_RADIUS,
  );
}

function generateObstacles(protectedPositions: GridPosition[]): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const occupiedCells = new Set(
    protectedPositions.map(({ x, y }) => `${x},${y}`),
  );
  const obstacleCount =
    MIN_OBSTACLE_COUNT +
    Math.floor(Math.random() * (MAX_OBSTACLE_COUNT - MIN_OBSTACLE_COUNT + 1));

  while (obstacles.length < obstacleCount) {
    const position = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
    const cellKey = `${position.x},${position.y}`;

    if (
      occupiedCells.has(cellKey) ||
      isNearStartingArea(position, protectedPositions)
    ) {
      continue;
    }

    occupiedCells.add(cellKey);
    obstacles.push({ id: randomUUID(), position, kind: "rock" });
  }

  return obstacles;
}

function makeShip(
  id: string,
  playerId: string,
  character: Ship["character"],
  position: GridPosition,
  orientation: Direction,
): Ship {
  const isPirate = character === "pirate";
  const orientationDegrees = directionAngles[orientation];

  return {
    id,
    playerId,
    character,
    position,
    orientation,
    orientationDegrees,
    targetOrientation: orientation,
    targetOrientationDegrees: orientationDegrees,
    angularSpeedDegreesPerSecond: 45,
    speed: isPirate ? "high" : "medium",
    baseSpeed: isPirate ? 1.35 : 1.05,
    effectiveSpeed: isPirate ? 1.35 : 1.05,
    health: isPirate ? 80 : 100,
    maxHealth: isPirate ? 80 : 100,
    shotDamage: isPirate ? 20 : 25,
  };
}

export function createGame(request: CreateGameRequest): Game {
  const createdAt = new Date();
  const piratePosition = { x: 1, y: GRID_HEIGHT - 2 };
  const ghostPosition = { x: GRID_WIDTH - 2, y: 1 };
  const pirateShipId = randomUUID();
  const ghostShipId = randomUUID();
  const piratePlayer: Player = {
    id: request.players[0].id,
    number: 1,
    character: "pirate",
    shipId: pirateShipId,
  };
  const ghostPlayer: Player = {
    id: request.players[1].id,
    number: 2,
    character: "ghost",
    shipId: ghostShipId,
  };

  const game: Game = {
    id: randomUUID(),
    status: "en_curso",
    createdAt: createdAt.toISOString(),
    players: [piratePlayer, ghostPlayer],
    ships: [
      makeShip(
        pirateShipId,
        piratePlayer.id,
        "pirate",
        piratePosition,
        "north_east",
      ),
      makeShip(
        ghostShipId,
        ghostPlayer.id,
        "ghost",
        ghostPosition,
        "south_west",
      ),
    ],
    map: {
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      obstacles: generateObstacles([piratePosition, ghostPosition]),
    },
    wind: {
      direction: null,
      active: false,
      changedAt: createdAt.toISOString(),
      nextChangeAt: new Date(
        createdAt.getTime() + WIND_CHANGE_INTERVAL_MS,
      ).toISOString(),
      changedRecently: false,
    },
    activeProjectiles: [],
    winnerPlayerId: null,
  };

  games.set(game.id, game);
  return game;
}

export function getGame(gameId: string): Game | undefined {
  const game = games.get(gameId);

  if (game) {
    updateWindNotice(game, new Date());
  }

  return game;
}

function windAlignment(
  shipAngle: number,
  windDirection: WindDirection | null,
): number {
  if (!windDirection) {
    return 0;
  }

  const shipVector = vectorFromAngle(shipAngle);
  const windVector = vectorFromAngle(directionAngles[windDirection]);
  return shipVector.x * windVector.x + shipVector.y * windVector.y;
}

function rotateShip(
  ship: Ship,
  windDirection: WindDirection | null,
  elapsedSeconds: number,
): void {
  const difference =
    normalizeAngle(
      ship.targetOrientationDegrees - ship.orientationDegrees + 180,
    ) - 180;
  const turnAlignment = windAlignment(
    ship.targetOrientationDegrees,
    windDirection,
  );
  const turnSpeed =
    ship.angularSpeedDegreesPerSecond *
    (1 + turnAlignment * WIND_TURN_INFLUENCE);
  const maximumRotation = turnSpeed * elapsedSeconds;

  if (Math.abs(difference) <= maximumRotation) {
    ship.orientationDegrees = ship.targetOrientationDegrees;
  } else {
    ship.orientationDegrees = normalizeAngle(
      ship.orientationDegrees + Math.sign(difference) * maximumRotation,
    );
  }

  if (windDirection) {
    const windAngle = directionAngles[windDirection];
    const windCrossProduct =
      vectorFromAngle(ship.orientationDegrees).x *
        vectorFromAngle(windAngle).y -
      vectorFromAngle(ship.orientationDegrees).y * vectorFromAngle(windAngle).x;
    ship.orientationDegrees = normalizeAngle(
      ship.orientationDegrees +
        windCrossProduct * WIND_DRIFT_DEGREES_PER_SECOND * elapsedSeconds,
    );
  }

  ship.orientation = directionFromAngle(ship.orientationDegrees);
}

function speedWithWind(
  ship: Ship,
  windDirection: WindDirection | null,
): number {
  return (
    ship.baseSpeed *
    (1 +
      windAlignment(ship.orientationDegrees, windDirection) *
        WIND_SPEED_INFLUENCE)
  );
}

function isInsideMap(position: GridPosition, map: Game["map"]): boolean {
  return (
    position.x >= 0 &&
    position.x < map.width &&
    position.y >= 0 &&
    position.y < map.height
  );
}

function isRockAt(position: GridPosition, obstacles: Obstacle[]): boolean {
  return obstacles.some(
    (obstacle) =>
      Math.abs(position.x - obstacle.position.x) < 0.5 &&
      Math.abs(position.y - obstacle.position.y) < 0.5,
  );
}

function reverseShip(ship: Ship): void {
  ship.orientationDegrees = normalizeAngle(ship.orientationDegrees + 180);
  ship.targetOrientationDegrees = ship.orientationDegrees;
  ship.orientation = directionFromAngle(ship.orientationDegrees);
  ship.targetOrientation = ship.orientation;
}

function damageShip(game: Game, ship: Ship, damage: number): void {
  ship.health = Math.max(0, ship.health - damage);

  if (ship.health === 0) {
    game.status = "finalizada";
    game.winnerPlayerId =
      game.players.find((player) => player.id !== ship.playerId)?.id ?? null;
    game.activeProjectiles = [];
  }
}

function moveShip(game: Game, ship: Ship, elapsedSeconds: number): void {
  rotateShip(ship, game.wind.direction, elapsedSeconds);
  ship.effectiveSpeed = speedWithWind(ship, game.wind.direction);
  const direction = vectorFromAngle(ship.orientationDegrees);
  const nextPosition = {
    x: ship.position.x + direction.x * ship.effectiveSpeed * elapsedSeconds,
    y: ship.position.y + direction.y * ship.effectiveSpeed * elapsedSeconds,
  };

  if (!isInsideMap(nextPosition, game.map)) {
    reverseShip(ship);
    return;
  }

  if (isRockAt(nextPosition, game.map.obstacles)) {
    damageShip(game, ship, SHIP_COLLISION_DAMAGE);
    reverseShip(ship);
    return;
  }

  ship.position = nextPosition;
}

function moveProjectile(
  game: Game,
  projectile: Projectile,
  elapsedSeconds: number,
): void {
  const projectileVector = vectorFromAngle(projectile.headingDegrees);
  const windVector = game.wind.direction
    ? vectorFromAngle(directionAngles[game.wind.direction])
    : { x: 0, y: 0 };
  const nextPosition = {
    x:
      projectile.position.x +
      (projectileVector.x * projectile.speed +
        windVector.x * WIND_PROJECTILE_INFLUENCE) *
        elapsedSeconds,
    y:
      projectile.position.y +
      (projectileVector.y * projectile.speed +
        windVector.y * WIND_PROJECTILE_INFLUENCE) *
        elapsedSeconds,
  };

  if (
    !isInsideMap(nextPosition, game.map) ||
    isRockAt(nextPosition, game.map.obstacles)
  ) {
    projectile.active = false;
    return;
  }

  projectile.headingDegrees = normalizeAngle(
    (Math.atan2(
      nextPosition.x - projectile.position.x,
      -(nextPosition.y - projectile.position.y),
    ) *
      180) /
      Math.PI,
  );
  projectile.position = nextPosition;
  const target = game.ships.find(
    (ship) =>
      ship.playerId !== projectile.ownerPlayerId &&
      Math.hypot(
        ship.position.x - nextPosition.x,
        ship.position.y - nextPosition.y,
      ) < 0.6,
  );

  if (target) {
    damageShip(game, target, projectile.damage);
    projectile.active = false;
  }
}

function changeWindIfNeeded(game: Game, now: Date): void {
  if (now.getTime() >= new Date(game.wind.nextChangeAt).getTime()) {
    game.wind.active = !game.wind.active;
    game.wind.direction = game.wind.active ? randomWindDirection() : null;
    game.wind.changedAt = now.toISOString();
    game.wind.nextChangeAt = new Date(
      now.getTime() + WIND_CHANGE_INTERVAL_MS,
    ).toISOString();
    game.wind.changedRecently = true;
  }

  updateWindNotice(game, now);
}

function updateWindNotice(game: Game, now: Date): void {
  const changedAt = new Date(game.wind.changedAt).getTime();
  game.wind.changedRecently =
    now.getTime() - changedAt < WIND_NOTICE_DURATION_MS;
}

function tickGame(game: Game, elapsedSeconds: number, now: Date): void {
  if (game.status !== "en_curso") {
    return;
  }

  changeWindIfNeeded(game, now);
  for (const ship of game.ships) {
    moveShip(game, ship, elapsedSeconds);
    if (game.winnerPlayerId !== null) {
      return;
    }
  }

  for (const projectile of game.activeProjectiles) {
    moveProjectile(game, projectile, elapsedSeconds);
    if (game.winnerPlayerId !== null) {
      return;
    }
  }

  game.activeProjectiles = game.activeProjectiles.filter(
    (projectile) => projectile.active,
  );
}

export function startGameLoop(): void {
  setInterval(() => {
    const now = new Date();
    for (const game of games.values()) {
      tickGame(game, TICK_MS / 1_000, now);
    }
  }, TICK_MS);
}

export function applyAction(game: Game, request: GameActionRequest): void {
  const ship = game.ships.find(
    (candidate) => candidate.playerId === request.playerId,
  );

  if (!ship) {
    throw new Error("El jugador no pertenece a esta partida.");
  }

  if (game.status === "finalizada") {
    throw new Error("La partida ya finalizó.");
  }

  if (request.action === "turn_left") {
    ship.targetOrientationDegrees = normalizeAngle(
      ship.targetOrientationDegrees - TURN_STEP_DEGREES,
    );
    ship.targetOrientation = directionFromAngle(ship.targetOrientationDegrees);
    return;
  }

  if (request.action === "turn_right") {
    ship.targetOrientationDegrees = normalizeAngle(
      ship.targetOrientationDegrees + TURN_STEP_DEGREES,
    );
    ship.targetOrientation = directionFromAngle(ship.targetOrientationDegrees);
    return;
  }

  if (request.action === "turn_to") {
    ship.targetOrientation = request.direction as Direction;
    ship.targetOrientationDegrees =
      directionAngles[request.direction as Direction];
    return;
  }

  game.activeProjectiles.push({
    id: randomUUID(),
    ownerPlayerId: ship.playerId,
    position: { ...ship.position },
    direction: ship.orientation,
    headingDegrees: ship.orientationDegrees,
    speed: PROJECTILE_SPEED,
    damage: ship.shotDamage,
    active: true,
  });
}

/** Solo se invoca desde las pruebas E2E habilitadas explícitamente. */
export function forceFinishGame(game: Game, winnerPlayerId: string): boolean {
  const winner = game.ships.find((ship) => ship.playerId === winnerPlayerId);
  const loser = game.ships.find((ship) => ship.playerId !== winnerPlayerId);

  if (!winner || !loser || game.status === "finalizada") {
    return false;
  }

  damageShip(game, loser, loser.health);
  return true;
}

export function isCreateGameRequest(
  value: unknown,
): value is CreateGameRequest {
  if (typeof value !== "object" || value === null || !("players" in value)) {
    return false;
  }

  const { players } = value;
  return (
    Array.isArray(players) &&
    players.length === 2 &&
    typeof players[0]?.id === "string" &&
    players[0].id.trim().length > 0 &&
    players[0].character === "pirate" &&
    typeof players[1]?.id === "string" &&
    players[1].id.trim().length > 0 &&
    players[1].character === "ghost" &&
    players[0].id !== players[1].id
  );
}

export function isGameActionRequest(
  value: unknown,
): value is GameActionRequest {
  if (
    typeof value !== "object" ||
    value === null ||
    !("playerId" in value) ||
    !("action" in value)
  ) {
    return false;
  }

  const candidate = value as {
    playerId: unknown;
    action: unknown;
    direction?: unknown;
  };
  const { playerId, action, direction } = candidate;
  const isDirection =
    typeof direction === "string" &&
    directions.includes(direction as Direction);

  return (
    typeof playerId === "string" &&
    playerId.trim().length > 0 &&
    (action === "turn_left" ||
      action === "turn_right" ||
      action === "shoot" ||
      (action === "turn_to" && isDirection))
  );
}
