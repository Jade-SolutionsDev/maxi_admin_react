# language: es
Característica: El panel muestra datos reales

  Un panel con cifras inventadas es peor que uno vacío: quien administra toma
  decisiones con él. Las cuatro cifras y las órdenes recientes tienen que salir
  de la base y coincidir con lo que dice el listado de pedidos.

  Antecedentes:
    Dado que hay pedidos de prueba de los últimos 30 días

  Escenario: Las cuatro cifras salen de la API
    Cuando abre el panel
    Entonces ninguna tarjeta muestra la cifra de ejemplo "424,652"
    Y la cifra de pedidos coincide con los pedidos de los últimos 30 días
    Y la cifra de productos coincide con los productos activos

  Escenario: Cada tarjeta compara con el periodo anterior
    Cuando abre el panel
    Entonces cada tarjeta lleva una variación o la palabra "Nuevo"

  Escenario: Las órdenes recientes son pedidos de verdad
    Cuando abre el panel
    Entonces la tabla de órdenes recientes muestra el número del último pedido
    Y no queda ningún estado inventado en la tabla

  Escenario: Desde el panel se llega al listado de pedidos
    Cuando abre el panel
    Y pulsa "Ver todas" en las órdenes recientes
    Entonces está en el listado de pedidos
