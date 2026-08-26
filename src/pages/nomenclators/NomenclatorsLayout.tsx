import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ResourceContextProvider, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import {
  NOMENCLATOR_CATEGORIES,
  type NomenclatorCategoryId,
} from "./nomenclatorCategories";
import NomenclatorsList from "./NomenclatorsList";

export interface NomenclatorsOutletContext {
  category: NomenclatorCategoryId;
}

export function NomenclatorsLayout() {
  const translate = useTranslate();
  const [category, setCategory] = useState<NomenclatorCategoryId>(
    NOMENCLATOR_CATEGORIES[0].id,
  );

  return (
    <ResourceContextProvider value="nomenclators">
      <div
        role="tablist"
        aria-label={translate("resources.nomenclators.name_plural")}
        className="flex gap-1 overflow-x-auto border-b border-border px-4 pt-4"
      >
        {NOMENCLATOR_CATEGORIES.map(({ id, labelKey }) => {
          const active = category === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setCategory(id)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {translate(labelKey)}
            </button>
          );
        })}
      </div>
      <NomenclatorsList category={category} />
      <Outlet context={{ category } satisfies NomenclatorsOutletContext} />
    </ResourceContextProvider>
  );
}
