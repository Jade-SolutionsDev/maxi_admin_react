import { useCanAccess, useRecordContext, useTranslate } from "ra-core";

import {
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  FilterButton,
  List,
  ReferenceField,
  ReferenceInput,
  RefreshButton,
  RowNumberField,
  SearchInput,
  SelectInput,
} from "@/components/admin";

const categoryFilters = [
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
];

const CategoryActions = () => {
  const { canAccess: canCreate } = useCanAccess({
    resource: "categories",
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

/**
 * El estado tal como lo vive el cliente, no solo el interruptor del panel.
 *
 * Una categoría activa puede no verse en la tienda: las consultas públicas
 * ocultan las que no tienen productos disponibles. Antes aquí ponía «Activo» y
 * nadie podía saber cuáles estaban fuera, ni por qué. El cálculo lo hace el
 * backend (`visibleInStore`); esta celda lo pinta y añade el motivo, que es lo
 * accionable: desactivada se arregla con un clic, sin productos no.
 */
const EstadoDeLaCategoria = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;

  // Rutas que no calculan los conteos: se enseña lo de siempre.
  if (record.visibleInStore === undefined) {
    return (
      <span className="text-sm">
        {record.isActive
          ? translate("users.status.active", { _: "Activo" })
          : translate("users.status.inactive", { _: "Inactivo" })}
      </span>
    );
  }

  if (record.visibleInStore) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        {translate("categories.visibility.visible", {
          _: "La ven los clientes",
        })}
      </span>
    );
  }

  const motivo = record.isActive
    ? translate("categories.visibility.reason_empty", {
        _: "No tiene productos disponibles",
      })
    : translate("categories.visibility.reason_inactive", {
        _: "Está desactivada",
      });

  return (
    <span
      className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
      title={motivo}
    >
      {motivo}
    </span>
  );
};

export default function CategoriesList() {
  const translate = useTranslate();

  return (
    <List
      filters={categoryFilters}
      actions={<CategoryActions />}
      resource="categories"
      title={translate("resources.categories.name_plural")}
      perPage={10}
    >
      <DataTable
        hasBulkActions={false}
        rowClick={(id) => `/categories/${id}`}
        rowClassName={() => "[&>td]:py-4"}
        hiddenColumns={["id", "parentId", "deletedAt", "slug"]}
      >
        <DataTable.Col label="#" disableSort cellClassName="w-10 text-center">
          <RowNumberField />
        </DataTable.Col>
        <DataTable.Col
          label="resources.departments.name"
          source="parentId"
          disableSort
          cellClassName="min-w-[160px]"
        >
          <ReferenceField source="parentId" reference="departments" />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.name"
          source="name"
          cellClassName="min-w-[180px]"
        />
        <DataTable.Col source="slug" label="list.fields.slug" />
        <DataTable.Col
          className="max-w-sm truncate"
          source="description"
          label="list.fields.description"
        />
        {/* Server-computed total; not a sortable column. */}
        <DataTable.Col
          source="productsCount"
          label="list.fields.productsCount"
          disableSort
        />
        <DataTable.Col
          source="sortOrder"
          label="list.fields.sortOrder"
          disableSort
        />
        <DataTable.Col source="isActive" label="list.fields.status" disableSort>
          <EstadoDeLaCategoria />
        </DataTable.Col>
        <DataTable.Col label="list.fields.createdAt" source="createdAt">
          <DateField source="createdAt" />
        </DataTable.Col>
        <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" showTime />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
