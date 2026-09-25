import { useMutation, useQuery } from "@tanstack/react-query";
import { Phone, Search } from "lucide-react";
import {
  useCanAccess,
  useDataProvider,
  useGetList,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { useState } from "react";

import { FormDialogContent } from "@/components/admin/form-dialog-content";
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
  FulfillmentOptions,
} from "@/providers/dataProvider";
import InviteClientModal from "../clients/InviteClientModal";
import { backendMessage } from "../users/errors";
import { SelectorDeLineas, type EditableLine } from "./SelectorDeLineas";

interface ClienteResumen {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  defaultMunicipalityId: string | null;
}

interface MunicipioResumen {
  id: string;
  name: string;
  provinceId: string;
}

interface ProvinciaResumen {
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

// El selector de líneas tiene el suyo para lo que enseña; este es el de esta
// pantalla para la tarifa de cada forma de entrega.
const money = (value: number) =>
  new Intl.NumberFormat("es-CU", { style: "currency", currency: "USD" }).format(
    value,
  );

const round = (value: number) => Math.round(value * 100) / 100;

// El carné cubano son 11 dígitos (AAMMDD + 5). La API valida la fecha que
// llevan dentro de verdad; esto es solo la pista en pantalla para no dejar
// pasar un "123" o un campo vacío antes de mandarlo.
const carnetValido = (valor: string) => /^\d{11}$/.test(valor.trim());

const nombreCliente = (c: ClienteResumen) =>
  [c.firstName, c.lastName].filter(Boolean).join(" ").trim() ||
  c.email ||
  c.id;

const ESTADO_INICIAL_ENTREGA = {
  calle: "",
  entreCalles: "",
  referencia: "",
  telefono: "",
  nombreRecibe: "",
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

  // La casilla «ya cobrado» solo se pinta a quien tenga el permiso: no es
  // `<RequireAccess>` (eso es un guarda de ruta, pinta la página entera de
  // «Acceso denegado» si falta el permiso), es `useCanAccess` directo, igual
  // que `GatedNavEntry` en el menú lateral. Sin permiso, no se pinta nada.
  const { canAccess: puedeCobrar, isPending: revisandoPermisoCobro } =
    useCanAccess({ resource: "orders", action: "update-payment-status" });

  // El enlace de invitar solo se pinta a quien de verdad puede invitar
  // clientes: sin el permiso, `InviteClientModal` lo rechazaría igual.
  const { canAccess: puedeInvitar } = useCanAccess({
    resource: "clients",
    action: "create",
  });

  const [cliente, setCliente] = useState<{ id: string; label: string } | null>(
    null,
  );
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [invitando, setInvitando] = useState(false);

  const [lines, setLines] = useState<EditableLine[]>([]);
  // Precio de catálogo con el que se añadió cada producto, para saber luego
  // si alguien lo pactó distinto por teléfono (ver el envío del `unitPrice`
  // más abajo) — el mismo criterio que usa el editor de líneas de un pedido
  // ya existente, pero aquí no hay "original" del que partir: el primer
  // precio que trae la línea al añadirse ES el de catálogo.
  const [preciosCatalogo, setPreciosCatalogo] = useState<
    Record<string, number>
  >({});

  const manejarLineas = (nuevas: EditableLine[]) => {
    setPreciosCatalogo((prev) => {
      const faltantes = nuevas.filter((l) => !(l.productId in prev));
      if (faltantes.length === 0) return prev;
      const siguiente = { ...prev };
      for (const l of faltantes) siguiente[l.productId] = l.unitPrice;
      return siguiente;
    });
    setLines(nuevas);
  };

  // El municipio manda la consulta de qué se puede ofrecer (GET /fulfillment
  // la exige); se prellena con el del cliente si tiene uno guardado, pero
  // queda editable — quien atiende el teléfono puede estar pidiendo la
  // entrega a otra parte.
  const [municipioId, setMunicipioId] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>("delivery");
  // Se mandan siempre explícitos: el fallback de la API a "la única opción"
  // deja de servir en cuanto la zona tiene dos o más.
  const [deliveryOptionId, setDeliveryOptionId] = useState("");
  const [pickupAddressId, setPickupAddressId] = useState("");
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
    setPreciosCatalogo({});
    setMunicipioId("");
    setTipoEntrega("delivery");
    setDeliveryOptionId("");
    setPickupAddressId("");
    setEntrega(ESTADO_INICIAL_ENTREGA);
    setYaCobrado(false);
    setMetodoCobro("");
    setReferenciaCobro("");
    setNotas("");
  };

  const { data: clientesEncontrados } = useGetList<ClienteResumen>(
    "clients",
    {
      // Solo activos: uno desactivado dispararía el mismo 409 que un cliente
      // sin stock — mejor no ofrecerlo que dejarlo elegir para que falle.
      filter: { q: busquedaCliente, isActive: true },
      pagination: { page: 1, perPage: 8 },
      sort: { field: "firstName", order: "ASC" },
    },
    { enabled: busquedaCliente.trim().length >= 2 },
  );

  // Puede abrir el formulario sin llegar a usarlo: estas listas no hace falta
  // pedirlas solo por tener el listado de pedidos abierto.
  const { data: municipios } = useGetList<MunicipioResumen>(
    "municipalities",
    {
      filter: { all: true },
      pagination: { page: 1, perPage: 200 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: open },
  );

  const { data: provincias } = useGetList<ProvinciaResumen>(
    "provinces",
    {
      pagination: { page: 1, perPage: 50 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: open },
  );
  const provinciaPorId = new Map((provincias ?? []).map((p) => [p.id, p.name]));

  const {
    data: metodosDePago,
    isPending: cargandoMetodos,
    isError: errorMetodos,
  } = useGetList<MetodoDePagoResumen>(
    "payment-methods",
    {
      pagination: { page: 1, perPage: 50 },
      sort: { field: "sortOrder", order: "ASC" },
    },
    { enabled: open },
  );
  // GET /payment-methods es solo de ADMIN/SUPER_ADMIN; el permiso de cobros
  // (`orders:update-payment-status`) se puede conceder a cualquier rol. Sin
  // esto, a un empleado con el permiso pero sin ser admin se le queda el
  // desplegable mudo y sin explicación.
  const tieneMetodosDisponibles =
    !cargandoMetodos && !errorMetodos && (metodosDePago ?? []).length > 0;

  // Mismo cálculo que ve la tienda para esa zona: opciones de entrega con su
  // tarifa y puntos de recogida. Solo se pide con cliente elegido y municipio
  // resuelto — sin municipio la API responde 400.
  const opcionesQuery = useQuery({
    queryKey: ["fulfillment-options", municipioId],
    queryFn: () =>
      dataProvider.getFulfillmentOptions(municipioId).then((r) => r.data),
    enabled: cliente !== null && municipioId.trim().length > 0,
  });
  const opciones: FulfillmentOptions | undefined = opcionesQuery.data;

  // Lo elegido, reconciliado con lo que de verdad hay en esta zona — como
  // valor derivado en el propio render, no en un efecto: un efecto que solo
  // sincroniza estado a partir de otro estado es del tipo que React pide
  // evitar (dispara un re-render extra en cascada). Si el tipo o la opción de
  // antes ya no están en la lista (cliente nuevo, municipio nuevo), se cae al
  // primero disponible; nunca vacío, nunca el fallback de la API.
  const tieneDelivery = (opciones?.deliveryOptions.length ?? 0) > 0;
  const tienePickup =
    !!opciones?.pickupEnabled && opciones.pickupPoints.length > 0;
  const tipoEntregaEfectivo: TipoEntrega =
    tipoEntrega === "delivery" && tieneDelivery
      ? "delivery"
      : tipoEntrega === "pickup" && tienePickup
        ? "pickup"
        : tieneDelivery
          ? "delivery"
          : "pickup";
  const deliveryOptionIdEfectivo = opciones?.deliveryOptions.some(
    (o) => o.id === deliveryOptionId,
  )
    ? deliveryOptionId
    : (opciones?.deliveryOptions[0]?.id ?? "");
  const pickupAddressIdEfectivo = opciones?.pickupPoints.some(
    (p) => p.id === pickupAddressId,
  )
    ? pickupAddressId
    : (opciones?.pickupPoints[0]?.id ?? "");

  // "unavailableMessage" no es de fiar por sí solo: es el mensaje de soporte
  // de los ajustes, y se puede guardar vacío. Lo que de verdad dice que la
  // zona no admite nada es que las dos listas vengan vacías.
  const sinNadaQueOfrecer = !!opciones && !tieneDelivery && !tienePickup;

  // Datos de quien recibe, completos de verdad — nunca cadenas vacías que
  // luego la API rechaza con un mensaje en inglés y en jerga de campo JSON.
  //
  // En entrega a domicilio, el destinatario viaja DENTRO de `deliveryAddress`
  // (`recipientName` / `contactPhone`), no en un `contact` aparte: es
  // exactamente lo que hace el checkout de la tienda con la dirección
  // guardada del cliente (`snapshotAddress` + `dto.contact ?? address` en
  // `orders.service.ts`). Por eso el carné **no** es obligatorio a
  // domicilio: la tienda nunca lo pide para entregar
  // (`CreateClientAddressDto.idCard` es opcional), y exigirlo aquí sería
  // pedirle a quien compra por teléfono un dato que a nadie más se le pide —
  // la propia divergencia entre panel y tienda que esta pantalla existe para
  // evitar. En recogida sí sigue siendo obligatorio: ahí no hay dirección de
  // la que sacarlo y la API lo exige dentro de `contact`.
  const entregaDatosCompletos =
    tipoEntregaEfectivo === "delivery"
      ? entrega.calle.trim().length > 0 &&
        entrega.telefono.trim().length > 0 &&
        entrega.nombreRecibe.trim().length > 0
      : entrega.quienRecoge.trim().length > 0 &&
        entrega.telefonoRecoge.trim().length > 0 &&
        carnetValido(entrega.carnet);

  // Hace falta una entrega elegida de verdad: con la zona resuelta y con
  // algo que ofrecer, con el id concreto de la opción o del punto —el
  // fallback de la API a "la única opción" no vale apoyo, y mandar vacío es
  // un 400 seguro— y con los datos de quien recibe completos.
  const tieneEntregaValida =
    !!opciones &&
    !sinNadaQueOfrecer &&
    (tipoEntregaEfectivo === "delivery"
      ? !!deliveryOptionIdEfectivo
      : !!pickupAddressIdEfectivo) &&
    entregaDatosCompletos;

  // Si la casilla está marcada, hace falta un método elegido de una lista que
  // de verdad se pudo cargar.
  const tieneCobroValido =
    !yaCobrado || (!!metodoCobro && tieneMetodosDisponibles);

  const crear = useMutation({
    mutationFn: async () => {
      if (!cliente) throw new Error("Falta el cliente");
      if (!tieneEntregaValida) throw new Error("Falta elegir la entrega");

      const payload: CreateOrderForClientPayload = {
        clientId: cliente.id,
        items: lines.map((line) => {
          const catalogo = preciosCatalogo[line.productId];
          // Solo viaja cuando de verdad difiere del precio con que se añadió
          // la línea: la API interpreta cualquier `unitPrice` presente como
          // un precio pactado por una persona, y no todas las líneas se
          // tocaron.
          const pactado =
            catalogo === undefined || round(catalogo) !== round(line.unitPrice);
          return {
            productId: line.productId,
            quantity: line.quantity,
            ...(pactado ? { unitPrice: line.unitPrice } : {}),
          };
        }),
        fulfillmentType: tipoEntregaEfectivo,
        deliveryMunicipalityId: municipioId,
        customerNotes: notas.trim() || undefined,
      };

      if (tipoEntregaEfectivo === "delivery") {
        payload.deliveryOptionId = deliveryOptionIdEfectivo;
        const municipio = (municipios ?? []).find((m) => m.id === municipioId);
        // El destinatario va DENTRO de la dirección, no en `contact`: es lo
        // que hace el checkout de la tienda (`snapshotAddress` +
        // `dto.contact ?? address`), y no manda `contact` para una entrega —
        // así que este pedido tampoco puede exigir de más solo por nacer en
        // el panel.
        payload.deliveryAddress = {
          street: entrega.calle.trim(),
          betweenStreets: entrega.entreCalles.trim() || null,
          reference: entrega.referencia.trim() || null,
          recipientName: entrega.nombreRecibe.trim(),
          contactPhone: entrega.telefono.trim(),
          // Con el id, la API compara la dirección contra el municipio del
          // pedido y rechaza la contradicción; sin él, se salta esa
          // comprobación en silencio. El nombre y la provincia son para que
          // el detalle y el PDF —que arman el lugar con ellos— no salgan sin
          // decir dónde es.
          municipalityId: municipioId,
          municipalityName: municipio?.name ?? null,
          provinceName: municipio ? (provinciaPorId.get(municipio.provinceId) ?? null) : null,
        };
      } else {
        payload.pickupAddressId = pickupAddressIdEfectivo;
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
      // Un 409 no es siempre "sin stock" —también salta si el cliente está
      // desactivado—, así que se enseña el mensaje real de la API en vez de
      // sustituirlo por uno propio. El de stock trae además un detalle por
      // línea (`"Producto": only N available`): sin esto, en un pedido de
      // varios productos no se sabe cuál falla.
      const detalles = (
        error as {
          body?: { error?: { details?: { message: string }[] } };
        }
      )?.body?.error?.details;
      const base = backendMessage(
        error,
        t("orders.create.error", "No se pudo crear el pedido"),
      );
      const mensaje =
        detalles && detalles.length > 0
          ? `${base}: ${detalles.map((d) => d.message).join("; ")}`
          : base;
      notify(mensaje, { type: "error" });
    },
  });

  const puedeCrear =
    cliente !== null &&
    lines.length > 0 &&
    tieneEntregaValida &&
    tieneCobroValido &&
    !crear.isPending;

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
                    onClick={() => {
                      setCliente(null);
                      // El municipio venía prellenado de este cliente; con
                      // otro no tiene por qué seguir siendo el mismo.
                      setMunicipioId("");
                    }}
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
                                // Prellenado, no impuesto: se puede cambiar en
                                // el selector de abajo si la entrega es a otra
                                // parte esta vez.
                                setMunicipioId(c.defaultMunicipalityId ?? "");
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
                  {puedeInvitar && (
                    <button
                      type="button"
                      className="text-xs text-primary underline-offset-2 hover:underline"
                      onClick={() => setInvitando(true)}
                    >
                      {t(
                        "orders.create.client_missing",
                        "¿No tiene cuenta? Invítalo: podrás hacerle el pedido cuando active la cuenta.",
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Productos */}
            <div className="space-y-3">
              <Label>{t("orders.create.lines", "Productos")}</Label>
              <SelectorDeLineas lines={lines} onChange={manejarLineas} />
            </div>

            {/* Entrega */}
            <div className="space-y-3">
              <Label>{t("orders.create.fulfillment", "Entrega")}</Label>

              {!cliente ? (
                <p className="text-sm text-muted-foreground">
                  {t(
                    "orders.create.fulfillment_needs_client",
                    "Elige un cliente para ver las opciones de entrega.",
                  )}
                </p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="entrega-municipio" className="text-xs">
                      {t("orders.create.delivery_municipality", "Municipio")}
                    </Label>
                    <select
                      id="entrega-municipio"
                      className={claseSelect}
                      value={municipioId}
                      onChange={(e) => setMunicipioId(e.target.value)}
                    >
                      <option value="">
                        {t(
                          "orders.create.delivery_municipality_placeholder",
                          "Elige un municipio…",
                        )}
                      </option>
                      {(municipios ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                          {provinciaPorId.get(m.provinceId)
                            ? ` (${provinciaPorId.get(m.provinceId)})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!municipioId ? (
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "orders.create.fulfillment_needs_municipality",
                        "Elige un municipio para ver qué se le puede ofrecer.",
                      )}
                    </p>
                  ) : opcionesQuery.isPending ? (
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "orders.create.fulfillment_loading",
                        "Consultando qué se puede ofrecer…",
                      )}
                    </p>
                  ) : opcionesQuery.isError ? (
                    <p className="text-sm text-destructive">
                      {t(
                        "orders.create.fulfillment_error",
                        "No se pudo consultar las opciones de entrega.",
                      )}
                    </p>
                  ) : sinNadaQueOfrecer ? (
                    // El mensaje de la API es el de soporte de los ajustes y
                    // se puede guardar vacío; con uno propio de reserva, la
                    // pantalla nunca se queda muda sobre por qué no se puede
                    // crear el pedido.
                    <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      {opciones?.unavailableMessage ||
                        t(
                          "orders.create.fulfillment_unavailable_fallback",
                          "Esta zona no admite entrega a domicilio ni recogida en tienda.",
                        )}
                    </p>
                  ) : opciones ? (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="entrega-tipo" className="text-xs">
                          {t("orders.create.fulfillment_type", "Tipo de entrega")}
                        </Label>
                        <select
                          id="entrega-tipo"
                          className={claseSelect}
                          value={tipoEntregaEfectivo}
                          onChange={(e) =>
                            setTipoEntrega(e.target.value as TipoEntrega)
                          }
                        >
                          {opciones.deliveryOptions.length > 0 && (
                            <option value="delivery">
                              {t("orders.fulfillment.delivery", "A domicilio")}
                            </option>
                          )}
                          {opciones.pickupEnabled &&
                            opciones.pickupPoints.length > 0 && (
                              <option value="pickup">
                                {t(
                                  "orders.fulfillment.pickup",
                                  "Recogida en tienda",
                                )}
                              </option>
                            )}
                        </select>
                      </div>

                      {tipoEntregaEfectivo === "delivery" ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="entrega-opcion" className="text-xs">
                              {t("orders.create.delivery_option", "Forma de entrega")}
                            </Label>
                            <select
                              id="entrega-opcion"
                              className={claseSelect}
                              value={deliveryOptionIdEfectivo}
                              onChange={(e) => setDeliveryOptionId(e.target.value)}
                            >
                              {opciones.deliveryOptions.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.label} — {money(o.fee)}
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
                                setEntrega((prev) => ({
                                  ...prev,
                                  calle: e.target.value,
                                }))
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
                              {t(
                                "orders.create.delivery_reference",
                                "Punto de referencia",
                              )}
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
                              {t(
                                "orders.create.delivery_phone",
                                "Teléfono de contacto",
                              )}
                            </Label>
                            <Input
                              id="entrega-telefono"
                              value={entrega.telefono}
                              onChange={(e) =>
                                setEntrega((prev) => ({
                                  ...prev,
                                  telefono: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="entrega-nombre-recibe" className="text-xs">
                              {t(
                                "orders.create.delivery_recipient",
                                "Nombre de quien recibe",
                              )}
                            </Label>
                            <Input
                              id="entrega-nombre-recibe"
                              value={entrega.nombreRecibe}
                              onChange={(e) =>
                                setEntrega((prev) => ({
                                  ...prev,
                                  nombreRecibe: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="recogida-punto" className="text-xs">
                              {t("orders.create.pickup_point", "Punto de recogida")}
                            </Label>
                            <select
                              id="recogida-punto"
                              className={claseSelect}
                              value={pickupAddressIdEfectivo}
                              onChange={(e) => setPickupAddressId(e.target.value)}
                            >
                              {opciones.pickupPoints.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.locationName}
                                  {p.label ? ` — ${p.label}` : ""} ({p.address})
                                </option>
                              ))}
                            </select>
                          </div>
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
                                {t(
                                  "orders.create.pickup_id_card",
                                  "Carné de identidad",
                                )}
                              </Label>
                              <Input
                                id="recogida-carnet"
                                value={entrega.carnet}
                                onChange={(e) =>
                                  setEntrega((prev) => ({
                                    ...prev,
                                    carnet: e.target.value,
                                  }))
                                }
                              />
                              <p className="text-xs text-muted-foreground">
                                {t("orders.create.id_card_hint", "Son 11 dígitos.")}
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="recogida-telefono" className="text-xs">
                                {t(
                                  "orders.create.pickup_phone",
                                  "Teléfono de contacto",
                                )}
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
                        </div>
                      )}
                    </>
                  ) : null}
                </>
              )}
            </div>

            {/* Pago */}
            <div className="space-y-3">
              <Label>{t("orders.create.payment", "Pago")}</Label>
              {!revisandoPermisoCobro && puedeCobrar && (
                <div className="space-y-3 rounded-md border border-border p-3">
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={yaCobrado}
                      disabled={!tieneMetodosDisponibles}
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

                  {!cargandoMetodos && !tieneMetodosDisponibles && (
                    // GET /payment-methods es solo de ADMIN/SUPER_ADMIN; el
                    // permiso de cobros se puede tener sin serlo.
                    <p className="text-xs text-destructive">
                      {t(
                        "orders.create.payment_methods_unavailable",
                        "No se pudo cargar el catálogo de métodos de pago; no puedes marcar este pedido como cobrado.",
                      )}
                    </p>
                  )}

                  {yaCobrado && tieneMetodosDisponibles && (
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
              )}
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
