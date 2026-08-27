import { isValidElement, type ReactNode } from "react";
import { FieldTitle } from "ra-core";

interface FieldLabelProps {
  label?: ReactNode;
  source?: string;
  resource?: string;
  isRequired?: boolean;
}

/**
 * The text of a field's label, plus the required marker.
 *
 * `FieldTitle` only appends the marker when it builds the label itself, from a
 * string or from the source name. Hand it an element — which is what a label
 * with an icon inside is — and it renders the element and nothing else, so a
 * required field silently loses its asterisk. That is how the category and
 * department image fields ended up looking optional while the footer of the
 * same form promised that required ones are marked.
 *
 * The marker is emitted the same way `FieldTitle` emits it (`<span aria-hidden>`
 * with a leading space) because that is exactly what `FormLabel` paints red.
 */
export const FieldLabel = ({
  label,
  source,
  resource,
  isRequired,
}: FieldLabelProps) => {
  if (isValidElement(label)) {
    return (
      <>
        {label}
        {isRequired && <span aria-hidden="true"> *</span>}
      </>
    );
  }

  return (
    <FieldTitle
      label={label as string | undefined}
      source={source}
      resource={resource}
      isRequired={isRequired}
    />
  );
};
