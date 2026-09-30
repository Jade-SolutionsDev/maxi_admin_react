import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInstructions,
  emptyPaymentMethodForm,
  isPaymentMethodFormIncomplete,
} from "../src/pages/payment-methods/payment-method-form.ts";

test("serializa efectivo sin arrastrar datos bancarios", () => {
  const form = emptyPaymentMethodForm();
  form.label = "Efectivo en Cárdenas";
  form.type = "cash";
  form.note = "Acércate al local con tu número de pedido.";
  form.bankName = "No debe viajar";
  form.accountNumber = "123";

  assert.deepEqual(buildInstructions(form), {
    type: "cash",
    note: "Acércate al local con tu número de pedido.",
  });
});

test("efectivo exige una instrucción para el cliente", () => {
  const form = emptyPaymentMethodForm();
  form.label = "Efectivo";
  form.type = "cash";

  assert.equal(isPaymentMethodFormIncomplete(form), true);

  form.note = "Paga en el local de Cárdenas.";
  assert.equal(isPaymentMethodFormIncomplete(form), false);
});

test("edita un método de efectivo conservando su nota", () => {
  const form = emptyPaymentMethodForm({
    label: "Efectivo",
    description: "Pago presencial",
    instructions: {
      type: "cash",
      note: "El pedido no vence automáticamente.",
    },
  });

  assert.equal(form.type, "cash");
  assert.equal(form.note, "El pedido no vence automáticamente.");
});
