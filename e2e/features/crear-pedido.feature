# language: es
Característica: Crear un pedido en nombre de un cliente

  Quien compra por WhatsApp o por teléfono no pasa por la tienda, y su venta
  tiene que quedar registrada igual que las demás: mismo stock apartado, mismo
  plazo, mismo correo. Si esto no existe, esas ventas viven en una libreta.

  Escenario: El botón solo aparece con permiso para crear
    Cuando abre el listado de "pedidos"
    Entonces ve el botón "Crear pedido"

  Escenario: No se puede crear un pedido sin cliente y sin productos
    Cuando abre el listado de "pedidos"
    Y pulsa "Crear pedido"
    Entonces el botón "Crear el pedido" está deshabilitado
