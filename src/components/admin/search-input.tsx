import { useCallback } from "react";
import { useTranslate } from "ra-core";
import { useWatch, useFormContext } from "react-hook-form";
import { Search, X } from "lucide-react";
import type { TextInputProps } from "@/components/admin/text-input";
import { TextInput } from "@/components/admin/text-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Text input with a search icon, designed for filter forms without a label.
 *
 * It automatically uses the 'q' source for full-text search by default.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/searchinput/ SearchInput documentation}
 *
 * @example
 * import { List, DataTable, SearchInput } from '@/components/admin';
 *
 * const postListFilters = [
 *   <SearchInput source="q" alwaysOn />,
 * ];
 *
 * const PostList = () => (
 *   <List filters={postListFilters}>
 *     <DataTable>
 *       <DataTable.Col source="title" />
 *       <DataTable.Col source="author" />
 *       <DataTable.Col source="published_at" />
 *     </DataTable>
 *   </List>
 * );
 */
export const SearchInput = (inProps: SearchInputProps) => {
  const { label, className, disableClearable, source = "q", ...rest } = inProps;

  const translate = useTranslate();
  const { setValue } = useFormContext();
  const fieldValue = useWatch({ name: source });
  const hasValue = fieldValue && fieldValue !== "";

  const handleClear = useCallback(() => {
    setValue(source, "", { shouldDirty: true });
  }, [setValue, source]);

  if (label) {
    throw new Error(
      "<SearchInput> isn't designed to be used with a label prop. Use <TextInput> if you need a label.",
    );
  }

  const showClearButton = !disableClearable && hasValue;

  return (
    <div className="flex flex-grow relative mt-auto">
      <TextInput
        source={source}
        label={false}
        helperText={false}
        placeholder={translate("ra.action.search")}
        className={cn("flex-grow", className)}
        inputClassName={cn("pr-8", showClearButton ? "pr-20" : "pr-8")}
        {...rest}
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      {showClearButton && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          /**
           * 32 px, no 24: el icono que se ve mide 14 y la gente apunta ahí. Con
           * el objetivo justo en el mínimo, un clic a dos píxeles del borde se
           * perdía — «la mayoría de los intentos los ignora», decía QA.
           */
          className="absolute right-7 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full p-0 text-muted-foreground"
          aria-label={translate("ra.action.clear_search")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export type SearchInputProps = TextInputProps & {
  disableClearable?: boolean;
};
