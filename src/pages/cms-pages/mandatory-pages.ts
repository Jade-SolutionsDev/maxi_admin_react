/**
 * Pages the storefront depends on by slug (footer legal links, About us).
 * The slugs are Spanish — the store's main language. Titles are exact: the
 * backend derives the slug from the title (slugify strips accents), so the
 * prefilled create form reproduces the canonical slug.
 */
export const MANDATORY_PAGES = [
  { slug: "sobre-nosotros", title: "Sobre nosotros" },
  { slug: "terminos-y-condiciones", title: "Términos y condiciones" },
  { slug: "politica-de-privacidad", title: "Política de privacidad" },
  { slug: "politica-de-reembolso", title: "Política de reembolso" },
];
