import { useState, type ReactNode } from "react";
import { useGetList, useGetMany, useTranslate } from "ra-core";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";

import { FormSection } from "@/components/admin";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { moveItem } from "./home-layout";

interface FeaturedPickerProps {
  resource: "products" | "departments";
  ids: string[];
  onChange: (ids: string[]) => void;
  max: number;
  icon: ReactNode;
  title: string;
  hint: string;
  addLabel: string;
  disabled: boolean;
}

type NamedRecord = { id: string | number; name?: string };

export function FeaturedPicker({
  resource,
  ids,
  onChange,
  max,
  icon,
  title,
  hint,
  addLabel,
  disabled,
}: FeaturedPickerProps) {
  const translate = useTranslate();
  const { data: selected } = useGetMany<NamedRecord>(
    resource,
    { ids },
    { enabled: ids.length > 0 },
  );
  const nameOf = (id: string) =>
    selected?.find((record) => String(record.id) === id)?.name ??
    translate("cms-home.featured.unknown");
  const isFull = ids.length >= max;

  return (
    <FormSection icon={icon} title={title} subtitle={hint}>
      {ids.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          {translate("cms-home.featured.empty")}
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {ids.map((id, index) => {
            const name = nameOf(id);
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <span className="w-6 text-center text-sm tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {name}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={disabled || index === 0}
                    aria-label={translate("cms-home.actions.move_up", { name })}
                    onClick={() => onChange(moveItem(ids, index, -1))}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={disabled || index === ids.length - 1}
                    aria-label={translate("cms-home.actions.move_down", {
                      name,
                    })}
                    onClick={() => onChange(moveItem(ids, index, 1))}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    disabled={disabled}
                    aria-label={translate("cms-home.actions.remove", { name })}
                    onClick={() => onChange(ids.filter((item) => item !== id))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {!disabled &&
        (isFull ? (
          <p className="text-xs text-muted-foreground">
            {translate("cms-home.featured.limit", { max })}
          </p>
        ) : (
          <AddFeaturedButton
            resource={resource}
            excludeIds={ids}
            label={addLabel}
            onAdd={(id) => onChange([...ids, id])}
          />
        ))}
    </FormSection>
  );
}

function AddFeaturedButton({
  resource,
  excludeIds,
  label,
  onAdd,
}: {
  resource: FeaturedPickerProps["resource"];
  excludeIds: string[];
  label: string;
  onAdd: (id: string) => void;
}) {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { data, isLoading } = useGetList<NamedRecord>(
    resource,
    {
      filter: term ? { q: term } : {},
      pagination: { page: 1, perPage: 20 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: open },
  );
  const needle = term.trim().toLowerCase();
  const options = (data ?? []).filter(
    (record) =>
      !excludeIds.includes(String(record.id)) &&
      (!needle || (record.name ?? "").toLowerCase().includes(needle)),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="self-start">
          <Plus className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={term}
            onValueChange={setTerm}
            placeholder={translate("cms-home.featured.search")}
          />
          <CommandList>
            {!isLoading && options.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {translate("cms-home.featured.no_results")}
              </p>
            )}
            <CommandGroup>
              {options.map((record) => (
                <CommandItem
                  key={record.id}
                  value={String(record.id)}
                  onSelect={() => {
                    onAdd(String(record.id));
                    setOpen(false);
                    setTerm("");
                  }}
                >
                  <span className="truncate">{record.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
