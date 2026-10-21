import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/clerk/clerkRefs", () => ({
  getApiToken: () => Promise.resolve("token-de-prueba"),
}));
vi.mock("./authProvider", () => ({ resetIdentityCache: () => undefined }));

import { dataProvider } from "./dataProvider";
import type { ExtendedDataProvider } from "./dataProvider";

/**
 * Qué cuerpo manda el panel en cada acción de un ticket.
 *
 * Existe por una regresión del 21-oct-2026: la API dejó de aceptar `status` en
 * el cuerpo de `/close` y `/reopen` —lo decide la ruta— y el panel siguió
 * mandándolo. Como la API valida con `forbidNonWhitelisted`, los dos botones
 * empezaron a responder **400 «property status should not exist»**. Lo
 * descubrió la comprobación contra staging, no las pruebas: **las dos partes
 * estaban en verde por separado**.
 *
 * Esto no sustituye a probarlo contra la API de verdad, y conviene no
 * confundirlo: fija lo que **este lado** manda. Si el contrato del otro lado
 * cambia otra vez, esta prueba seguirá en verde — lo que evita es que el
 * cambio ocurra aquí sin querer.
 */
describe("las acciones de un ticket", () => {
  const api = dataProvider as ExtendedDataProvider;
  let fetchFalso: ReturnType<typeof vi.fn>;

  const cuerpoDe = (llamada: number): Record<string, unknown> =>
    JSON.parse(String(fetchFalso.mock.calls[llamada][1].body));

  beforeEach(() => {
    fetchFalso = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: "t1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchFalso);
  });

  it("cerrar manda el cuerpo vacío, sin inventarse un estado", async () => {
    await api.closeTicket("t1");

    expect(String(fetchFalso.mock.calls[0][0])).toContain("/tickets/t1/close");
    expect(cuerpoDe(0)).toEqual({});
  });

  it("reabrir manda solo el porqué", async () => {
    await api.reopenTicket("t1", "volvió a pasar");

    expect(String(fetchFalso.mock.calls[0][0])).toContain("/tickets/t1/reopen");
    expect(cuerpoDe(0)).toEqual({ note: "volvió a pasar" });
  });

  // El control: mover de estado SÍ manda el estado, que es lo suyo. Sin esta
  // línea, las dos de arriba pasarían igual con un dataProvider que no manda
  // nada nunca.
  it("mover de estado sí manda el estado", async () => {
    await api.changeTicketStatus("t1", "en_curso");
    expect(cuerpoDe(0)).toEqual({ status: "en_curso" });
  });

  it("mover de estado con nota la manda también", async () => {
    await api.changeTicketStatus("t1", "resuelto", "era el cabezal");
    expect(cuerpoDe(0)).toEqual({
      status: "resuelto",
      note: "era el cabezal",
    });
  });

  it("comentar manda solo el texto", async () => {
    await api.addTicketComment("t1", "probé otro rollo");
    expect(cuerpoDe(0)).toEqual({ note: "probé otro rollo" });
  });
});
