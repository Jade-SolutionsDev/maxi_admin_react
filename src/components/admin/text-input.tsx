import { useRef, type ReactNode } from "react";
import type { InputProps } from "ra-core";
import { useInput, useResourceContext, useTranslate } from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { FormInputIcon } from "@/components/admin/form-input-icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";
import { FieldLabel } from "@/components/admin/field-label";

export type TextInputProps = InputProps & {
  multiline?: boolean;
  inputClassName?: string;
  /** Leading tinted icon tile inside the control. */
  icon?: ReactNode;
} & React.ComponentProps<"textarea"> &
  React.ComponentProps<"input">;

/** Los que traen un selector nativo detrás del icono. */
const TIPOS_CON_CALENDARIO = ["date", "datetime-local", "month", "time", "week"];

/**
 * Single-line or multiline text input for string values.
 *
 * Use `<TextInput>` for short text fields like titles or names. Set `multiline` to `true`
 * for longer content like descriptions or comments. Wraps shadcn's `<Input>` or `<Textarea>`
 * component depending on the `multiline` prop.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/textinput/ TextInput documentation}
 *
 * @example
 * import { Edit, SimpleForm, TextInput } from '@/components/admin';
 *
 * const PostEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <TextInput source="title" />
 *       <TextInput source="description" multiline rows={4} />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export const TextInput = (props: TextInputProps) => {
  const resource = useResourceContext(props);
  const translate = useTranslate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    label,
    source,
    multiline,
    className,
    inputClassName,
    helperText,
    icon,
    validate: _validateProp,
    format: _formatProp,
    ...rest
  } = props;
  const { id, field, isRequired } = useInput(props);

  const abreCalendario =
    !multiline && TIPOS_CON_CALENDARIO.includes(rest.type as string);

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldLabel
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      {/* `relative` must stay OUTSIDE FormControl: it is a Radix Slot, so it
          merges id/aria-invalid onto its immediate child — a wrapper here would
          steal them from the input and break label-focus + invalid styling. */}
      <div className="relative">
        {icon &&
          (abreCalendario ? (
            // Con un selector nativo detrás, el icono es el sitio donde la gente
            // pulsa para abrirlo. Decorativo aquí es una promesa incumplida: se
            // ve un calendario y no hace nada.
            <button
              type="button"
              aria-label={translate("shared.actions.open_picker", {
                _: "Abrir el selector",
              })}
              onClick={() => {
                inputRef.current?.focus();
                inputRef.current?.showPicker?.();
              }}
              className="absolute inset-y-px left-px z-10 flex w-9 items-center justify-center rounded-l-md bg-primary/10 text-primary transition-colors hover:bg-primary/20 [&_svg]:size-4"
            >
              {icon}
            </button>
          ) : (
            // Align to the first line of a growing textarea instead of centring.
            <FormInputIcon className={multiline ? "inset-y-px items-start pt-2.5" : undefined}>
              {icon}
            </FormInputIcon>
          ))}
        <FormControl>
          {multiline ? (
            <Textarea
              {...rest}
              {...field}
              className={cn(icon && "pl-12", inputClassName)}
            />
          ) : (
            <Input
              {...rest}
              {...field}
              // `field.ref` se sigue llamando: el spread lo trae y este lo pisa.
              ref={(el: HTMLInputElement | null) => {
                inputRef.current = el;
                const suyo = field.ref as
                  | ((node: HTMLInputElement | null) => void)
                  | { current: HTMLInputElement | null }
                  | undefined;
                if (typeof suyo === "function") suyo(el);
                else if (suyo) suyo.current = el;
              }}
              className={cn(icon && "pl-12", inputClassName)}
            />
          )}
        </FormControl>
      </div>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};
