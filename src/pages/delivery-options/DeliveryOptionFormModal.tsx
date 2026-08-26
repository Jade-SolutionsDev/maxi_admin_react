import { useNavigate, useParams } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import { AlignLeft, ArrowUpDown, Coins, Heading, Truck } from "lucide-react";

import {
  BooleanInput,
  NumberInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";
import { CoverageSelector } from "@/pages/stock-locations/CoverageSelector";
import { coverageToZones, zonesToCoverage } from "./deliveryZones";

interface DeliveryOptionFormModalProps {
  mode: "create" | "edit";
}

const sanitizeDeliveryOption = (data: Record<string, unknown>) => ({
  label: data.label,
  description: data.description ?? null,
  fee: Number(data.fee ?? 0),
  sortOrder: Number(data.sortOrder ?? 0),
  enabled: data.enabled ?? false,
  zones: coverageToZones(
    (data.coverage ?? []) as Parameters<typeof coverageToZones>[0],
  ),
});

export default function DeliveryOptionFormModal({
  mode,
}: DeliveryOptionFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.delivery-options.name", {
    _: "Delivery option",
  });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/delivery-options")}
      icon={<Truck className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate("delivery-options.form.note"),
      }}
      transform={sanitizeDeliveryOption}
      // The API stores zones; the picker speaks coverage.
      defaultValues={(record) => ({
        fee: 0,
        sortOrder: 0,
        enabled: false,
        ...record,
        coverage: zonesToCoverage(
          (record?.zones ?? []) as Parameters<typeof zonesToCoverage>[0],
        ),
      })}
    >
      <DeliveryOptionFormFields />
    </ResourceFormModal>
  );
}

function DeliveryOptionFormFields() {
  const translate = useTranslate();

  return (
    <>
      <TextInput
        source="label"
        label={translate("delivery-options.fields.label", { _: "Name" })}
        validate={required()}
        icon={<Heading />}
      />

      <TextInput
        source="description"
        label={translate("delivery-options.fields.description", {
          _: "Description",
        })}
        multiline
        icon={<AlignLeft />}
      />

      <NumberInput
        source="fee"
        label={translate("delivery-options.fields.fee", { _: "Fee" })}
        min={0}
        step={0.01}
        icon={<Coins />}
        helperText="delivery-options.form.hints.fee"
      />

      <NumberInput
        source="sortOrder"
        label={translate("list.fields.sortOrder", { _: "Order" })}
        min={0}
        icon={<ArrowUpDown />}
      />

      <BooleanInput
        source="enabled"
        label={translate("delivery-options.fields.enabled", { _: "Enabled" })}
        helperText="delivery-options.form.hints.enabled"
      />

      <CoverageSelector source="coverage" required={false} />
    </>
  );
}
