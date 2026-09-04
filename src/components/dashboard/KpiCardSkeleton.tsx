/**
 * Placeholder while GET /dashboard/stats is in flight. Same geometry as
 * KpiCard so the grid does not reflow when the figures land.
 *
 * A separate component rather than a loading prop on KpiCard: AnimatedNumber
 * restarts its count-up on every change of `value`, so feeding the card a
 * placeholder and then the real figure would animate twice — the first time
 * towards a number nobody asked for.
 */
export default function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 shadow-card bg-card">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="h-8 w-32 mt-3 rounded bg-muted animate-pulse" />
      <div className="h-4 w-24 mt-2 rounded bg-muted animate-pulse" />
    </div>
  );
}
