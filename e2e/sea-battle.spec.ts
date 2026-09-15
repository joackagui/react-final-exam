import { expect, test, type Page } from "@playwright/test";
import type { Game } from "../client/src/game-types";

async function createGame(page: Page, suffix: string): Promise<Game> {
  await page.goto("/");
  await page.getByLabel("Identificador").nth(0).fill(`pirata-${suffix}`);
  await page.getByLabel("Identificador").nth(1).fill(`fantasma-${suffix}`);

  const gameResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/games") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Iniciar batalla" }).click();
  const response = await gameResponse;

  expect(response.status()).toBe(201);
  return response.json();
}

test("muestra el selector de personaje al cargar", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Elige tu tripulación" }),
  ).toBeVisible();
  await expect(page.getByText("Jugador 1")).toBeVisible();
  await expect(page.getByText("Jugador 2")).toBeVisible();
});

test("inicia una partida y renderiza ambos barcos en el mapa", async ({
  page,
}) => {
  const game = await createGame(page, "mapa");

  expect(game.status).toBe("en_curso");
  expect(game.ships).toHaveLength(2);
  await expect(page.getByLabel("Mapa de batalla naval")).toBeVisible();
  await expect(page.getByLabel("Barco Pirata")).toBeVisible();
  await expect(page.getByLabel("Barco Fantasma")).toBeVisible();
  await expect(page.getByText("J1 · pirata-mapa")).toBeVisible();
  await expect(page.getByText("J2 · fantasma-mapa")).toBeVisible();

  const renderedShips = page.locator(".ship");
  expect(await renderedShips.count()).toBe(2);
  for (let index = 0; index < 2; index += 1) {
    const ship = renderedShips.nth(index);
    const image = ship.locator("img");
    expect(
      await image.evaluate(
        (element) => (element as HTMLImageElement).naturalWidth,
      ),
    ).toBeGreaterThan(0);
    const box = await ship.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  }
});

test("crea la partida mediante POST /api/games y recibe un estado válido", async ({
  page,
}) => {
  const game = await createGame(page, "api");

  expect(game.id).toEqual(expect.any(String));
  expect(game.players).toHaveLength(2);
  expect(game.map.width).toBeGreaterThan(0);
  expect(game.map.obstacles.length).toBeGreaterThanOrEqual(8);
  expect(game.map.obstacles.length).toBeLessThanOrEqual(15);
});

test("muestra el resultado y reinicia tras finalizar una partida de prueba", async ({
  page,
}) => {
  test.skip(
    Boolean(process.env.E2E_BASE_URL),
    "La finalización forzada solo existe en el servidor local de pruebas.",
  );

  const game = await createGame(page, "resultado");
  const winnerPlayerId = game.players[0].id;
  const response = await page.request.post(
    `/api/games/${game.id}/test/finish`,
    {
      data: { winnerPlayerId },
    },
  );

  expect(response.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "¡Gana el pirata-resultado!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reiniciar" }).click();
  await expect(
    page.getByRole("heading", { name: "Elige tu tripulación" }),
  ).toBeVisible();
});
