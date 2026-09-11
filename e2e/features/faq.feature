# language: es
@faq
Característica: Administración de preguntas frecuentes

  El equipo editorial necesita publicar ayuda sin desplegar nuevamente la tienda.

  Escenario: Un administrador crea, edita y elimina una pregunta y su categoría
    Cuando crea la categoría FAQ de prueba
    Y crea una pregunta dentro de esa categoría
    Entonces ve la pregunta FAQ publicada en el listado
    Cuando edita la respuesta de la pregunta FAQ
    Entonces ve la respuesta FAQ actualizada
    Cuando elimina la pregunta y la categoría FAQ de prueba
    Entonces la categoría FAQ de prueba deja de aparecer
