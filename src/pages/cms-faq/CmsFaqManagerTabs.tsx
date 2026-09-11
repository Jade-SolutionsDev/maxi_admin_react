import { CircleHelp, FolderTree } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

const tabs = [
  {
    path: "/cms-faq-categories",
    labelKey: "cms-faq.tabs.categories",
    icon: FolderTree,
  },
  {
    path: "/cms-faq-questions",
    labelKey: "cms-faq.tabs.questions",
    icon: CircleHelp,
  },
];

export function CmsFaqManagerTabs() {
  const translate = useTranslate();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mb-4 flex gap-2 px-4" aria-label={translate("app.menu.cmsFaq")}>
      {tabs.map(({ path, labelKey, icon: Icon }) => {
        const active = location.pathname.startsWith(path);
        return (
          <button
            key={path}
            type="button"
            aria-pressed={active}
            onClick={() => navigate(path)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={16} aria-hidden="true" />
            {translate(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
