import { useMutation } from "@tanstack/react-query";
import { Phone, Search } from "lucide-react";
import {
  useDataProvider,
  useGetList,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { useState } from "react";

import { FormDialogContent } from "@/components/admin/form-dialog-content";
import { RequireAccess } from "@/components/auth/RequireAccess";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateOrderForClientPayload,
  ExtendedDataProvider,
} from "@/providers/dataProvider";
import InviteClientModal from "../clients/InviteClientModal";
import { backendMessage } from "../users/errors";
import { SelectorDeLineas, type EditableLine } from "./SelectorDeLineas";

interface ClienteResumen {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface MunicipioResumen {
  id: string;
  name: string;
}

interface MetodoDePagoResumen {
  id: string;
  code: string;
  label: string;
}

type TipoEntrega = "delivery" | "pickup";

// Mismo estilo que usa el reporte de pedidos para sus `<select>` nativos: este
// formulario va con `useState` puro (no `SimpleForm`), así que los `SelectInput`
// de `@/components/admin` —que necesitan un `useInput` con contexto de
// formulario— no aplican aquí.
const claseSelect =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const nombreCliente = (c: ClienteResumen) =>
  [c.firstName, c.lastName].filter(Boolean).join(" ").trim() ||
  c.email ||
  c.id;

const ESTADO_INICIAL_ENTREGA = {
  tipo: "delivery" as TipoEntrega,
  municipioId: "",
  calle: "",
  entreCalles: "",
  referencia: "",
  telefono: "",
  quienRecoge: "",
  carnet: "",
  telefonoRecoge: "",
};

/**
 * Alta de un pedido en nombre de un cliente, para quien compra por WhatsApp o
 * por teléfono y no pasa por la tienda.
 *
 * Las líneas se llevan con `useState` puro, no con `react-hook-form`:
 * `SelectorDeLineas` avisa con `onChange(lineasNuevas)`, calculado a partir de
 * las líneas que tiene en ese momento, y un estado que llegue con retraso haría
 * que dos cambios seguidos (añadir dos productos rápido, por ejemplo) se
 * pisaran entre sí.
 *
 * No se le pasa `originales` al selector: esa prop marca qué líneas ya estaban
 * en un pedido guardado, y aquí el pedido todavía no existe — no hay contra qué
 * comparar, así que ninguna línea se marca como «nueva».
 */
export function CrearPedidoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const t = (clave: string, porDefecto: string, args?: Record<string, unknown>) =>
    translate(clave, { _: porDefecto, ...args });

  const [cliente, setCliente] = useState<{ id: string; label: string } | null>(
    null,
  );
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [invitando, setInvitando] = useState(false);

  const [lines, setLines] = useState<EditableLine[]>([]);

  const [entrega, setEntrega] = useState(ESTADO_INICIAL_ENTREGA);

  const [yaCobrado, setYaCobrado] = useState(false);
  const [metodoCobro, setMetodoCobro] = useState("");
  const [referenciaCobro, setReferenciaCobro] = useState("");

  const [notas, setNotas] = useState("");

  const reiniciar = () => {
    setCliente(null);
    setBusquedaCliente("");
    setInvitando(false);
    setLines([]);
    setEntrega(ESTADO_INICIAL_ENTREGA);
    setYaCobrado(false);
    setMetodoCobro("");
    setReferenciaCobro("");
    setNotas("");
  };

  const { data: clientesEncontrados } = useGetList<ClienteResumen>(
    "clients",
    {
      filter: { q: busquedaCliente },
      pagination: { page: 1, perPage: 8 },
      sort: { field: "firstName", order: "ASC" },
    },
    { enabled: busquedaCliente.trim().length >= 2 },
  );

  const { data: municipios } = useGetList<MunicipioResumen>("municipalities", {
    filter: { all: true },
    pagination: { page: 1, perPage: 200 },
    sort: { field: "name", order: "ASC" },
  });

  const { data: metodosDePago } = useGetList<MetodoDePagoResumen>(
    "payment-methods",
    {
      pagination: { page: 1, perPage: 50 },
      sort: { field: "sortOrder", order: "ASC" },
    },
  );

  const crear = useMutation({
    mutationFn: async () => {
      if (!cliente) throw new Error("Falta el cliente");

      const payload: CreateOrderForClientPayload = {
        clientId: cliente.id,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        fulfillmentType: entrega.tipo,
        customerNotes: notas.trim() || undefined,
      };

      if (entrega.tipo === "delivery") {
        payload.deliveryMunicipalityId = entrega.municipioId || undefined;
        const direccion: Record<string, unknown> = {};
        if (entrega.calle.trim()) direccion.street = entrega.calle.trim();
        if (entrega.entreCalles.trim())
          direccion.betweenStreets = entrega.entreCalles.trim();
        if (entrega.referencia.trim())
          direccion.reference = entrega.referencia.trim();
        if (entrega.telefono.trim())
          direccion.contactPhone = entrega.telefono.trim();
        if (Object.keys(direccion).length > 0) {
          payload.deliveryAddress = direccion;
        }
      } else {
        payload.contact = {
          recipientName: entrega.quienRecoge.trim(),
          idCard: entrega.carnet.trim(),
          contactPhone: entrega.telefonoRecoge.trim(),
        };
      }

      // El campo se llama `cobro`, en español: la API valida con lista
      // blanca y cualquier otro nombre (o un `paymentMethod` suelto) se
      // pierde en silencio, dejando el pedido pendiente sin avisar.
      if (yaCobrado) {
        payload.cobro = {
          paymentMethod: metodoCobro,
          reference: referenciaCobro.trim() || undefined,
        };
      }

      return dataProvider.createOrderForClient(payload);
    },
    onSuccess: ({ data }) => {
      notify("orders.create.created", {
        type: "success",
        messageArgs: {
          _: "Pedido %{orderNumber} creado",
          orderNumber: data.orderNumber,
        },
      });
      reiniciar();
      refresh();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      // 409: sin stock suficiente en la zona del cliente. Se dice en cubano
      // en vez del mensaje crudo que manda la API en inglés.
      if ((error as { status?: number })?.status === 409) {
        notify(t("orders.create.no_stock", "No hay stock suficiente para algún producto"), {
          type: "error",
        });
        return;
      }
      notify(
        backendMessage(error, t("orders.create.error", "No se pudo crear el pedido")),
        { type: "error" },
      );
    },
  });

  const puedeCrear = cliente !== null && lines.length > 0 && !crear.isPending;

  const cambiarApertura = (next: boolean) => {
    if (!next) reiniciar();
    onOpenChange(next);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={cambiarApertura}>
        <FormDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="size-5" />
              {t("orders.create.title", "Crear un pedido para un cliente")}
            </DialogTitle>
            <DialogDescription>
              {t("orders.create.subtitle", "Para quien compra por WhatsApp o por teléfono.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cliente */}
            <div className="space-y-3">
              <Label>{t("orders.create.client", "Cliente")}</Label>
              {cliente ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                  <span className="text-sm font-medium text-foreground">
                    {cliente.label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCliente(null)}
                  >
                    {t("orders.create.client_change", "Cambiar")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="crear-pedido-cliente"
                      value={busquedaCliente}
                      onChange={(e) => setBusquedaCliente(e.target.value)}
                      placeholder={t(
                        "orders.create.client_search_placeholder",
                        "Busca por nombre, correo o teléfono…",
                      )}
                      className="pl-8"
                    />
                  </div>
                  {busquedaCliente.trim().length >= 2 && (
                    <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-md border border-border">
                      {(clientesEncontrados ?? []).length === 0 ? (
                        <li className="p-2 text-sm text-muted-foreground">
                          {t(
                            "orders.create.client_no_results",
                            "Ningún cliente con esos datos.",
                          )}
                        </li>
                      ) : (
                        (clientesEncontrados ?? []).map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                              onClick={() => {
                                setCliente({ id: c.id, label: nombreCliente(c) });
                                setBusquedaCliente("");
                              }}
                            >
                              <span className="font-medium text-foreground">
                                {nombreCliente(c)}
                              </span>
                              {c.email && (
                                <span className="text-xs text-muted-foreground">
                                  {c.email}
                                </span>
                              )}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="text-xs text-primary underline-offset-2 hover:underline"
                    onClick={() => setInvitando(true)}
                  >
                    {t("orders.create.client_missing", "¿No tiene cuenta? Invítalo")}
                  </button>
                </>
              )}
            </div>

            {/* Productos */}
            <div className="space-y-3">
              <Label>{t("orders.create.lines", "Productos")}</Label>
              <SelectorDeLineas lines={lines} onChange={setLines} />
            </div>

            {/* Entrega */}
            <div className="space-y-3">
              <Label>{t("orders.create.fulfillment", "Entrega")}</Label>
              <select
                className={claseSelect}
                value={entrega.tipo}
                onChange={(e) =>
                  setEntrega((prev) => ({
                    ...prev,
                    tipo: e.target.value as TipoEntrega,
                  }))
                }
              >
                <option value="delivery">
                  {t("orders.fulfillment.delivery", "A domicilio")}
                </option>
                <option value="pickup">
                  {t("orders.fulfillment.pickup", "Recogida en tienda")}
                </option>
              </select>

              {entrega.tipo === "delivery" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="entrega-municipio" className="text-xs">
                      {t("orders.create.delivery_municipality", "Municipio")}
                    </Label>
                    <select
                      id="entrega-municipio"
                      className={claseSelect}
                      value={entrega.municipioId}
                      onChange={(e) =>
                        setEntrega((prev) => ({
                          ...prev,
                          municipioId: e.target.value,
                        }))
                      }
                    >
                      <option value="">
                        {t(
                          "orders.create.delivery_municipality_default",
                          "Usar el municipio guardado del cliente",
                        )}
                      </option>
                      {(municipios ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="entrega-calle" className="text-xs">
                      {t("orders.create.delivery_street", "Calle")}
                    </Label>
                    <Input
                      id="entrega-calle"
                      value={entrega.calle}
                      onChange={(e) =>
                        setEntrega((prev) => ({ ...prev, calle: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="entrega-entre" className="text-xs">
                      {t("orders.create.delivery_between", "Entre calles")}
                    </Label>
                    <Input
                      id="entrega-entre"
                      value={entrega.entreCalles}
                      onChange={(e) =>
                        setEntrega((prev) => ({
                          ...prev,
                          entreCalles: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="entrega-referencia" className="text-xs">
                      {t("orders.create.delivery_reference", "Punto de referencia")}
                    </Label>
                    <Input
                      id="entrega-referencia"
                      value={entrega.referencia}
                      onChange={(e) =>
                        setEntrega((prev) => ({
                          ...prev,
                          referencia: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="entrega-telefono" className="text-xs">
                      {t("orders.create.delivery_phone", "Teléfono de contacto")}
                    </Label>
                    <Input
                      id="entrega-telefono"
                      value={entrega.telefono}
                      onChange={(e) =>
                        setEntrega((prev) => ({ ...prev, telefono: e.target.value }))
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="recogida-nombre" className="text-xs">
                      {t("orders.create.pickup_recipient", "Quién recoge")}
                    </Label>
                    <Input
                      id="recogida-nombre"
                      value={entrega.quienRecoge}
                      onChange={(e) =>
                        setEntrega((prev) => ({
                          ...prev,
                          quienRecoge: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="recogida-carnet" className="text-xs">
                      {t("orders.create.pickup_id_card", "Carné de identidad")}
                    </Label>
                    <Input
                      id="recogida-carnet"
                      value={entrega.carnet}
                      onChange={(e) =>
                        setEntrega((prev) => ({ ...prev, carnet: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="recogida-telefono" className="text-xs">
                      {t("orders.create.pickup_phone", "Teléfono de contacto")}
                    </Label>
                    <Input
                      id="recogida-telefono"
                      value={entrega.telefonoRecoge}
                      onChange={(e) =>
                        setEntrega((prev) => ({
                          ...prev,
                          telefonoRecoge: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pago */}
            <div className="space-y-3">
              <Label>{t("orders.create.payment", "Pago")}</Label>
              {/* Solo se pinta a quien tenga el permiso de cobros. Que el botón
                  exista sin permiso solo serviría para que la API conteste 403. */}
              <RequireAccess resource="orders" action="update-payment-status">
                <div className="space-y-3 rounded-md border border-border p-3">
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={yaCobrado}
                      onCheckedChange={(v) => setYaCobrado(v === true)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium text-foreground">
                        {t("orders.create.already_paid", "Ya está cobrado")}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t(
                          "orders.create.already_paid_hint",
                          "Marca esto solo si el dinero ya entró: por transferencia o en el mostrador.",
                        )}
                      </span>
                    </span>
                  </label>

                  {yaCobrado && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="cobro-metodo" className="text-xs">
                          {t("orders.create.payment_method", "Método de pago")}
                        </Label>
                        <select
                          id="cobro-metodo"
                          className={claseSelect}
                          value={metodoCobro}
                          onChange={(e) => setMetodoCobro(e.target.value)}
                        >
                          <option value="">
                            {t("orders.create.payment_method_placeholder", "Elige uno…")}
                          </option>
                          {(metodosDePago ?? []).map((m) => (
                            <option key={m.id} value={m.code}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cobro-referencia" className="text-xs">
                          {t("orders.create.reference", "Referencia del cobro")}
                        </Label>
                        <Input
                          id="cobro-referencia"
                          value={referenciaCobro}
                          onChange={(e) => setReferenciaCobro(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </RequireAccess>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label htmlFor="pedido-notas">{t("orders.create.notes", "Notas")}</Label>
              <Textarea
                id="pedido-notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder={t(
                  "orders.create.notes_placeholder",
                  "Cualquier detalle que el cliente haya dado por teléfono…",
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={crear.isPending}
              onClick={() => cambiarApertura(false)}
            >
              {t("shared.actions.cancel", "Cancelar")}
            </Button>
            <Button
              type="button"
              disabled={!puedeCrear}
              onClick={() => crear.mutate()}
            >
              {crear.isPending
                ? t("orders.create.submitting", "Creando…")
                : t("orders.create.submit", "Crear el pedido")}
            </Button>
          </DialogFooter>
        </FormDialogContent>
      </Dialog>

      {/* Invitar a un cliente nuevo sin salir de este formulario: es un diálogo
          aparte, no anidado dentro del de arriba, y solo se desmonta al cerrarlo
          —nunca navega a /clients ni pierde lo que ya se llevaba escrito. */}
      {invitando && <InviteClientModal onClose={() => setInvitando(false)} />}
    </>
  );
}
