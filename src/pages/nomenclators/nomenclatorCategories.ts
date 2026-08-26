/**
 * Nomenclator categories manageable from this screen. Adding a future
 * catalog = one entry here + its i18n labels (backend: extend
 * NOMENCLATOR_CATEGORIES in src/nomenclators/entities/nomenclator.entity.ts).
 */
export const NOMENCLATOR_CATEGORIES = [
  { id: "contact-motive", labelKey: "nomenclators.categories.contact-motive" },
] as const;

export type NomenclatorCategoryId =
  (typeof NOMENCLATOR_CATEGORIES)[number]["id"];
