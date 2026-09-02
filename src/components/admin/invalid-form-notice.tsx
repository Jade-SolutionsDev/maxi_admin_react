import { useEffect, useRef } from "react";
import { useFormState } from "react-hook-form";
import { useNotify, useTranslate } from "ra-core";

/**
 * Dice en voz alta que el formulario no se guardó.
 *
 * Los errores de validación se pintan **debajo de su campo**, y en un modal con
 * desplazamiento el campo que falla suele estar fuera de la vista: quien mira el
 * botón «Guardar» pulsa y no ve absolutamente nada. Pasaba al crear una
 * categoría o un departamento sin imagen — la imagen es obligatoria y vive al
 * final del formulario.
 *
 * `react-hook-form` intenta enfocar el primer campo con error, pero solo si ese
 * campo le dio una referencia enfocable; el subidor de imágenes no lo hace, así
 * que tampoco había desplazamiento.
 *
 * Va dentro de `SimpleForm`, no en un formulario concreto, porque el problema no
 * es de la pantalla de departamentos: es de cualquier formulario cuyo campo
 * obligatorio no quepa en pantalla.
 */
export const InvalidFormNotice = () => {
  const notify = useNotify();
  const translate = useTranslate();
  const { submitCount, errors } = useFormState();
  const avisadoPara = useRef(0);

  useEffect(() => {
    // `submitCount` sube en cada intento, también cuando la validación lo
    // detiene. Es la señal de «alguien pulsó Guardar y no pasó nada».
    if (submitCount === 0 || submitCount === avisadoPara.current) return;
    if (Object.keys(errors).length === 0) return;

    avisadoPara.current = submitCount;

    notify(
      translate("shared.form.invalid", {
        _: "Revisa los campos marcados: falta algo por completar.",
      }),
      { type: "warning" },
    );

    // Y se le lleva al primero, que es lo que el aviso por sí solo no resuelve:
    // saber que falta algo no dice dónde.
    requestAnimationFrame(() => {
      document
        .querySelector('[data-slot="form-message"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [submitCount, errors, notify, translate]);

  return null;
};
