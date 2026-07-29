import { useState } from "react";
import {
  ResourceContextProvider,
  useCanAccess,
  useRecordContext,
  useTranslate,
  type RaRecord,
} from "ra-core";
import { Plus, Warehouse } from "lucide-react";

import {
  DataTable,
  List,
  RefreshButton,
  RowNumberField,
  SearchInput,
  SelectInput,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
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
          <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
            <RowNumberField />
          </DataTable.Col>
          <DataTable.Col source="name" label="list.fields.name">
            <NameCell />
          </DataTable.Col>
          <DataTable.Col
            label="stockLocations.sections.coverage"
            disableSort
            render={CoverageSummary}
          />
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
