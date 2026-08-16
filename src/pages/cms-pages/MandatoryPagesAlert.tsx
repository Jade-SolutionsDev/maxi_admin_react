import { Link } from "react-router-dom";
import { useGetList, useTranslate } from "ra-core";
import { TriangleAlert } from "lucide-react";
import { MANDATORY_PAGES } from "./mandatory-pages";

/**
 * Warns when a page the storefront links to by slug has no active row
 * (deleted or deactivated). Each missing page is a link that opens the
 * create form with the canonical title/slug prefilled, so recreating it
 * lands on the exact slug the rest of the site references.
 */
export function MandatoryPagesAlert() {
  const translate = useTranslate();
  const { data: pages } = useGetList("cms-pages", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "title", order: "ASC" },
  });

  if (!pages) return null;

  const missing = MANDATORY_PAGES.filter(
    (mandatory) =>
      !pages.some((page) => page.slug === mandatory.slug && page.isActive),
  );

  if (missing.length === 0) return null;

  return (
    <div
      role="alert"
      className="mx-4 mb-4 flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:mx-6"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
        <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        {translate("cms-pages.mandatory.title")}
      </p>
      <p className="text-sm text-muted-foreground">
        {translate("cms-pages.mandatory.description")}
      </p>
      <ul className="flex flex-wrap gap-2">
        {missing.map((page) => (
          <li key={page.slug}>
            <Link
              to={`/cms-pages/create?title=${encodeURIComponent(page.title)}&slug=${encodeURIComponent(page.slug)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={translate("cms-pages.mandatory.create_label", {
                title: page.title,
              })}
            >
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
