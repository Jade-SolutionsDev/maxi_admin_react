import { describe, expect, it } from "vitest";
import { tituloDeLaDireccion } from "./libreta";

const CALLE = "Calle 174 número 310";

describe("tituloDeLaDireccion", () => {
  it("usa el alias cuando lo hay, y la calle va debajo", () => {
    expect(tituloDeLaDireccion("Casa de mamá", CALLE)).toEqual({
      titulo: "Casa de mamá",
      calleAparte: true,
    });
  });

  it.each([
    ["null", null],
    ["vacío", ""],
    ["solo espacios", "   "],
  ])("sin alias (%s) el título es la calle, y no se repite", (_n, label) => {
    expect(tituloDeLaDireccion(label, CALLE)).toEqual({
      titulo: CALLE,
      calleAparte: false,
    });
  });

  it("un alias que repite la calle no es un alias", () => {
    // Pasa de verdad: el formulario de la tienda no pide alias al pagar, y
    // quien lo rellena después suele volver a escribir la calle.
    expect(tituloDeLaDireccion(CALLE, CALLE).calleAparte).toBe(false);
  });

  it("y tampoco lo es escrito distinto", () => {
    expect(tituloDeLaDireccion(`  ${CALLE.toUpperCase()} `, CALLE)).toEqual({
      titulo: CALLE,
      calleAparte: false,
    });
  });

  it("no pierde el alias por un parecido: distinto es distinto", () => {
    expect(tituloDeLaDireccion("Calle 174", CALLE).calleAparte).toBe(true);
  });
});
