import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Building2,
  Tags,
  ClipboardList,
  Warehouse,
  Users,
  UserRound,
  BarChart3,
  Settings,
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
  useTranslate,
} from "ra-core";
import { Button } from "../ui/button";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";

interface NavItem {
  labelKey: string;
  icon: React.ReactNode;
  path?: string;
  /** When true, only SUPER_ADMIN / ADMIN see this entry. */
  managerOnly?: boolean;
  /** Not yet built — rendered disabled with a "coming soon" hint. */
  soon?: boolean;
}

const navItems: NavItem[] = [
  { labelKey: "app.menu.panel", icon: <LayoutDashboard size={20} />, path: "/" },
  { labelKey: "app.menu.pedidos", icon: <ShoppingCart size={20} />, soon: true },
  { labelKey: "app.menu.productos", icon: <Package size={20} />, path: "/productos" },
  { labelKey: "app.menu.departamentos", icon: <Building2 size={20} />, path: "/departments" },
  { labelKey: "app.menu.categorias", icon: <Tags size={20} />, path: "/categories" },
  { labelKey: "app.menu.inventario", icon: <ClipboardList size={20} />, soon: true },
  { labelKey: "app.menu.almacenes", icon: <Warehouse size={20} />, soon: true },
  { labelKey: "app.menu.usuarios", icon: <Users size={20} />, path: "/users", managerOnly: true },
  { labelKey: "app.menu.clientes", icon: <UserRound size={20} />, path: "/clients" },
  { labelKey: "app.menu.reportes", icon: <BarChart3 size={20} />, soon: true },
  { labelKey: "app.menu.configuracion", icon: <Settings size={20} />, soon: true },
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

  const isManager = MANAGER_ROLES.includes((identity?.role as Role) ?? "KARDIST");

  const visibleItems = navItems.filter(
    (item) => !item.managerOnly || isManager,
  );

  const isActive = (path?: string) => !!path && location.pathname === path;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ease-in-out",
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sidebar",
        collapsed ? "w-18" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-sidebar-border">
        <div className="flex items-center overflow-hidden">
          <img
            src={Logo}
            alt="MaxiHabana"
            style={collapsed ? { width: 32, height: 32 } : undefined}
          />
        </div>
        <button
          onClick={onToggleCollapse}
          className="shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            size={18}
            className={cn(
              "transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {visibleItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.labelKey}
              disabled={item.soon}
              onClick={() => item.path && navigate(item.path)}
              title={
                collapsed
                  ? translate(item.labelKey)
                  : item.soon
                    ? translate("app.menu.soon", { _: "Coming soon" })
                    : undefined
              }
              className={cn(
                "w-full h-11 flex items-center gap-3 rounded-[10px] border-l-[3px] transition-all duration-150 ease-out",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary font-medium"
                  : "border-transparent text-sidebar-foreground",
                item.soon
                  ? "opacity-45 cursor-not-allowed"
                  : !active &&
                      "hover:bg-sidebar-accent/10 hover:text-foreground cursor-pointer",
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-[14px] flex-1 text-left truncate">
                  <Translate i18nKey={item.labelKey} />
                </span>
              )}
              {!collapsed && item.soon && (
                <span className="text-[10px] rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">
                  <Translate i18nKey="app.menu.soon" />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div
        className={cn(
          "border-t border-sidebar-border shrink-0 flex items-center gap-3 py-3",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-primary/10 text-primary">
          {identity?.avatar ? (
            <img
              src={identity.avatar}
              alt={identity.fullName ?? ""}
              className="w-full h-full object-cover"
            />
          ) : identity?.fullName ? (
            <span className="text-[13px] font-medium">
              {identity.fullName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={16} />
          )}
        </div>
        {!collapsed && (
          <>
            <div className="overflow-hidden">
              <p className="text-foreground text-[13px] font-medium truncate">
                {identity?.fullName}
              </p>
              {identity?.email && (
                <p className="text-[11px] text-muted-foreground truncate">
                  {identity.email}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-muted-foreground hover:text-foreground"
              title={translate("ra.auth.logout")}
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
