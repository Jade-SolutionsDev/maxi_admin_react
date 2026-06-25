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

export interface Order {
  id: string;
  client: string;
  email: string;
  product: string;
  total: number;
  status: 'completada' | 'pendiente' | 'cancelada' | 'en proceso';
  date: string;
  paymentMethod: string;
}

export const recentOrders: Order[] = [
  { id: 'ORD-001', client: 'María González', email: 'maria.g@email.com', product: 'Auriculares Bluetooth', total: 45.00, status: 'completada', date: '24 Jun 2025', paymentMethod: 'Tarjeta' },
  { id: 'ORD-002', client: 'Carlos Ruiz', email: 'c.ruiz@email.com', product: 'Cargador USB-C', total: 18.50, status: 'pendiente', date: '24 Jun 2025', paymentMethod: 'Efectivo' },
  { id: 'ORD-003', client: 'Ana Martínez', email: 'ana.m@email.com', product: 'Funda iPhone 15', total: 22.00, status: 'completada', date: '23 Jun 2025', paymentMethod: 'Transferencia' },
  { id: 'ORD-004', client: 'Luis Herrera', email: 'luis.h@email.com', product: 'Mouse Inalámbrico', total: 35.00, status: 'en proceso', date: '23 Jun 2025', paymentMethod: 'Tarjeta' },
  { id: 'ORD-005', client: 'Sofía López', email: 'sofia.l@email.com', product: 'Teclado Mecánico', total: 89.00, status: 'cancelada', date: '22 Jun 2025', paymentMethod: 'Tarjeta' },
];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: boolean;
  image?: string;
}

export const products: Product[] = [
  { id: '1', name: 'Auriculares Bluetooth Pro', sku: 'SKU-001', category: 'Electrónica', price: 45.00, stock: 23, status: true },
  { id: '2', name: 'Cargador Rápido USB-C', sku: 'SKU-002', category: 'Electrónica', price: 18.50, stock: 45, status: true },
  { id: '3', name: 'Funda iPhone 15 Pro Max', sku: 'SKU-003', category: 'Electrónica', price: 22.00, stock: 12, status: true },
  { id: '4', name: 'Mouse Inalámbrico Ergonómico', sku: 'SKU-004', category: 'Electrónica', price: 35.00, stock: 8, status: true },
  { id: '5', name: 'Teclado Mecánico RGB', sku: 'SKU-005', category: 'Electrónica', price: 89.00, stock: 5, status: true },
  { id: '6', name: 'Lámpara LED Escritorio', sku: 'SKU-006', category: 'Hogar', price: 32.00, stock: 18, status: true },
  { id: '7', name: 'Organizador de Cable', sku: 'SKU-007', category: 'Hogar', price: 8.50, stock: 67, status: true },
  { id: '8', name: 'Soporte Laptop Ajustable', sku: 'SKU-008', category: 'Hogar', price: 28.00, stock: 0, status: false },
  { id: '9', name: 'Camiseta Algodón Orgánico', sku: 'SKU-009', category: 'Moda', price: 24.00, stock: 34, status: true },
  { id: '10', name: 'Mochila Antirrobo', sku: 'SKU-010', category: 'Moda', price: 55.00, stock: 15, status: true },
  { id: '11', name: 'Botella Agua Deportiva', sku: 'SKU-011', category: 'Deportes', price: 15.00, stock: 42, status: true },
  { id: '12', name: 'Set Mancuernas 5kg', sku: 'SKU-012', category: 'Deportes', price: 38.00, stock: 7, status: true },
];

export const topProducts = [
  { name: 'Auriculares Bluetooth Pro', sold: 128, percent: 95 },
  { name: 'Cargador Rápido USB-C', sold: 96, percent: 72 },
  { name: 'Funda iPhone 15 Pro Max', sold: 84, percent: 62 },
  { name: 'Lámpara LED Escritorio', sold: 67, percent: 50 },
  { name: 'Mochila Antirrobo', sold: 54, percent: 40 },
];

export const orders: Order[] = [
  { id: 'ORD-001', client: 'María González', email: 'maria.g@email.com', product: 'Auriculares Bluetooth', total: 45.00, status: 'completada', date: '24 Jun 2025', paymentMethod: 'Tarjeta' },
  { id: 'ORD-002', client: 'Carlos Ruiz', email: 'c.ruiz@email.com', product: 'Cargador USB-C', total: 18.50, status: 'pendiente', date: '24 Jun 2025', paymentMethod: 'Efectivo' },
  { id: 'ORD-003', client: 'Ana Martínez', email: 'ana.m@email.com', product: 'Funda iPhone 15', total: 22.00, status: 'completada', date: '23 Jun 2025', paymentMethod: 'Transferencia' },
  { id: 'ORD-004', client: 'Luis Herrera', email: 'luis.h@email.com', product: 'Mouse Inalámbrico', total: 35.00, status: 'en proceso', date: '23 Jun 2025', paymentMethod: 'Tarjeta' },
  { id: 'ORD-005', client: 'Sofía López', email: 'sofia.l@email.com', product: 'Teclado Mecánico', total: 89.00, status: 'cancelada', date: '22 Jun 2025', paymentMethod: 'Tarjeta' },
  { id: 'ORD-006', client: 'Pedro Castillo', email: 'pedro.c@email.com', product: 'Lámpara LED', total: 32.00, status: 'completada', date: '22 Jun 2025', paymentMethod: 'Efectivo' },
  { id: 'ORD-007', client: 'Diana Torres', email: 'diana.t@email.com', product: 'Organizador Cable', total: 8.50, status: 'pendiente', date: '21 Jun 2025', paymentMethod: 'Tarjeta' },
  { id: 'ORD-008', client: 'Roberto Díaz', email: 'roberto.d@email.com', product: 'Soporte Laptop', total: 28.00, status: 'en proceso', date: '21 Jun 2025', paymentMethod: 'Transferencia' },
  { id: 'ORD-009', client: 'Carmen Vega', email: 'carmen.v@email.com', product: 'Camiseta Algodón', total: 24.00, status: 'completada', date: '20 Jun 2025', paymentMethod: 'Tarjeta' },
  { id: 'ORD-010', client: 'Jorge Mendez', email: 'jorge.m@email.com', product: 'Mochila Antirrobo', total: 55.00, status: 'completada', date: '20 Jun 2025', paymentMethod: 'Efectivo' },
  { id: 'ORD-011', client: 'Laura Pérez', email: 'laura.p@email.com', product: 'Botella Deportiva', total: 15.00, status: 'pendiente', date: '19 Jun 2025', paymentMethod: 'Tarjeta' },
  { id: 'ORD-012', client: 'Andrés Reyes', email: 'andres.r@email.com', product: 'Mancuernas 5kg', total: 38.00, status: 'completada', date: '19 Jun 2025', paymentMethod: 'Transferencia' },
];
