import { useNavigate } from "react-router-dom";
import { useNotify, useRefresh, useTranslate, type RaRecord } from "ra-core";
import { Warehouse } from "lucide-react";

import { ResourceFormModal } from "@/components/admin";
import { StockLocationFormFields } from "./StockLocationFormFields";
import { sanitizeStockLocation as sanitize } from "./sanitizeStockLocation";

export function StockLocationCreateModal({
  open,
  onClose,
  isManager,
}: {
  open: boolean;
  onClose: () => void;
  isManager: boolean;
}) {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const navigate = useNavigate();

  return (
    <ResourceFormModal
      mode="create"
      resource="stock-locations"
      open={open}
      onClose={onClose}
      icon={<Warehouse className="h-5 w-5" />}
      title={translate("stockLocations.actions.create", {
        _: "Crear almacén",
      })}
      subtitle={translate("stockLocations.form.create_subtitle", { _: "" })}
      callout={{
        title: translate("shared.form.note_title"),
        description: translate("stockLocations.form.note"),
      }}
      transform={sanitize}
      mutationOptions={{
        onSuccess: (data: RaRecord) => {
          notify("stockLocations.notify.created", {
            type: "success",
            messageArgs: { _: "Almacén creado" },
          });
          onClose();
          refresh();
          navigate(`/stock-locations/${data.id}`);
        },
      }}
    >
      {/* `stacked` keeps this single-column: the coverage selector needs the
          full modal width. */}
      <StockLocationFormFields isManager={isManager} stacked />
    </ResourceFormModal>
  );
}
