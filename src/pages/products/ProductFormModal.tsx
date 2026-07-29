import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import { useFormContext, useWatch } from "react-hook-form";
import {
  AlignLeft,
  ArrowUpDown,
  Box,
  Building2,
  CalendarDays,
  DollarSign,
  Eye,
  Image as ImageIcon,
  Package,
  Percent,
  Ruler,
  Tag,
} from "lucide-react";

import {
  BooleanInput,
  FormSection,
  ImageUploadInput,
  NumberInput,
  ReferenceInput,
  ResourceFormModal,
  SelectInput,
  TextInput,
} from "@/components/admin";

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
  imageUrl: (data.imageUrl as string) || undefined,
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
  const name = translate("resources.products.name", { _: "Product" });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/products")}
      icon={<Package className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit ? "products.form.edit_subtitle" : "products.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "products.form.note",
        ),
      }}
      transform={sanitizeProduct}
    >
      <ProductFormFields mode={mode} />
    </ResourceFormModal>
  );
}

function ProductFormFields({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const { setValue } = useFormContext();
  const isEdit = mode === "edit";
  // Department is a client-side filter for the category dropdown only; it is not
  // submitted (stripped by sanitizeProduct). On edit it arrives pre-filled from
  // the record — the API derives it from the category's parent department.
  const departmentId = useWatch({ name: "departmentId" });

  // When the user changes the department, clear the selected category (a category
  // from another department must not be submitted). Only a change FROM a real
  // department counts: the initial `undefined → value` transition is the edit
  // record loading in asynchronously, and must keep the record's category.
  const prevDept = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevDept.current !== undefined && prevDept.current !== departmentId) {
      setValue("categoryId", undefined);
    }
    prevDept.current = departmentId;
  }, [departmentId, setValue]);

  return (
    <>
      <FormSection
        icon={<Package />}
        title={translate("products.form.sections.general", { _: "" })}
        subtitle={translate("products.form.sections.general_hint", { _: "" })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ReferenceInput
            source="departmentId"
            reference="departments"
            label="resources.departments.name"
            alwaysOn
          >
            <SelectInput
              validate={required()}
              optionText="name"
              label="resources.departments.name"
              icon={<Building2 />}
              helperText="products.form.hints.departmentId"
            />
          </ReferenceInput>
          <ReferenceInput
            source="categoryId"
            reference="categories"
            filter={departmentId ? { departmentId } : {}}
          >
            <SelectInput
              optionText="name"
              label={translate("resources.categories.name")}
              validate={required()}
              disabled={!departmentId}
              icon={<Tag />}
              helperText={
                !departmentId
                  ? translate("resources.products.select_department_first", {
                      _: "Selecciona un departamento primero",
                    })
                  : "products.form.hints.categoryId"
              }
            />
          </ReferenceInput>
        </div>
        <TextInput
          source="name"
          label={translate("list.fields.name")}
          validate={required()}
          icon={<Package />}
          helperText="products.form.hints.name"
        />
        <TextInput
          source="description"
          label={translate("list.fields.description")}
          multiline
          icon={<AlignLeft />}
        />
      </FormSection>

      <FormSection
        icon={<DollarSign />}
        title={translate("products.form.sections.pricing", { _: "" })}
        subtitle={translate("products.form.sections.pricing_hint", { _: "" })}
        className="border-t pt-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberInput
            source="basePrice"
            label={translate("list.fields.basePrice")}
            step={0.01}
            min={0}
            validate={required()}
            icon={<DollarSign />}
            helperText="products.form.hints.basePrice"
          />
          <NumberInput
            source="discount"
            label={translate("list.fields.discount")}
            min={0}
            max={100}
            defaultValue={0}
            icon={<Percent />}
            helperText="products.form.hints.discount"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            source="measureUnit"
            label={translate("list.fields.measureUnit")}
            choices={MEASURE_UNITS}
            defaultValue="unidad"
            translateChoice={false}
            icon={<Ruler />}
          />
          <TextInput
            source="format"
            label={translate("list.fields.format")}
            icon={<Box />}
          />
        </div>
        <TextInput
          source="expiryDate"
          type="date"
          label={translate("list.fields.expiryDate")}
          icon={<CalendarDays />}
        />
      </FormSection>

      <FormSection
        icon={<ImageIcon />}
        title={translate("products.form.images_title", { _: "Imagen" })}
        subtitle={translate("products.form.images_hint", { _: "" })}
        className="border-t pt-5"
      >
        {/* TEMPORARY: image is optional until the Render file server is configured
            — QA cannot upload yet. To restore: add back `validate={required()}`
            here and `@IsNotEmpty()` on the backend CreateProductDto.imageUrl. */}
        <div className="rounded-xl border border-border p-4 sm:max-w-sm">
          <ImageUploadInput
            source="imageUrl"
            label={translate("list.fields.image")}
            recommendedSize="800 x 800"
          />
        </div>
      </FormSection>

      {/* Order + visibility are edit-only; create uses the sanitizer's defaults. */}
      {isEdit && (
        <FormSection
          icon={<Eye />}
          title={translate("products.form.sections.visibility", { _: "" })}
          subtitle={translate("products.form.sections.visibility_hint", {
            _: "",
          })}
          className="border-t pt-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              source="sortOrder"
              label={translate("list.fields.sortOrder")}
              defaultValue={0}
              icon={<ArrowUpDown />}
              helperText="products.form.hints.sortOrder"
            />
            <div className="flex flex-col gap-4">
              <BooleanInput
                source="featured"
                label={translate("list.fields.featured")}
                defaultValue={false}
              />
              <BooleanInput
                source="isActive"
                label={translate("list.fields.status")}
                defaultValue={true}
              />
            </div>
          </div>
        </FormSection>
      )}
    </>
  );
}
