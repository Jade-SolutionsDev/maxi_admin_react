# language: es
Característica: Cuando el formulario no se puede guardar, se nota

  Pulsar «Guardar» y que no pase nada es de las cosas que más desconciertan:
  quien lo hace no sabe si el sistema está pensando, si se rompió, o si hizo
  algo mal. Pasaba al crear una categoría o un departamento sin imagen — la
  imagen es obligatoria y está al final del formulario, fuera de la vista.

  Escenario: Crear un departamento sin imagen avisa
    Cuando abre el formulario de nuevo departamento
    Y escribe "Departamento Sin Imagen E2E" en el nombre
    Y pulsa guardar
    Entonces se avisa de que faltan campos por completar
    Y el formulario sigue abierto

  Escenario: Y lleva hasta el campo que falta
    Cuando abre el formulario de nuevo departamento
    Y escribe "Departamento Sin Imagen E2E" en el nombre
    Y pulsa guardar
    Entonces se ve el error del campo que falta

  Escenario: Crear una categoría sin imagen avisa igual
    Cuando abre el formulario de nueva categoría
    Y escribe "Categoría Sin Imagen E2E" en el nombre
    Y pulsa guardar
    Entonces se avisa de que faltan campos por completar
    Y el formulario sigue abierto
