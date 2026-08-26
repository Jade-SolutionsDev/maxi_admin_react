import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { ADMIN, sql } from '../helpers';

const { Given, When, Then, After } = createBdd();

/**
 * Todo lo que se siembra aquí lleva «E2E» en el nombre y se borra al terminar.
 * Estas formas de entrega las lee la tienda: dejarlas puestas cambia lo que se
 * le ofrece a un cliente en el checkout.
 */
After(async () => {
  sql(`DELETE FROM delivery_option_zones
        WHERE option_id IN (SELECT id FROM delivery_options WHERE label LIKE '%E2E%')`);
  sql(`DELETE FROM delivery_options WHERE label LIKE '%E2E%'`);
});

const fila = (page: Page, etiqueta: string) =>
  page.locator('li').filter({ hasText: etiqueta }).first();

const dialogo = (page: Page) => page.getByRole('dialog').first();

const NOMBRE = 'input[name="label"]';
const COSTO = 'input[name="fee"]';

Given(
  'que existe la forma de entrega {string} sin zonas',
  async ({}, etiqueta: string) => {
    sql(`INSERT INTO delivery_options (label, fee, enabled)
         VALUES ('${etiqueta}', 3, true)`);
  },
);

Given(
  'que existe la forma de entrega {string} con la provincia {string}',
  async ({}, etiqueta: string, provincia: string) => {
    const id = sql(`INSERT INTO delivery_options (label, fee, enabled)
                    VALUES ('${etiqueta}', 3, true) RETURNING id`);
    const provinciaId = sql(
      `SELECT id FROM provinces WHERE name = '${provincia}'`,
    );
    sql(`INSERT INTO delivery_option_zones (option_id, province_id)
         VALUES ('${id}', '${provinciaId}')`);
  },
);

When('abre las formas de entrega', async ({ page }) => {
  await page.goto(`${ADMIN}/delivery-options`);
  await expect(page.getByText(/formas de entrega/i).first()).toBeVisible({
    timeout: 30_000,
  });
});

When('abre el formulario de nueva forma de entrega', async ({ page }) => {
  await page.goto(`${ADMIN}/delivery-options/create`);
  await page.locator(NOMBRE).first().waitFor({ state: 'visible', timeout: 30_000 });
});

When(
  'escribe {string} en el nombre de la forma',
  async ({ page }, texto: string) => {
    await page.locator(NOMBRE).first().fill(texto);
  },
);

Then(
  'el formulario de entrega sigue abierto con lo escrito',
  async ({ page }) => {
    await expect(page.locator(NOMBRE).first()).toHaveValue(
      'A medio escribir E2E',
    );
  },
);

When(
  'crea la forma de entrega {string} con un costo de {int}',
  async ({ page }, etiqueta: string, costo: number) => {
    await page.getByRole('link', { name: /crear/i }).first().click();
    await page.locator(NOMBRE).first().waitFor({ state: 'visible', timeout: 30_000 });
    await page.locator(NOMBRE).first().fill(etiqueta);
    await page.locator(COSTO).first().fill(String(costo));
    await guardar(page);
  },
);

When(
  'edita la forma {string} y le pone un costo de {int}',
  async ({ page }, etiqueta: string, costo: number) => {
    await abrirEdicion(page, etiqueta);
    await page.locator(COSTO).first().fill(String(costo));
    await guardar(page);
  },
);

When(
  'edita la forma {string} y le asigna la provincia {string}',
  async ({ page }, etiqueta: string, provincia: string) => {
    await abrirEdicion(page, etiqueta);
    await dialogo(page).getByRole('checkbox', { name: provincia }).first().check();
    await guardar(page);
  },
);

When(
  'edita la forma {string} y le quita la provincia {string}',
  async ({ page }, etiqueta: string, provincia: string) => {
    await abrirEdicion(page, etiqueta);
    await dialogo(page)
      .getByRole('checkbox', { name: provincia })
      .first()
      .uncheck();
    await guardar(page);
  },
);

When(
  'pulsa el interruptor de la forma {string}',
  async ({ page }, etiqueta: string) => {
    await fila(page, etiqueta).getByRole('switch').first().click();
  },
);

When('cambia el interruptor de recoger en tienda', async ({ page }) => {
  const interruptor = page.getByRole('switch', {
    name: /recoger pedidos en tienda/i,
  });
  await interruptor.waitFor({ state: 'visible', timeout: 30_000 });
  estadoPrevioRecogida = await interruptor.getAttribute('aria-checked');
  await interruptor.click();
});

let estadoPrevioRecogida: string | null = null;

When('confirma', async ({ page }) => {
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: /activar|desactivar|permitir|confirmar/i })
    .first()
    .click();
  await page.waitForTimeout(1200);
});

Then(
  've la forma de entrega {string} con el costo {string}',
  async ({ page }, etiqueta: string, costo: string) => {
    await expect(fila(page, etiqueta)).toContainText(costo, { timeout: 20_000 });
  },
);

Then(
  'la forma {string} dice que se ofrece en todo el país',
  async ({ page }, etiqueta: string) => {
    await expect(fila(page, etiqueta)).toContainText(/en todo el pa/i, {
      timeout: 20_000,
    });
  },
);

Then(
  'la forma {string} dice que tiene {int} zona(s)',
  async ({ page }, etiqueta: string, cuantas: number) => {
    await expect(fila(page, etiqueta)).toContainText(
      new RegExp(`${cuantas} zona`, 'i'),
      { timeout: 20_000 },
    );
  },
);

Then(
  'se pide confirmar que dejará de aparecer al finalizar la compra',
  async ({ page }) => {
    await expect(
      page.getByRole('alertdialog').getByText(/dejar. de aparecer/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  },
);

Then('se pide confirmar el cambio de la recogida', async ({ page }) => {
  await expect(
    page.getByRole('alertdialog').getByText(/recogida|recoger/i).first(),
  ).toBeVisible({ timeout: 15_000 });
});

Then(
  'la forma {string} queda desactivada',
  async ({ page }, etiqueta: string) => {
    await expect(
      fila(page, etiqueta).getByRole('switch').first(),
    ).toHaveAttribute('aria-checked', 'false', { timeout: 20_000 });
  },
);

Then('el interruptor de recoger en tienda queda cambiado', async ({ page }) => {
  const interruptor = page.getByRole('switch', {
    name: /recoger pedidos en tienda/i,
  });
  await expect(interruptor).not.toHaveAttribute(
    'aria-checked',
    estadoPrevioRecogida ?? 'true',
    { timeout: 20_000 },
  );
  // Se deja como estaba: es un ajuste de toda la tienda, no del escenario.
  await interruptor.click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: /activar|desactivar|permitir|confirmar/i })
    .first()
    .click();
  await expect(interruptor).toHaveAttribute(
    'aria-checked',
    estadoPrevioRecogida ?? 'true',
    { timeout: 20_000 },
  );
});

async function abrirEdicion(page: Page, etiqueta: string) {
  await fila(page, etiqueta).getByRole('link').first().click();
  await page.locator(NOMBRE).first().waitFor({ state: 'visible', timeout: 30_000 });
}

async function guardar(page: Page) {
  await page.getByRole('button', { name: /^guardar/i }).first().click();
  await expect(page.locator(NOMBRE).first()).toBeHidden({ timeout: 30_000 });
}
