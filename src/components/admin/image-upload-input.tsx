import { useRef, useState } from "react";
import type { InputProps } from "ra-core";
import {
  useInput,
  useResourceContext,
  FieldTitle,
  useNotify,
  useTranslate,
} from "ra-core";
import { ImageOff, Loader2, Upload, X } from "lucide-react";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadImage,
} from "@/lib/uploads";

export type ImageUploadInputProps = InputProps & {
  className?: string;
};

/**
 * Uploads an image to the backend and stores the returned URL in the field.
 * The form value is the URL string (not the file), so it round-trips through
 * the JSON data provider unchanged.
 */
export const ImageUploadInput = (props: ImageUploadInputProps) => {
  const resource = useResourceContext(props);
  const { label, source, className, helperText } = props;
  const { id, field, isRequired } = useInput(props);
  const notify = useNotify();
  const translate = useTranslate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const value = field.value as string | null | undefined;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      notify("shared.upload.invalid_type", { type: "error" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      notify("shared.upload.too_large", { type: "error" });
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
      <FormControl>
        <div className="flex items-center gap-3">
          <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
            {value ? (
              <img
                src={value}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {translate("shared.upload.choose", { _: "Upload image" })}
            </Button>
            {value && !uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => field.onChange(null)}
              >
                <X className="mr-2 h-4 w-4" />
                {translate("shared.upload.remove", { _: "Remove" })}
              </Button>
            )}
          </div>
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};
