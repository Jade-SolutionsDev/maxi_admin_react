import { useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { FormDescription } from "@/components/admin/form";
import { cn } from "@/lib/utils";

/**
 * Texto de ayuda con contador: «Escríbela como la formularía un cliente. 312/300».
 *
 * La API rechaza el texto que pasa del límite, y sin esto la única pista era
 * un error al pulsar «Guardar». El contador avisa mientras se escribe y se pone
 * en rojo al pasarse, junto al mensaje de validación del campo.
 *
 * Va como `helperText` de un `TextInput`, así que siempre vive dentro del
 * formulario de react-hook-form (necesita `useWatch`).
 */
export function CharacterCountHint({
  source,
  max,
  hint,
}: {
  source: string;
  max: number;
  /** Clave i18n del texto de ayuda habitual. */
  hint: string;
}) {
  const translate = useTranslate();
  const value = useWatch({ name: source }) as unknown;
  const count = typeof value === "string" ? value.length : 0;
  const over = count > max;

  return (
    <FormDescription className="flex items-baseline justify-between gap-3">
      <span>{translate(hint, { _: hint })}</span>
      <span
        aria-label={translate("shared.validation.character_count", {
          _: "%{count} de %{max} caracteres",
          count,
          max,
        })}
        className={cn("shrink-0 tabular-nums", over && "text-destructive")}
      >
        {count}/{max}
      </span>
    </FormDescription>
  );
}
