import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { ADMIN, sql } from "../helpers";

const { Before, After, When, Then } = createBdd();

const CATEGORY = "FAQ e2e backoffice";
const QUESTION = "¿Cómo pruebo la FAQ administrable?";
const ORIGINAL_ANSWER = "Creando el contenido desde el backoffice.";
const UPDATED_ANSWER = "Editando el contenido desde el backoffice.";

const cleanup = () =>
  sql(`DELETE FROM cms_faq_categories WHERE title = '${CATEGORY}'`);

Before({ tags: "@faq" }, cleanup);
After({ tags: "@faq" }, cleanup);

When("crea la categoría FAQ de prueba", async ({ page }) => {
  await page.goto(`${ADMIN}/cms-faq-categories/create`);
  await page.locator('input[name="title"]').fill(CATEGORY);
  await page.getByRole("button", { name: /^guardar$/i }).click();
  await expect(page.locator("tbody").getByText(CATEGORY)).toBeVisible({
    timeout: 20_000,
  });
});

When("crea una pregunta dentro de esa categoría", async ({ page }) => {
  await page.locator("tbody").getByText(CATEGORY).click();
  await page.getByRole("link", { name: /nueva pregunta/i }).click();

  await page.locator('input[name="question"]').fill(QUESTION);
  await page.locator('textarea[name="answer"]').fill(ORIGINAL_ANSWER);
  await page.locator('input[name="linkLabel"]').fill("Contactanos");
  await page.locator('input[name="linkHref"]').fill("/contacto");
  await page.getByRole("button", { name: /^guardar$/i }).click();
});

Then("ve la pregunta FAQ publicada en el listado", async ({ page }) => {
  await expect(page.locator("tbody").getByText(QUESTION)).toBeVisible({
    timeout: 20_000,
  });
});

When("edita la respuesta de la pregunta FAQ", async ({ page }) => {
  await page.locator("tbody").getByText(QUESTION).click();
  await page.getByRole("link", { name: /^editar$/i }).click();
  const answer = page.locator('textarea[name="answer"]');
  await answer.fill(UPDATED_ANSWER);
  await page.getByRole("button", { name: /guardar cambios/i }).click();
});

Then("ve la respuesta FAQ actualizada", async ({ page }) => {
  await page.locator("tbody").getByText(QUESTION).click();
  await expect(page.getByText(UPDATED_ANSWER, { exact: true })).toBeVisible({
    timeout: 20_000,
  });
});

When("elimina la pregunta y la categoría FAQ de prueba", async ({ page }) => {
  await page.getByRole("button", { name: /^eliminar$/i }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: /^eliminar$/i })
    .click();
  await expect(page.locator("tbody").getByText(QUESTION)).toHaveCount(0);

  await page.goto(`${ADMIN}/cms-faq-categories`);
  await page.locator("tbody").getByText(CATEGORY).click();
  await page.getByRole("button", { name: /^eliminar$/i }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: /^eliminar$/i })
    .click();
});

Then("la categoría FAQ de prueba deja de aparecer", async ({ page }) => {
  await expect(page.locator("tbody").getByText(CATEGORY)).toHaveCount(0);
});
