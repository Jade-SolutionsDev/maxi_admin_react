import { useState } from "react";
import { useGetList, useInput, useTranslate, type RaRecord } from "ra-core";
import { ChevronRight } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type CoverageType = "province" | "municipality";
export interface CoverageItem {
  coverageType: CoverageType;
  provinceId: string;
  municipalityId?: string | null;
}

const LIST_PARAMS = {
  pagination: { page: 1, perPage: 200 },
  sort: { field: "name", order: "ASC" as const },
};

/**
 * Form input bound to `coverage` (CoverageItem[]). A province card is checked
 * when the whole province is served; "Municipios →" opens a drill-in to serve
 * specific municipalities instead. Whole-province and per-municipality coverage
 * are mutually exclusive per province.
 */
const validateCoverage = (value: unknown) =>
  Array.isArray(value) && value.length > 0
    ? undefined
    : "stockLocations.coverage.required";

export function CoverageSelector({ source = "coverage" }: { source?: string }) {
  const translate = useTranslate();
  const { field, fieldState } = useInput({ source, validate: validateCoverage });
  const value: CoverageItem[] = Array.isArray(field.value) ? field.value : [];

  const { data: provinces = [], isPending } = useGetList("provinces", LIST_PARAMS);
  const [openProvince, setOpenProvince] = useState<RaRecord | null>(null);

  const provinceState = (provinceId: string) => {
    const rows = value.filter((c) => c.provinceId === provinceId);
    const whole = rows.some((c) => c.coverageType === "province");
    const municipalityIds = rows
      .filter((c) => c.coverageType === "municipality")
      .map((c) => c.municipalityId as string);
    return { covered: rows.length > 0, whole, municipalityIds };
  };

  const setWholeProvince = (provinceId: string) => {
    field.onChange([
      ...value.filter((c) => c.provinceId !== provinceId),
      { coverageType: "province", provinceId, municipalityId: null },
    ]);
  };

  const clearProvince = (provinceId: string) => {
    field.onChange(value.filter((c) => c.provinceId !== provinceId));
  };

  const toggleMunicipality = (provinceId: string, municipalityId: string) => {
    const withoutWhole = value.filter(
      (c) => !(c.provinceId === provinceId && c.coverageType === "province"),
    );
    const exists = withoutWhole.some(
      (c) => c.municipalityId === municipalityId,
    );
    field.onChange(
      exists
        ? withoutWhole.filter((c) => c.municipalityId !== municipalityId)
        : [
            ...withoutWhole,
            { coverageType: "municipality", provinceId, municipalityId },
          ],
    );
  };

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fieldState.error && (
        <p className="text-sm text-destructive">
          {translate(
            (fieldState.error.message as string) ??
              "stockLocations.coverage.required",
            { _: "Selecciona al menos una zona de compra" },
          )}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {provinces.map((province) => {
          const pid = province.id as string;
          const { covered, whole, municipalityIds } = provinceState(pid);
          return (
            <div
              key={province.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors",
                covered ? "border-primary/40 bg-primary/5" : "border-border",
              )}
            >
              <label className="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer">
                <Checkbox
                  className="shrink-0"
                  checked={covered}
                  onCheckedChange={(v) =>
                    v ? setWholeProvince(pid) : clearProvince(pid)
                  }
                  aria-label={province.name as string}
                />
                <div className="flex min-w-0 flex-col">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate text-sm font-medium leading-tight text-foreground">
                        {province.name as string}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{province.name as string}</TooltipContent>
                  </Tooltip>
                  {covered && !whole && (
                    <span className="text-xs text-primary">
                      {translate("stockLocations.coverage.n_municipalities", {
                        smart_count: municipalityIds.length,
                        _: "%{smart_count} municipios",
                      })}
                    </span>
                  )}
                </div>
              </label>
              <button
                type="button"
                onClick={() => setOpenProvince(province)}
                className="flex shrink-0 items-center gap-0.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {translate("stockLocations.coverage.municipalities", {
                  _: "Municipios",
                })}
                <ChevronRight size={13} />
              </button>
            </div>
          );
        })}
      </div>

      <Sheet
        open={openProvince != null}
        onOpenChange={(o) => !o && setOpenProvince(null)}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {openProvince && (
            <MunicipalityPicker
              province={openProvince}
              state={provinceState(openProvince.id as string)}
              onToggleWhole={(v) =>
                v
                  ? setWholeProvince(openProvince.id as string)
                  : clearProvince(openProvince.id as string)
              }
              onToggleMunicipality={(municipalityId) =>
                toggleMunicipality(openProvince.id as string, municipalityId)
              }
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MunicipalityPicker({
  province,
  state,
  onToggleWhole,
  onToggleMunicipality,
}: {
  province: RaRecord;
  state: { whole: boolean; municipalityIds: string[] };
  onToggleWhole: (v: boolean) => void;
  onToggleMunicipality: (municipalityId: string) => void;
}) {
  const translate = useTranslate();
  const { data: municipalities = [], isPending } = useGetList("municipalities", {
    ...LIST_PARAMS,
    filter: { provinceId: province.id },
  });

  return (
    <>
      <SheetHeader>
        <SheetTitle>{province.name as string}</SheetTitle>
        <SheetDescription>
          {translate("stockLocations.coverage.pick_hint", {
            _: "Selecciona los municipios habilitados o marca toda la provincia.",
          })}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-1 px-4 pb-6">
        <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 cursor-pointer">
          <Checkbox
            checked={state.whole}
            onCheckedChange={(v) => onToggleWhole(v === true)}
          />
          <span className="text-sm font-medium">
            {translate("stockLocations.coverage.whole_province", {
              _: "Toda la provincia",
            })}
          </span>
        </label>

        {isPending ? (
          <div className="space-y-1 pt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          municipalities.map((m) => {
            const checked =
              !state.whole && state.municipalityIds.includes(m.id as string);
            return (
              <label
                key={m.id}
                className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-muted"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleMunicipality(m.id as string)}
                />
                <span className="text-sm">{m.name as string}</span>
              </label>
            );
          })
        )}
      </div>
    </>
  );
}
