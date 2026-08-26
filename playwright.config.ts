import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

/**
 * Las pruebas se escriben en Gherkin, en `e2e/features/`, igual que en la
 * tienda: se leen sin saber Playwright. `bddgen` las traduce antes de correr.
 *
 * Necesita la administración en `:5173`, la API en `:4000` y la base de
 * desarrollo levantada.
 */
const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: 'e2e/steps/**/*.ts',
  outputDir: 'e2e/.generado',
});

export default defineConfig({
  testDir,
  fullyParallel: false, // comparten base de datos
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    headless: true,
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 20_000,
  },
});
