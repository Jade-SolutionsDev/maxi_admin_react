import { describe, expect, it } from "vitest";
import {
  SIGUIENTES,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_CLASSES,
  TICKET_STATUSES,
  TICKET_STATUS_CLASSES,
  type TicketStatus,
} from "./ticketStatus";

describe("los estados de un ticket", () => {
  it("cada estado tiene su clase de insignia", () => {
    for (const estado of TICKET_STATUSES) {
      expect(TICKET_STATUS_CLASSES[estado]).toBeTruthy();
    }
  });

  it("cada prioridad tiene la suya", () => {
    for (const prioridad of TICKET_PRIORITIES) {
      expect(TICKET_PRIORITY_CLASSES[prioridad]).toBeTruthy();
    }
  });

  /**
   * Cerrar pide `tickets:close` y tiene su propio botón. Si saliera de esta
   * tabla, el panel ofrecería cerrar a quien solo puede gestionar y el
   * servidor contestaría 403 — un botón que falla es peor que no tenerlo.
   */
  it("nunca ofrece cerrar como un paso más", () => {
    for (const estado of TICKET_STATUSES) {
      expect(SIGUIENTES[estado]).not.toContain("cerrado");
    }
  });

  /** Reabrir lo cerrado también pide el permiso de cerrar. */
  it("de cerrado no ofrece ningún paso", () => {
    expect(SIGUIENTES.cerrado).toEqual([]);
  });

  it("no propone saltos que la API rechaza", () => {
    // La tabla de la API: abierto↔en_curso, y a resuelto desde los dos.
    const permitidos: Record<TicketStatus, TicketStatus[]> = {
      abierto: ["en_curso", "resuelto"],
      en_curso: ["abierto", "resuelto"],
      resuelto: ["en_curso", "cerrado"],
      cerrado: ["en_curso"],
    };
    for (const estado of TICKET_STATUSES) {
      for (const siguiente of SIGUIENTES[estado]) {
        expect(permitidos[estado]).toContain(siguiente);
      }
    }
  });

  it("ningún estado se ofrece a sí mismo", () => {
    for (const estado of TICKET_STATUSES) {
      expect(SIGUIENTES[estado]).not.toContain(estado);
    }
  });
});
