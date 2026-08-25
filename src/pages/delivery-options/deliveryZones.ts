import type { CoverageItem } from "@/pages/stock-locations/CoverageSelector";

/** What the API stores: a zone with no municipality covers the whole province. */
export interface DeliveryZone {
  provinceId: string;
  municipalityId?: string | null;
}

export const zonesToCoverage = (zones: DeliveryZone[] = []): CoverageItem[] =>
  zones.map((zone) => ({
    coverageType: zone.municipalityId ? "municipality" : "province",
    provinceId: zone.provinceId,
    municipalityId: zone.municipalityId ?? null,
  }));

export const coverageToZones = (coverage: CoverageItem[] = []): DeliveryZone[] =>
  coverage.map((item) => ({
    provinceId: item.provinceId,
    municipalityId:
      item.coverageType === "municipality" ? (item.municipalityId ?? null) : null,
  }));
