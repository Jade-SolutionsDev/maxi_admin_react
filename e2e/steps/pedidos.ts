import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Then } = createBdd();

const filtroDeMetodo = (page: import('@playwright/test').Page) =>
  page.getByRole('combobox', { name: /método de pago/i }).first();

Then('puede filtrar por método de pago', async ({ page }) => {
  await expect(filtroDeMetodo(page)).toBeVisible({ timeout: 20_000 });
});

/**
 * Uno de cada diez pedidos no llega a tener ningún intento: sin esta opción
 * desaparecerían de todo filtro y la suma no cuadraría con el total.
 */
Then('entre las opciones está {string}', async ({ page }, texto: string) => {
  await filtroDeMetodo(page).click();
  await expect(
    page.getByRole('option', { name: new RegExp(texto, 'i') }).first(),
  ).toBeVisible({ timeout: 20_000 });
});

Then('la tabla tiene una columna de método de pago', async ({ page }) => {
  await expect(
    page.getByRole('columnheader', { name: /método de pago/i }).first(),
  ).toBeVisible({ timeout: 20_000 });
});
