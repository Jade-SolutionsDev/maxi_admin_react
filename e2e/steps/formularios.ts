import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { ADMIN } from '../helpers';

const { When, Then } = createBdd();

const NOMBRE = 'input[name="name"]';
const DESCUENTO = 'input[name="discount"]';

When('abre el formulario de nuevo producto', async ({ page }) => {
  await page.goto(`${ADMIN}/products/create`);
  await page.locator(NOMBRE).first().waitFor({ state: 'visible', timeout: 30_000 });
});

When('escribe {string} en el nombre', async ({ page }, texto: string) => {
  await page.locator(NOMBRE).first().fill(texto);
});

When('pulsa fuera del formulario', async ({ page }) => {
  // La esquina de la pantalla: fondo, lejos de cualquier campo.
  await page.mouse.click(20, 300);
  await page.waitForTimeout(1200);
});

When('escribe {int} en el descuento', async ({ page }, valor: number) => {
  await page.locator(DESCUENTO).first().fill(String(valor));
});

When('borra el descuento', async ({ page }) => {
  await page.locator(DESCUENTO).first().fill('');
  await page.waitForTimeout(600);
});

Then('el formulario sigue abierto con lo escrito', async ({ page }) => {
  const nombre = page.locator(NOMBRE).first();
  await expect(nombre).toBeVisible();
  await expect(nombre).toHaveValue('Producto a medio escribir');
});

Then('puede marcar el producto como destacado', async ({ page }) => {
  await expect(page.getByText(/destacado/i).first()).toBeVisible({ timeout: 15_000 });
});

Then('el descuento queda vacío', async ({ page }) => {
  await expect(page.locator(DESCUENTO).first()).toHaveValue('');
});

When('abre el formulario de invitar usuario', async ({ page }) => {
  // El modal es una ruta, no un botón: `/users/create` lo monta directamente.
  // Se localiza por su título: los popovers cerrados también son `role=dialog`.
  await page.goto(`${ADMIN}/users/create`);
  await expect(dialogoDeInvitacion(page)).toBeVisible({ timeout: 20_000 });
});

const dialogoDeInvitacion = (page: import('@playwright/test').Page) =>
  page.getByRole('dialog', { name: /crear nuevo usuario|invitar/i });

Then('el formulario de invitación sigue abierto', async ({ page }) => {
  await expect(dialogoDeInvitacion(page)).toBeVisible();
});
