import { describe, expect, it } from "vitest";
import {
  enlaceDeNavegacion,
  formatearPunto,
  leerPunto,
} from "./punto-de-entrega";

const punto = {
  latitude: 23.102847,
  longitude: -82.409263,
  source: "device" as const,
};

/**
 * `deliveryAddress` del pedido es una columna `jsonb`: nada garantiza su forma.
 * Lo que esta función impide es que una fila a medias acabe centrando el mapa
 * en el golfo de Guinea —la «isla» que no existe— en vez de decir que no hay
 * ubicación.
 */
describe("leerPunto", () => {
  it("acepta un punto completo", () => {
    expect(leerPunto(punto)).toEqual(punto);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["una cadena", "23.1,-82.4"],
    ["un número", 23.1],
    ["un objeto vacío", {}],
  ])("devuelve null ante %s", (_nombre, valor) => {
    expect(leerPunto(valor)).toBeNull();
  });

  it.each([
    ["sin longitud", { latitude: 23.1, source: "manual" }],
    ["sin latitud", { longitude: -82.4, source: "manual" }],
    ["sin procedencia", { latitude: 23.1, longitude: -82.4 }],
  ])("rechaza un punto %s", (_nombre, valor) => {
    expect(leerPunto(valor)).toBeNull();
  });

  it("rechaza coordenadas que llegan como texto", () => {
    // Un `"0"` colado por una fila vieja centraría el mapa en Null Island.
    expect(leerPunto({ ...punto, latitude: "23.102847" })).toBeNull();
  });

  it.each([
    ["latitud mayor que 90", { ...punto, latitude: 90.1 }],
    ["latitud menor que -90", { ...punto, latitude: -91 }],
    ["longitud mayor que 180", { ...punto, longitude: 181 }],
    ["longitud menor que -180", { ...punto, longitude: -180.5 }],
  ])("rechaza %s", (_nombre, valor) => {
    expect(leerPunto(valor)).toBeNull();
  });

  it.each([
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
  ])("rechaza una latitud %s", (_nombre, latitude) => {
    expect(leerPunto({ ...punto, latitude })).toBeNull();
  });

  it("rechaza una procedencia inventada", () => {
    expect(leerPunto({ ...punto, source: "adivinada" })).toBeNull();
  });

  it.each([
    ["el polo sur", { latitude: -90, longitude: 0 }],
    ["el polo norte", { latitude: 90, longitude: 0 }],
    ["el antimeridiano", { latitude: 0, longitude: 180 }],
    ["su otro extremo", { latitude: 0, longitude: -180 }],
  ])("acepta %s: el límite entra", (_nombre, coords) => {
    expect(leerPunto({ ...coords, source: "manual" })).not.toBeNull();
  });

  it("acepta el punto cero, aunque sea Null Island", () => {
    // Si alguien marca ahí a mano, es un punto válido: lo que esta función
    // evita es el cero **inventado** por una fila incompleta, no el elegido.
    expect(leerPunto({ latitude: 0, longitude: 0, source: "manual" })).toEqual({
      latitude: 0,
      longitude: 0,
      source: "manual",
    });
  });
});

describe("formatearPunto", () => {
  it("enseña seis decimales, que son unos 11 cm", () => {
    expect(formatearPunto(punto)).toBe("23.102847, -82.409263");
  });

  it("rellena los decimales que falten, para que la columna no baile", () => {
    expect(formatearPunto({ ...punto, latitude: 23 })).toBe(
      "23.000000, -82.409263",
    );
  });
});

describe("enlaceDeNavegacion", () => {
  it("apunta al punto exacto", () => {
    expect(enlaceDeNavegacion(punto)).toBe(
      "https://www.google.com/maps?q=23.102847,-82.409263",
    );
  });

  it("no redondea: quien conduce necesita el punto, no su vecindad", () => {
    const preciso = { ...punto, latitude: 23.1028479 };

    expect(enlaceDeNavegacion(preciso)).toContain("23.1028479");
  });
});
