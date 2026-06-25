import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import TopProducts from '@/components/dashboard/TopProducts';
import CategoryChart from '@/components/dashboard/CategoryChart';

const kpiData = [
  {
    title: 'Total Ventas',
    value: '$424,652',
    subtitle: 'Ventas este mes',
    trend: '+12.5%',
    trendUp: true,
    icon: DollarSign,
    iconBg: '#ECFDF5',
    iconColor: '#059669',
  },
  {
    title: 'Órdenes',
    value: '1,284',
    subtitle: 'Órdenes totales',
    trend: '+8.2%',
    trendUp: true,
    icon: ShoppingCart,
    iconBg: '#F0FDFA',
    iconColor: '#0D9488',
  },
  {
    title: 'Productos',
    value: '342',
    subtitle: 'Productos activos',
    trend: '+24 nuevos',
    trendUp: true,
    icon: Package,
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
  },
  {
    title: 'Clientes',
    value: '86',
    subtitle: 'Clientes nuevos',
    trend: '+15.3%',
    trendUp: true,
    icon: Users,
    iconBg: '#FFF1F2',
    iconColor: '#E11D48',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Sales Chart */}
      <SalesChart />

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <RecentOrders />
        </div>
        <div className="lg:col-span-2">
          <TopProducts />
        </div>
      </div>

      {/* Category Chart */}
      <CategoryChart />
    </div>
  );
}
