import { useState } from "react";
import { useGetIdentity, useTranslate } from "ra-core";
import { Bell, KeyRound, Store, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";
import { PersonalInfoTab } from "./PersonalInfoTab";
import { SecurityTab } from "./SecurityTab";
import { ComingSoon } from "./ComingSoon";

type TabKey = "personal" | "security" | "notifications" | "store";

// ponytail: a plain-state tab strip instead of pulling in @radix-ui/react-tabs —
// four tabs don't warrant a new dependency (and adding one in this worktree would
// mutate the shared node_modules).
export default function ProfilePage() {
  const translate = useTranslate();
  const { data: identity } = useGetIdentity();
  const [tab, setTab] = useState<TabKey>("personal");

  const isManager = MANAGER_ROLES.includes((identity?.role as Role) ?? "KARDIST");

  const tabs: { key: TabKey; label: string; icon: typeof UserIcon }[] = [
    { key: "personal", label: "profile.tabs.personal", icon: UserIcon },
    { key: "security", label: "profile.tabs.security", icon: KeyRound },
    { key: "notifications", label: "profile.tabs.notifications", icon: Bell },
    ...(isManager
      ? [{ key: "store" as const, label: "profile.tabs.store", icon: Store }]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {translate("profile.title", { _: "My profile" })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("profile.subtitle", {
            _: "Manage your account and preferences.",
          })}
        </p>
      </div>

      {/* Tab strip */}
      <div
        role="tablist"
        aria-label={translate("profile.title", { _: "My profile" })}
        className="flex gap-1 overflow-x-auto border-b border-border"
      >
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {translate(label)}
            </button>
          );
        })}
      </div>

      <div className="pt-6" role="tabpanel">
        {tab === "personal" && <PersonalInfoTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "notifications" && (
          <ComingSoon
            icon={Bell}
            titleKey="profile.notifications.title"
            titleFallback="Notifications"
            descriptionKey="profile.notifications.description"
            descriptionFallback="Notification preferences are coming soon."
          />
        )}
        {tab === "store" && (
          <ComingSoon
            icon={Store}
            titleKey="profile.store.title"
            titleFallback="Store settings"
            descriptionKey="profile.store.description"
            descriptionFallback="Global store options will live here."
          />
        )}
      </div>
    </div>
  );
}
