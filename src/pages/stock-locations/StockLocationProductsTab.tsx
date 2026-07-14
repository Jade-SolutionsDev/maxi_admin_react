import { useMemo, useState } from "react";
import { useGetList, useGetMany, useTranslate, type RaRecord } from "ra-core";
import { ImageOff, PackageSearch, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StockLocationProductsTab({
  locationId,
}: {
  locationId: string;
}) {
  const translate = useTranslate();
  const [q, setQ] = useState("");

  const { data: inventory, isLoading } = useGetList("inventory", {
    filter: { locationId },
    pagination: { page: 1, perPage: 200 },
    sort: { field: "id", order: "ASC" },
  });

  const productIds = useMemo(
    () => [...new Set((inventory ?? []).map((r) => r.productId as string))],
    [inventory],
  );
  const { data: products } = useGetMany(
    "products",
    { ids: productIds },
    { enabled: productIds.length > 0 },
  );
  const productMap = useMemo(
    () => new Map((products ?? []).map((p) => [p.id, p])),
    [products],
  );

  const rows = useMemo(() => {
    const list = (inventory ?? []).map((row) => ({
      ...row,
      product: productMap.get(row.productId as string) as RaRecord | undefined,
    }));
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((r) =>
      String((r.product?.name as string) ?? "")
        .toLowerCase()
        .includes(term),
    );
  }, [inventory, productMap, q]);

  if (isLoading) {
    return <div className="h-48 rounded-lg bg-muted animate-pulse" />;
  }

  if ((inventory ?? []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <PackageSearch className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium text-foreground">
          {translate("stockLocations.products.empty_title", {
            _: "Sin productos en existencia",
          })}
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {translate("stockLocations.products.empty_hint", {
            _: 'Use "Operaciones" para registrar una entrada y añadir existencias.',
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">
            {translate("stockLocations.products.title", {
              _: "Productos del almacén",
            })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {translate("stockLocations.products.subtitle", {
              _: "Listado de productos y cantidad disponible en este almacén.",
            })}
          </p>
        </div>
        <div className="relative w-64 max-w-full">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={translate("stockLocations.products.search", {
              _: "Buscar producto",
            })}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>
                {translate("stockLocations.products.product_name", {
                  _: "Nombre del producto",
                })}
              </TableHead>
              <TableHead className="text-right">
                {translate("stockLocations.products.available", {
                  _: "Cantidad disponible",
                })}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => {
              const image = row.product?.imageUrl as string | null | undefined;
              return (
                <TableRow key={row.id as string}>
                  <TableCell className="text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="h-9 w-9 rounded-md border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40">
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-foreground">
                        {(row.product?.name as string) ??
                          translate("stockLocations.products.unknown", {
                            _: "Producto",
                          })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {row.quantity as number}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
