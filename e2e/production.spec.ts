import { expect, test, type Page } from "@playwright/test";
import type { Game } from "../client/src/game-types";

async function createProductionGame(page: Page): Promise<Game> {
  await page.goto("/");
  await page.getByLabel("Identificador").nth(0).fill("produccion-pirata");
  await page.getByLabel("Identificador").nth(1).fill("produccion-fantasma");

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

test("crea una partida y procesa una acción en la aplicación publicada", async ({
  page,
}) => {
  test.skip(
    !process.env.E2E_BASE_URL,
    "Esta prueba se ejecuta cuando E2E_BASE_URL apunta a producción.",
  );

  const game = await createProductionGame(page);

  expect(game.status).toBe("en_curso");
  expect(game.players).toHaveLength(2);
  await expect(page.getByLabel("Mapa de batalla naval")).toBeVisible();
  await expect(page.getByLabel("Barco Pirata")).toBeVisible();
  await expect(page.getByLabel("Barco Fantasma")).toBeVisible();

  const actionResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/games/${game.id}/action`) &&
      response.request().method() === "POST",
  );
  await page.keyboard.press("c");
  const response = await actionResponse;

  expect(response.status()).toBe(200);
  const updatedGame = (await response.json()) as Game;
  expect(updatedGame.activeProjectiles.length).toBeGreaterThan(0);
});
