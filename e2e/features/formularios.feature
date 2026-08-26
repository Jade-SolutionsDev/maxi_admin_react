# language: es
Característica: Los formularios de la administración

  Un formulario de producto son doce campos y una imagen. Perder eso por un
  clic mal puesto es caro, y que no se pueda borrar un cero es de esas cosas
  que irritan cien veces al día.

  Antecedentes:
    Dado que hay productos de prueba en el catálogo

  Escenario: Un clic fuera no se lleva lo escrito
    Cuando abre el formulario de nuevo producto
    Y escribe "Producto a medio escribir" en el nombre
    Y pulsa fuera del formulario
    Entonces el formulario sigue abierto con lo escrito

  Escenario: El destacado se puede marcar al crear
    Cuando abre el formulario de nuevo producto
    Entonces puede marcar el producto como destacado

  Escenario: Un campo numérico se puede dejar vacío
    Cuando abre el formulario de nuevo producto
    Y escribe 25 en el descuento
    Y borra el descuento
    Entonces el descuento queda vacío
