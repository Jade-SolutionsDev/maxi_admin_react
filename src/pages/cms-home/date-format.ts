const DATE_TIME = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (iso: string): string =>
  DATE_TIME.format(new Date(iso));
