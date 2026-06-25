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

const barColors = ['#10B981', '#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4'];

export default function CategoryChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card">
      <h3 className="text-[18px] font-semibold text-[#1E293B] mb-6">Ventas por Categoría</h3>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={categoryData}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#1E293B', fontSize: 12, fontWeight: 500 }}
            width={90}
          />
          <Bar
            dataKey="value"
            radius={[0, 8, 8, 0]}
            barSize={16}
          >
            {categoryData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
