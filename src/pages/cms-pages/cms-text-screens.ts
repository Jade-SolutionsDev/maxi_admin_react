import type { CmsTextResource } from "@/providers/dataProvider";

/**
 * Info pages and home notices are the same document in the API (a Markdown
 * draft plus published versions), so they share every screen. This is what
 * differs between them.
 */
export interface CmsTextScreen {
  resource: CmsTextResource;
  /** Where the list lives; the detail is `${basePath}/:id`. */
  basePath: string;
  /** i18n namespace for the screen's own copy. */
  i18n: "cms-pages" | "cms-home-notices";
  /** Notices carry show/hide dates and have no page of their own. */
  isNotice: boolean;
}

export const PAGE_SCREEN: CmsTextScreen = {
  resource: "cms-pages",
  basePath: "/cms-pages",
  i18n: "cms-pages",
  isNotice: false,
};

export const NOTICE_SCREEN: CmsTextScreen = {
  resource: "cms-home-notices",
  basePath: "/cms-home-notices",
  i18n: "cms-home-notices",
  isNotice: true,
};
