import { recentOrders } from '@/data/mockData';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusStyles: Record<string, { bg: string; text: string }> = {
  completada: { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' },
  pendiente: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  cancelada: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
  'en proceso': { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
};

export default function RecentOrders() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-semibold text-[#1E293B]">Órdenes Recientes</h3>
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
            <tr className="border-b border-[#F1F5F9]">
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
                  className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F0FDFA] transition-colors duration-100 cursor-pointer"
                  style={{ height: 56 }}
                >
                  <td className="text-[12px] text-[#94A3B8] pr-4">{order.id}</td>
                  <td className="text-[14px] text-[#1E293B] pr-4">{order.client}</td>
                  <td className="text-[14px] text-[#1E293B] text-right pr-4">${order.total.toFixed(2)}</td>
                  <td className="pr-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="text-[12px] text-[#94A3B8]">{order.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
