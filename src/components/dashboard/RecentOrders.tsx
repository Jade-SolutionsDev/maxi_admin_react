import { recentOrders } from '@/data/mockData';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../admin';

const statusStyles: Record<string, { bg: string; text: string }> = {
  completada: { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' },
  pendiente: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  cancelada: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
  'en proceso': { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
};

export default function RecentOrders() {
  const { theme:mode } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl p-6 shadow-card"
      style={{ backgroundColor: mode === 'dark' ? '#161D27' : '#FFFFFF' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-[18px] font-semibold"
          style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
        >
          Órdenes Recientes
        </h3>
        <button
          onClick={() => navigate('/ordenes')}
          className="flex items-center gap-1 text-[13px] font-medium text-[#10B981] hover:text-[#0D9488] transition-colors"
        >
          Ver todas
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottomColor: mode === 'dark' ? '#1E293B' : '#F1F5F9', borderBottomWidth: 1 }}>
              <th className="text-left text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider pb-3 pr-4">#</th>
              <th className="text-left text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider pb-3 pr-4">Cliente</th>
              <th className="text-right text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider pb-3 pr-4">Total</th>
              <th className="text-left text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider pb-3 pr-4">Estado</th>
              <th className="text-left text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider pb-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => {
              const statusStyle = statusStyles[order.status] || statusStyles.pendiente;
              return (
                <tr
                  key={order.id}
                  className="transition-colors duration-100 cursor-pointer"
                  style={{
                    height: 56,
                    borderBottom: `1px solid ${mode === 'dark' ? '#1E293B' : '#F1F5F9'}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = mode === 'dark' ? '#0F2E2E' : '#F0FDFA';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="text-[12px] pr-4" style={{ color: '#94A3B8' }}>{order.id}</td>
                  <td
                    className="text-[14px] pr-4"
                    style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
                  >
                    {order.client}
                  </td>
                  <td
                    className="text-[14px] text-right pr-4"
                    style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
                  >
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="pr-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="text-[12px]" style={{ color: '#94A3B8' }}>{order.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
