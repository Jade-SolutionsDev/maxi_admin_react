/** Mirror of the API's HomeSectionKey: sections the storefront can render. */
export const HOME_SECTION_KEYS = [
  "hero",
  "departments",
  "featured-products",
  "services",
  "on-sale-products",
  "categories",
  "recent-products",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export interface HomeSection {
  key: HomeSectionKey;
  isVisible: boolean;
}

/** Mirror of the API's HomeLayout (cms/home draft). Order is display order. */
export interface HomeLayout {
  sections: HomeSection[];
  featuredProductIds: string[];
  featuredDepartmentIds: string[];
}

/** Swaps an item with its neighbour; out-of-range moves return the same list. */
export const moveItem = <T>(items: T[], index: number, offset: -1 | 1): T[] => {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export const toggleSectionVisibility = (
  sections: HomeSection[],
  key: HomeSectionKey,
): HomeSection[] =>
  sections.map((section) =>
    section.key === key
      ? { ...section, isVisible: !section.isVisible }
      : section,
  );
