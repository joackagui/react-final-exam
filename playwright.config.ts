import { defineConfig, devices } from "@playwright/test";

const productionBaseUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: productionBaseUrl ?? "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  ...(productionBaseUrl
    ? {}
    : {
        webServer: {
          command:
            "npm run build && PORT=3001 ENABLE_TEST_ROUTES=true npm run start",
          url: "http://127.0.0.1:3001/api/health",
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
});
