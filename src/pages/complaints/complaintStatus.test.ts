import { describe, expect, it } from "vitest";
import { COMPLAINT_STATUSES, SIGUIENTES } from "./complaintStatus";

describe("transiciones de una queja", () => {
  /**
   * MxH-0064: resolver tiene su propia acción y su propio permiso
   * (`complaints:close`). Si apareciera como un botón de estado más, quien
   * solo puede gestionar lo vería, lo pulsaría y se comería un 403.
   */
  it("resolver no es uno de los botones de estado", () => {
    for (const desde of COMPLAINT_STATUSES) {
      expect(SIGUIENTES[desde]).not.toContain("resuelta");
    }
  });

  it("una resuelta se puede reabrir", () => {
    expect(SIGUIENTES.resuelta).toContain("en_gestion");
  });

  it("ningún estado se ofrece a sí mismo", () => {
    for (const desde of COMPLAINT_STATUSES) {
      expect(SIGUIENTES[desde]).not.toContain(desde);
    }
  });
});
