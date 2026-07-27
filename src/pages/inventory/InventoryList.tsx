import { useTranslate } from "ra-core";
import type { RaRecord } from "ra-core";
import { Link } from "react-router-dom";
import { Eye, ImageOff, Package } from "lucide-react";

import {
  ColumnsButton,
  DataTable,
  FilterButton,
  List,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  RefreshButton,
  SelectInput,
} from "@/components/admin";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const inventoryFilters = [
  <ReferenceInput
    source="departmentId"
    reference="departments"
    label="resources.departments.name"
    alwaysOn
  >
    <SelectInput optionText="name" label="resources.departments.name" />
  </ReferenceInput>,
  <ReferenceInput
    source="categoryId"
    reference="categories"
    label="resources.categories.name"
    alwaysOn
  >
    <SelectInput optionText="name" label="resources.categories.name" />
  </ReferenceInput>,
  <ReferenceInput
    source="atLocationId"
    reference="stock-locations"
    label="resources.stock-locations.name"
  >
    <SelectInput optionText="name" label="resources.stock-locations.name" />
  </ReferenceInput>,
  <NumberInput source="minStock" label="list.fields.minStock" min={0} />,
  <NumberInput source="maxStock" label="list.fields.maxStock" min={0} />,
];

const InventoryActions = () => (
  <div className="flex items-center gap-2">
    <RefreshButton />
    <ColumnsButton />
    <FilterButton variant="outline" size="lg" />
  </div>
);

const Thumb = (record: RaRecord) => {
  const url = record.imageUrl as string | null;
  return url ? (
    <img
      src={url}
      alt=""
      className="h-10 w-10 rounded-md border border-border object-cover"
    />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40">
      <ImageOff className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

const NameCell = (record: RaRecord) => (
  <Link
    to={`/inventory/${record.id}`}
    className="min-w-40 font-medium text-foreground hover:text-primary hover:underline"
  >
    {record.productName as string}
  </Link>
);

const AvailableCell = (record: RaRecord) => {
  const available = Number(record.available ?? 0);
  const real = Number(record.real ?? 0);
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        available === 0
          ? "text-red-600 dark:text-red-400"
          : available < real
            ? "text-amber-600 dark:text-amber-400"
            : "text-foreground",
      )}
    >
      {available}
    </span>
  );
};

const RowActions = () => {
  const translate = useTranslate();
  return (record: RaRecord) => (
    <div className="flex items-center justify-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={`/inventory/${record.id}`}
              aria-label={translate("shared.actions.view", { _: "View" })}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye size={16} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{translate("inventory.actions.view_breakdown", { _: "Existencias por almacén" })}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={`/products/${record.id}`}
              aria-label={translate("inventory.actions.view_product", { _: "Product" })}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 text-muted-foreground hover:text-foreground",
              )}
            >
              <Package size={16} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{translate("inventory.actions.view_product", { _: "Ver producto" })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default function InventoryList() {
  const translate = useTranslate();
  const rowActions = RowActions();

  return (
    <List
      filters={inventoryFilters}
      actions={<InventoryActions />}
      resource="inventory"
      title={translate("resources.inventory.name_plural", { _: "Inventario" })}
      perPage={10}
    >
      <DataTable hasBulkActions={false} hiddenColumns={["id"]}>
        <DataTable.Col
          label="list.fields.image"
          disableSort
          cellClassName="w-16"
          render={Thumb}
        />
        <DataTable.Col
          source="productName"
          label="list.fields.name"
          render={NameCell}
        />
        <DataTable.Col
          label="resources.categories.name"
          source="categoryId"
          disableSort
          cellClassName="min-w-36"
        >
          <ReferenceField source="categoryId" reference="categories" />
        </DataTable.Col>
        <DataTable.Col source="measureUnit" label="list.fields.measureUnit" />
        <DataTable.NumberCol source="real" label="list.fields.real" />
        <DataTable.NumberCol source="reserved" label="list.fields.reserved" />
        <DataTable.Col
          source="available"
          label="list.fields.available"
          cellClassName="text-right tabular-nums"
          render={AvailableCell}
        />
        <DataTable.NumberCol source="storageCount" label="list.fields.storages" />
        <DataTable.Col
          label="list.fields.actions"
          disableSort
          cellClassName="text-center w-24"
          render={rowActions}
        />
      </DataTable>
    </List>
  );
}
