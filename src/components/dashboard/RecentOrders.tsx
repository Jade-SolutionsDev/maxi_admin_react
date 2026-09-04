import { ArrowRight } from 'lucide-react';
import { useCanAccess, useGetList, useLocaleState, useTranslate } from 'ra-core';
import { useNavigate } from 'react-router-dom';

import { OrderStatusBadge } from '@/pages/orders/OrderBadges';
import { money } from '@/pages/orders/orderStatus';
import type { OrderStatus } from '@/providers/dataProvider';
import { useTheme } from '../admin';

const RECENT_COUNT = 5;

/** The slice of OrderResponseDto this table renders. */
interface RecentOrderRow {
  id: string;
  orderNumber: string | null;
  clientName: string | null;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export default function RecentOrders() {
  const { resolvedTheme: mode } = useTheme();
  const navigate = useNavigate();
  const translate = useTranslate();
  const [locale] = useLocaleState();
  // A grocer can read orders, so this table stays for them even though the KPI
  // row above does not.
  const { canAccess } = useCanAccess({ resource: 'orders', action: 'list' });

  const { data, isPending, error } = useGetList<RecentOrderRow>(
    'orders',
    {
      pagination: { page: 1, perPage: RECENT_COUNT },
      sort: { field: 'createdAt', order: 'DESC' },
    },
    { enabled: !!canAccess },
  );

  if (!canAccess) return null;

  const headingColor = mode === 'dark' ? '#E2E8F0' : '#1E293B';
  const borderColor = mode === 'dark' ? '#1E293B' : '#F1F5F9';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const columns = [
    { key: 'number', label: '#', align: 'text-left' },
    { key: 'client', label: 'Cliente', align: 'text-left' },
    { key: 'total', label: 'Total', align: 'text-right' },
    { key: 'status', label: 'Estado', align: 'text-left' },
    { key: 'date', label: 'Fecha', align: 'text-left' },
  ] as const;

  const renderBody = () => {
    if (isPending) {
      return <div className="h-40 rounded-lg bg-muted animate-pulse" />;
    }
    if (error) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {translate('dashboard.recentOrders.error', {
            _: 'No se pudieron cargar los pedidos.',
          })}
        </p>
      );
    }
    if (!data || data.length === 0) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {translate('dashboard.recentOrders.empty', {
            _: 'Todavía no hay pedidos.',
          })}
        </p>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottomColor: borderColor, borderBottomWidth: 1 }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.align} text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider pb-3 pr-4`}
                >
                  {translate(`dashboard.recentOrders.columns.${column.key}`, {
                    _: column.label,
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((order) => (
              <tr
                key={order.id}
                className="transition-colors duration-100 cursor-pointer"
                style={{ height: 56, borderBottom: `1px solid ${borderColor}` }}
                onClick={() => navigate(`/orders/${order.id}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    mode === 'dark' ? '#0F2E2E' : '#F0FDFA';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'transparent';
                }}
              >
                {/* orderNumber is nullable on the entity — fall back to the id. */}
                <td className="text-[12px] pr-4" style={{ color: '#94A3B8' }}>
                  {order.orderNumber ?? order.id.slice(0, 8)}
                </td>
                <td className="text-[14px] pr-4" style={{ color: headingColor }}>
                  {order.clientName ??
                    translate('dashboard.recentOrders.noClient', {
                      _: 'Sin nombre',
                    })}
                </td>
                <td
                  className="text-[14px] text-right pr-4"
                  style={{ color: headingColor }}
                >
                  {money(order.total)}
                </td>
                <td className="pr-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="text-[12px]" style={{ color: '#94A3B8' }}>
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className="rounded-2xl p-6 shadow-card"
      style={{ backgroundColor: mode === 'dark' ? '#161D27' : '#FFFFFF' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-semibold" style={{ color: headingColor }}>
          {translate('dashboard.recentOrders.title', {
            _: 'Órdenes recientes',
          })}
        </h3>
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-[13px] font-medium text-[#10B981] hover:text-[#0D9488] transition-colors"
        >
          {translate('dashboard.recentOrders.viewAll', { _: 'Ver todas' })}
          <ArrowRight size={14} />
        </button>
      </div>
      {renderBody()}
    </div>
  );
}
