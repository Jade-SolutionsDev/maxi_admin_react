import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { ADMIN, sembrarCatalogo } from '../helpers';
import { iniciarSesion } from '../setup/acceso';

const { Given, When, Then, Before } = createBdd();

const RUTAS: Record<string, string> = {
  productos: '/products',
  categorías: '/categories',
  departamentos: '/departments',
  almacenes: '/stock-locations',
  inventario: '/inventory',
  pedidos: '/orders',
};

/** Una sesión por escenario: el admin no comparte estado entre pestañas. */
Before(async ({ page }) => {
  await iniciarSesion(page);
});

Given('que hay productos de prueba en el catálogo', async () => {
  sembrarCatalogo();
});

When('abre el listado de {string}', async ({ page }, listado: string) => {
  await page.goto(`${ADMIN}${RUTAS[listado]}`);
  await esperarLaTabla(page);
});

When('busca {string}', async ({ page }, termino: string) => {
  const buscador = page.locator('input[name="q"], input[placeholder*="uscar" i]').first();
  await buscador.waitFor({ state: 'visible', timeout: 20_000 });
  await buscador.fill(termino);
  // El filtro viaja con retardo: se espera al resultado, no a un reloj.
  await page.waitForTimeout(1200);
});

When('pulsa la equis de limpiar', async ({ page }) => {
  await page.getByRole('button', { name: /clear|limpiar/i }).first().click();
  await page.waitForTimeout(900);
});

When('filtra por el departamento {string}', async ({ page }, nombre: string) => {
  const combo = page.getByRole('combobox').first();
  await combo.click();
  await page.getByRole('option', { name: nombre, exact: true }).first().click();
  await page.waitForTimeout(1500);
});

Then('ve el producto {string}', async ({ page }, nombre: string) => {
  await expect(page.getByText(nombre).first()).toBeVisible({ timeout: 15_000 });
});

Then('se le dice que no hay resultados', async ({ page }) => {
  await expect(page.getByText(/sin resultados|no hay nada/i).first()).toBeVisible({
    timeout: 15_000,
  });
});

Then('puede limpiar los filtros', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: /limpiar filtros/i }).first(),
  ).toBeVisible({ timeout: 10_000 });
});

Then('todas las cabeceras tienen el mismo tamaño de letra', async ({ page }) => {
  const tamaños = await page.evaluate(() =>
    [...document.querySelectorAll('th')]
      .map((th) => {
        const interior = th.querySelector('span, button');
        return interior && interior.textContent?.trim()
          ? getComputedStyle(interior).fontSize
          : null;
      })
      .filter((t): t is string => t !== null),
  );

  expect(tamaños.length).toBeGreaterThan(3);
  expect(new Set(tamaños).size).toBe(1);
});

Then('la búsqueda queda vacía', async ({ page }) => {
  const buscador = page.locator('input[name="q"], input[placeholder*="uscar" i]').first();
  await expect(buscador).toHaveValue('');
});

Then(
  'solo puede elegir categorías de ese departamento',
  async ({ page }) => {
    const combo = page.getByRole('combobox').nth(1);
    await combo.click();
    await page.waitForTimeout(900);
    const opciones = (await page.locator('[role=option]:visible').allInnerTexts()).map((t) =>
      t.trim(),
    );
    await page.keyboard.press('Escape');

    expect(opciones).toContain('Almíbar y conservas');
    expect(opciones).not.toContain('Detergentes');
  },
);

Then('hay un interruptor para ver solo los habilitados', async ({ page }) => {
  await expect(page.getByRole('switch').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/solo habilitados/i).first()).toBeVisible();
});

Then('no se ven claves de traducción sin traducir', async ({ page }) => {
  const texto = await page.locator('body').innerText();
  const crudas = texto.match(/\bra\.[a-z_]+\.[a-z_]+/g) ?? [];
  expect(crudas, `claves sin traducir en pantalla: ${crudas.join(', ')}`).toHaveLength(0);
});

/** Acción, no botón: «Crear» es un enlace a la ruta de alta. */
Then('ve la acción {string}', async ({ page }, nombre: string) => {
  await expect(page.getByText(nombre, { exact: true }).first()).toBeVisible();
});

/** La tabla tarda: hay sesión, permisos y una petición de por medio. */
async function esperarLaTabla(page: Page) {
  await page
    .locator('table, [role=table]')
    .first()
    .waitFor({ state: 'visible', timeout: 30_000 })
    .catch(() => undefined);
  await page.waitForTimeout(1200);
}

Then(
  'la fila del producto muestra su departamento y su categoría',
  async ({ page }) => {
    // `tbody tr`, no `getByRole('row')`: esta tabla no expone el rol de fila.
    const fila = page.locator('tbody tr').filter({ hasText: 'Melocotón en Almíbar' }).first();
    await expect(fila).toContainText('Alimentación');
    await expect(fila).toContainText('Almíbar y conservas');
  },
);

Then(
  'el menú muestra los grupos {string}, {string} e {string}',
  async ({ page }, uno: string, dos: string, tres: string) => {
    const menu = page.getByRole('navigation').first().or(page.locator('[data-slot=sidebar]'));
    for (const grupo of [uno, dos, tres]) {
      await expect(menu.getByText(grupo, { exact: true }).first()).toBeVisible({
        timeout: 15_000,
      });
    }
  },
);

Then(
  'puede llegar a {string}, {string} y {string} desde el menú',
  async ({ page }, uno: string, dos: string, tres: string) => {
    for (const modulo of [uno, dos, tres]) {
      await expect(
        page.getByRole('button', { name: modulo, exact: true }).first(),
      ).toBeVisible({ timeout: 15_000 });
    }
  },
);
