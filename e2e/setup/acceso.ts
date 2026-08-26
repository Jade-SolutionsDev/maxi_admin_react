import { expect, type Page } from '@playwright/test';
import { ADMIN, sql } from '../helpers';

/**
 * La instancia de Clerk del backoffice es distinta a la de la tienda, y la
 * tabla de usuarios internos nace vacía. Estas credenciales corresponden a una
 * cuenta de prueba (`+clerk_test`, sin correo real) dada de alta como
 * super administrador.
 */
export const CORREO = process.env.E2E_ADMIN_EMAIL ?? 'qa.admin+clerk_test@maxihabana.com';
const CLAVE = process.env.E2E_ADMIN_PASSWORD ?? 'MaxiAdminQA2026';

export async function iniciarSesion(page: Page) {
  const existe = sql(`SELECT id FROM users WHERE email = '${CORREO}'`);
  if (!existe) {
    throw new Error(
      `No existe el usuario ${CORREO} en la tabla users. Créalo en Clerk (backoffice) y dalo de alta como SUPER_ADMIN.`,
    );
  }

  await page.goto(`${ADMIN}/login`);
  await page.waitForFunction(() => (window as any).Clerk?.loaded === true, null, {
    timeout: 30_000,
  });

  const clave = page.locator('input[type="password"]').first();
  await clave.waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('input[type="email"], input[name="email"]').first().fill(CORREO);
  await clave.fill(CLAVE);
  await page.getByRole('button', { name: /iniciar|entrar|acceder|sign in/i }).first().click();

  await expect(page).not.toHaveURL(/login/, { timeout: 30_000 });
}
