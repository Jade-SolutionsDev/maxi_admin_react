import { execFileSync } from 'node:child_process';

export const ADMIN = 'http://localhost:5173';

const CONTENEDOR = 'maxihabana-postgres-dev';
const BASE_DATOS = 'maxihabana';

/** SQL contra la base de desarrollo. Devuelve la primera fila útil. */
export function sql(consulta: string): string {
  const salida = execFileSync(
    'docker',
    ['exec', '-i', CONTENEDOR, 'psql', '-U', 'maxihabana', '-d', BASE_DATOS, '-qtAc', consulta],
    { encoding: 'utf8' },
  );

  return (
    salida
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !/^(INSERT|UPDATE|DELETE|SELECT) \d/.test(l))[0] ?? ''
  );
}

/**
 * Catálogo mínimo con el que se puede probar de verdad: dos departamentos
 * —para ver que el filtro de categorías se estrecha— y un producto cuyo nombre
 * lleva tildes, que es el caso que fallaba.
 */
export function sembrarCatalogo() {
  if (sql(`SELECT id FROM categories WHERE slug = 'alimentacion-e2e'`)) return;

  const departamento = sql(`
    INSERT INTO categories (name, slug, parent_id, image_desktop_url, image_mobile_url)
    VALUES ('Alimentación', 'alimentacion-e2e', NULL, 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png')
    RETURNING id`);
  const categoria = sql(`
    INSERT INTO categories (name, slug, parent_id, image_desktop_url, image_mobile_url)
    VALUES ('Almíbar y conservas', 'almibar-e2e', '${departamento}', 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png')
    RETURNING id`);

  const otroDepartamento = sql(`
    INSERT INTO categories (name, slug, parent_id, image_desktop_url, image_mobile_url)
    VALUES ('Limpieza', 'limpieza-e2e', NULL, 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png')
    RETURNING id`);
  sql(`
    INSERT INTO categories (name, slug, parent_id, image_desktop_url, image_mobile_url)
    VALUES ('Detergentes', 'detergentes-e2e', '${otroDepartamento}', 'https://placehold.co/600x400.png', 'https://placehold.co/600x400.png')`);

  sql(`
    INSERT INTO products (category_id, sku, name, slug, measure_unit, base_price, discount, image_url)
    VALUES ('${categoria}', 'E2E-ADMIN-1', 'Melocotón en Almíbar', 'melocoton-almibar-e2e', 'unidad', 120, 10, 'https://placehold.co/600x400.png')`);
}
