import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('pulsa guardar', async ({ page }) => {
  await page.getByRole('button', { name: /^guardar/i }).first().click();
});

/**
 * El aviso, que es lo que no existía: antes se pulsaba «Guardar» y no ocurría
 * nada visible, porque el error se pintaba bajo un campo que estaba fuera de la
 * vista.
 */
Then('se avisa de que faltan campos por completar', async ({ page }) => {
  await expect(
    page.getByText(/revisa los campos marcados/i).first(),
  ).toBeVisible({ timeout: 15_000 });
});

Then('el formulario sigue abierto', async ({ page }) => {
  await expect(page.locator('input[name="name"]').first()).toBeVisible();
});

/**
 * `toBeInViewport` es la parte que de verdad comprueba lo reportado: no basta
 * con que el error exista en la página, tiene que estar donde se vea.
 */
Then('se ve el error del campo que falta', async ({ page }) => {
  const error = page.locator('[data-slot="form-message"]').first();
  await expect(error).toBeVisible({ timeout: 15_000 });
  await expect(error).toBeInViewport({ timeout: 15_000 });
});
