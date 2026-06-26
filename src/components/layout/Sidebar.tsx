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
import { Translate, useLogout } from "ra-core";
import { Button } from "../ui/button";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
  { label: "Departamento", icon: <Building2 size={20} /> },
  { label: "Categoría", icon: <Tags size={20} /> },
  { label: "Producto", icon: <Package size={20} />, path: "/productos" },
  { label: "Órdenes", icon: <ShoppingCart size={20} />, path: "/ordenes" },
  { label: "Cargos de Pago", icon: <CreditCard size={20} /> },
  { label: "Métodos de Pago", icon: <Wallet size={20} /> },
  { label: "Cupones", icon: <Ticket size={20} /> },
  { label: "Clientes", icon: <Users size={20} />, path: "/clients" },
  { label: "Mensajes", icon: <MessageSquare size={20} /> },
  {
    label: "Web Cliente",
    icon: <Monitor size={20} />,
    children: [
      { label: "Configuración", path: "#" },
      { label: "Banners", path: "#" },
    ],
  },
  {
    label: "Administración",
    icon: <Shield size={20} />,
    children: [
      { label: "Usuarios", path: "/users" },
      { label: "Roles", path: "#" },
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
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
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
        {navItems.map((item) => {
          const hasChildren = !!item.children;
          const active =
            isActive(item.path) ||
            (hasChildren &&
              item.children?.some((child) => isActive(child.path)));
          const isExpanded = expandedMenus[item.label];
          const activeChild = item.children?.find((child) => isActive(child.path));

          return (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    if (!collapsed) toggleSubmenu(item.label);
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
                title={collapsed ? item.label : undefined}
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
                      <Translate i18nKey={item.label} />
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
                      key={child.label}
                      onClick={() => child.path !== "#" && navigate(child.path)}
                      className={cn(
                        "w-full flex items-center px-4 py-2 rounded-lg text-[13px] transition-colors duration-100 text-left dark:text-[#94A3B8] text-[#CBD5E1] hover:bg-black/5",
                        activeChild && activeChild.path === child.path && "bg-black/10 dark:bg-[#0A5C56] text-white",
                      )}
                      
                    >
                      {child.label}
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
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 dark:bg-[#0A5C56] bg-[#0D9488]">
          <User size={16} className="text-white" />
        </div>
        {!collapsed && (
          <>
            <div className="overflow-hidden">
              <p className="text-white text-[13px] font-medium truncate">
                Admin Maxi
              </p>
              <p className="text-[11px] truncate" style={{ color: "#94A3B8" }}>
                admin@maxihabana.com
              </p>
            </div>
            <Button
              variant={"ghost"}
              className="ml-auto transition-colors"
              style={{ color: "#94A3B8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#94A3B8";
              }}
              onClick={logout}
            >
              <LogOut size={16} />
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
