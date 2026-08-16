import { useLocation, useNavigate } from "react-router-dom";
import { useTranslate } from "ra-core";
import {
  FileText,
  GalleryHorizontalEnd,
  HandHeart,
  Settings2,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { labelKey: "app.menu.cmsPages", path: "/cms-pages", icon: FileText },
  {
    labelKey: "app.menu.cmsBanners",
    path: "/cms-banners",
    icon: GalleryHorizontalEnd,
  },
  { labelKey: "app.menu.cmsServices", path: "/cms-services", icon: HandHeart },
  { labelKey: "app.menu.cmsStaff", path: "/cms-staff", icon: UsersRound },
  {
    labelKey: "app.menu.cmsSettings",
    path: "/cms-settings",
    icon: Settings2,
  },
];

/**
 * Shared tab strip for the CMS section: one sidebar entry, five routed tabs.
 * Same visual pattern as the ProfilePage tab strip, but navigation-driven so
 * every tab stays deep-linkable.
 */
export function CmsTabsNav() {
  const translate = useTranslate();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      role="tablist"
      aria-label={translate("app.menu.cms", { _: "CMS" })}
      className="mb-4 flex gap-1 overflow-x-auto border-b border-border px-4 pt-4"
    >
      {tabs.map(({ labelKey, path, icon: Icon }) => {
        const active = location.pathname.startsWith(path);
        return (
          <button
            key={path}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => navigate(path)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={16} />
            {translate(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
