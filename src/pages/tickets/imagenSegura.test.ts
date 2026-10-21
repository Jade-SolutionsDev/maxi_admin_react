import { describe, expect, it } from "vitest";
import { esImagenSegura } from "./imagenSegura";

describe("esImagenSegura", () => {
  it.each([
    "https://res.cloudinary.com/x/image/upload/v1/tickets/a.png",
    "http://localhost:9000/tickets/a.png",
  ])("deja pasar %s", (url) => {
    expect(esImagenSegura(url)).toBe(true);
  });

  /**
   * El caso por el que existe: un `javascript:` en el `href` de la ficha se
   * ejecutaría en la sesión del compañero que la abra.
   */
  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(document.cookie)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ])("bloquea %s", (url) => {
    expect(esImagenSegura(url)).toBe(false);
  });

  it("no lanza con basura", () => {
    for (const basura of ["", "   ", "???", "http://"]) {
      expect(() => esImagenSegura(basura)).not.toThrow();
    }
  });
});
