import { useState, type ReactNode } from "react";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useCanAccess, useDataProvider, useTranslate } from "ra-core";
import { useQuery } from "@tanstack/react-query";

import CategoryChart from "@/components/dashboard/CategoryChart";
import KpiCard from "@/components/dashboard/KpiCard";
import KpiCardSkeleton from "@/components/dashboard/KpiCardSkeleton";
import RecentOrders from "@/components/dashboard/RecentOrders";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import WindowSelector from "@/components/dashboard/WindowSelector";
import {
  DEFAULT_WINDOW_DAYS,
  type WindowDays,
} from "@/components/dashboard/window";
import {
  countTrend,
  moneyKpi,
  percentTrend,
  type Trend,
} from "@/components/dashboard/format";
import type {
  DashboardStats,
  ExtendedDataProvider,
} from "@/providers/dataProvider";

// Presentation only. The figures come from GET /dashboard/stats; this holds
// what the API has no business knowing — which icon and which tile colour.
const KPI_STYLE = [
  { key: "revenue", icon: DollarSign, iconBg: "#ECFDF5", iconColor: "#059669" },
  { key: "orders", icon: ShoppingCart, iconBg: "#F0FDFA", iconColor: "#0D9488" },
  { key: "products", icon: Package, iconBg: "#FFFBEB", iconColor: "#D97706" },
  { key: "clients", icon: Users, iconBg: "#FFF1F2", iconColor: "#E11D48" },
] as const;

type KpiKey = (typeof KPI_STYLE)[number]["key"];

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
    {children}
  </div>
);

const KpiSkeletons = () => (
  <Grid>
    {KPI_STYLE.map((kpi) => (
      <KpiCardSkeleton key={kpi.key} />
    ))}
  </Grid>
);

interface KpiRowProps {
  days: WindowDays;
  onDaysChange: (days: WindowDays) => void;
}

function KpiRow({ days, onDaysChange }: KpiRowProps) {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  // The endpoint is ADMIN+, so a grocer would take a 403 that react-query would
  // then retry. Cheaper and quieter to not ask at all.
  const { canAccess, isPending: checkingAccess } = useCanAccess({
    resource: "dashboard-stats",
    action: "read",
  });

  // `days` is part of the key AND of the request: a window switch is a distinct
  // cache entry, so going back to a window already fetched is instant.
  const { data, isPending, isError } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", days],
    queryFn: () => dataProvider.getDashboardStats({ days }).then((r) => r.data),
    enabled: !!canAccess,
    // Keep the previous window's figures on screen while the next one loads, so
    // switching does not flash the whole row back to skeletons.
    placeholderData: (previous) => previous,
  });

  if (checkingAccess) return <KpiSkeletons />;
  if (!canAccess) return null;

  // Rendered above every state below, so the window stays switchable even when
  // the current one failed to load.
  const selector = (
    <div className="flex justify-end">
      <WindowSelector
        value={days}
        onChange={onDaysChange}
        disabled={isPending}
      />
    </div>
  );

  const section = (children: ReactNode) => (
    <div className="space-y-4">
      {selector}
      {children}
    </div>
  );

  if (isError) {
    return section(
      <div className="rounded-2xl bg-card p-6 shadow-card text-sm text-muted-foreground">
        {translate("dashboard.stats.error", {
          _: "No se pudieron cargar las estadísticas.",
        })}
      </div>,
    );
  }

  if (isPending || !data) return section(<KpiSkeletons />);

  const figures: Record<
    KpiKey,
    { value: string; subtitle: string; trend: Trend }
  > = {
    revenue: {
      value: moneyKpi(data.revenue.current),
      subtitle: translate("dashboard.kpi.revenue.subtitle", {
        days,
        _: "Ventas cobradas en los últimos %{days} días",
      }),
      trend: percentTrend(data.revenue, translate),
    },
    orders: {
      value: data.orders.current.toLocaleString(),
      subtitle: translate("dashboard.kpi.orders.subtitle", {
        days,
        _: "Pedidos de los últimos %{days} días",
      }),
      trend: percentTrend(data.orders, translate),
    },
    products: {
      // A snapshot of the catalogue, so the badge counts new arrivals instead
      // of comparing two windows of the same figure.
      value: data.products.active.toLocaleString(),
      subtitle: translate("dashboard.kpi.products.subtitle", {
        _: "Productos activos",
      }),
      trend: countTrend(data.products, translate),
    },
    clients: {
      value: data.clients.current.toLocaleString(),
      subtitle: translate("dashboard.kpi.clients.subtitle", {
        days,
        _: "Clientes nuevos en %{days} días",
      }),
      trend: percentTrend(data.clients, translate),
    },
  };

  return section(
    <Grid>
      {KPI_STYLE.map(({ key, icon, iconBg, iconColor }) => (
        <KpiCard
          key={key}
          value={figures[key].value}
          subtitle={figures[key].subtitle}
          trend={figures[key].trend.label}
          trendUp={figures[key].trend.up}
          icon={icon}
          iconBg={iconBg}
          iconColor={iconColor}
        />
      ))}
    </Grid>,
  );
}

export default function Dashboard() {
  // Owned here so the KPI row and the product ranking always report the same
  // period; the selector that drives it lives inside KpiRow.
  const [days, setDays] = useState<WindowDays>(DEFAULT_WINDOW_DAYS);

  return (
    <div className="space-y-6">
      <KpiRow days={days} onDaysChange={setDays} />
      {/* Todavía con datos de ejemplo (src/data/mockData.ts): la API no tiene
          agregados de series ni de ventas por categoría. */}
      <SalesChart />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <RecentOrders />
        </div>
        <div className="lg:col-span-2">
          <TopProducts days={days} />
        </div>
      </div>
      <CategoryChart />
    </div>
  );
}
