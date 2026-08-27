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

  Escenario: Tampoco se cierra el formulario de invitar a alguien
    Cuando abre el formulario de invitar usuario
    Y pulsa fuera del formulario
    Entonces el formulario de invitación sigue abierto

  # Los cuatro de abajo nacen de defectos que se dieron por resueltos dos veces.
  # Cada uno comprueba **lo que se reportó** —que la etiqueta lleva asterisco,
  # que el campo nace vacío— y no la propiedad de al lado, que fue el error:
  # había una prueba de que el descuento «se puede borrar» y el defecto era que
  # venía escrito.

  Escenario: La imagen obligatoria de una categoría lleva su asterisco
    Cuando abre el formulario de nueva categoría
    Entonces la etiqueta "Imagen (escritorio)" lleva asterisco

  # El mismo defecto estaba en tres formularios y solo se reportó uno.
  Escenario: Y la de un departamento también
    Cuando abre el formulario de nuevo departamento
    Entonces la etiqueta "Imagen (escritorio)" lleva asterisco

  Escenario: El descuento nace vacío, igual que el precio base
    Cuando abre el formulario de nuevo producto
    Entonces el descuento está vacío
    Y el precio base está vacío

  Escenario: La unidad de medida nace sin elegir
    Cuando abre el formulario de nuevo producto
    Entonces la unidad de medida está vacía

  Escenario: El icono del calendario responde
    Cuando abre el formulario de nuevo producto
    Entonces el icono de la fecha es un botón
    Y al pulsarlo, el campo de fecha queda enfocado
