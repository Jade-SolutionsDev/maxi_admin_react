import { useState } from "react";
import {
  ResourceContextProvider,
  useCanAccess,
  useDelete,
  useNotify,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useTranslate,
  useUpdate,
  type RaRecord,
} from "ra-core";
import { AlertTriangle, Plus, Trash2, Warehouse } from "lucide-react";

import {
  DataTable,
  List,
  RefreshButton,
  SearchInput,
  SelectInput,
} from "@/components/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { StockLocationCreateModal } from "./StockLocationCreateModal";

const BOOL_CHOICES = [
  { id: "true", name: "shared.filters.yes" },
  { id: "false", name: "shared.filters.no" },
];

const almacenFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="isActive"
    label="list.fields.isActive"
    choices={BOOL_CHOICES}
    alwaysOn
  />,
];

const CoverageSummary = (record: RaRecord) => {
  const coverage = Array.isArray(record.coverage) ? record.coverage : [];
  const provinces = coverage.filter(
    (c: { coverageType: string }) => c.coverageType === "province",
  ).length;
  const municipalities = coverage.filter(
    (c: { coverageType: string }) => c.coverageType === "municipality",
  ).length;
  const parts: string[] = [];
  if (provinces) parts.push(`${provinces} prov.`);
  if (municipalities) parts.push(`${municipalities} mun.`);
  return (
    <span className="text-sm text-muted-foreground">
      {parts.length ? parts.join(" · ") : "—"}
    </span>
  );
};

/** Inline availability switch; the backend enforces assignment for grocers. */
const StatusToggle = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const translate = useTranslate();
  const [update, { isPending }] = useUpdate();
  const { canAccess: canEdit } = useCanAccess({
    resource: "stock-locations",
    action: "edit",
  });

  if (!record) return null;
  const checked = record.isActive === true;

  const handleChange = async (value: boolean) => {
    try {
      await update(
        resource,
        { id: record.id, data: { isActive: value }, previousData: record },
        { mutationMode: "pessimistic" },
      );
      refresh();
    } catch {
      notify("shared.actions.error", {
        type: "error",
        messageArgs: { _: "Could not update" },
      });
      refresh();
    }
  };

  return (
    <span onClick={(e) => e.stopPropagation()} className="inline-flex">
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        disabled={!canEdit || isPending}
        aria-label={translate("list.fields.isActive")}
      />
    </span>
  );
};

const DeleteButton = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const translate = useTranslate();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);
  const [deleteOne, { isPending }] = useDelete();

  const handleConfirm = async () => {
    await deleteOne(
      resource,
      { id: record?.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          setOpen(false);
          refresh();
        },
        onError: () => setOpen(false),
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={translate("shared.actions.delete", { _: "Delete" })}
      >
        <Trash2 size={16} />
      </Button>
      <AlertDialogContent
        className="sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader className="space-y-3">
          <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center sm:text-left text-lg">
            {translate("stockLocations.actions.delete_title", {
              _: "Eliminar almacén",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center sm:text-left">
            {translate("shared.actions.delete_confirm_description", {
              _: "Are you sure you want to delete %{name}? This action cannot be undone.",
              name: (record?.name as string) || "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel disabled={isPending}>
            {translate("shared.actions.cancel", { _: "Cancel" })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(buttonVariants({ variant: "destructive" }))}
          >
            {translate("shared.actions.confirm", { _: "Delete" })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ActionsCell = () => {
  const { canAccess: canDelete } = useCanAccess({
    resource: "stock-locations",
    action: "delete",
  });
  return (
    <div className="flex items-center justify-end">
      {canDelete && <DeleteButton />}
    </div>
  );
};

const ListActions = ({ onCreate }: { onCreate: () => void }) => {
  const translate = useTranslate();
  const { canAccess: canCreate } = useCanAccess({
    resource: "stock-locations",
    action: "create",
  });
  return (
    <div className="flex items-center gap-2">
      <RefreshButton />
      {canCreate && (
        <Button size={'lg'} type="button" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {translate("stockLocations.actions.create", { _: "Crear almacén" })}
        </Button>
      )}
    </div>
  );
};

export default function StockLocationsList() {
  const translate = useTranslate();
  const [createOpen, setCreateOpen] = useState(false);
  const { canAccess } = useCanAccess({
    resource: "stock-locations",
    action: "create",
  });
  const isManager = canAccess === true;

  return (
    <ResourceContextProvider value="stock-locations">
      <List
        filters={almacenFilters}
        actions={<ListActions onCreate={() => setCreateOpen(true)} />}
        title={translate("resources.stock-locations.name_plural", {
          _: "Almacenes",
        })}
        perPage={10}
        empty={false}
      >
        <DataTable
          rowClick={(id) => `/stock-locations/${id}`}
          bulkActionButtons={false}
        >
          <DataTable.Col source="name" label="list.fields.name">
            <NameCell />
          </DataTable.Col>
          <DataTable.Col
            label="stockLocations.sections.coverage"
            disableSort
            render={CoverageSummary}
          />
          <DataTable.Col
            source="isActive"
            label="stockLocations.fields.available"
            disableSort
          >
            <StatusToggle />
          </DataTable.Col>
          <DataTable.Col label="list.fields.actions" disableSort>
            <ActionsCell />
          </DataTable.Col>
        </DataTable>
      </List>

      {CreateModalHost({ createOpen, setCreateOpen, isManager })}
    </ResourceContextProvider>
  );
}

const NameCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Warehouse size={16} />
      </span>
      <span className="font-medium text-foreground">
        {record.name as string}
      </span>
    </div>
  );
};

// Kept out of the main tree so the modal isn't inside <List>'s record context.
function CreateModalHost({
  createOpen,
  setCreateOpen,
  isManager,
}: {
  createOpen: boolean;
  setCreateOpen: (v: boolean) => void;
  isManager: boolean;
}) {
  return (
    <StockLocationCreateModal
      open={createOpen}
      onClose={() => setCreateOpen(false)}
      isManager={isManager}
    />
  );
}
