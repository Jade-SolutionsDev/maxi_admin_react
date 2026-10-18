import { describe, expect, it } from "vitest";
import { countTrend, moneyKpi, percentTrend } from "./format";

/**
 * El panel traduce con `ra-core`; aquí basta con devolver el texto por omisión,
 * que es lo que se ve cuando no hay traducción cargada.
 */
const traducir = ((clave: string, opciones?: { _?: string }) =>
  opciones?._ ?? clave) as never;

describe("moneyKpi", () => {
  it("enseña los céntimos, que son parte de la cifra", () => {
    // Redondear a dólares enteros hacía que el panel discrepara de la API que
    // está reportando.
    expect(moneyKpi(1234.5)).toBe("$1,234.50");
  });

  it("no se come los ceros", () => {
    expect(moneyKpi(1000)).toBe("$1,000.00");
  });

  it("sabe enseñar nada", () => {
    expect(moneyKpi(0)).toBe("$0.00");
  });
});

/**
 * Un porcentaje contra una base de cero es infinito o es un invento, así que
 * estas pruebas vigilan sobre todo los dos casos en los que **no** hay
 * porcentaje que calcular.
 */
describe("percentTrend", () => {
  it("calcula la subida", () => {
    const t = percentTrend({ current: 150, previous: 100 }, traducir);

    expect(t).toEqual({ label: "+50.0%", up: true });
  });

  it("calcula la bajada", () => {
    const t = percentTrend({ current: 50, previous: 100 }, traducir);

    expect(t).toEqual({ label: "-50.0%", up: false });
  });

  it("sin cambio, va en positivo y marca 0", () => {
    expect(percentTrend({ current: 100, previous: 100 }, traducir)).toEqual({
      label: "+0.0%",
      up: true,
    });
  });

  it("la primera venta de la historia dice «Nuevo», no infinito", () => {
    expect(percentTrend({ current: 5, previous: 0 }, traducir)).toEqual({
      label: "Nuevo",
      up: true,
    });
  });

  it("dos ceros seguidos son «Sin cambios», y en positivo", () => {
    // En rojo se leería como una alarma sobre algo que no ha pasado: no hubo
    // pedidos ni antes ni ahora.
    expect(percentTrend({ current: 0, previous: 0 }, traducir)).toEqual({
      label: "Sin cambios",
      up: true,
    });
  });

  it("no devuelve Infinity ni NaN con base cero", () => {
    for (const current of [0, 1, 1000]) {
      const { label } = percentTrend({ current, previous: 0 }, traducir);

      expect(label).not.toMatch(/Infinity|NaN/);
    }
  });

  it("una caída a cero sigue siendo un porcentaje", () => {
    expect(percentTrend({ current: 0, previous: 80 }, traducir)).toEqual({
      label: "-100.0%",
      up: false,
    });
  });
});

describe("countTrend", () => {
  it("cuenta lo de ahora, no la diferencia", () => {
    expect(countTrend({ current: 24, previous: 10 }, traducir).label).toBe(
      "+%{smart_count} nuevos",
    );
  });

  it("va hacia arriba cuando iguala el periodo anterior", () => {
    expect(countTrend({ current: 10, previous: 10 }, traducir).up).toBe(true);
  });

  it("va hacia abajo cuando hay menos que antes", () => {
    expect(countTrend({ current: 3, previous: 10 }, traducir).up).toBe(false);
  });
});
