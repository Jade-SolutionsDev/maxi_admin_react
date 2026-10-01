import {
  CircleHelp,
  FileText,
  GalleryHorizontalEnd,
  HandHeart,
  LayoutTemplate,
  Settings2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface CmsTab {
  labelKey: string;
  path: string;
  /** Resource the tab lists; hidden (and skipped by the sidebar) without access. */
  resource: string;
  activePrefixes?: string[];
  icon: LucideIcon;
}

/**
 * The CMS section, in display order. Single source for the tab strip and for
 * the sidebar entry, which lands on the first tab the user may open.
 */
export const CMS_TABS: CmsTab[] = [
  {
    labelKey: "app.menu.cmsHome",
    path: "/cms-home",
    resource: "cms-home",
    icon: LayoutTemplate,
  },
  {
    labelKey: "app.menu.cmsBanners",
    path: "/cms-banners",
    resource: "cms-banners",
    icon: GalleryHorizontalEnd,
  },
  {
    labelKey: "app.menu.cmsPages",
    path: "/cms-pages",
    resource: "cms-pages",
    icon: FileText,
  },
  {
    labelKey: "app.menu.cmsServices",
    path: "/cms-services",
    resource: "cms-services",
    icon: HandHeart,
  },
  {
    labelKey: "app.menu.cmsStaff",
    path: "/cms-staff",
    resource: "cms-staff",
    icon: UsersRound,
  },
  {
    labelKey: "app.menu.cmsFaq",
    path: "/cms-faq-categories",
    resource: "cms-faq-categories",
    activePrefixes: ["/cms-faq-categories", "/cms-faq-questions"],
    icon: CircleHelp,
  },
  {
    labelKey: "app.menu.cmsSettings",
    path: "/cms-settings",
    resource: "cms-settings",
    icon: Settings2,
  },
];
