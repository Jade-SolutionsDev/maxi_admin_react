import { useState } from "react";
import {
  useCanAccess,
  useDelete,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { AlertTriangle, ImageOff, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import {
  ColumnsButton,
  ConfirmToggleField,
  CreateButton,
  DataTable,
  FilterButton,
  List,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  RefreshButton,
  SearchInput,
  SelectInput,
} from "@/components/admin";

import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RaRecord } from "ra-core";
import { ProductViewButton } from "./ProductDetailModal";

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

const productFilters = [
  <SearchInput source="q" alwaysOn />,
  <ReferenceInput
    source="departmentId"
    reference="departments"
    label="resources.departments.name"
    alwaysOn
  >
    <SelectInput className="min-w-64" optionText="name" label="resources.departments.name" />
  </ReferenceInput>,
  <ReferenceInput
    source="categoryId"
    reference="categories"
    label="resources.categories.name"
    alwaysOn
  >
    <SelectInput className="min-w-64" optionText="name" label="resources.categories.name" />
  </ReferenceInput>,
  <NumberInput source="minPrice" label="list.fields.minPrice" min={0} />,
  <NumberInput source="maxPrice" label="list.fields.maxPrice" min={0} />,
  <SelectInput
    source="featured"
    label="list.fields.featured"
    choices={BOOL_CHOICES}
  />,
  <SelectInput
    source="isActive"
    label="list.fields.isActive"
    choices={BOOL_CHOICES}
  />,
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


const ProductDeleteButton = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const translate = useTranslate();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);

  const [deleteOne, { isPending }] = useDelete(resource, {
    id: record?.id,
    previousData: record,
  });

  const displayName = (record?.name as string) || "";

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
        onError: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => setOpen(true)}
              aria-label={translate("shared.actions.delete", { _: "Delete" })}
            >
              <Trash2 size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{translate("shared.actions.delete", { _: "Delete" })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="space-y-3">
          <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center sm:text-left text-lg">
            {translate("shared.actions.delete_confirm_title", {
              // The key is "Eliminar %{name}" — pass the resource label, like
              // the categories/departments lists do (the description below
              // names the actual record).
              name: translate("resources.products.name", { _: "product" }),
              _: "Delete product",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center sm:text-left">
            {translate("shared.actions.delete_confirm_description", {
              _: "Are you sure you want to delete %{name}? This action cannot be undone.",
              name: displayName,
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
            {isPending
              ? translate("ra.action.loading", { _: "Deleting…" })
              : translate("shared.actions.confirm", { _: "Delete" })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ProductEditButton = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={`/products/edit/${record?.id}`}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
              "text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30",
            )}
            aria-label={translate("shared.actions.edit", { _: "Edit" })}
          >
            <Pencil size={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{translate("shared.actions.edit", { _: "Edit" })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ProductActionsCell = () => {
  const { canAccess: canEdit } = useCanAccess({
    resource: "products",
    action: "edit",
  });
  return (
    <div className="flex items-center justify-center gap-1">
      <ProductViewButton />
      {canEdit && (
        <>
          <ProductEditButton />
          <ProductDeleteButton />
        </>
      )}
    </div>
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
      <DataTable hasBulkActions={false} hiddenColumns={["id"]}>
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
          locales={'en-US'}
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
          locales={'en-US'}
        />
        <DataTable.Col source="featured" label="list.fields.featured">
          <ConfirmToggleField
            source="featured"
            labelKey="list.fields.featured"
            confirmKey="products.toggles.featured"
          />
        </DataTable.Col>
        <DataTable.Col source="isActive" label="list.fields.isActive">
          <ConfirmToggleField
            source="isActive"
            labelKey="list.fields.isActive"
            confirmKey="products.toggles.isActive"
          />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.actions"
          disableSort
          cellClassName="text-center w-28"
        >
          <ProductActionsCell />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
