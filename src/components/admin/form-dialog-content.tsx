import type { ComponentProps } from "react";
import { DialogContent } from "@/components/ui/dialog";

/**
 * El contenido de un diálogo que contiene un formulario.
 *
 * Se diferencia de `DialogContent` en una cosa: **un clic fuera no lo cierra**.
 * Un formulario a medio escribir son diez minutos de trabajo, y perderlos por
 * rozar el fondo no es una decisión del usuario, es un resbalón. Se cierra por
 * «Cancelar» o por la equis, que sí lo son.
 *
 * Los diálogos de confirmación, de solo lectura y el buscador **no** usan esto:
 * ahí cerrar al pulsar fuera es lo que se espera, y no hay nada que perder.
 */
export const FormDialogContent = (props: ComponentProps<typeof DialogContent>) => (
  <DialogContent
    {...props}
    onPointerDownOutside={(evento) => evento.preventDefault()}
    onInteractOutside={(evento) => evento.preventDefault()}
  />
);
