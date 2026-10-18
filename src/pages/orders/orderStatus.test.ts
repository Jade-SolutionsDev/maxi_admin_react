import { describe, expect, it } from "vitest";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_TRANSITIONS,
  STAFF_TARGETS,
  STATUS_TRANSITIONS,
} from "./orderStatus";

/**
 * Las transiciones que el panel ofrece (MxH-0177).
 *
 * Este mapa es una **copia** del que vive en la API (`orders.service.ts`), y el
 * comentario del fichero lo dice. La API revalida, así que un mapa flojo aquí
 * no deja pasar un cambio ilegal: deja ofrecer en pantalla un botón que
 * responderá con un error, que es peor que no ofrecerlo.
 *
 * No se comprueba el contenido literal —sería copiar el mapa y llamarlo prueba—
 * sino las **propiedades** que lo hacen correcto. Así, un estado nuevo o una
 * flecha de más saltan sin tener que mantener dos listas iguales.
 */
describe("STATUS_TRANSITIONS", () => {
  it("cubre todos los estados declarados", () => {
    expect(Object.keys(STATUS_TRANSITIONS).sort()).toEqual(
      [...ORDER_STATUSES].sort(),
    );
  });

  it("no lleva a ningún estado que no exista", () => {
    const destinos = Object.values(STATUS_TRANSITIONS).flat();

    for (const destino of destinos) {
      expect(ORDER_STATUSES).toContain(destino);
    }
  });

  it("no ofrece quedarse donde ya se está", () => {
    for (const [origen, destinos] of Object.entries(STATUS_TRANSITIONS)) {
      expect(destinos).not.toContain(origen);
    }
  });

  it.each(["delivered", "cancelled"] as const)(
    "«%s» es final: no sale de ahí",
    (estado) => {
      // Un pedido entregado o cancelado no vuelve atrás. Si alguna vez hiciera
      // falta —una devolución, un error de registro—, eso es otra operación con
      // su propio rastro, no una flecha más en este mapa.
      expect(STATUS_TRANSITIONS[estado]).toEqual([]);
    },
  );

  it.each(["pending", "confirmed", "processing", "shipped"] as const)(
    "«%s» siempre puede cancelarse",
    (estado) => {
      expect(STATUS_TRANSITIONS[estado]).toContain("cancelled");
    },
  );

  it("avanza en un solo paso, nunca saltándose etapas", () => {
    // El orden de ORDER_STATUSES es el del flujo; cancelled va al final y es la
    // excepción, porque se puede llegar desde cualquier punto.
    const flujo = ORDER_STATUSES.filter((e) => e !== "cancelled");

    for (const [origen, destinos] of Object.entries(STATUS_TRANSITIONS)) {
      const i = flujo.indexOf(origen as (typeof flujo)[number]);
      for (const destino of destinos) {
        if (destino === "cancelled") continue;
        expect(flujo.indexOf(destino)).toBe(i + 1);
      }
    }
  });
});

describe("STAFF_TARGETS", () => {
  it("son estados de verdad", () => {
    for (const objetivo of STAFF_TARGETS) {
      expect(ORDER_STATUSES).toContain(objetivo);
    }
  });

  it("deja confirmar y cancelar fuera: eso es cosa de un responsable", () => {
    expect(STAFF_TARGETS).not.toContain("confirmed");
    expect(STAFF_TARGETS).not.toContain("cancelled");
  });
});

describe("PAYMENT_TRANSITIONS", () => {
  it("cubre todos los estados de pago", () => {
    expect(Object.keys(PAYMENT_TRANSITIONS).sort()).toEqual(
      [...PAYMENT_STATUSES].sort(),
    );
  });

  it("no lleva a ningún estado que no exista", () => {
    for (const destino of Object.values(PAYMENT_TRANSITIONS).flat()) {
      expect(PAYMENT_STATUSES).toContain(destino);
    }
  });

  it("de «pagado» solo se sale devolviendo el dinero", () => {
    // Y no a «pendiente» ni a «fallido»: el dinero entró, y deshacerlo es un
    // reembolso con su propio rastro, no un cambio de etiqueta.
    expect(PAYMENT_TRANSITIONS.paid).toEqual(["refunded"]);
  });

  it("«reembolsado» es final", () => {
    expect(PAYMENT_TRANSITIONS.refunded).toEqual([]);
  });

  it("un cobro fallido se puede reintentar", () => {
    expect(PAYMENT_TRANSITIONS.failed).toContain("paid");
  });
});
