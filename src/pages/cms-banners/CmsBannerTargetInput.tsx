import { useEffect, useRef } from "react";
import { required, useRecordContext, useTranslate } from "ra-core";
import { useFormContext, useWatch } from "react-hook-form";
import { AlertTriangle, Link2, Tags } from "lucide-react";

import {
  AutocompleteInput,
  FormSection,
  ReferenceInput,
  SelectInput,
} from "@/components/admin";
import type { CmsBannerTarget, CmsBannerTargetType } from "./cms-banner-target";
import {
  CMS_BANNER_TARGET_CHOICES,
  CMS_BANNER_TARGET_RESOURCES,
} from "./cms-banner-target";

type BannerRecord = {
  id: string;
  target?: CmsBannerTarget | null;
};

/**
 * Optional polymorphic destination built from the same React Admin reference
 * inputs used by the catalog forms. Changing the discriminator clears the old
 * id so a product UUID can never be submitted as a category UUID.
 */
export function CmsBannerTargetInput() {
  const translate = useTranslate();
  const { setValue } = useFormContext();
  const record = useRecordContext<BannerRecord>();
  const targetType = useWatch({ name: "target.type" }) as
    | CmsBannerTargetType
    | ""
    | undefined;
  const targetId = useWatch({ name: "target.id" }) as string | undefined;
  const previousType = useRef<CmsBannerTargetType | "" | undefined>(undefined);

  useEffect(() => {
    if (
      previousType.current !== undefined &&
      previousType.current !== targetType
    ) {
      setValue("target.id", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    previousType.current = targetType;
  }, [setValue, targetType]);

  const currentTarget = record?.target;
  const unavailableCurrentTarget =
    currentTarget &&
    currentTarget.id === targetId &&
    currentTarget.isAvailable === false
      ? currentTarget
      : null;

  return (
    <FormSection
      icon={<Link2 />}
      title={translate("cms-banners.target.section_title")}
      subtitle={translate("cms-banners.target.section_hint")}
      className="border-t pt-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectInput
          source="target.type"
          label="cms-banners.target.type_label"
          choices={CMS_BANNER_TARGET_CHOICES}
          emptyText="cms-banners.target.none"
          icon={<Tags />}
          helperText="cms-banners.target.type_hint"
        />

        {targetType ? (
          <ReferenceInput
            key={targetType}
            source="target.id"
            reference={CMS_BANNER_TARGET_RESOURCES[targetType]}
          >
            <AutocompleteInput
              optionText="name"
              label="cms-banners.target.destination_label"
              validate={required()}
              placeholder={translate("cms-banners.target.search_placeholder")}
              helperText="cms-banners.target.destination_hint"
              icon={<Link2 />}
              modal
            />
          </ReferenceInput>
        ) : (
          <div className="flex min-h-20 items-center rounded-lg border border-dashed px-4 text-sm text-muted-foreground">
            {translate("cms-banners.target.none_hint")}
          </div>
        )}
      </div>

      {unavailableCurrentTarget ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {translate("cms-banners.target.unavailable_edit_hint", {
              name: unavailableCurrentTarget.name ?? unavailableCurrentTarget.id,
            })}
          </span>
        </div>
      ) : null}
    </FormSection>
  );
}
