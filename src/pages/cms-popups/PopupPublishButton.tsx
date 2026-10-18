import { useState } from "react";
import {
  useCanAccess,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
} from "ra-core";

import { Button } from "@/components/ui/button";
import type { ExtendedDataProvider } from "@/providers/dataProvider";

/**
 * Publicar y retirar, desde la propia fila.
 *
 * Publicar puede fallar con un 409: la API no deja dos avisos vigentes a la
 * vez y devuelve el nombre del que estorba. Ese texto se enseña tal cual,
 * porque dice exactamente qué hay que hacer.
 */
export const PopupPublishButton = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const [enCurso, setEnCurso] = useState(false);
  const { canAccess } = useCanAccess({
    resource: "cms-popups",
    action: "update",
  });

  if (!record || !canAccess) return null;

  const publicado = Boolean(record.publishedAt);

  const alternar = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setEnCurso(true);
    try {
      if (publicado) {
        await dataProvider.unpublishPopup(String(record.id));
        notify(
          translate("cms-popups.notify.unpublished", {
            _: "El aviso se retiró de la tienda",
          }),
          { type: "info" },
        );
      } else {
        await dataProvider.publishPopup(String(record.id));
        notify(
          translate("cms-popups.notify.published", {
            _: "El aviso ya se ve en la tienda",
          }),
          { type: "success" },
        );
      }
      refresh();
    } catch (error) {
      const mensaje =
        error instanceof Error && error.message
          ? error.message
          : translate("cms-popups.notify.failed", {
              _: "No se pudo cambiar el estado del aviso",
            });
      notify(mensaje, { type: "warning", multiLine: true });
    } finally {
      setEnCurso(false);
    }
  };

  return (
    <Button
      type="button"
      variant={publicado ? "outline" : "default"}
      size="sm"
      disabled={enCurso}
      onClick={alternar}
    >
      {publicado
        ? translate("cms-popups.actions.unpublish", { _: "Retirar" })
        : translate("cms-popups.actions.publish", { _: "Publicar" })}
    </Button>
  );
};
