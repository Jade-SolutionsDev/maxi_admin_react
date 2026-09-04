/**
 * Window lengths the dashboard can ask for. These mirror the API's own
 * whitelist (`@IsIn([7, 30, 90])` in DashboardStatsQueryDto): an arbitrary
 * number in the query string is exactly what that whitelist exists to prevent,
 * so the UI must never be able to send one.
 */
export const WINDOW_OPTIONS = [7, 30, 90] as const;

export type WindowDays = (typeof WINDOW_OPTIONS)[number];

/** Matches the API's default, so the first render needs no query parameter. */
export const DEFAULT_WINDOW_DAYS: WindowDays = 30;
