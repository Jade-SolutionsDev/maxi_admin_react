import type { useTranslate } from "ra-core";

type Translate = ReturnType<typeof useTranslate>;

/**
 * Currency for a KPI headline, to the exact cent.
 *
 * `revenue` is SUM(orders.total) over a numeric(12,2) column, so two decimals
 * are the whole figure, not an approximation of it — rounding the headline to
 * whole dollars made the panel disagree with the API it is reporting. The
 * ".00" jump this used to avoid is gone: AnimatedNumber now counts up at the
 * same precision as the string it lands on.
 */
export const moneyKpi = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export interface Trend {
  label: string;
  up: boolean;
}

/**
 * Percentage change against the previous window.
 *
 * A percentage against a zero baseline is either Infinity or an invention, so a
 * first-ever sale says "Nuevo" and a pair of zeroes says "Sin cambios" — both
 * in the positive tone, because KpiCard only has up/down and painting "no
 * orders at all" in red reads as an alarm about something that did not happen.
 */
export function percentTrend(
  { current, previous }: { current: number; previous: number },
  translate: Translate,
): Trend {
  if (previous === 0) {
    return current > 0
      ? { label: translate("dashboard.trend.new", { _: "Nuevo" }), up: true }
      : {
          label: translate("dashboard.trend.flat", { _: "Sin cambios" }),
          up: true,
        };
  }
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  return { label: `${up ? "+" : "-"}${Math.abs(pct).toFixed(1)}%`, up };
}

/** Absolute delta, for the Productos card: "+24 nuevos", as the design has it. */
export function countTrend(
  { current, previous }: { current: number; previous: number },
  translate: Translate,
): Trend {
  return {
    label: translate("dashboard.trend.newCount", {
      smart_count: current,
      _: "+%{smart_count} nuevos",
    }),
    up: current >= previous,
  };
}
