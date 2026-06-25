import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { products } from '@/data/mockData';

type SortField = 'name' | 'category' | 'price' | 'stock';
type SortDir = 'asc' | 'desc';

const categories = ['Todas las categorías', 'Electrónica', 'Hogar', 'Moda', 'Deportes'];

export default function Productos() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas las categorías');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [productStatuses, setProductStatuses] = useState<Record<string, boolean>>(
    Object.fromEntries(products.map((p) => [p.id, p.status]))
  );

  const itemsPerPage = 8;

  const toggleStatus = (id: string) => {
    setProductStatuses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let data = [...products];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'Todas las categorías') {
      data = data.filter((p) => p.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      data = data.filter((p) =>
        statusFilter === 'active' ? productStatuses[p.id] : !productStatuses[p.id]
      );
    }

    data.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'price' || sortField === 'stock') {
        return (a[sortField] - b[sortField]) * dir;
      }
      return a[sortField].localeCompare(b[sortField]) * dir;
    });

    return data;
  }, [search, categoryFilter, statusFilter, sortField, sortDir, productStatuses]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={14} className="text-[#CBD5E1]" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={14} className="text-[#10B981]" />
    ) : (
      <ChevronDown size={14} className="text-[#10B981]" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[28px] font-bold text-[#1E293B] tracking-tight">Productos</h1>
        <button className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#0DA271] active:scale-[0.97] text-white font-medium text-[14px] px-4 py-2 rounded-[10px] transition-all duration-150 w-fit">
          <Plus size={16} />
          Añadir Producto
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-card flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="flex items-center bg-[#F1F5F9] rounded-[10px] px-3 h-10 flex-1 min-w-[200px]">
          <Search size={18} className="text-[#94A3B8] shrink-0" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none text-[14px] text-[#1E293B] placeholder-[#94A3B8] ml-2 w-full"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#F1F5F9] rounded-[10px] px-3 h-10 text-[14px] text-[#1E293B] outline-none border-none cursor-pointer min-w-[180px]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Status Toggle */}
        <div className="flex gap-1">
          {([
            { key: 'all', label: 'Todos' },
            { key: 'active', label: 'Activos' },
            { key: 'inactive', label: 'Inactivos' },
          ] as const).map((s) => (
            <button
              key={s.key}
              onClick={() => { setStatusFilter(s.key); setCurrentPage(1); }}
              className={`
                px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-150 h-10
                ${statusFilter === s.key
                  ? 'bg-[#10B981] text-white'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-6 py-3">Producto</th>
                <th
                  className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-[#1E293B] transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Categoría <SortIcon field="category" />
                  </div>
                </th>
                <th
                  className="text-right text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-[#1E293B] transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Precio <SortIcon field="price" />
                  </div>
                </th>
                <th
                  className="text-right text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-[#1E293B] transition-colors"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Stock <SortIcon field="stock" />
                  </div>
                </th>
                <th className="text-center text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-center text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F0FDFA] transition-colors duration-100"
                  style={{ height: 64 }}
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center shrink-0">
                        <Package size={18} className="text-[#CBD5E1]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1E293B]">{product.name}</p>
                        <p className="text-[11px] text-[#94A3B8]">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[14px] text-[#1E293B]">{product.category}</td>
                  <td className="px-4 py-3 text-[14px] text-[#1E293B] text-right">${product.price.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-[14px] text-right ${product.stock <= 10 ? 'text-[#D97706] font-medium' : 'text-[#1E293B]'}`}>
                    {product.stock}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(product.id)}
                      className={`
                        relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150
                        ${productStatuses[product.id] ? 'bg-[#10B981]' : 'bg-[#CBD5E1]'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150
                          ${productStatuses[product.id] ? 'translate-x-4' : 'translate-x-0.5'}
                        `}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#0D9488]">
                        <Pencil size={15} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FEF2F2] transition-colors text-[#EF4444]">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginated.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
              <Package size={28} className="text-[#CBD5E1]" />
            </div>
            <p className="text-[16px] font-medium text-[#1E293B]">No hay productos</p>
            <p className="text-[13px] text-[#94A3B8] mt-1">Intenta con otros filtros de búsqueda</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-[#F1F5F9] gap-3">
            <p className="text-[12px] text-[#64748B]">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}-{Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length} productos
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
