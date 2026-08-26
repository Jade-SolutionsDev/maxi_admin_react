# language: es
Característica: Los listados de la administración

  Quien administra la tienda se pasa el día en estas tablas: buscando, filtrando
  y volviendo atrás. Cada uno de estos escenarios nació de un rechazo de QA, así
  que están aquí para que ese rechazo no se repita sin avisar.

  Antecedentes:
    Dado que hay productos de prueba en el catálogo

  Escenario: Buscar sin tildes encuentra lo que las lleva
    Cuando abre el listado de "productos"
    Y busca "melocoton"
    Entonces ve el producto "Melocotón en Almíbar"

  Escenario: Buscar con tildes también encuentra
    Cuando abre el listado de "productos"
    Y busca "Almíbar"
    Entonces ve el producto "Melocotón en Almíbar"

  Escenario: Una búsqueda sin resultados lo explica y ofrece salida
    Cuando abre el listado de "productos"
    Y busca "zzzznoexiste"
    Entonces se le dice que no hay resultados
    Y puede limpiar los filtros

  Escenario: Los nombres de las columnas tienen todos el mismo tamaño
    Cuando abre el listado de "productos"
    Entonces todas las cabeceras tienen el mismo tamaño de letra

  Escenario: La equis de limpiar responde donde se ve
    Cuando abre el listado de "productos"
    Y busca "melocoton"
    Y pulsa la equis de limpiar
    Entonces la búsqueda queda vacía

  Escenario: El filtro de categorías sigue al departamento
    Cuando abre el listado de "productos"
    Y filtra por el departamento "Alimentación"
    Entonces solo puede elegir categorías de ese departamento

  Escenario: El estado se filtra con un interruptor, no con un desplegable
    Cuando abre el listado de "almacenes"
    Entonces hay un interruptor para ver solo los habilitados

  Escenario: La interfaz está en español
    Cuando abre el listado de "productos"
    Entonces no se ven claves de traducción sin traducir
    Y ve la acción "Crear"
