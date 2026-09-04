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
  Settings, LogOut,
  User,
  PanelsTopLeft,
  CreditCard,
  Inbox,
  ListTree,
  NotebookPen,
  Truck,
} from "lucide-react";
import LogoDark from "@/assets/maxi_habana_logo_dark.png";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import {
  Translate,
  useCanAccess,
  useGetIdentity,
  useGetList,
  useLogout,
  useTranslate,
} from "ra-core";
import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "../ui/sidebar";
import { useTheme } from "../admin";
import {
  useSetSidebarBadge,
  useSidebarBadge,
  type SidebarBadge,
} from "./sidebarBadges";

/** Icon-only mark (the "m" + smile) for the collapsed rail. `currentColor` = "m", brand green = smile. */
function LogoMark({
  className,
  letterColor = "currentColor",
  smileColor = "#49B08A",
}: {
  className?: string;
  letterColor?: string;
  smileColor?: string;
}) {
  return (
    <svg
      viewBox="-1.5 11 44.4 34"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MaxiHabana"
    >
      <path
        d="M41.4347 23.6696V29.9763H33.1477V24.3153C33.1477 21.5386 31.8132 19.7736 29.1657 19.7736C26.5182 19.7736 24.8608 21.7108 24.8608 24.961V29.8902H16.5739V24.3153C16.5739 21.5386 15.2394 19.7736 12.5918 19.7736C9.94432 19.7736 8.28694 21.7108 8.28694 24.961V29.8902H0V18.5467C0 17.0795 0.582813 15.6725 1.62023 14.6351C2.65764 13.5976 4.06468 13.0148 5.5318 13.0148H8.28694V15.5547C9.15372 14.4363 10.2828 13.5488 11.5743 12.9706C12.8657 12.3924 14.2798 12.1415 15.6914 12.2399C17.1076 12.1751 18.5168 12.4757 19.7833 13.1127C21.0499 13.7498 22.1313 14.7019 22.9236 15.8776C23.8438 14.6459 25.0603 13.6666 26.4601 13.0307C27.8599 12.3947 29.3977 12.1227 30.9307 12.2399C37.2805 12.2399 41.4347 16.7601 41.4347 23.6696Z"
        fill={letterColor}
      />
      <path
        d="M20.7071 43.3624C18.1659 43.3673 15.6502 42.8566 13.312 41.8614C10.9738 40.8662 8.86176 39.4071 7.10361 37.5723C6.79474 37.2701 6.54967 36.909 6.38292 36.5103C6.21617 36.1117 6.13113 35.6837 6.13284 35.2516C6.13455 34.8195 6.22297 34.3921 6.39287 33.9948C6.56278 33.5975 6.8107 33.2384 7.12194 32.9386C7.43319 32.6389 7.80144 32.4047 8.20486 32.2499C8.60828 32.0951 9.03867 32.0229 9.47052 32.0375C9.90237 32.0521 10.3269 32.1532 10.719 32.3349C11.111 32.5165 11.4626 32.7751 11.7529 33.0951C12.9152 34.2988 14.308 35.256 15.8483 35.9098C17.3885 36.5636 19.0446 36.9006 20.7179 36.9006C22.3911 36.9006 24.0472 36.5636 25.5875 35.9098C27.1277 35.256 28.5205 34.2988 29.6828 33.0951C29.9768 32.7828 30.3294 32.5314 30.7205 32.3553C31.1117 32.1792 31.5336 32.0819 31.9624 32.0689C32.3911 32.056 32.8182 32.1275 33.2192 32.2796C33.6203 32.4317 33.9875 32.6612 34.2998 32.9552C34.6122 33.2492 34.8636 33.6018 35.0396 33.9929C35.2157 34.384 35.313 34.806 35.326 35.2348C35.339 35.6635 35.2674 36.0906 35.1153 36.4917C34.9633 36.8927 34.7337 37.2599 34.4397 37.5723C32.6651 39.4209 30.5318 40.8879 28.1705 41.8834C25.8092 42.879 23.2696 43.3823 20.7071 43.3624Z"
        fill={smileColor}
      />
    </svg>
  );
}

interface NavItem {
  labelKey: string;
  icon: React.ReactNode;
  path?: string;
  /** Also mark active when the pathname starts with this (tabbed sections). */
  activePrefix?: string;
  /** Resource this entry maps to; the item is hidden unless the user can list
   *  it (canAccess). Omit for non-resource entries (dashboard, "coming soon"). */
  resource?: string;
  /** Not yet built — rendered disabled with a "coming soon" hint. */
  soon?: boolean;
}

interface NavGroup {
  /** Section label (i18n key). Omit for the top ungrouped entries. */
  labelKey?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { labelKey: "app.menu.panel", icon: <LayoutDashboard size={20} />, path: "/" },
    ],
  },
  {
    labelKey: "app.menu.group.ventas",
    items: [
      {
        labelKey: "app.menu.pedidos",
        icon: <ShoppingCart size={20} />,
        path: "/orders",
        resource: "orders",
      },
      {
        labelKey: "app.menu.metodos_pago",
        icon: <CreditCard size={20} />,
        path: "/payment-methods",
        resource: "payment-methods",
      },
      {
        labelKey: "app.menu.entregas",
        icon: <Truck size={20} />,
        path: "/delivery-options",
        resource: "delivery-options",
      },
      {
        labelKey: "app.menu.clientes",
        icon: <UserRound size={20} />,
        path: "/clients",
        resource: "clients",
      },
    ],
  },
  {
    labelKey: "app.menu.group.catalogo",
    items: [
      {
        labelKey: "app.menu.productos",
        icon: <Package size={20} />,
        path: "/products",
        resource: "products",
      },
      {
        labelKey: "app.menu.departamentos",
        icon: <Building2 size={20} />,
        path: "/departments",
        resource: "departments",
      },
      {
        labelKey: "app.menu.categorias",
        icon: <Tags size={20} />,
        path: "/categories",
        resource: "categories",
      },
    ],
  },
  {
    labelKey: "app.menu.group.inventario",
    items: [
      {
        labelKey: "app.menu.inventario",
        icon: <ClipboardList size={20} />,
        path: "/inventory",
        resource: "inventory",
      },
      {
        labelKey: "app.menu.almacenes",
        icon: <Warehouse size={20} />,
        path: "/stock-locations",
        resource: "stock-locations",
      },
    ],
  },
  {
    labelKey: "app.menu.group.soporte",
    items: [
      {
        labelKey: "app.menu.contactoMensajes",
        icon: <Inbox size={20} />,
        path: "/contact-messages",
        activePrefix: "/contact-messages",
        resource: "contact-messages",
      },
      {
        labelKey: "app.menu.contactoPlantillas",
        icon: <NotebookPen size={20} />,
        path: "/contact-templates",
        resource: "contact-templates",
      },
      {
        labelKey: "app.menu.nomencladores",
        icon: <ListTree size={20} />,
        path: "/nomenclators",
        resource: "nomenclators",
      },
    ],
  },
  {
    labelKey: "app.menu.group.sistema",
    items: [
      {
        labelKey: "app.menu.usuarios",
        icon: <Users size={20} />,
        path: "/users",
        resource: "users",
      },
      {
        labelKey: "app.menu.cms",
        icon: <PanelsTopLeft size={20} />,
        path: "/cms-pages",
        activePrefix: "/cms-",
        resource: "cms-pages",
      },
      { labelKey: "app.menu.reportes", icon: <BarChart3 size={20} />, soon: true },
      {
        labelKey: "app.menu.configuracion",
        icon: <Settings size={20} />,
        path: "/roles",
        resource: "roles",
      },
    ],
  },
];

/** Notification-badge colours. Deliberately just two: brand green for a count
 *  or "new", red for "urgent". `dot` is the collapsed-rail indicator. */
function badgePillClass(badge: SidebarBadge): string {
  if (badge === "urgent") return "bg-destructive text-white uppercase tracking-wide";
  if (badge === "new") return "bg-sidebar-primary text-white uppercase tracking-wide";
  return "bg-sidebar-primary text-white tabular-nums";
}
function badgeDotClass(badge: SidebarBadge): string {
  return badge === "urgent" ? "bg-destructive" : "bg-sidebar-primary";
}

/** Renders a single sidebar entry. */
function NavEntry({ item }: { item: NavItem }) {
  const location = useLocation();
  const navigate = useNavigate();
  const translate = useTranslate();
  // "soon" items never carry a notification badge (their slot shows the hint).
  const rawBadge = useSidebarBadge(item.labelKey);
  const badge = item.soon ? null : rawBadge;
  const isActive =
    (!!item.path && location.pathname === item.path) ||
    (!!item.activePrefix && location.pathname.startsWith(item.activePrefix));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        isActive={isActive}
        disabled={item.soon}
        tooltip={translate(item.labelKey)}
        onClick={() => item.path && navigate(item.path)}
        className={cn(
          "gap-3 rounded-[10px] text-[14px] text-sidebar-foreground",
          "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground",
          // Dark theme keeps the pre-existing subtle highlight instead of the
          // solid brand pill used on the light rail.
          "dark:data-[active=true]:bg-sidebar-primary/10 dark:data-[active=true]:text-sidebar-primary",
          // Collapsed rail: fill and center the button + icon, drop the label.
          "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!",
          item.soon &&
            "opacity-45 hover:bg-transparent hover:text-sidebar-foreground",
        )}
      >
        <span className="relative shrink-0 [&>svg]:size-5">
          {item.icon}
          {/* Collapsed rail: pills hide, so a dot keeps the notice visible. */}
          {badge && (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 hidden size-2 rounded-full ring-2 ring-sidebar group-data-[collapsible=icon]:block",
                badgeDotClass(badge),
              )}
            />
          )}
        </span>
        <span className="flex-1 truncate group-data-[collapsible=icon]:hidden">
          <Translate i18nKey={item.labelKey} />
        </span>
      </SidebarMenuButton>
      {item.soon && (
        <SidebarMenuBadge className="top-3.5 rounded-full bg-sidebar-accent px-1.5 text-[10px] text-sidebar-foreground/70 dark:bg-muted dark:text-muted-foreground">
          <Translate i18nKey="app.menu.soon" />
        </SidebarMenuBadge>
      )}
      {badge && (
        <SidebarMenuBadge
          className={cn(
            "top-2.5 rounded-full px-1.5 text-[10px] font-semibold",
            badgePillClass(badge),
          )}
        >
          {badge === "new" || badge === "urgent"
            ? translate(`app.menu.badge.${badge}`)
            : badge > 99
              ? "99+"
              : badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

/** Resource-bound entry: hidden unless the user can list the resource. */
function GatedNavEntry({ item }: { item: NavItem }) {
  const { canAccess, isPending } = useCanAccess({
    resource: item.resource!,
    action: "list",
  });
  if (isPending || !canAccess) return null;
  return <NavEntry item={item} />;
}

/**
 * The single place that wires live counts into the sidebar badge store. To add a
 * new badge: gate by canAccess, count with useGetList's `total`, and setBadge on
 * that item's labelKey. Each feeder renders nothing.
 */
function SidebarBadgeFeeders() {
  return (
    <>
      <UsersAwaitingBadge />
      <ContactMessagesBadge />
      <OrdersNeedingTransferBadge />
    </>
  );
}

/** Pickup orders holding stock away from their counter → badge on "Pedidos". */
function OrdersNeedingTransferBadge() {
  const setBadge = useSetSidebarBadge();
  const { canAccess } = useCanAccess({ resource: "orders", action: "list" });
  const { total } = useGetList(
    "orders",
    {
      filter: { needsTransfer: true },
      pagination: { page: 1, perPage: 1 },
    },
    { enabled: !!canAccess },
  );
  useEffect(() => {
    setBadge("app.menu.pedidos", canAccess ? (total ?? null) : null);
  }, [setBadge, canAccess, total]);
  return null;
}

/** Number of users still awaiting approval → badge on "Usuarios". */
function ContactMessagesBadge() {
  const setBadge = useSetSidebarBadge();
  const { canAccess } = useCanAccess({
    resource: "contact-messages",
    action: "list",
  });
  const { total } = useGetList(
    "contact-messages",
    {
      filter: { status: "nuevo" },
      pagination: { page: 1, perPage: 1 },
    },
    { enabled: !!canAccess },
  );
  useEffect(() => {
    setBadge("app.menu.contactoMensajes", canAccess ? (total ?? null) : null);
  }, [setBadge, canAccess, total]);
  return null;
}

function UsersAwaitingBadge() {
  const setBadge = useSetSidebarBadge();
  const { canAccess } = useCanAccess({ resource: "users", action: "list" });
  const { total } = useGetList(
    "users",
    {
      filter: { status: "awaiting_approval" },
      pagination: { page: 1, perPage: 1 },
    },
    { enabled: !!canAccess },
  );
  useEffect(() => {
    setBadge("app.menu.usuarios", canAccess ? (total ?? null) : null);
  }, [setBadge, canAccess, total]);
  return null;
}

export default function AppSidebar() {
  const logout = useLogout();
  const translate = useTranslate();
  const { data: identity } = useGetIdentity();
  const { resolvedTheme } = useTheme();

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      {/* Logo */}
      <SidebarHeader className="h-16 flex-row items-center justify-between border-b border-sidebar-border px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        <img
          src={LogoDark}
          alt="MaxiHabana"
          className="h-8 w-auto max-w-full group-data-[collapsible=icon]:hidden"
        />
        <LogoMark
          className="hidden h-7 w-auto group-data-[collapsible=icon]:block"
          letterColor={resolvedTheme === "dark" ? "#FFFFFF" : "currentColor"}
          smileColor={resolvedTheme === "dark" ? "#FFFFFF" : "#5EEAD4"}
        />
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-1 py-2">
        {navGroups.map((group, i) => (
          <SidebarGroup key={group.labelKey ?? `group-${i}`} className="py-1">
            {group.labelKey && (
              <>
                {/* Collapsed rail: the label hides, so a thin separator keeps groups apart. */}
                <SidebarSeparator className="mx-0 hidden group-data-[collapsible=icon]:block" />
                <SidebarGroupLabel>
                  <Translate i18nKey={group.labelKey} />
                </SidebarGroupLabel>
              </>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) =>
                  item.resource ? (
                    <GatedNavEntry key={item.labelKey} item={item} />
                  ) : (
                    <NavEntry key={item.labelKey} item={item} />
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Live count feeders (render nothing; they push into the badge store). */}
      <SidebarBadgeFeeders />

      {/* User profile */}
      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-sidebar-primary-foreground dark:bg-primary/10 dark:text-primary">
            {identity?.avatar ? (
              <img
                src={identity.avatar}
                alt={identity.fullName ?? ""}
                className="h-full w-full object-cover"
              />
            ) : identity?.fullName ? (
              <span className="text-[13px] font-medium">
                {identity.fullName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={16} />
            )}
          </div>
          <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[13px] font-medium text-sidebar-primary-foreground dark:text-foreground">
              {identity?.fullName}
            </p>
            {identity?.email && (
              <p className="truncate text-[11px] text-sidebar-foreground/70 dark:text-muted-foreground">
                {identity.email}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:text-muted-foreground dark:hover:text-foreground group-data-[collapsible=icon]:hidden"
            title={translate("ra.auth.logout")}
            onClick={() => logout()}
          >
            <LogOut size={16} />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
