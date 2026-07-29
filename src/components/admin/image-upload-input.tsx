import { useRef, useState } from "react";
import type { InputProps } from "ra-core";
import {
  useInput,
  useResourceContext,
  FieldTitle,
  useNotify,
  useTranslate,
} from "ra-core";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_IMAGE_LABEL,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  uploadImage,
} from "@/lib/uploads";
import { cn } from "@/lib/utils";

export type ImageUploadInputProps = InputProps & {
  className?: string;
  /**
   * Recommended pixel dimensions, e.g. "1200 x 800". Shown in the dropzone
   * hint next to the size cap. Omit to show only the cap.
   */
  recommendedSize?: string;
};

/**
 * Uploads an image to the backend and stores the returned URL in the field.
 * The form value is the URL string (not the file), so it round-trips through
 * the JSON data provider unchanged.
 *
 * Empty state is a click-or-drop zone; once set, it shows the image with
 * replace/remove actions. Accepted formats and the size cap are derived from
 * `@/lib/uploads` so the limits are stated in exactly one place.
 */
export const ImageUploadInput = (props: ImageUploadInputProps) => {
  const resource = useResourceContext(props);
  const { label, source, className, helperText, recommendedSize } = props;
  const { id, field, isRequired } = useInput(props);
  const notify = useNotify();
  const translate = useTranslate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const value = field.value as string | null | undefined;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      notify("shared.upload.invalid_type", { type: "error" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      notify("shared.upload.too_large", {
        type: "error",
        messageArgs: { max: MAX_IMAGE_SIZE_LABEL },
      });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      field.onChange(url);
    } catch {
      notify("shared.upload.failed", { type: "error" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openPicker = () => inputRef.current?.click();

  const hint = recommendedSize
    ? translate("shared.upload.dropzone_hint", {
        size: recommendedSize,
        max: MAX_IMAGE_SIZE_LABEL,
        _: `Recomendado: ${recommendedSize} px (máx. ${MAX_IMAGE_SIZE_LABEL})`,
      })
    : translate("shared.upload.dropzone_hint_no_size", {
        max: MAX_IMAGE_SIZE_LABEL,
        _: `Máx. ${MAX_IMAGE_SIZE_LABEL}`,
      });

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      {/* `sr-only` rather than `hidden` so the id lands on a real focusable
          element: clicking the label opens the picker and the field is tabbable. */}
      <FormControl>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </FormControl>

      {value ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <img
            src={value}
            alt=""
            className="h-32 w-full rounded-md border border-border object-cover"
          />
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={openPicker}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {translate("shared.upload.replace", { _: "Subir nueva imagen" })}
            </Button>
            <p className="text-xs text-muted-foreground">
              {translate("shared.upload.formats", {
                formats: ACCEPTED_IMAGE_LABEL,
                _: `Formato: ${ACCEPTED_IMAGE_LABEL}`,
              })}
            </p>
            <p className="text-xs text-muted-foreground">{hint}</p>
            {!uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-destructive hover:bg-destructive/10"
                onClick={() => field.onChange(null)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {translate("shared.upload.remove_image", {
                  _: "Quitar imagen",
                })}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            "hover:border-primary hover:bg-primary/5",
            dragging && "border-primary bg-primary/5",
          )}
        >
          <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
          </span>
          <p className="text-sm font-medium text-foreground">
            {translate("shared.upload.dropzone_title", {
              _: "Arrastra una imagen aquí",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {translate("shared.upload.dropzone_cta", {
              _: "o haz clic para seleccionar",
            })}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      )}

      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};
