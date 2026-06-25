import { useState, useMemo } from 'react';
import { Search, ShoppingCart, DollarSign, Clock, CreditCard } from 'lucide-react';
import { orders } from '@/data/mockData';
import type { Order } from '@/data/mockData';

const statusStyles: Record<string, { bg: string; text: string }> = {
  completada: { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' },
  pendiente: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  cancelada: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
  'en proceso': { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
};

const paymentIcons: Record<string, string> = {
  'Tarjeta': 'Tarjeta',
  'Efectivo': 'Efectivo',
  'Transferencia': 'Transferencia',
};

const itemsPerPage = 6;

export default function Ordenes() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const summaryCards = [
    { title: 'Órdenes Totales', value: '1,284', icon: ShoppingCart, bg: '#ECFDF5', color: '#059669' },
    { title: 'Ingresos del Mes', value: '$84,239', icon: DollarSign, bg: '#F0FDFA', color: '#0D9488' },
    { title: 'Órdenes Pendientes', value: '23', icon: Clock, bg: '#FEF3C7', color: '#D97706' },
  ];

  const filtered = useMemo(() => {
    let data = [...orders];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.client.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter((o) => o.status === statusFilter);
    }

    return data;
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {summaryCards.map((card) => (
          <div key={card.title} className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon size={24} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-[24px] font-bold text-[#1E293B] leading-tight">{card.value}</p>
                <p className="text-[13px] text-[#64748B] mt-0.5">{card.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-card flex flex-col lg:flex-row gap-3">
        <div className="flex items-center bg-[#F1F5F9] rounded-[10px] px-3 h-10 flex-1 min-w-[200px]">
          <Search size={18} className="text-[#94A3B8] shrink-0" />
          <input
            type="text"
            placeholder="Buscar órdenes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none text-[14px] text-[#1E293B] placeholder-[#94A3B8] ml-2 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#F1F5F9] rounded-[10px] px-3 h-10 text-[14px] text-[#1E293B] outline-none border-none cursor-pointer min-w-[160px]"
        >
          <option value="all">Todos los estados</option>
          <option value="completada">Completada</option>
          <option value="pendiente">Pendiente</option>
          <option value="en proceso">En Proceso</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-6 py-3">#</th>
                <th className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3">Cliente</th>
                <th className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3">Fecha</th>
                <th className="text-right text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3">Total</th>
                <th className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-6 py-3">Método de Pago</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order: Order) => {
                const statusStyle = statusStyles[order.status] || statusStyles.pendiente;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F0FDFA] transition-colors duration-100 cursor-pointer"
                    style={{ height: 56 }}
                  >
                    <td className="px-6 py-3 text-[12px] text-[#94A3B8] font-medium">{order.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[14px] text-[#1E293B] font-medium">{order.client}</p>
                        <p className="text-[11px] text-[#94A3B8]">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#64748B]">{order.date}</td>
                    <td className="px-4 py-3 text-[14px] text-[#1E293B] text-right font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-[#94A3B8]" />
                        <span className="text-[13px] text-[#1E293B]">{paymentIcons[order.paymentMethod] || order.paymentMethod}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginated.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
              <ShoppingCart size={28} className="text-[#CBD5E1]" />
            </div>
            <p className="text-[16px] font-medium text-[#1E293B]">No hay órdenes</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Intenta con otros filtros de búsqueda</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-[#F1F5F9] gap-3">
            <p className="text-[12px] text-[#64748B]">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}-{Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length} órdenes
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-all duration-150
                      ${currentPage === page
                        ? 'bg-[#10B981] text-white'
                        : 'text-[#64748B] hover:bg-[#F1F5F9]'
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px]"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
