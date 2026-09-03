# language: es
Característica: Filtrar los pedidos por método de pago

  Con varias pasarelas conviviendo, la pregunta diaria de quien administra es
  «¿qué pedidos vienen por tarjeta?». Y la respuesta tiene que coincidir con lo
  que muestra la tabla: un filtro que enseñe filas de otra pasarela destruye la
  confianza en toda la pantalla.

  Escenario: El filtro por método existe y ofrece las pasarelas
    Cuando abre el listado de "pedidos"
    Entonces puede filtrar por método de pago
    Y entre las opciones está "Sin intento de pago"

  Escenario: La tabla dice con qué se intentó pagar cada pedido
    Cuando abre el listado de "pedidos"
    Entonces la tabla tiene una columna de método de pago
