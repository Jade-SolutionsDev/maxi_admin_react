import { topProducts } from '@/data/mockData';
import { Package } from 'lucide-react';

export default function TopProducts() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card">
      <h3 className="text-[18px] font-semibold text-[#1E293B] mb-5">Productos Más Vendidos</h3>

      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Placeholder Image */}
            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center shrink-0">
              <Package size={18} className="text-[#CBD5E1]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1E293B] truncate">{product.name}</p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">{product.sold} vendidos</p>
            </div>

            {/* Progress Bar */}
            <div className="w-16 h-1 bg-[#F1F5F9] rounded-full overflow-hidden shrink-0">
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
