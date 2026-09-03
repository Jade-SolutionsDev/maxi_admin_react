import { useGetList, useTranslate } from "ra-core";
import { SelectInput } from "@/components/admin";

interface PaymentMethodRecord {
  id: string;
  code: string;
  label: string;
}

/** Pedidos que no llegaron a tener ningún intento de pago. */
export const SIN_METODO = "none";

/**
 * Filtro por la pasarela del **último** intento de pago, que es el criterio con
 * el que la tabla muestra la columna: si divergieran, filtrar por «Tarjeta»
 * enseñaría filas que dicen «Mi Billetera» y nadie volvería a fiarse de esta
 * pantalla.
 *
 * Las opciones salen del catálogo de métodos, no de una lista escrita aquí: una
 * pasarela nueva aparece sola, y con la etiqueta que la administración le haya
 * puesto. Se incluyen también las desactivadas — los pedidos viejos siguen
 * teniendo su método y hay que poder encontrarlos.
 */
export const PaymentMethodFilter = (props: { alwaysOn?: boolean }) => {
  const translate = useTranslate();
  const { data } = useGetList<PaymentMethodRecord>("payment-methods", {
    pagination: { page: 1, perPage: 50 },
    sort: { field: "sortOrder", order: "ASC" },
  });

  const choices = [
    ...(data ?? []).map((method) => ({
      id: method.code,
      name: method.label,
    })),
    {
      id: SIN_METODO,
      name: translate("orders.filters.withoutPaymentMethod", {
        _: "Sin intento de pago",
      }),
    },
  ];

  return (
    <SelectInput
      {...props}
      source="paymentMethod"
      label={translate("orders.fields.paymentMethod", { _: "Método de pago" })}
      choices={choices}
      translateChoice={false}
    />
  );
};
