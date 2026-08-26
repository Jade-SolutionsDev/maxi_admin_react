import { useInput, useTranslate } from "ra-core";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * Filtro de estado en un gesto.
 *
 * Sustituye al desplegable de Sí/No, que exigía abrir, leer dos opciones y
 * elegir para algo que en realidad tiene dos posiciones. Apagado no filtra
 * —se ven todos, habilitados y deshabilitados—; encendido deja solo los
 * habilitados, que es lo que casi siempre se quiere mirar.
 */
export const OnlyEnabledFilter = ({
  source = "isActive",
  label,
}: {
  source?: string;
  label?: string;
  /** Lo consume el formulario de filtros para dejarlo siempre visible. */
  alwaysOn?: boolean;
}) => {
  const translate = useTranslate();
  const { id, field } = useInput({ source });
  const activo = field.value === "true" || field.value === true;

  return (
    <div className="flex items-center gap-2 mt-auto h-9">
      <span className="text-sm text-muted-foreground">
        {translate(label ?? "list.fields.isActive", { _: "Estado" })}:
      </span>
      <Label
        htmlFor={id}
        className="text-sm font-normal cursor-pointer text-muted-foreground"
      >
        {translate("shared.filters.all", { _: "Todos" })}
      </Label>
      <Switch
        id={id}
        checked={activo}
        onCheckedChange={(marcado) =>
          field.onChange(marcado ? "true" : undefined)
        }
      />
      <Label htmlFor={id} className="text-sm font-normal cursor-pointer">
        {translate("shared.filters.only_enabled", { _: "Solo habilitados" })}
      </Label>
    </div>
  );
};
