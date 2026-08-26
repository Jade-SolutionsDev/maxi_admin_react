# language: es
Característica: El menú de la administración

  Doce módulos en una lista plana no se recorren, se rebuscan. Agrupados por
  dominio, quien busca algo mira primero el grupo.

  Escenario: Los módulos están agrupados por dominio
    Cuando abre el listado de "productos"
    Entonces el menú muestra los grupos "Ventas", "Catálogo" e "Inventario"

  Escenario: Se llega a cada módulo desde su grupo
    Cuando abre el listado de "productos"
    Entonces puede llegar a "Pedidos", "Clientes" y "Almacenes" desde el menú
