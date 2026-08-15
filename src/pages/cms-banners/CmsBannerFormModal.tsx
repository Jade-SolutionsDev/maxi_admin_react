import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { required, useTranslate } from "ra-core";
import { useFormContext, useWatch } from "react-hook-form";
import type { ReactNode } from "react";
import {
  ArrowUpDown,
  Captions,
  GalleryHorizontalEnd,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

import {
  BooleanInput,
  FormSection,
  ImageUploadInput,
  NumberInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";

interface CmsBannerFormModalProps {
  mode: "create" | "edit";
}

type BannerVariant = "desktop" | "tablet" | "mobile";

const asAsset = (value: unknown) => {
  const asset = (value ?? {}) as {
    src?: string;
    width?: number;
    height?: number;
  };
  return { src: asset.src, width: asset.width, height: asset.height };
};

// Nested variant objects round-trip as-is; server-managed fields are dropped.
const sanitizeCmsBanner = (data: Record<string, unknown>) => ({
  alt: data.alt,
  desktop: asAsset(data.desktop),
  tablet: asAsset(data.tablet),
  mobile: asAsset(data.mobile),
  sortOrder: data.sortOrder ?? 0,
  isActive: data.isActive ?? true,
});

export default function CmsBannerFormModal({ mode }: CmsBannerFormModalProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();

  const isEdit = mode === "edit";
  const name = translate("resources.cms-banners.name", { _: "Banner" });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/cms-banners")}
      icon={<GalleryHorizontalEnd className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        isEdit
          ? "cms-banners.form.edit_subtitle"
          : "cms-banners.form.create_subtitle",
        { _: "" },
      )}
      callout={{
        title: translate(
          isEdit ? "shared.form.note_title_edit" : "shared.form.note_title",
        ),
        description: translate(
          isEdit ? "shared.form.edit_note" : "cms-banners.form.note",
        ),
      }}
      transform={sanitizeCmsBanner}
    >
      <CmsBannerFormFields mode={mode} />
    </ResourceFormModal>
  );
}

/**
 * ImageUploadInput stores only the URL, but the storefront builds next/image
 * srcsets from the intrinsic dimensions. On every src change the natural size
 * is read off the loaded image and written into the hidden width/height
 * fields, so editors never type dimensions by hand.
 */
function BannerVariantField({
  variant,
  icon,
  recommendedSize,
}: {
  variant: BannerVariant;
  icon: ReactNode;
  recommendedSize: string;
}) {
  const translate = useTranslate();
  const { setValue } = useFormContext();
  const src = useWatch({ name: `${variant}.src` }) as string | undefined;
  const width = useWatch({ name: `${variant}.width` }) as number | undefined;
  const height = useWatch({ name: `${variant}.height` }) as number | undefined;

  useEffect(() => {
    if (!src) {
      setValue(`${variant}.width`, undefined);
      setValue(`${variant}.height`, undefined);
      return;
    }
    const image = new Image();
    image.onload = () => {
      setValue(`${variant}.width`, image.naturalWidth, { shouldDirty: true });
      setValue(`${variant}.height`, image.naturalHeight, {
        shouldDirty: true,
      });
    };
    image.src = src;
  }, [src, setValue, variant]);

  return (
    <div className="rounded-xl border border-border p-4">
      <ImageUploadInput
        source={`${variant}.src`}
        uploadPrefix="cms"
        validate={required()}
        label={
          <span className="flex items-center gap-2">
            {icon}
            {translate(`cms-banners.form.variants.${variant}`)}
          </span>
        }
        recommendedSize={recommendedSize}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {width && height
          ? translate("cms-banners.form.dimensions", {
              width,
              height,
              _: `${width} x ${height} px`,
            })
          : translate("cms-banners.form.dimensions_pending", { _: "" })}
      </p>
    </div>
  );
}

function CmsBannerFormFields({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const isEdit = mode === "edit";

  return (
    <>
      <TextInput
        source="alt"
        label={translate("list.fields.alt")}
        validate={required()}
        icon={<Captions />}
        placeholder={translate("cms-banners.form.placeholders.alt", { _: "" })}
        helperText="cms-banners.form.hints.alt"
      />

      <FormSection
        icon={<ImageIcon />}
        title={translate("cms-banners.form.images_title", { _: "Imágenes" })}
        subtitle={translate("cms-banners.form.images_hint", { _: "" })}
        className="border-t pt-5"
      >
        <div className="grid gap-4">
          <BannerVariantField
            variant="desktop"
            icon={<Monitor className="h-4 w-4 text-primary" />}
            recommendedSize="1921 x 393"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <BannerVariantField
              variant="tablet"
              icon={<Tablet className="h-4 w-4 text-primary" />}
              recommendedSize="745 x 1048"
            />
            <BannerVariantField
              variant="mobile"
              icon={<Smartphone className="h-4 w-4 text-primary" />}
              recommendedSize="1081 x 1609"
            />
          </div>
        </div>
      </FormSection>

      {isEdit && (
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <NumberInput
            source="sortOrder"
            label={translate("list.fields.sortOrder")}
            defaultValue={0}
            icon={<ArrowUpDown />}
            helperText="cms-banners.form.hints.sortOrder"
          />
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText="cms-banners.form.hints.isActive"
          />
        </div>
      )}
    </>
  );
}
