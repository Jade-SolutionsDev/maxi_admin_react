import { createElement } from "react";
import { useRecordContext } from "ra-core";
import { resolveServiceIcon } from "./service-icons";

/**
 * Renders the actual lucide glyph a service card will show on the storefront
 * (name kept as tooltip) — a bare icon name means nothing to content editors.
 */
export function ServiceIconField() {
  const record = useRecordContext();
  const name = (record?.icon as string | undefined) ?? "";
  if (!name) return null;

  return (
    <span
      title={name}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
    >
      {createElement(resolveServiceIcon(name), {
        className: "h-5 w-5",
        "aria-hidden": true,
      })}
      <span className="sr-only">{name}</span>
    </span>
  );
}
