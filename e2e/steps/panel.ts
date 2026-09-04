import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { ADMIN, sql } from '../helpers';

const { Given, When, Then } = createBdd();

/** El panel es la raíz: `dashboard={Dashboard}` en App.tsx. */
const PANEL = `${ADMIN}/`;

/** Estados que solo existían en los datos de ejemplo; la API nunca los emite. */
const ESTADOS_INVENTADOS = /completada|en proceso|cancelada\b/i;

/** Espera a que caigan los esqueletos y queden las cuatro tarjetas. */
async function esperarLasTarjetas(page: Page) {
  await expect(page.locator('.animate-pulse')).toHaveCount(0, {
    timeout: 20_000,
  });
}

/** El texto de las cuatro tarjetas, ya sin esqueletos. */
async function textoDeLasTarjetas(page: Page): Promise<string[]> {
  await esperarLasTarjetas(page);
  return page
    .locator('div.rounded-2xl.shadow-card')
    .filter({ hasNotText: 'Órdenes recientes' })
    .allInnerTexts();
}

Given('que hay pedidos de prueba de los últimos 30 días', async () => {
  if (sql(`SELECT id FROM orders WHERE order_number = 'E2E-PANEL-1'`)) return;

  const cliente =
    sql(`SELECT id FROM clients WHERE deleted_at IS NULL ORDER BY created_at LIMIT 1`) ||
    sql(`
      INSERT INTO clients (clerk_id, email, first_name, last_name)
      VALUES ('clerk_panel_e2e', 'panel.e2e@example.com', 'Panel', 'E2E')
      RETURNING id`);

  // created_at es @CreateDateColumn: hay que retrodatarlo para colocar la fila
  // dentro de la ventana que mide el panel.
  const dentro = sql(`
    INSERT INTO orders (order_number, client_id, status, subtotal, delivery_fee, total)
    VALUES ('E2E-PANEL-1', '${cliente}', 'confirmed', 250, 0, 250)
    RETURNING id`);
  sql(`UPDATE orders SET created_at = now() - interval '2 days' WHERE id = '${dentro}'`);

  const fuera = sql(`
    INSERT INTO orders (order_number, client_id, status, subtotal, delivery_fee, total)
    VALUES ('E2E-PANEL-VIEJO', '${cliente}', 'delivered', 999, 0, 999)
    RETURNING id`);
  sql(`UPDATE orders SET created_at = now() - interval '200 days' WHERE id = '${fuera}'`);
});

When('abre el panel', async ({ page }) => {
  await page.goto(PANEL);
  await esperarLasTarjetas(page);
});

When('pulsa {string} en las órdenes recientes', async ({ page }, etiqueta: string) => {
  await page.getByRole('button', { name: etiqueta }).first().click();
});

Then(
  'ninguna tarjeta muestra la cifra de ejemplo {string}',
  async ({ page }, cifra: string) => {
    // El guard más barato contra que el arreglo de mockData vuelva a colarse.
    const tarjetas = await textoDeLasTarjetas(page);
    expect(tarjetas.join(' ')).not.toContain(cifra);
  },
);

Then(
  'la cifra de pedidos coincide con los pedidos de los últimos 30 días',
  async ({ page }) => {
    // Se compara contra la base, no contra una constante mágica: el test
    // asserta concordancia entre panel y datos.
    const esperado = Number(
      sql(`SELECT count(*) FROM orders
             WHERE deleted_at IS NULL
               AND created_at >= now() - interval '30 days'`),
    );
    const tarjetas = await textoDeLasTarjetas(page);
    const pedidos = tarjetas.find((t) => /Pedidos de los últimos/i.test(t));
    expect(pedidos, 'no encontré la tarjeta de pedidos').toBeTruthy();
    expect(pedidos).toContain(esperado.toLocaleString('en-US'));
  },
);

Then('la cifra de productos coincide con los productos activos', async ({ page }) => {
  const esperado = Number(
    sql(`SELECT count(*) FROM products WHERE deleted_at IS NULL AND is_active`),
  );
  const tarjetas = await textoDeLasTarjetas(page);
  const productos = tarjetas.find((t) => /Productos activos/i.test(t));
  expect(productos, 'no encontré la tarjeta de productos').toBeTruthy();
  expect(productos).toContain(esperado.toLocaleString('en-US'));
});

Then(
  'cada tarjeta lleva una variación o la palabra {string}',
  async ({ page }, sinBase: string) => {
    const tarjetas = await textoDeLasTarjetas(page);
    expect(tarjetas.length).toBeGreaterThanOrEqual(4);
    tarjetas.forEach((tarjeta) => {
      expect(tarjeta).toMatch(
        new RegExp(`[+-]\\d|${sinBase}|Sin cambios|nuevos?`, 'i'),
      );
    });
  },
);

Then(
  'la tabla de órdenes recientes muestra el número del último pedido',
  async ({ page }) => {
    const ultimo = sql(`
      SELECT order_number FROM orders
       WHERE deleted_at IS NULL AND order_number IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`);
    expect(ultimo, 'no hay pedidos con número en la base').toBeTruthy();
    await expect(page.getByText(ultimo).first()).toBeVisible({ timeout: 15_000 });
  },
);

Then('no queda ningún estado inventado en la tabla', async ({ page }) => {
  // Los pills viejos venían del mock en español; los de verdad salen de
  // orders.status.* y dicen "Pendiente", "En preparación", "Entregado"…
  const tabla = await page.locator('table').first().innerText();
  expect(tabla).not.toMatch(ESTADOS_INVENTADOS);
});

Then('está en el listado de pedidos', async ({ page }) => {
  await expect(page).toHaveURL(/\/orders$/, { timeout: 15_000 });
});
