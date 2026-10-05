import { useEffect, useState } from "react";
import { useDataProvider, useTranslate } from "ra-core";
import { CalendarSearch, ChevronDown, History } from "lucide-react";

import { FormSection } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/pages/cms-home/date-format";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { versionInForceAt, type CmsText, type CmsTextVersion } from "./cms-text";
import type { CmsTextScreen } from "./cms-text-screens";

interface VersionHistoryProps {
  screen: CmsTextScreen;
  record: CmsText;
}

/**
 * Every version the store has shown, with author and date. These are legal
 * texts: the date lookup answers "what did the terms say when this customer
 * bought?" by opening the version in force at that moment.
 */
export function VersionHistory({ screen, record }: VersionHistoryProps) {
  const translate = useTranslate();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const [versions, setVersions] = useState<CmsTextVersion[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [lookup, setLookup] = useState("");

  const publishedId = record.published?.id;
  useEffect(() => {
    let cancelled = false;
    dataProvider
      .getCmsTextVersions(screen.resource, record.id)
      .then(({ data }) => !cancelled && setVersions(data))
      .catch(() => !cancelled && setVersions([]));
    return () => {
      cancelled = true;
    };
  }, [dataProvider, screen.resource, record.id, publishedId]);

  const lookupDate = lookup ? new Date(lookup) : null;
  const inForce =
    versions && lookupDate ? versionInForceAt(versions, lookupDate) : null;

  const lookupResult = () => {
    if (!lookupDate) return null;
    if (!inForce) return translate("cms-texts.history.lookup_none");
    return translate("cms-texts.history.lookup_result", {
      date: formatDateTime(lookupDate.toISOString()),
      version: inForce.version,
      published: formatDateTime(inForce.publishedAt),
      name: inForce.publishedBy,
    });
  };

  return (
    <FormSection icon={<History />} title={translate("cms-texts.history.title")}>
      {!versions ? (
        <Skeleton className="h-20 w-full" />
      ) : versions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {translate("cms-texts.history.empty")}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cms-text-version-lookup"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <CalendarSearch aria-hidden className="h-4 w-4 text-primary" />
              {translate("cms-texts.history.lookup_label")}
            </label>
            <Input
              id="cms-text-version-lookup"
              type="datetime-local"
              value={lookup}
              onChange={(event) => {
                setLookup(event.target.value);
                const date = event.target.value
                  ? new Date(event.target.value)
                  : null;
                const match = date ? versionInForceAt(versions, date) : null;
                setOpenId(match?.id ?? null);
              }}
              aria-describedby="cms-text-version-lookup-result"
              className="sm:max-w-xs"
            />
            <p
              id="cms-text-version-lookup-result"
              role="status"
              className="text-sm text-muted-foreground"
            >
              {lookupResult() ?? translate("cms-texts.history.lookup_hint")}
            </p>
          </div>

          <ul className="flex flex-col divide-y divide-border rounded-lg border">
            {versions.map((version) => {
              const isOpen = openId === version.id;
              const isLive = version.id === publishedId;
              return (
                <li
                  key={version.id}
                  className={cn(inForce?.id === version.id && "bg-primary/5")}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`cms-text-version-${version.id}`}
                    onClick={() => setOpenId(isOpen ? null : version.id)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium text-foreground">
                        {translate("cms-texts.history.version", {
                          version: version.version,
                        })}
                        {isLive && (
                          <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                            {translate("cms-texts.history.current")}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {translate("cms-texts.history.by", {
                          date: formatDateTime(version.publishedAt),
                          name: version.publishedBy,
                        })}
                      </span>
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`cms-text-version-${version.id}`}
                      className="flex flex-col gap-2 px-3 pb-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {version.title}
                      </p>
                      <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-md border border-input bg-muted/50 px-3 py-2 font-sans text-sm">
                        {version.content}
                      </pre>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </FormSection>
  );
}
