import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { products } from '@/data/mockData';
import { useTheme } from '@/components/admin';

type SortField = 'name' | 'category' | 'price' | 'stock';
type SortDir = 'asc' | 'desc';

const categories = ['Todas las categorías', 'Electrónica', 'Hogar', 'Moda', 'Deportes'];

export default function Productos() {
  const { theme: mode } = useTheme();
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

  const cardBg = mode === 'dark' ? '#161D27' : '#FFFFFF';
  const inputBg = mode === 'dark' ? '#1A2535' : '#F1F5F9';
  const textPrimary = mode === 'dark' ? '#E2E8F0' : '#1E293B';
  const textSecondary = mode === 'dark' ? '#94A3B8' : '#64748B';
  const borderColor = mode === 'dark' ? '#1E293B' : '#F1F5F9';
  const tableHeaderBg = mode === 'dark' ? '#161D27' : '#F8FAFC';
  const rowHover = mode === 'dark' ? '#0F2E2E' : '#F0FDFA';

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
    if (sortField !== field) return <ChevronDown size={14} style={{ color: '#CBD5E1' }} />;
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
        <h1
          className="text-[28px] font-bold tracking-tight"
          style={{ color: textPrimary }}
        >
          Productos
        </h1>
        <button className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#0DA271] active:scale-[0.97] text-white font-medium text-[14px] px-4 py-2 rounded-[10px] transition-all duration-150 w-fit">
          <Plus size={16} />
          Añadir Producto
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="rounded-2xl p-4 shadow-card flex flex-col lg:flex-row gap-3"
        style={{ backgroundColor: cardBg }}
      >
        {/* Search */}
        <div
          className="flex items-center rounded-[10px] px-3 h-10 flex-1 min-w-[200px]"
          style={{ backgroundColor: inputBg }}
        >
          <Search size={18} style={{ color: '#94A3B8' }} className="shrink-0" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none outline-none text-[14px] ml-2 w-full placeholder:text-[#94A3B8]"
            style={{ color: textPrimary }}
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          className="rounded-[10px] px-3 h-10 text-[14px] outline-none border-none cursor-pointer min-w-[180px]"
          style={{ backgroundColor: inputBg, color: textPrimary }}
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
              className="px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-150 h-10"
              style={{
                backgroundColor: statusFilter === s.key ? '#10B981' : inputBg,
                color: statusFilter === s.key ? '#FFFFFF' : textSecondary,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl shadow-card overflow-hidden" style={{ backgroundColor: cardBg }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: tableHeaderBg }}>
                <th className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-6 py-3">Producto</th>
                <th
                  className="text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3 cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Categoría <SortIcon field="category" />
                  </div>
                </th>
                <th
                  className="text-right text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3 cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Precio <SortIcon field="price" />
                  </div>
                </th>
                <th
                  className="text-right text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-4 py-3 cursor-pointer"
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
                  className="transition-colors duration-100"
                  style={{ height: 64, borderBottom: `1px solid ${borderColor}` }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = rowHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: inputBg }}
                      >
                        <Package size={18} style={{ color: mode === 'dark' ? '#475569' : '#CBD5E1' }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium" style={{ color: textPrimary }}>{product.name}</p>
                        <p className="text-[11px]" style={{ color: '#94A3B8' }}>{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[14px]" style={{ color: textPrimary }}>{product.category}</td>
                  <td className="px-4 py-3 text-[14px] text-right" style={{ color: textPrimary }}>${product.price.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-[14px] text-right ${product.stock <= 10 ? 'text-[#D97706] font-medium' : ''}`} style={{ color: product.stock > 10 ? textPrimary : undefined }}>
                    {product.stock}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(product.id)}
                      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150"
                      style={{ backgroundColor: productStatuses[product.id] ? '#10B981' : '#CBD5E1' }}
                    >
                      <span
                        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150"
                        style={{ transform: productStatuses[product.id] ? 'translateX(16px)' : 'translateX(2px)' }}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-[#0D9488]"
                        style={{ '--tw-bg-opacity': 1 } as React.CSSProperties}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = mode === 'dark' ? '#1A2535' : '#F1F5F9'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-[#EF4444]"
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = mode === 'dark' ? '#3A1515' : '#FEF2F2'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                      >
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
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: inputBg }}
            >
              <Package size={28} style={{ color: mode === 'dark' ? '#475569' : '#CBD5E1' }} />
            </div>
            <p className="text-[16px] font-medium" style={{ color: textPrimary }}>No hay productos</p>
            <p className="text-[13px] mt-1" style={{ color: textSecondary }}>Intenta con otros filtros de búsqueda</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 gap-3"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <p className="text-[12px]" style={{ color: textSecondary }}>
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
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-all duration-150"
                    style={{
                      backgroundColor: currentPage === page ? '#10B981' : 'transparent',
                      color: currentPage === page ? '#FFFFFF' : '#64748B',
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = mode === 'dark' ? '#1A2535' : '#F1F5F9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      }
                    }}
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
