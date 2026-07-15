import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  EditBase,
  ResourceContextProvider,
  useEditContext,
  useGetIdentity,
  useSaveContext,
  useTranslate,
} from "ra-core";
import { useFormContext, useFormState } from "react-hook-form";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Loader2,
  Save,
  Settings2,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

import { SimpleForm } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";
import { StockLocationFormFields } from "./StockLocationFormFields";
import { StockLocationProductsTab } from "./StockLocationProductsTab";
import { CreateOperationWizard } from "./CreateOperationWizard";

const sanitize = (data: Record<string, unknown>) => ({
  name: data.name,
  isActive: data.isActive,
  coverage: data.coverage,
  ...(data.grocerIds !== undefined ? { grocerIds: data.grocerIds } : {}),
});

type TabKey = "general" | "productos";

export default function StockLocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: identity } = useGetIdentity();
  const isManager = MANAGER_ROLES.includes(
    (identity?.role as Role) ?? "KARDIST",
  );

  return (
    <ResourceContextProvider value="stock-locations">
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <EditBase
          id={id}
          mutationMode="pessimistic"
          transform={sanitize}
          redirect={false}
        >
          <DetailShell isManager={isManager} />
        </EditBase>
      </div>
    </ResourceContextProvider>
  );
}

function DetailShell({ isManager }: { isManager: boolean }) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { record, isLoading } = useEditContext();
  const [tab, setTab] = useState<TabKey>("general");
  const [opsOpen, setOpsOpen] = useState(false);

  if (isLoading || !record) {
    return <div className="h-64 rounded-lg bg-muted animate-pulse" />;
  }

  const active = record.isActive === true;

  const tabs: { key: TabKey; label: string; icon: typeof Boxes }[] = [
    { key: "general", label: "stockLocations.tabs.general", icon: SlidersHorizontal },
    { key: "productos", label: "stockLocations.tabs.products", icon: Boxes },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8"
            onClick={() => navigate("/stock-locations")}
            aria-label={translate("shared.actions.back", { _: "Back" })}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">
                {record.name as string}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  active
                    ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                    : "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {active ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                {translate(
                  active ? "stockLocations.status.active" : "stockLocations.status.inactive",
                  { _: active ? "Activo" : "Inactivo" },
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {translate("stockLocations.detail.subtitle", {
                _: "Detalle y configuración del almacén",
              })}
            </p>
          </div>
        </div>

        {/* Operaciones — opens the In/Out/Transfer wizard */}
        <Button type="button" variant="outline" onClick={() => setOpsOpen(true)}>
          <Settings2 className="mr-2 h-4 w-4" />
          {translate("stockLocations.actions.operations", { _: "Operaciones" })}
        </Button>
      </div>

      <CreateOperationWizard
        locationId={record.id as string}
        open={opsOpen}
        onOpenChange={setOpsOpen}
      />

      {/* Tab strip */}
      <div
        role="tablist"
        className="mb-6 flex gap-1 border-b border-border"
      >
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {translate(label)}
            </button>
          );
        })}
      </div>

      {tab === "general" && (
        <SimpleForm
          toolbar={<SaveToolbar />}
          className="w-full max-w-none p-0 gap-6"
        >
          <StockLocationFormFields isManager={isManager} />
        </SimpleForm>
      )}

      {tab === "productos" && (
        <StockLocationProductsTab locationId={record.id as string} />
      )}
    </>
  );
}

function SaveToolbar() {
  const translate = useTranslate();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t pt-4 mt-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/stock-locations")}
      >
        {translate("shared.actions.cancel", { _: "Cancel" })}
      </Button>
      <SaveButton
        label={translate("stockLocations.actions.save_changes", {
          _: "Guardar cambios",
        })}
      />
    </div>
  );
}

function SaveButton({ label }: { label: string }) {
  const form = useFormContext();
  const saveContext = useSaveContext();
  const { isSubmitting, isValidating } = useFormState();
  const disabled = isSubmitting || isValidating;

  const handleClick = async () => {
    await form.handleSubmit(async (values) => {
      await saveContext?.save?.(values);
    })();
  };

  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(disabled && "opacity-50 cursor-not-allowed")}
    >
      {isSubmitting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
