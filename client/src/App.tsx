import { useEffect, useRef, useState } from "react";
import type { Character, Direction, Game, Ship } from "./game-types";
import "./App.css";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const assetUrl = (assetName: string) =>
  `${import.meta.env.BASE_URL}Assets/${assetName}`;

function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}

type PlayerSetup = {
  id: string;
  character: Character;
};

type Action = "turn_left" | "turn_right" | "shoot";

const TURN_REPEAT_MS = 180;

const initialSetup: [PlayerSetup, PlayerSetup] = [
  { id: "Jugador-1", character: "pirate" },
  { id: "Jugador-2", character: "ghost" },
];

const directionLabel: Record<Direction, string> = {
  north: "Norte",
  north_east: "Noreste",
  east: "Este",
  south_east: "Sureste",
  south: "Sur",
  south_west: "Suroeste",
  west: "Oeste",
  north_west: "Noroeste",
};

const windIconRotation: Record<Direction, number> = {
  north: -90,
  north_east: -45,
  east: 0,
  south_east: 45,
  south: 90,
  south_west: 135,
  west: 180,
  north_west: 225,
};

function getPlayerName(game: Game, playerId: string | null): string {
  const player = game.players.find((candidate) => candidate.id === playerId);

  if (!player) {
    return "Tripulación desconocida";
  }

  return player.id;
}

function positionStyle(position: { x: number; y: number }, game: Game) {
  return {
    left: `${((position.x + 0.5) / game.map.width) * 100}%`,
    top: `${((position.y + 0.5) / game.map.height) * 100}%`,
  };
}

function App() {
  const [setup, setSetup] = useState<[PlayerSetup, PlayerSetup]>(initialSetup);
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [windNotice, setWindNotice] = useState<Direction | null>(null);
  const [damagedPlayerId, setDamagedPlayerId] = useState<string | null>(null);
  const pressedKeys = useRef(new Set<string>());
  const previousShips = useRef(new Map<string, number>());
  const previousWindChange = useRef<string | null>(null);
  const windTimer = useRef<number | null>(null);
  const damageTimer = useRef<number | null>(null);
  const seaBackgroundStyle = {
    "--sea-image": `url("${assetUrl("sea.png")}")`,
  } as React.CSSProperties;

  const gameId = game?.id;
  const gameStatus = game?.status;
  const playerOneId = game?.players[0]?.id;
  const playerTwoId = game?.players[1]?.id;

  async function readJson<T>(response: Response): Promise<T> {
    const data = (await response.json()) as T & { error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo completar la solicitud.");
    }

    return data;
  }

  async function startGame() {
    if (setup[0].id.trim().length === 0 || setup[1].id.trim().length === 0) {
      setError("Cada jugador necesita un identificador.");
      return;
    }

    if (setup[0].id.trim() === setup[1].id.trim()) {
      setError("Los identificadores de los jugadores deben ser diferentes.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/games"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players: setup }),
      });
      const createdGame = await readJson<Game>(response);
      previousShips.current.clear();
      previousWindChange.current = createdGame.wind.changedAt;
      setGame(createdGame);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo crear la partida.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function sendAction(playerId: string, action: Action) {
    if (!gameId || gameStatus !== "en_curso") {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/games/${gameId}/action`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, action }),
      });
      setGame(await readJson<Game>(response));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo enviar la acción.",
      );
    }
  }

  useEffect(() => {
    if (!gameId || gameStatus !== "en_curso") {
      return;
    }

    let isActive = true;

    async function pollGame() {
      try {
        const response = await fetch(apiUrl(`/api/games/${gameId}`));
        const nextGame = await readJson<Game>(response);

        if (isActive) {
          setGame(nextGame);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No se pudo actualizar la partida.",
          );
        }
      }
    }

    void pollGame();
    const pollingTimer = window.setInterval(() => void pollGame(), 120);

    return () => {
      isActive = false;
      window.clearInterval(pollingTimer);
    };
  }, [gameId, gameStatus]);

  useEffect(() => {
    if (!gameId || gameStatus !== "en_curso" || !playerOneId || !playerTwoId) {
      return;
    }

    const rotationKeys: Record<string, { playerId: string; action: Action }> = {
      KeyA: { playerId: playerOneId, action: "turn_left" },
      KeyD: { playerId: playerOneId, action: "turn_right" },
      ArrowLeft: { playerId: playerTwoId, action: "turn_left" },
      ArrowRight: { playerId: playerTwoId, action: "turn_right" },
    };
    const shotKeys: Record<string, string> = {
      KeyC: playerOneId,
      Space: playerTwoId,
    };

    function onKeyDown(event: KeyboardEvent) {
      const rotation = rotationKeys[event.code];
      const shooter = shotKeys[event.code];

      if (!rotation && !shooter) {
        return;
      }

      event.preventDefault();
      if (pressedKeys.current.has(event.code)) {
        return;
      }

      pressedKeys.current.add(event.code);
      if (rotation) {
        void sendAction(rotation.playerId, rotation.action);
      }
      if (shooter) {
        void sendAction(shooter, "shoot");
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.code);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const rotationTimer = window.setInterval(() => {
      for (const [key, rotation] of Object.entries(rotationKeys)) {
        if (pressedKeys.current.has(key)) {
          void sendAction(rotation.playerId, rotation.action);
        }
      }
    }, TURN_REPEAT_MS);

    return () => {
      window.clearInterval(rotationTimer);
      pressedKeys.current.clear();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [gameId, gameStatus, playerOneId, playerTwoId]);

  useEffect(() => {
    if (!game) {
      return;
    }

    for (const ship of game.ships) {
      const previousHealth = previousShips.current.get(ship.playerId);
      if (previousHealth !== undefined && ship.health < previousHealth) {
        setDamagedPlayerId(ship.playerId);
        if (damageTimer.current !== null) {
          window.clearTimeout(damageTimer.current);
        }
        damageTimer.current = window.setTimeout(
          () => setDamagedPlayerId(null),
          420,
        );
      }
      previousShips.current.set(ship.playerId, ship.health);
    }

    if (
      game.wind.changedRecently &&
      previousWindChange.current !== game.wind.changedAt
    ) {
      setWindNotice(game.wind.direction);
      if (windTimer.current !== null) {
        window.clearTimeout(windTimer.current);
      }
      windTimer.current = window.setTimeout(() => setWindNotice(null), 3_000);
    }
    previousWindChange.current = game.wind.changedAt;
  }, [game]);

  useEffect(() => {
    return () => {
      if (windTimer.current !== null) {
        window.clearTimeout(windTimer.current);
      }
      if (damageTimer.current !== null) {
        window.clearTimeout(damageTimer.current);
      }
    };
  }, []);

  function restart() {
    pressedKeys.current.clear();
    previousShips.current.clear();
    previousWindChange.current = null;
    setWindNotice(null);
    setDamagedPlayerId(null);
    setError(null);
    setGame(null);
  }

  function updatePlayerId(index: 0 | 1, id: string) {
    setSetup((current) => {
      const next = [...current] as [PlayerSetup, PlayerSetup];
      next[index] = { ...next[index], id };
      return next;
    });
  }

  if (game?.status === "finalizada") {
    return (
      <main className="result-screen" style={seaBackgroundStyle}>
        <section className="result-card" aria-labelledby="result-title">
          <p className="eyebrow">La batalla terminó</p>
          <h1 id="result-title">
            ¡Gana el {getPlayerName(game, game.winnerPlayerId)}!
          </h1>
          <p>La tripulación rival se quedó sin vida.</p>
          <button type="button" className="primary-button" onClick={restart}>
            Reiniciar
          </button>
        </section>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="selector-screen" style={seaBackgroundStyle}>
        <section className="selector-card" aria-labelledby="selector-title">
          <div className="selector-heading">
            <h1 id="selector-title">Elige tu tripulación</h1>
            <p>El Perla Negra navega rápido</p>
            <p>El Holandes Errante resiste más y causa más daño.</p>
          </div>

          <div className="character-grid">
            <article className="character-card pirate-card">
              <div className="character-preview ship-preview">
                <img
                  src={assetUrl("black-pearl.png")}
                  alt="Barco Pirata visto desde arriba"
                />
              </div>
              <div>
                <p className="player-label">Jugador 1</p>
                <h2>Pirata</h2>
                <dl>
                  <div>
                    <dt>Vida</dt>
                    <dd>80</dd>
                  </div>
                  <div>
                    <dt>Velocidad</dt>
                    <dd>Alta</dd>
                  </div>
                  <div>
                    <dt>Daño</dt>
                    <dd>20</dd>
                  </div>
                </dl>
                <label htmlFor="player-one-id">Identificador</label>
                <input
                  id="player-one-id"
                  value={setup[0].id}
                  onChange={(event) => updatePlayerId(0, event.target.value)}
                  maxLength={24}
                />
              </div>
            </article>

            <article className="character-card ghost-card">
              <div className="character-preview ship-preview">
                <img
                  src={assetUrl("flying-dutchman.png")}
                  alt="Barco Fantasma visto desde arriba"
                />
              </div>
              <div>
                <p className="player-label">Jugador 2</p>
                <h2>Fantasma</h2>
                <dl>
                  <div>
                    <dt>Vida</dt>
                    <dd>100</dd>
                  </div>
                  <div>
                    <dt>Velocidad</dt>
                    <dd>Media</dd>
                  </div>
                  <div>
                    <dt>Daño</dt>
                    <dd>25</dd>
                  </div>
                </dl>
                <label htmlFor="player-two-id">Identificador</label>
                <input
                  id="player-two-id"
                  value={setup[1].id}
                  onChange={(event) => updatePlayerId(1, event.target.value)}
                  maxLength={24}
                />
              </div>
            </article>
          </div>

          <aside className="controls-note">
            <strong>Perla Negra:</strong> A/D para girar y C para disparar.
            <br />
            <strong>Holandes Errante:</strong> ←/→ para girar y Espacio para
            disparar.
          </aside>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            className="primary-button"
            onClick={() => void startGame()}
            disabled={isCreating}
          >
            {isCreating ? "Creando partida…" : "Iniciar batalla"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="game-screen">
      <section
        className="game-map"
        aria-label="Mapa de batalla naval"
        style={seaBackgroundStyle}
      >
        {game.map.obstacles.map((obstacle, index) => (
          <div
            className={`rock ${index % 3 === 0 ? "rock-long" : "rock-small"}`}
            key={obstacle.id}
            style={
              {
                ...positionStyle(obstacle.position, game),
                "--rock-rotation": `${(index * 43) % 360}deg`,
              } as React.CSSProperties
            }
          >
            <img
              src={
                index % 3 === 0
                  ? assetUrl("long-rock.png")
                  : assetUrl("small-rock.png")
              }
              alt="Roca"
            />
          </div>
        ))}

        {game.activeProjectiles.map((projectile) => (
          <span
            className="projectile"
            key={projectile.id}
            style={positionStyle(projectile.position, game)}
            aria-label="Proyectil activo"
          />
        ))}

        {game.ships.map((ship) => (
          <div
            className={`ship ${ship.character} ${damagedPlayerId === ship.playerId ? "ship-hit" : ""}`}
            key={ship.id}
            style={positionStyle(ship.position, game)}
            aria-label={`Barco ${ship.character === "pirate" ? "Pirata" : "Fantasma"}`}
          >
            <img
              src={
                ship.character === "pirate"
                  ? assetUrl("black-pearl.png")
                  : assetUrl("flying-dutchman.png")
              }
              alt=""
              style={
                {
                  "--ship-angle": `${ship.orientationDegrees}deg`,
                } as React.CSSProperties
              }
            />
          </div>
        ))}
      </section>

      <header className="hud" aria-label="Estado de los jugadores">
        {game.ships.map((ship) => (
          <HealthBar key={ship.id} game={game} ship={ship} />
        ))}
      </header>

      {windNotice && (
        <div className="wind-notice" role="status">
          <span
            aria-hidden="true"
            style={
              {
                "--wind-angle": `${windIconRotation[windNotice]}deg`,
              } as React.CSSProperties
            }
          >
            ➜
          </span>
          <strong>Viento hacia {directionLabel[windNotice]}</strong>
        </div>
      )}
      {error && (
        <p className="game-error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}

function HealthBar({ game, ship }: { game: Game; ship: Ship }) {
  const healthPercentage = (ship.health / ship.maxHealth) * 100;
  const name = getPlayerName(game, ship.playerId);

  return (
    <section className={`health-bar ${ship.character}`}>
      <div className="health-heading">
        <span>
          J{ship.character === "pirate" ? "1" : "2"} · {name}
        </span>
        <strong>
          {ship.health}/{ship.maxHealth}
        </strong>
      </div>
      <div
        className="health-track"
        aria-label={`Vida de ${name}: ${ship.health} de ${ship.maxHealth}`}
      >
        <span style={{ width: `${healthPercentage}%` }} />
      </div>
    </section>
  );
}

export default App;
