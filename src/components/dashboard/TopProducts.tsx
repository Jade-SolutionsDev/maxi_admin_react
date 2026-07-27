import { topProducts } from '@/data/mockData';
import { Package } from 'lucide-react';
import { useTheme } from '../admin';

export default function TopProducts() {
  const { resolvedTheme:mode } = useTheme();

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

      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Placeholder Image */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9' }}
            >
              <Package size={18} style={{ color: mode === 'dark' ? '#475569' : '#CBD5E1' }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-medium truncate"
                style={{ color: mode === 'dark' ? '#E2E8F0' : '#1E293B' }}
              >
                {product.name}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{product.sold} vendidos</p>
            </div>

            {/* Progress Bar */}
            <div
              className="w-16 h-1 rounded-full overflow-hidden shrink-0"
              style={{ backgroundColor: mode === 'dark' ? '#1A2535' : '#F1F5F9' }}
            >
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${product.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
