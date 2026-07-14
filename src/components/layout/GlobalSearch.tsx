import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataProvider, useGetIdentity, useTranslate } from "ra-core";
import { useQueries } from "@tanstack/react-query";
import { Building2, Package, Search, Tags, Users, Warehouse } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MANAGER_ROLES, type Role } from "@/providers/authProvider";

type SearchRecord = { id: string | number; [key: string]: unknown };

interface SearchSource {
  /** dataProvider resource name === backend route === i18n key segment. */
  resource: string;
  groupKey: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Only include this source for management roles (SUPER_ADMIN / ADMIN). */
  managerOnly?: boolean;
  getLabel: (record: SearchRecord) => string;
  getPath: (record: SearchRecord) => string;
}

// Only entities with real server-side `q` search + an addressable route.
// Taxonomy/products deep-link to their detail view `/[resource]/:id`; users
// have no detail view so they open the edit form. Clients (modal-only edit)
// and orders (mock) are intentionally absent.
const SEARCH_SOURCES: SearchSource[] = [
  {
    resource: "products",
    groupKey: "resources.products.name_plural",
    icon: Package,
    getLabel: (r) => String(r.name ?? ""),
    getPath: (r) => `/products/${r.id}`,
  },
  {
    resource: "categories",
    groupKey: "resources.categories.name_plural",
    icon: Tags,
    getLabel: (r) => String(r.name ?? ""),
    getPath: (r) => `/categories/${r.id}`,
  },
  {
    resource: "departments",
    groupKey: "resources.departments.name_plural",
    icon: Building2,
    getLabel: (r) => String(r.name ?? ""),
    getPath: (r) => `/departments/${r.id}`,
  },
  {
    // Backend scopes results by role (grocers see only assigned storages).
    resource: "stock-locations",
    groupKey: "resources.stock-locations.name_plural",
    icon: Warehouse,
    getLabel: (r) => String(r.name ?? ""),
    getPath: (r) => `/stock-locations/${r.id}`,
  },
  {
    resource: "users",
    groupKey: "resources.users.name_plural",
    icon: Users,
    managerOnly: true,
    getLabel: (r) =>
      `${(r.firstName as string) ?? ""} ${(r.lastName as string) ?? ""}`.trim() ||
      String(r.email ?? ""),
    getPath: (r) => `/users/edit/${r.id}`,
  },
];

const MIN_CHARS = 2;
const PER_SOURCE = 5;
const DEBOUNCE_MS = 250;

/**
 * Global command palette (⌘K / Ctrl+K). Repurposes the header search box: fans
 * the typed term out to each searchable resource via the dataProvider, groups
 * the hits by entity type, and navigates to the record's detail/edit page on
 * select.
 */
export function GlobalSearch() {
  const translate = useTranslate();
  const navigate = useNavigate();
  const dataProvider = useDataProvider();
  const { data: identity } = useGetIdentity();

  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  // ⌘K / Ctrl+K toggles the palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Debounce so we don't fan out a request on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [term]);

  const role = identity?.role as Role | undefined;
  const sources = useMemo(
    () =>
      SEARCH_SOURCES.filter(
        (s) => !s.managerOnly || (!!role && MANAGER_ROLES.includes(role)),
      ),
    [role],
  );

  const enabled = open && debounced.length >= MIN_CHARS;

  const results = useQueries({
    queries: sources.map((source) => ({
      queryKey: ["global-search", source.resource, debounced],
      enabled,
      staleTime: 30_000,
      queryFn: async () => {
        const { data } = await dataProvider.getList(source.resource, {
          filter: { q: debounced },
          pagination: { page: 1, perPage: PER_SOURCE },
          sort: { field: "id", order: "ASC" },
        });
        return data as SearchRecord[];
      },
    })),
  });

  const isLoading = enabled && results.some((r) => r.isLoading);
  const hasResults = results.some((r) => (r.data?.length ?? 0) > 0);

  const go = (path: string) => {
    setOpen(false);
    setTerm("");
    setDebounced("");
    navigate(path);
  };

  return (
    <>
      {/* Header trigger, styled like the previous (dead) search pill. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center rounded-[10px] px-3 h-10 w-[280px] bg-[#F1F5F9] dark:bg-[#1A2535] text-left"
      >
        <Search
          size={18}
          className="shrink-0 text-[#64748B] dark:text-[#94A3B8]"
        />
        <span className="ml-2 flex-1 text-[14px] text-[#94A3B8]">
          {translate("search.placeholder", { _: "Buscar..." })}
        </span>
        <kbd className="ml-2 rounded border border-[#CBD5E1] px-1.5 py-0.5 text-[11px] text-[#94A3B8] dark:border-[#334155]">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {translate("search.placeholder", { _: "Buscar..." })}
            </DialogTitle>
            <DialogDescription>
              {translate("search.description", {
                _: "Buscar en la aplicación",
              })}
            </DialogDescription>
          </DialogHeader>

          {/* shouldFilter=false: results are already filtered server-side. */}
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2"
          >
            <CommandInput
              value={term}
              onValueChange={setTerm}
              placeholder={translate("search.placeholder", { _: "Buscar..." })}
            />
            <CommandList>
              {!enabled && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {translate("search.hint", {
                    _: "Escribe al menos 2 caracteres",
                  })}
                </p>
              )}
              {enabled && isLoading && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {translate("search.loading", { _: "Buscando…" })}
                </p>
              )}
              {enabled && !isLoading && !hasResults && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {translate("search.empty", { _: "Sin resultados" })}
                </p>
              )}
              {enabled &&
                sources.map((source, i) => {
                  const rows = results[i].data ?? [];
                  if (rows.length === 0) return null;
                  const Icon = source.icon;
                  return (
                    <CommandGroup
                      key={source.resource}
                      heading={translate(source.groupKey, {
                        _: source.resource,
                      })}
                    >
                      {rows.map((row) => (
                        <CommandItem
                          key={`${source.resource}-${row.id}`}
                          value={`${source.resource}-${row.id}`}
                          onSelect={() => go(source.getPath(row))}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {source.getLabel(row)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
