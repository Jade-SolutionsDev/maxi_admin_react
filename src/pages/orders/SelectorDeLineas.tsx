import { useMemo, useState } from "react";
import { useGetList, useTranslate } from "ra-core";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EditableLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

// No se exportan: cada pantalla que muestra dinero tiene su propio formateador
// en este repo (OrderDetailPage, RefundsQueuePage…), así que este selector
// sigue esa misma convención en vez de forzar un módulo de utilidades nuevo.
const money = (value: number) =>
  new Intl.NumberFormat("es-CU", {
    style: "currency",
    currency: "USD",
  }).format(value);

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Elegir productos y cantidades para un pedido.
 *
 * Lo usan dos pantallas: la corrección de líneas de un pedido que ya existe y
 * el alta de un pedido desde el panel. Está compartido a propósito — dos
 * selectores separados acabarían enseñando stock distinto, que es justo lo que
 * pasó con el reporte de pedidos antes de compartir el constructor de filtros.
 *
 * Devuelve un fragmento con dos hermanos (la tabla de líneas y el buscador),
 * sin envoltorio propio: el espaciado entre ambos y el resto del formulario
 * lo pone quien lo use.
 *
 * El campo de búsqueda usa un `id` fijo (`items-search`); no pongas dos
 * selectores en la misma pantalla o sus `<label htmlFor>` colisionarán.
 */
export function SelectorDeLineas({
  lines,
  onChange,
  /** Precios editables. El editor de pedidos los deja tocar; el alta también. */
  allowPriceEdit = true,
  /**
   * Productos que ya estaban en el pedido guardado. Lo que no esté aquí se
   * marca como «nuevo». Si se omite, no se marca nada: en un pedido que aún
   * no existe, no hay contra qué comparar.
   */
  originales,
}: {
  lines: EditableLine[];
  onChange: (lines: EditableLine[]) => void;
  allowPriceEdit?: boolean;
  originales?: string[];
}): React.ReactElement {
  const translate = useTranslate();
  const [search, setSearch] = useState("");

  // Set de consulta rápida para la marca "nuevo"; `null` cuando no hay nada
  // contra qué comparar (alta de pedido), así ninguna línea se marca.
  const originalesSet = useMemo(
    () => (originales ? new Set(originales) : null),
    [originales],
  );

  // Catálogo para añadir productos. Se consulta solo cuando hay búsqueda: la
  // lista entera no cabe y tampoco ayuda.
  //
  // `isActive: true` se aplica en las dos pantallas que comparten este
  // buscador, sin volverlo configurable: un producto retirado no se puede
  // vender ni en un pedido nuevo ni al corregir uno existente, la API lo
  // rechaza igual en ambos casos, y las líneas que YA estaban en un pedido
  // (`lines`, que no pasa por esta búsqueda) se siguen viendo aunque el
  // producto se haya retirado después.
  const { data: found } = useGetList(
    "products",
    {
      filter: { q: search, isActive: true },
      pagination: { page: 1, perPage: 8 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: search.trim().length >= 2 },
  );

  const setQuantity = (productId: string, quantity: number) =>
    onChange(
      lines.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.max(1, Math.min(9999, quantity)) }
          : line,
      ),
    );

  const setPrice = (productId: string, unitPrice: number) =>
    onChange(
      lines.map((line) =>
        line.productId === productId
          ? { ...line, unitPrice: Math.max(0, unitPrice) }
          : line,
      ),
    );

  const addProduct = (product: {
    id: string;
    name?: string;
    finalPrice?: number;
    basePrice?: number;
  }) => {
    setSearch("");
    const already = lines.find((line) => line.productId === product.id);
    if (already) return; // ya está: se sube su cantidad desde la fila
    onChange([
      ...lines,
      {
        productId: product.id,
        name: product.name ?? product.id,
        quantity: 1,
        unitPrice: Number(product.finalPrice ?? product.basePrice ?? 0),
      },
    ]);
  };

  return (
    <>
      <ul className="divide-y divide-border rounded-md border border-border">
        {lines.map((line) => {
          const esNuevo =
            originalesSet !== null && !originalesSet.has(line.productId);
          return (
            <li key={line.productId} className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-foreground">
                  {line.name}
                  {esNuevo && (
                    <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-normal text-emerald-700 dark:text-emerald-400">
                      {translate("orders.items_editor.new", { _: "nuevo" })}
                    </span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={translate("orders.items_editor.remove", {
                    _: "Quitar del pedido",
                  })}
                  onClick={() =>
                    onChange(
                      lines.filter((l) => l.productId !== line.productId),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                  <Label
                    htmlFor={`qty-${line.productId}`}
                    className="text-xs"
                  >
                    {translate("orders.fields.quantity", {
                      _: "Cantidad",
                    })}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={translate("orders.items_editor.less", {
                        _: "Una menos",
                      })}
                      onClick={() =>
                        setQuantity(line.productId, line.quantity - 1)
                      }
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      id={`qty-${line.productId}`}
                      type="number"
                      min={1}
                      max={9999}
                      value={line.quantity}
                      onChange={(e) =>
                        setQuantity(
                          line.productId,
                          Number(e.target.value) || 1,
                        )
                      }
                      className="h-8 w-20 text-center tabular-nums"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={translate("orders.items_editor.more", {
                        _: "Una más",
                      })}
                      onClick={() =>
                        setQuantity(line.productId, line.quantity + 1)
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`price-${line.productId}`}
                    className="text-xs"
                  >
                    {translate("orders.fields.unitPrice", {
                      _: "Precio",
                    })}
                  </Label>
                  <Input
                    id={`price-${line.productId}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    disabled={!allowPriceEdit}
                    onChange={(e) =>
                      setPrice(line.productId, Number(e.target.value) || 0)
                    }
                    className="h-8 w-28 text-right tabular-nums"
                  />
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">
                    {translate("orders.fields.lineTotal", {
                      _: "Importe",
                    })}
                  </p>
                  <p className="font-medium tabular-nums">
                    {money(round(line.unitPrice * line.quantity))}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
        {lines.length === 0 && (
          <li className="p-3 text-sm text-destructive">
            {translate("orders.items_editor.empty", {
              _: "Un pedido no puede quedarse sin productos. Añade alguno o cancela el pedido.",
            })}
          </li>
        )}
      </ul>

      <div className="space-y-1.5">
        <Label htmlFor="items-search">
          {translate("orders.items_editor.add", {
            _: "Añadir un producto",
          })}
        </Label>
        <div className="relative">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            id="items-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={translate("orders.items_editor.add_placeholder", {
              _: "Busca por nombre…",
            })}
            className="pl-8"
          />
        </div>
        {search.trim().length >= 2 && (
          <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {(found ?? []).length === 0 ? (
              <li className="p-2 text-sm text-muted-foreground">
                {translate("orders.items_editor.no_results", {
                  _: "Ningún producto con ese nombre.",
                })}
              </li>
            ) : (
              (found ?? []).map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() =>
                      addProduct(
                        product as unknown as {
                          id: string;
                          name?: string;
                          finalPrice?: number;
                          basePrice?: number;
                        },
                      )
                    }
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                      {product.name as string}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {money(
                        Number(product.finalPrice ?? product.basePrice ?? 0),
                      )}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </>
  );
}
