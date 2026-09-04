import { Package } from 'lucide-react';
import { useCanAccess, useDataProvider, useTranslate } from 'ra-core';
import { useQuery } from '@tanstack/react-query';

import type {
  DashboardTopProducts,
  ExtendedDataProvider,
} from '@/providers/dataProvider';
import { useTheme } from '../admin';
import { DEFAULT_WINDOW_DAYS, type WindowDays } from './window';

/** How many products the card ranks. The API caps this at 20. */
const LIMIT = 5;

interface TopProductsProps {
  /** Window to rank over; shared with the KPI row so the page agrees on a period. */
  days?: WindowDays;
}

/**
 * The bar is relative to the best seller, not to a total: it answers "how does
 * this compare to the top one", which is what a ranking bar reads as. A zero
 * leader would divide by zero, and an empty list never reaches here anyway.
 */
const barWidth = (sold: number, leader: number) =>
  leader > 0 ? Math.round((sold / leader) * 100) : 0;

function Shell({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 shadow-card"
      style={{ backgroundColor: mode === 'dark' ? '#161D27' : '#FFFFFF' }}
    >
      <h3
        className="text-[18px] font-semibold mb-5"
        style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
      >
        Productos Más Vendidos
      </h3>
      {children}
    </div>
  );
}

function Rows({ count, mode }: { count: number; mode: string }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div
            className="w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9' }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-3 rounded w-2/3"
              style={{
                backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9',
              }}
            />
            <div
              className="h-2 rounded w-1/3"
              style={{
                backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TopProducts({
  days = DEFAULT_WINDOW_DAYS,
}: TopProductsProps) {
  const { resolvedTheme: mode } = useTheme();
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  // The endpoint is ADMIN+, same as the KPI row. Asking as a grocer would take
  // a 403 that react-query would then retry.
  const { canAccess, isPending: checkingAccess } = useCanAccess({
    resource: 'dashboard-stats',
    action: 'read',
  });

  const { data, isPending, isError } = useQuery<DashboardTopProducts>({
    queryKey: ['dashboard-top-products', days, LIMIT],
    queryFn: () =>
      dataProvider
        .getDashboardTopProducts({ days, limit: LIMIT })
        .then((r) => r.data),
    enabled: !!canAccess,
    placeholderData: (previous) => previous,
  });

  if (!checkingAccess && !canAccess) return null;

  if (checkingAccess || isPending || !data) {
    return (
      <Shell mode={mode}>
        <Rows count={LIMIT} mode={mode} />
      </Shell>
    );
  }

  if (isError) {
    return (
      <Shell mode={mode}>
        <p className="text-[13px]" style={{ color: '#94A3B8' }}>
          {translate('dashboard.topProducts.error', {
            _: 'No se pudieron cargar los productos.',
          })}
        </p>
      </Shell>
    );
  }

  if (data.items.length === 0) {
    return (
      <Shell mode={mode}>
        <p className="text-[13px]" style={{ color: '#94A3B8' }}>
          {translate('dashboard.topProducts.empty', {
            days,
            _: 'Sin ventas en los últimos %{days} días.',
          })}
        </p>
      </Shell>
    );
  }

  const leader = data.items[0].sold;

  return (
    <Shell mode={mode}>
      <div className="space-y-4">
        {data.items.map((product) => (
          <div key={product.id} className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
              style={{
                backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9',
              }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Package
                  size={18}
                  style={{ color: mode === 'dark' ? '#475569' : '#CBD5E1' }}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-medium truncate"
                style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
                title={product.name}
              >
                {product.name}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>
                {translate('dashboard.topProducts.sold', {
                  smart_count: product.sold,
                  _: '%{smart_count} vendidos',
                })}
              </p>
            </div>

            <div
              className="w-16 h-1 rounded-full overflow-hidden shrink-0"
              style={{
                backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9',
              }}
            >
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${barWidth(product.sold, leader)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
