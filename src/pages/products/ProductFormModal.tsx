import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CreateBase,
  EditBase,
  required,
  useEditContext,
  useSaveContext,
  useTranslate,
} from "ra-core";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Loader2, Save } from "lucide-react";

import {
  AutocompleteInput,
  BooleanInput,
  ImageUploadInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
} from "@/components/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductFormModalProps {
  mode: "create" | "edit";
}

const MEASURE_UNITS = [
  { id: "unidad", name: "Unidad" },
  { id: "kg", name: "kg" },
  { id: "g", name: "g" },
  { id: "L", name: "L" },
  { id: "ml", name: "ml" },
];

// The form carries server-managed fields plus `departmentId`, which is a UI-only
// cascade filter (the backend derives the department from the category). Send
// only what the DTO accepts, converting empty strings to `undefined` so optional
// validators don't reject them.
const sanitizeProduct = (data: Record<string, unknown>) => ({
  categoryId: data.categoryId,
  sku: (data.sku as string) || undefined,
  name: data.name,
  description: (data.description as string) || undefined,
  imageUrl: data.imageUrl,
  format: (data.format as string) || undefined,
  expiryDate: (data.expiryDate as string) || undefined,
  measureUnit: (data.measureUnit as string) || undefined,
  basePrice: data.basePrice,
  discount: data.discount ?? 0,
  featured: data.featured ?? false,
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export default function ProductFormModal({ mode }: ProductFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const title = translate(
    isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
    { name: translate("resources.products.name", { _: "Product" }) },
  );

  const onClose = () => navigate("/products");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex flex-col w-full sm:max-w-xl h-[85vh] sm:h-auto sm:max-h-[85vh] p-0 gap-0 overflow-hidden">
        {isEdit ? (
          <EditBase id={id} mutationMode="pessimistic" transform={sanitizeProduct}>
            <ModalFormShell title={title} onClose={onClose} mode={mode} />
          </EditBase>
        ) : (
          <CreateBase
            redirect="list"
            mutationMode="pessimistic"
            transform={sanitizeProduct}
          >
            <ModalFormShell title={title} onClose={onClose} mode={mode} />
          </CreateBase>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ModalFormShellProps {
  title: string;
  onClose: () => void;
  mode: "create" | "edit";
}

function ModalFormShell({ title, onClose, mode }: ModalFormShellProps) {
  const translate = useTranslate();

  return (
    <>
      <DialogHeader className="shrink-0 px-6 py-4 border-b">
        <div className="space-y-1">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {translate("shared.actions.form_subtitle", {
              _: "Fill in the details below.",
            })}
          </DialogDescription>
        </div>
      </DialogHeader>

      <SimpleForm
        toolbar={<ModalFormToolbar onClose={onClose} />}
        className="flex-1 min-h-0 flex flex-col w-full max-w-none px-0 py-0 gap-0"
      >
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {mode === "edit" ? <EditLoading /> : <ProductFormFields />}
        </div>
      </SimpleForm>
    </>
  );
}

function EditLoading() {
  const editContext = useEditContext();
  const isLoading = editContext?.isLoading ?? false;

  return isLoading ? <FormSkeleton /> : <ProductFormFields />;
}

function ProductFormFields() {
  const translate = useTranslate();
  const { setValue } = useFormContext();
  // Department is a client-side filter for the category dropdown only; it is not
  // submitted (stripped by sanitizeProduct). On edit it arrives pre-filled from
  // the record — the API derives it from the category's parent department.
  const departmentId = useWatch({ name: "departmentId" });

  // When the user changes the department, clear the selected category (a category
  // from another department must not be submitted). The firstRun guard keeps the
  // record's category on the initial load.
  const prevDept = useRef<string | undefined>(undefined);
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      prevDept.current = departmentId;
      return;
    }
    if (prevDept.current !== departmentId) {
      prevDept.current = departmentId;
      setValue("categoryId", undefined);
    }
  }, [departmentId, setValue]);

  return (
    <>
      <ImageUploadInput
        source="imageUrl"
        label={translate("list.fields.image")}
        validate={required()}
      />
      <TextInput
        source="name"
        label={translate("list.fields.name")}
        validate={required()}
      />
      <TextInput
        source="description"
        label={translate("list.fields.description")}
        multiline
      />
      <ReferenceInput
        source="departmentId"
        reference="departments"
        label={translate("resources.departments.name")}
      >
        <AutocompleteInput validate={required()} />
      </ReferenceInput>
      <ReferenceInput
        source="categoryId"
        reference="categories"
        label={translate("resources.categories.name")}
        filter={departmentId ? { departmentId } : {}}
      >
        <SelectInput
          optionText="name"
          validate={required()}
          disabled={!departmentId}
          helperText={
            !departmentId
              ? translate("resources.products.select_department_first", {
                  _: "Selecciona un departamento primero",
                })
              : undefined
          }
        />
      </ReferenceInput>
      <TextInput source="format" label={translate("list.fields.format")} />
      <SelectInput
        source="measureUnit"
        label={translate("list.fields.measureUnit")}
        choices={MEASURE_UNITS}
        defaultValue="unidad"
        translateChoice={false}
      />
      <TextInput
        source="expiryDate"
        type="date"
        label={translate("list.fields.expiryDate")}
      />
      <NumberInput
        source="basePrice"
        label={translate("list.fields.basePrice")}
        step={0.01}
        min={0}
        validate={required()}
      />
      <NumberInput
        source="discount"
        label={translate("list.fields.discount")}
        min={0}
        max={100}
        defaultValue={0}
      />
      <NumberInput
        source="sortOrder"
        label={translate("list.fields.sortOrder")}
        defaultValue={0}
      />
      <BooleanInput
        source="featured"
        label={translate("list.fields.featured")}
        defaultValue={false}
      />
      <BooleanInput
        source="isActive"
        label={translate("list.fields.isActive")}
        defaultValue={true}
      />
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function ModalFormToolbar({ onClose }: { onClose: () => void }) {
  const translate = useTranslate();

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pt-4 pb-4 border-t",
      )}
    >
      <Button type="button" variant="outline" onClick={onClose}>
        {translate("shared.actions.cancel", { _: "Cancel" })}
      </Button>
      <SaveButton label={translate("shared.actions.save", { _: "Save" })} />
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
