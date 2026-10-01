import { useLocation, useNavigate } from "react-router-dom";
import { useCanAccessResources, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import { CMS_TABS } from "./cms-tabs";

/**
 * Shared tab strip for the CMS section: one sidebar entry, several routed
 * tabs. Same visual pattern as the ProfilePage tab strip, but
 * navigation-driven so every tab stays deep-linkable. Tabs the user may not
 * open are left out instead of leading to an access-denied page.
 */
export function CmsTabsNav() {
  const translate = useTranslate();
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccess } = useCanAccessResources({
    resources: CMS_TABS.map((tab) => tab.resource),
    action: "list",
  });
  const tabs = CMS_TABS.filter((tab) => canAccess?.[tab.resource]);

  return (
    <div
      role="tablist"
      aria-label={translate("app.menu.cms", { _: "CMS" })}
      className="mb-4 flex gap-1 overflow-x-auto border-b border-border px-4 pt-4"
    >
      {tabs.map(({ labelKey, path, activePrefixes, icon: Icon }) => {
        const active = (activePrefixes ?? [path]).some((prefix) =>
          location.pathname.startsWith(prefix),
        );
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
