// Datos de ejemplo. Solo quedan los dos widgets que todavía no tienen respaldo
// en la API: SalesChart y CategoryChart. Los KPI salen de GET /dashboard/stats,
// los más vendidos de GET /dashboard/top-products y las órdenes recientes de
// GET /orders.

export const salesData = [
  { month: 'Ene', value: 28000 },
  { month: 'Feb', value: 32000 },
  { month: 'Mar', value: 29000 },
  { month: 'Abr', value: 35000 },
  { month: 'May', value: 42000 },
  { month: 'Jun', value: 38000 },
  { month: 'Jul', value: 45000 },
  { month: 'Ago', value: 52000 },
  { month: 'Sep', value: 48000 },
  { month: 'Oct', value: 55000 },
  { month: 'Nov', value: 61000 },
  { month: 'Dic', value: 58000 },
];

export const categoryData = [
  { category: 'Electrónica', value: 145000 },
  { category: 'Hogar', value: 98000 },
  { category: 'Moda', value: 72000 },
  { category: 'Deportes', value: 54000 },
  { category: 'Belleza', value: 39000 },
];

