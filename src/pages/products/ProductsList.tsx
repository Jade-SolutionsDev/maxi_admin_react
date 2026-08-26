import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { OnlyEnabledFilter } from "@/components/admin/only-enabled-filter";
import { useCanAccess, useTranslate, type RaRecord } from "ra-core";
import { ImageOff } from "lucide-react";

import {
  BooleanField,
  ColumnsButton,
  CreateButton,
  DataTable,
  FilterButton,
  List,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  RefreshButton,
  RowNumberField,
  SearchInput,
  SelectInput,
} from "@/components/admin";

// Prices are shown always in USD (doesn't matter the app is for Cuba).
const CURRENCY: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "usd",
};

// Tri-state boolean filter (absent = "all").
const BOOL_CHOICES = [
  { id: "true", name: "shared.filters.yes" },
  { id: "false", name: "shared.filters.no" },
];

/**
 * Las categorías del departamento elegido, no todas.
 *
 * Con los dos filtros sueltos se podía pedir un departamento y una categoría
 * que no le pertenece, y el listado salía vacío sin explicar por qué. Al
 * cambiar de departamento se suelta la categoría anterior, que ya no aplica.
 */
const CategoryFilter = (_props: { source?: string; alwaysOn?: boolean }) => {
  const { setValue } = useFormContext();
  const departmentId = useWatch({ name: "departmentId" });
  const anterior = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (anterior.current !== undefined && anterior.current !== departmentId) {
      setValue("categoryId", undefined);
    }
    anterior.current = departmentId;
  }, [departmentId, setValue]);

  return (
    <ReferenceInput
      source="categoryId"
      reference="categories"
      label="resources.categories.name"
      filter={departmentId ? { departmentId } : {}}
      alwaysOn
    >
      <SelectInput
        className="min-w-64"
        optionText="name"
        label="resources.categories.name"
      />
    </ReferenceInput>
  );
};

const productFilters = [
  <SearchInput source="q" alwaysOn />,
  <ReferenceInput
    source="departmentId"
    reference="departments"
    label="resources.departments.name"
    alwaysOn
  >
    <SelectInput
      className="min-w-64"
      optionText="name"
      label="resources.departments.name"
    />
  </ReferenceInput>,
  <CategoryFilter source="categoryId" alwaysOn />,
  <NumberInput source="minPrice" label="list.fields.minPrice" min={0} />,
  <NumberInput source="maxPrice" label="list.fields.maxPrice" min={0} />,
  <SelectInput
    source="featured"
    label="list.fields.featured"
    choices={BOOL_CHOICES}
  />,
  <OnlyEnabledFilter source="isActive" />,
];

const ProductActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "products",
    action: "create",
  });
  return (
    <div className="flex items-center gap-2">
      <RefreshButton />
      {canCreate && <CreateButton />}
      <ColumnsButton />
      <FilterButton variant="outline" size="lg" />
    </div>
  );
};

const ProductThumb = (record: RaRecord) => {
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

const ProductNameCell = (record: RaRecord) => (
  <div className="min-w-40">
    <p className="font-medium text-foreground">{record.name as string}</p>
    {/* {record.sku ? (
      <p className="text-xs text-muted-foreground">{record.sku as string}</p>
    ) : null} */}
  </div>
);

const DiscountCell = (record: RaRecord) => {
  const discount = Number(record.discount ?? 0);
  return discount > 0 ? (
    <span className="text-primary">{discount}%</span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
};

export default function ProductsList() {
  const translate = useTranslate();

  return (
    <List
      filters={productFilters}
      actions={<ProductActions />}
      resource="products"
      title={translate("resources.products.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        hiddenColumns={["id"]}
        rowClick={(id) => `/products/${id}`}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.image"
          disableSort
          cellClassName="w-16"
          render={ProductThumb}
        />
        <DataTable.Col
          source="name"
          label="list.fields.name"
          render={ProductNameCell}
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
        <DataTable.NumberCol
          source="basePrice"
          label="list.fields.basePrice"
          options={CURRENCY}
          locales={"en-US"}
        />
        <DataTable.Col
          source="discount"
          label="list.fields.discount"
          render={DiscountCell}
        />
        <DataTable.NumberCol
          source="finalPrice"
          label="list.fields.finalPrice"
          options={CURRENCY}
          locales={"en-US"}
        />
        <DataTable.Col
          source="featured"
          label="list.fields.featured"
          disableSort
        >
          <BooleanField source="featured" />
        </DataTable.Col>
        <DataTable.Col source="isActive" label="list.fields.status" disableSort>
          <BooleanField
            valueLabelFalse="users.status.inactive"
            valueLabelTrue="users.status.active"
            source="isActive"
          />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
