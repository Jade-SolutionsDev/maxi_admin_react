/**
 * Store texts (info pages and home notices) as the API serves them to the
 * backoffice: `title`/`content` are the DRAFT, `published` is what the store
 * shows. Kept free of app imports so the node test runner can load it.
 */
export type CmsTextPublicationStatus =
  | "unpublished"
  | "published"
  | "pending-changes";

/** Mirror of the API's CmsPageVersionResponseDto. */
export interface CmsTextVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  publishedAt: string;
  publishedBy: string;
}

/** Mirror of the API's CmsPageResponseDto. */
export interface CmsText {
  id: string;
  kind: "page" | "home-notice";
  slug: string;
  title: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  draftUpdatedAt: string | null;
  draftUpdatedBy: string | null;
  publicationStatus: CmsTextPublicationStatus;
  published: CmsTextVersion | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * The version the store showed at a given moment: the latest one published
 * at or before it. Null when the text had not been published yet.
 */
export const versionInForceAt = (
  versions: CmsTextVersion[],
  at: Date,
): CmsTextVersion | null =>
  versions
    .filter((version) => new Date(version.publishedAt) <= at)
    .sort((a, b) => b.version - a.version)[0] ?? null;

const pad = (value: number) => String(value).padStart(2, "0");

/** ISO instant → value for an `<input type="datetime-local">`, in local time. */
export const toDateTimeLocal = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** `datetime-local` value (local time) → ISO instant; empty → null. */
export const fromDateTimeLocal = (value: string | null | undefined) =>
  value ? new Date(value).toISOString() : null;

export type NoticeScheduleState = "scheduled" | "live" | "ended";

/** Same window the API applies: from `startsAt` (inclusive) to `endsAt`. */
export const noticeScheduleState = (
  notice: Pick<CmsText, "startsAt" | "endsAt">,
  now: Date,
): NoticeScheduleState => {
  if (notice.startsAt && new Date(notice.startsAt) > now) return "scheduled";
  if (notice.endsAt && new Date(notice.endsAt) <= now) return "ended";
  return "live";
};
