# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/features/listados.feature.spec.js >> Los listados de la administración >> El listado dice a qué departamento pertenece cada producto
- Location: e2e/.generado/e2e/features/listados.feature.spec.js:29:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('tbody tr').filter({ hasText: 'Melocotón en Almíbar' }).first()
Expected substring: "Alimentación"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('tbody tr').filter({ hasText: 'Melocotón en Almíbar' }).first()

```

```yaml
- img "MaxiHabana"
- list:
  - listitem:
    - button "Panel"
- text: Ventas
- list:
  - listitem:
    - button "Pedidos"
  - listitem:
    - button "Métodos de pago"
  - listitem:
    - button "Entregas"
  - listitem:
    - button "Clientes"
- text: Catálogo
- list:
  - listitem:
    - button "Productos"
  - listitem:
    - button "Departamentos"
  - listitem:
    - button "Categorías"
- text: Inventario
- list:
  - listitem:
    - button "Inventario"
  - listitem:
    - button "Almacenes"
- text: Soporte
- list:
  - listitem:
    - button "Mensajes"
  - listitem:
    - button "Plantillas"
  - listitem:
    - button "Nomencladores"
- text: Sistema
- list:
  - listitem:
    - button "Usuarios"
  - listitem:
    - button "CMS"
  - listitem:
    - button "Reportes" [disabled]
    - text: Próximamente
  - listitem:
    - button "Configuración"
- text: Q
- paragraph: QA Admin
- paragraph: qa.admin+clerk_test@maxihabana.com
- button "Cerrar Sesión"
- button "Mostrar u ocultar el menú lateral"
- main:
  - button
  - heading "Panel" [level=1]
  - paragraph: Inicio
  - button "Buscar... ⌘K"
  - button
  - button "ES"
  - button "Cambiar el tema"
  - button "Q"
  - heading "Productos" [level=2]
  - button
  - link "Crear":
    - /url: /products/create
  - button "Columnas"
  - button "Añadir filtro"
  - group:
    - textbox "Buscar"
  - group:
    - text: Departamento
    - combobox "Departamento"
  - group:
    - text: Categoría
    - combobox "Categoría"
  - table:
    - rowgroup:
      - row "# Imagen Nombre Departamento Categoría Unidad de medida Precio base Descuento Precio final Destacado Estado":
        - columnheader "#"
        - columnheader "Imagen"
        - columnheader "Nombre":
          - button "Nombre"
        - columnheader "Departamento"
        - columnheader "Categoría"
        - columnheader "Unidad de medida":
          - button "Unidad de medida"
        - columnheader "Precio base":
          - button "Precio base"
        - columnheader "Descuento":
          - button "Descuento"
        - columnheader "Precio final":
          - button "Precio final"
        - columnheader "Destacado"
        - columnheader "Estado"
    - rowgroup:
      - button "1 Fila 13 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "1"
        - cell
        - cell "Fila 13 E2E 76749733":
          - paragraph: Fila 13 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "2 Fila 12 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "2"
        - cell
        - cell "Fila 12 E2E 76749733":
          - paragraph: Fila 12 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "3 Fila 11 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "3"
        - cell
        - cell "Fila 11 E2E 76749733":
          - paragraph: Fila 11 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "4 Fila 10 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "4"
        - cell
        - cell "Fila 10 E2E 76749733":
          - paragraph: Fila 10 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "5 Fila 09 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "5"
        - cell
        - cell "Fila 09 E2E 76749733":
          - paragraph: Fila 09 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "6 Fila 08 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "6"
        - cell
        - cell "Fila 08 E2E 76749733":
          - paragraph: Fila 08 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "7 Fila 07 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "7"
        - cell
        - cell "Fila 07 E2E 76749733":
          - paragraph: Fila 07 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "8 Fila 06 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "8"
        - cell
        - cell "Fila 06 E2E 76749733":
          - paragraph: Fila 06 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "9 Fila 05 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "9"
        - cell
        - cell "Fila 05 E2E 76749733":
          - paragraph: Fila 05 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
      - button "10 Fila 04 E2E 76749733 Dep E2E 76749733 Cat E2E 76749733 unidad $100.00 — $100.00":
        - cell "10"
        - cell
        - cell "Fila 04 E2E 76749733":
          - paragraph: Fila 04 E2E 76749733
        - cell "Dep E2E 76749733"
        - cell "Cat E2E 76749733"
        - cell "unidad"
        - cell "$100.00"
        - cell "—"
        - cell "$100.00"
        - cell:
          - img
        - cell:
          - img
  - paragraph: "Filas por página:"
  - combobox: "10"
  - text: 1 - 10 de 17
  - navigation "pagination":
    - list:
      - listitem:
        - img "Ir a la página anterior"
      - listitem:
        - link "1":
          - /url: "#"
      - listitem:
        - link "2":
          - /url: "#"
      - listitem:
        - link "Siguiente":
          - /url: "#"
- region "Notifications alt+T"
- button "Open Tanstack query devtools":
  - img
```

# Test source

```ts
  34  |   // El filtro viaja con retardo: se espera al resultado, no a un reloj.
  35  |   await page.waitForTimeout(1200);
  36  | });
  37  | 
  38  | When('pulsa la equis de limpiar', async ({ page }) => {
  39  |   await page.getByRole('button', { name: /clear|limpiar/i }).first().click();
  40  |   await page.waitForTimeout(900);
  41  | });
  42  | 
  43  | When('filtra por el departamento {string}', async ({ page }, nombre: string) => {
  44  |   const combo = page.getByRole('combobox').first();
  45  |   await combo.click();
  46  |   await page.getByRole('option', { name: nombre, exact: true }).first().click();
  47  |   await page.waitForTimeout(1500);
  48  | });
  49  | 
  50  | Then('ve el producto {string}', async ({ page }, nombre: string) => {
  51  |   await expect(page.getByText(nombre).first()).toBeVisible({ timeout: 15_000 });
  52  | });
  53  | 
  54  | Then('se le dice que no hay resultados', async ({ page }) => {
  55  |   await expect(page.getByText(/sin resultados|no hay nada/i).first()).toBeVisible({
  56  |     timeout: 15_000,
  57  |   });
  58  | });
  59  | 
  60  | Then('puede limpiar los filtros', async ({ page }) => {
  61  |   await expect(
  62  |     page.getByRole('button', { name: /limpiar filtros/i }).first(),
  63  |   ).toBeVisible({ timeout: 10_000 });
  64  | });
  65  | 
  66  | Then('todas las cabeceras tienen el mismo tamaño de letra', async ({ page }) => {
  67  |   const tamaños = await page.evaluate(() =>
  68  |     [...document.querySelectorAll('th')]
  69  |       .map((th) => {
  70  |         const interior = th.querySelector('span, button');
  71  |         return interior && interior.textContent?.trim()
  72  |           ? getComputedStyle(interior).fontSize
  73  |           : null;
  74  |       })
  75  |       .filter((t): t is string => t !== null),
  76  |   );
  77  | 
  78  |   expect(tamaños.length).toBeGreaterThan(3);
  79  |   expect(new Set(tamaños).size).toBe(1);
  80  | });
  81  | 
  82  | Then('la búsqueda queda vacía', async ({ page }) => {
  83  |   const buscador = page.locator('input[name="q"], input[placeholder*="uscar" i]').first();
  84  |   await expect(buscador).toHaveValue('');
  85  | });
  86  | 
  87  | Then(
  88  |   'solo puede elegir categorías de ese departamento',
  89  |   async ({ page }) => {
  90  |     const combo = page.getByRole('combobox').nth(1);
  91  |     await combo.click();
  92  |     await page.waitForTimeout(900);
  93  |     const opciones = (await page.locator('[role=option]:visible').allInnerTexts()).map((t) =>
  94  |       t.trim(),
  95  |     );
  96  |     await page.keyboard.press('Escape');
  97  | 
  98  |     expect(opciones).toContain('Almíbar y conservas');
  99  |     expect(opciones).not.toContain('Detergentes');
  100 |   },
  101 | );
  102 | 
  103 | Then('hay un interruptor para ver solo los habilitados', async ({ page }) => {
  104 |   await expect(page.getByRole('switch').first()).toBeVisible({ timeout: 15_000 });
  105 |   await expect(page.getByText(/solo habilitados/i).first()).toBeVisible();
  106 | });
  107 | 
  108 | Then('no se ven claves de traducción sin traducir', async ({ page }) => {
  109 |   const texto = await page.locator('body').innerText();
  110 |   const crudas = texto.match(/\bra\.[a-z_]+\.[a-z_]+/g) ?? [];
  111 |   expect(crudas, `claves sin traducir en pantalla: ${crudas.join(', ')}`).toHaveLength(0);
  112 | });
  113 | 
  114 | /** Acción, no botón: «Crear» es un enlace a la ruta de alta. */
  115 | Then('ve la acción {string}', async ({ page }, nombre: string) => {
  116 |   await expect(page.getByText(nombre, { exact: true }).first()).toBeVisible();
  117 | });
  118 | 
  119 | /** La tabla tarda: hay sesión, permisos y una petición de por medio. */
  120 | async function esperarLaTabla(page: Page) {
  121 |   await page
  122 |     .locator('table, [role=table]')
  123 |     .first()
  124 |     .waitFor({ state: 'visible', timeout: 30_000 })
  125 |     .catch(() => undefined);
  126 |   await page.waitForTimeout(1200);
  127 | }
  128 | 
  129 | Then(
  130 |   'la fila del producto muestra su departamento y su categoría',
  131 |   async ({ page }) => {
  132 |     // `tbody tr`, no `getByRole('row')`: esta tabla no expone el rol de fila.
  133 |     const fila = page.locator('tbody tr').filter({ hasText: 'Melocotón en Almíbar' }).first();
> 134 |     await expect(fila).toContainText('Alimentación');
      |                        ^ Error: expect(locator).toContainText(expected) failed
  135 |     await expect(fila).toContainText('Almíbar y conservas');
  136 |   },
  137 | );
  138 | 
  139 | Then(
  140 |   'el menú muestra los grupos {string}, {string} e {string}',
  141 |   async ({ page }, uno: string, dos: string, tres: string) => {
  142 |     const menu = page.getByRole('navigation').first().or(page.locator('[data-slot=sidebar]'));
  143 |     for (const grupo of [uno, dos, tres]) {
  144 |       await expect(menu.getByText(grupo, { exact: true }).first()).toBeVisible({
  145 |         timeout: 15_000,
  146 |       });
  147 |     }
  148 |   },
  149 | );
  150 | 
  151 | Then(
  152 |   'puede llegar a {string}, {string} y {string} desde el menú',
  153 |   async ({ page }, uno: string, dos: string, tres: string) => {
  154 |     for (const modulo of [uno, dos, tres]) {
  155 |       await expect(
  156 |         page.getByRole('button', { name: modulo, exact: true }).first(),
  157 |       ).toBeVisible({ timeout: 15_000 });
  158 |     }
  159 |   },
  160 | );
  161 | 
```