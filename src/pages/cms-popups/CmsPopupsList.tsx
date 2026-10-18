import { useCanAccess, useRecordContext, useTranslate } from "ra-core";

import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  List,
  RefreshButton,
  RowNumberField,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PopupPublishButton } from "./PopupPublishButton";

const CmsPopupsActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "cms-popups",
    action: "create",
  });
  return (
    <div className="flex items-center gap-2">
      <RefreshButton />
      {canCreate && <CreateButton />}
      <ColumnsButton />
    </div>
  );
};

/**
 * En qué punto de su vida está el aviso. El estado lo calcula la API y aquí
 * solo se pinta: si lo dedujéramos del lado del panel, la pantalla y la
 * tienda podrían acabar diciendo cosas distintas del mismo aviso.
 */
const EstadoField = () => {
  const translate = useTranslate();
  const record = useRecordContext();
  const estado = (record?.state as string) ?? "borrador";
  const tono: Record<string, string> = {
    vigente:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent",
    programado:
      "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-transparent",
    caducado: "bg-muted text-muted-foreground border-transparent",
    borrador: "bg-muted text-muted-foreground border-transparent",
  };
  return (
    <Badge className={cn(tono[estado] ?? tono.borrador)}>
      {translate(`cms-popups.states.${estado}`, { _: estado })}
    </Badge>
  );
};

const VigenciaField = () => {
  const translate = useTranslate();
  const record = useRecordContext();
  const desde = record?.startsAt as string | null | undefined;
  const hasta = record?.endsAt as string | null | undefined;
  if (!desde && !hasta) {
    return (
      <span className="text-muted-foreground">
        {translate("cms-popups.fields.no_dates", { _: "Sin fechas" })}
      </span>
    );
  }
  const fecha = (valor?: string | null) =>
    valor ? new Date(valor).toLocaleDateString("es-CU") : "—";
  return (
    <span className="tabular-nums">
      {fecha(desde)} → {fecha(hasta)}
    </span>
  );
};

const Miniatura = () => {
  const record = useRecordContext();
  const src = (record?.desktop as { src?: string } | undefined)?.src;
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className="h-10 w-20 rounded-md border border-border object-cover"
    />
  );
};

export default function CmsPopupsList() {
  const translate = useTranslate();
  return (
    <List
      resource="cms-popups"
      actions={<CmsPopupsActions />}
      title={translate("cms-popups.title", { _: "Avisos emergentes" })}
      perPage={25}
    >
      <DataTable
        hasBulkActions={false}
        hiddenColumns={["id", "createdAt"]}
        rowClick={(id) => `/cms-popups/edit/${id}`}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          source="state"
          label="cms-popups.fields.state"
          disableSort
        >
          <EstadoField />
        </DataTable.Col>
        <DataTable.Col
          source="desktop"
          label="cms-popups.fields.image"
          disableSort
        >
          <Miniatura />
        </DataTable.Col>
        <DataTable.Col source="title" label="cms-popups.fields.title" />
        <DataTable.Col
          source="startsAt"
          label="cms-popups.fields.dates"
          disableSort
        >
          <VigenciaField />
        </DataTable.Col>
        <DataTable.Col label="cms-popups.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
        <DataTable.Col
          label="cms-popups.fields.actions"
          disableSort
          cellClassName="w-40 text-right"
        >
          <PopupPublishButton />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
