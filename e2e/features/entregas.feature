# language: es
Característica: Las formas de entrega

  Lo que el cliente puede elegir al finalizar la compra sale de esta pantalla:
  cuánto cuesta cada forma, dónde se ofrece y si está activa. Un error aquí no
  se ve hasta el checkout, y para entonces el cliente ya puso sus datos.

  Escenario: Crear una forma de entrega con su costo
    Cuando abre las formas de entrega
    Y crea la forma de entrega "Mensajería E2E" con un costo de 7
    Entonces ve la forma de entrega "Mensajería E2E" con el costo "7.00"

  Escenario: Una forma sin zonas dice que se ofrece en todo el país
    Dado que existe la forma de entrega "Sin Zonas E2E" sin zonas
    Cuando abre las formas de entrega
    Entonces la forma "Sin Zonas E2E" dice que se ofrece en todo el país

  Escenario: Asignar una provincia deja dicho cuántas zonas tiene
    Dado que existe la forma de entrega "Con Zona E2E" sin zonas
    Cuando abre las formas de entrega
    Y edita la forma "Con Zona E2E" y le asigna la provincia "Artemisa"
    Entonces la forma "Con Zona E2E" dice que tiene 1 zona

  Escenario: Quitar la última zona la devuelve a todo el país
    Dado que existe la forma de entrega "Vuelve E2E" con la provincia "Artemisa"
    Cuando abre las formas de entrega
    Y edita la forma "Vuelve E2E" y le quita la provincia "Artemisa"
    Entonces la forma "Vuelve E2E" dice que se ofrece en todo el país

  Escenario: Cambiar el costo de una forma de entrega
    Dado que existe la forma de entrega "Sube E2E" sin zonas
    Cuando abre las formas de entrega
    Y edita la forma "Sube E2E" y le pone un costo de 12
    Entonces ve la forma de entrega "Sube E2E" con el costo "12.00"

  Escenario: Desactivar una forma de entrega se confirma antes
    Dado que existe la forma de entrega "Apagar E2E" sin zonas
    Cuando abre las formas de entrega
    Y pulsa el interruptor de la forma "Apagar E2E"
    Entonces se pide confirmar que dejará de aparecer al finalizar la compra
    Cuando confirma
    Entonces la forma "Apagar E2E" queda desactivada

  Escenario: El formulario de entrega no se cierra con un clic fuera
    Cuando abre el formulario de nueva forma de entrega
    Y escribe "A medio escribir E2E" en el nombre de la forma
    Y pulsa fuera del formulario
    Entonces el formulario de entrega sigue abierto con lo escrito

  Escenario: La recogida en tienda se puede desactivar y volver a activar
    Cuando abre las formas de entrega
    Y cambia el interruptor de recoger en tienda
    Entonces se pide confirmar el cambio de la recogida
    Cuando confirma
    Entonces el interruptor de recoger en tienda queda cambiado
