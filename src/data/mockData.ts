// Datos de ejemplo. Solo quedan los tres widgets que todavía no tienen respaldo
// en la API: SalesChart, TopProducts y CategoryChart. Los KPI salen de
// GET /dashboard/stats y las órdenes recientes de GET /orders.

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

export const topProducts = [
  { name: 'Auriculares Bluetooth Pro', sold: 128, percent: 95 },
  { name: 'Cargador Rápido USB-C', sold: 96, percent: 72 },
  { name: 'Funda iPhone 15 Pro Max', sold: 84, percent: 62 },
  { name: 'Lámpara LED Escritorio', sold: 67, percent: 50 },
  { name: 'Mochila Antirrobo', sold: 54, percent: 40 },
];
