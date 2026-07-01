import { useState } from "react";
import {
  useDelete,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import {
  BooleanField,
  ColumnsButton,
  CreateButton,
  DataTable,
  DateField,
  FilterButton,
  List,
  RefreshButton,
  SearchInput,
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

const departmentFilters = [
  <SearchInput source="q" alwaysOn placeholder="ra.action.search" />,
];

const DepartmentActions = () => (
  <div className="flex items-center gap-2">
    <RefreshButton />
    <CreateButton />
    <ColumnsButton />
    <FilterButton variant="outline" size="lg" />
  </div>
);

const DepartmentDeleteButton = () => {
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
              _: "Delete department",
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

const DepartmentEditButton = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={`/departments/edit/${record?.id}`}
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

const DepartmentActionsCell = () => (
  <div className="flex items-center justify-center gap-1">
    <DepartmentEditButton />
    <DepartmentDeleteButton />
  </div>
);

export default function DepartmentsList() {
  const translate = useTranslate();

  return (
    <List
      filters={departmentFilters}
      actions={<DepartmentActions />}
      resource="departments"
      title={translate("resources.departments.name_plural")}
      perPage={10}
    >
      <DataTable
        hiddenColumns={[
          "id",
          "providerId",
          "parentId",
          "description",
          "deletedAt",
          "updatedAt",
        ]}
      >
        <DataTable.Col
          label="list.fields.name"
          source="name"
          cellClassName="min-w-[180px]"
        />
        <DataTable.Col source="slug" label="list.fields.slug" />
        <DataTable.Col
          source="sortOrder"
          label="list.fields.sortOrder"
          disableSort
        />
        <DataTable.Col source="isActive" label="list.fields.isActive">
          <BooleanField source="isActive" />
        </DataTable.Col>
        <DataTable.Col label="list.fields.createdAt" source="createdAt">
          <DateField source="createdAt" />
        </DataTable.Col>
        <DataTable.Col label="list.fields.updatedAt" source="updatedAt">
          <DateField source="updatedAt" />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.actions"
          disableSort
          cellClassName="text-center w-24"
        >
          <DepartmentActionsCell />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
