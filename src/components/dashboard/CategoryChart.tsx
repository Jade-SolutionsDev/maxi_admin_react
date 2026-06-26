import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { categoryData } from '@/data/mockData';

const barColors = ["#10B981", "#0D9488", "#14B8A6", "#2DD4BF", "#5EEAD4"];

export default function CategoryChart() {
  return (
    <div className="rounded-2xl p-6 shadow-card dark:bg-[#161D27] bg-[#FFFFFF]">
      <h3 className="text-[18px] font-semibold mb-6 dark:text-[#E2E8F0] text-[#1E293B]">
        Ventas por Categoría
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={categoryData}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-[#F1F5F9] dark:stroke-[#1E293B]"
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            className="fill-[#94A3B8] dark:fill-[#64748B]"
            tick={{ fontSize: 11 }}
            tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            className="fill-[#1E293B] dark:fill-[#94A3B8]"
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: 500 }}
            width={90}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
            {categoryData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={barColors[index % barColors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
