import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Tags,
  Package,
  ShoppingCart,
  CreditCard,
  Wallet,
  Ticket,
  Users,
  MessageSquare,
  Monitor,
  Shield,
  ChevronDown,
  ChevronLeft,
  LogOut,
  User,
} from "lucide-react";
import Logo from "@/assets/maxi_habana_logo.png";
import { cn } from "@/lib/utils";
import {
  Translate,
  useGetIdentity,
  useLogout,
  usePermissions,
  useTranslate,
} from "ra-core";
import { Button } from "../ui/button";

interface NavChild {
  labelKey: string;
  path: string;
  // Backend permission module gating this entry (see `canSee`).
  resource?: string;
}

interface NavItem {
  labelKey: string;
  icon: React.ReactNode;
  path?: string;
  // Backend permission module gating this entry. When undefined the entry has
  // no backing permission yet and is always shown.
  resource?: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { labelKey: "app.menu.dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
  { labelKey: "app.menu.departments", icon: <Building2 size={20} />, path: "/departments", resource: "categories" },
  { labelKey: "app.menu.categories", icon: <Tags size={20} />, path: "/categories", resource: "categories" },
  { labelKey: "app.menu.products", icon: <Package size={20} />, path: "/productos", resource: "products" },
  { labelKey: "app.menu.orders", icon: <ShoppingCart size={20} />, path: "/ordenes", resource: "orders" },
  { labelKey: "app.menu.paymentCharges", icon: <CreditCard size={20} /> },
  { labelKey: "app.menu.paymentMethods", icon: <Wallet size={20} /> },
  { labelKey: "app.menu.coupons", icon: <Ticket size={20} /> },
  { labelKey: "app.menu.clients", icon: <Users size={20} />, path: "/clients", resource: "clients" },
  { labelKey: "app.menu.messages", icon: <MessageSquare size={20} /> },
  {
    labelKey: "app.menu.clientWeb",
    icon: <Monitor size={20} />,
    children: [
      { labelKey: "app.menu.clientWebSettings", path: "#", resource: "settings" },
      { labelKey: "app.menu.clientWebBanners", path: "#", resource: "settings" },
    ],
  },
  {
    labelKey: "app.menu.administration",
    icon: <Shield size={20} />,
    children: [
      { labelKey: "app.menu.users", path: "/users", resource: "users" },
      { labelKey: "app.menu.roles", path: "/roles", resource: "roles" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const translate = useTranslate();
  const { data: identity } = useGetIdentity();
  const { permissions } = usePermissions<Record<string, string[]>>();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );

  const isAdmin = identity?.userType === "admin";

  // Admins see every option; entries without a backing permission module are
  // always shown; otherwise the current user must hold at least one permission
  // on that module.
  const canSee = (resource?: string) => {
    if (!resource) return true;
    if (isAdmin) return true;
    const verbs = permissions?.[resource];
    return Array.isArray(verbs) && verbs.length > 0;
  };

  const visibleItems = navItems
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((child) => canSee(child.resource));
        return children.length > 0 ? { ...item, children } : null;
      }
      return canSee(item.resource) ? item : null;
    })
    .filter((item): item is NavItem => item !== null);

  const toggleSubmenu = (labelKey: string) => {
    setExpandedMenus((prev) => ({ ...prev, [labelKey]: !prev[labelKey] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  // const sidebarBg = mode === 'dark' ? 'bg-[#0D3634]' : 'bg-[#134E4A]';
  // const textColor = mode === 'dark' ? '#94A3B8' : '#CBD5E1';
  // const activeBg = mode === 'dark' ? '#0A5C56' : '#0D9488';

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ease-in-out dark:bg-[#0D3634] bg-[#134E4A]",
        collapsed ? "w-18" : "w-64",
      )}
      style={{
        boxShadow: "4px 0 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex items-center gap-0 overflow-hidden">
          {/* <img src={Logo} alt="Logo"  /> */}
          {!collapsed ? (
            <img src={Logo} alt="Logo" />
          ) : (
            <img src={Logo} alt="Logo" style={{ width: 32, height: 32 }} />
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="shrink-0 transition-colors duration-150 dark:text-[#94A3B8] text-[#CBD5E1]"
          style={{ marginLeft: collapsed ? 0 : 8 }}
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {visibleItems.map((item) => {
          const hasChildren = !!item.children;
          const active =
            isActive(item.path) ||
            (hasChildren &&
              item.children?.some((child) => isActive(child.path)));
          const isExpanded = expandedMenus[item.labelKey];
          const activeChild = item.children?.find((child) => isActive(child.path));

          return (
            <div key={item.labelKey}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    if (!collapsed) toggleSubmenu(item.labelKey);
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={cn(
                  `
                  w-full flex items-center gap-3 rounded-[10px] transition-all duration-150 ease-out hover:bg-[#0D9488] hover:dark:bg-[#0A5C56] hover:text-white
                  ${collapsed ? "justify-center px-0" : "px-3"}
                `,
                  active
                    ? "text-white border-l-[3px] border-[#10B981] dark:bg-[#FFFFF] bg-[#0D9488]"
                    : "dark:text-[#94A3B8] text-[#CBD5E1] bg-transparent border-l-[3px] border-transparent",
                )}
                style={{
                  height: 44,
                  minHeight: 44,
                }}
                title={collapsed ? translate(item.labelKey) : undefined}
              >
                <span
                  className="shrink-0"
                  style={{ marginRight: collapsed ? 0 : undefined }}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="text-[14px] font-medium flex-1 text-left truncate">
                      <Translate i18nKey={item.labelKey} />
                    </span>
                    {hasChildren && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Submenu */}
              {hasChildren && isExpanded && !collapsed && (
                <div className="ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-200">
                  {item.children?.map((child) => (
                    <button
                      key={child.labelKey}
                      onClick={() => child.path !== "#" && navigate(child.path)}
                      className={cn(
                        "w-full flex items-center px-4 py-2 rounded-lg text-[13px] transition-colors duration-100 text-left dark:text-[#94A3B8] text-[#CBD5E1] hover:bg-black/5",
                        activeChild && activeChild.path === child.path && "bg-black/10 dark:bg-[#0A5C56] text-white",
                      )}
                    >
                      <Translate i18nKey={child.labelKey} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      <div
        className="border-t border-white/10 shrink-0 flex items-center gap-3 py-3"
        style={{
          paddingLeft: collapsed ? 0 : 16,
          paddingRight: collapsed ? 0 : 16,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 dark:bg-[#0A5C56] bg-[#0D9488]">
          {identity?.avatar ? (
            <img
              src={identity.avatar}
              alt={identity.fullName ?? ""}
              className="w-full h-full object-cover"
            />
          ) : identity?.fullName ? (
            <span className="text-white text-[13px] font-medium">
              {identity.fullName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={16} className="text-white" />
          )}
        </div>
        {!collapsed && (
          <>
            <div className="overflow-hidden">
              <p className="text-white text-[13px] font-medium truncate">
                {identity?.fullName}
              </p>
              {identity?.email && (
                <p className="text-[11px] truncate" style={{ color: "#94A3B8" }}>
                  {identity.email}
                </p>
              )}
            </div>
            <Button
              variant={"ghost"}
              className="ml-auto transition-colors"
              style={{ color: "#94A3B8" }}
              title={translate("ra.auth.logout")}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#94A3B8";
              }}
              onClick={() => logout()}
            >
              <LogOut size={16} />
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
