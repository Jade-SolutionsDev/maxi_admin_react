import { useState } from "react";
import {
  useCreatePath,
  useDelete,
  useGetIdentity,
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
  FilterButton,
  List,
  RefreshButton,
  SearchInput,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
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

const roleFilters = [
  <SearchInput source="q" alwaysOn />,
];

const RoleActions = () => (
  <div className="flex items-center gap-2">
    <RefreshButton />
    <CreateButton />
    <ColumnsButton />
    <FilterButton variant="outline" size="lg" />
  </div>
);

const RoleTypeCell = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  if (!record) return null;
  return record.isSystem ? (
    <Badge variant="secondary">{translate("roles.system")}</Badge>
  ) : (
    <Badge variant="outline">{translate("roles.custom")}</Badge>
  );
};

const RolePermissionsCountCell = () => {
  const record = useRecordContext();
  if (!record) return null;
  const count = Array.isArray(record.permissionIds)
    ? record.permissionIds.length
    : 0;
  return <span className="tabular-nums">{count}</span>;
};

const RoleEditButton = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  const createPath = useCreatePath();
  if (!record) return null;

  const to = createPath({ resource: "roles", type: "edit", id: record.id });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
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

const RoleDeleteButton = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const translate = useTranslate();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);

  const [deleteOne, { isPending }] = useDelete(resource, {
    id: record?.id,
    previousData: record,
  });

  // System roles cannot be deleted.
  if (!record || record.isSystem) return null;

  const displayName = (record.name as string) || "";

  const handleConfirm = async () => {
    await deleteOne(
      resource,
      { id: record.id, previousData: record },
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
            {translate("roles.delete_confirm_title", { _: "Delete role" })}
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

const RoleActionsCell = () => (
  <div className="flex items-center justify-center gap-1">
    <RoleEditButton />
    <RoleDeleteButton />
  </div>
);

export default function RoleList() {
  const translate = useTranslate();
  const { data: identity, isPending } = useGetIdentity();

  // RBAC management is admin-only. Backend also enforces this (AdminGuard).
  if (!isPending && identity?.userType !== "admin") {
    return (
      <div className="p-6 text-muted-foreground">
        {translate("roles.admin_only")}
      </div>
    );
  }

  return (
    <List
      filters={roleFilters}
      actions={<RoleActions />}
      resource="roles"
      title={translate("resources.roles.name_plural")}
      perPage={25}
    >
      <DataTable hiddenColumns={["id", "createdBy", "updatedAt", "createdAt"]}>
        <DataTable.Col
          source="name"
          label="list.fields.firstName"
          cellClassName="min-w-[180px] font-medium"
        />
        <DataTable.Col
          source="description"
          label="list.fields.description"
          disableSort
        />
        <DataTable.Col label="roles.fields.type" disableSort>
          <RoleTypeCell />
        </DataTable.Col>
        <DataTable.Col label="roles.fields.permissionsCount" disableSort>
          <RolePermissionsCountCell />
        </DataTable.Col>
        <DataTable.Col source="isActive" label="list.fields.isActive">
          <BooleanField source="isActive" />
        </DataTable.Col>
        <DataTable.Col
          label="list.fields.actions"
          disableSort
          cellClassName="text-center w-24"
        >
          <RoleActionsCell />
        </DataTable.Col>
      </DataTable>
    </List>
  );
}
