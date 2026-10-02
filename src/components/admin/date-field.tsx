import type { HTMLAttributes } from "react";
import {
  genericMemo,
  useFieldValue,
  useLocaleState,
  useTranslate,
} from "ra-core";

import type { FieldProps } from "@/lib/field.type";

/**
 * Zona y reloj con los que se pintan todas las fechas del panel.
 *
 * **Se fija la zona a propósito, en vez de usar la del equipo de cada uno.**
 * El negocio ocurre en Cuba: el almacén abre allí, los pedidos se recogen
 * allí y los plazos de custodia se cuentan allí. Si cada persona viera su
 * hora local, dos empleados mirando el mismo pedido leerían horas distintas
 * y no podrían hablar entre ellos. Pasó el 28-sep-2026: un equipo en UTC
 * enseñaba «6:10» donde en el mostrador eran las 14:10.
 *
 * **Por nombre, no por desfase.** Cuba cambia de hora dos veces al año
 * (UTC-4 en verano, UTC-5 en invierno). Con `America/Havana` el ajuste es
 * automático; con un «-4» escrito a mano, cada noviembre todas las horas del
 * panel se equivocarían en una y nadie lo relacionaría con esto.
 *
 * **Reloj de 24 horas**, porque un equipo configurado en 12 escribía «6:10»
 * sin el «p. m.», que se lee como las seis de la mañana.
 */
const ZONA_DEL_NEGOCIO = 'America/Havana';
const RELOJ_24H = false; // valor de `hour12`

const DateFieldImpl = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
>(
  inProps: DateFieldProps<RecordType>,
) => {
  const {
    empty,
    locales,
    options,
    showTime = false,
    showDate = true,
    transform = defaultTransform,
    source,
    record,
    defaultValue,
    ...rest
  } = inProps;
  const translate = useTranslate();
  /**
   * El idioma de la aplicacion, no el del navegador.
   *
   * `toLocaleString()` sin locale usa el del navegador, asi que en un
   * equipo configurado en ingles el panel —que esta en espanol— escribia
   * «9/10/2026, 8:33:48 AM»: mes primero y AM/PM. El valor era correcto;
   * lo que estaba mal era la forma de escribirlo. Con `es` queda
   * «10/9/2026, 8:33:48», dia primero y 24 horas.
   */
  const [localeApp] = useLocaleState();
  const idioma = locales ?? localeApp;

  if (!showTime && !showDate) {
    throw new Error(
      "<DateField> cannot have showTime and showDate false at the same time",
    );
  }

  const value = useFieldValue({ source, record, defaultValue });
  if (value == null || value === "") {
    if (!empty) {
      return null;
    }

    return (
      <span {...rest}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const date = transform(value);

  // Quien llama puede sobrescribirlos; si no dice nada, manda el negocio.
  const opcionesConZona: Intl.DateTimeFormatOptions = {
    timeZone: ZONA_DEL_NEGOCIO,
    hour12: RELOJ_24H,
    ...options,
  };

  let dateString = "";
  if (date) {
    if (showTime && showDate) {
      dateString = toLocaleStringSupportsLocales
        ? date.toLocaleString(idioma, opcionesConZona)
        : date.toLocaleString();
    } else if (showDate) {
      // If input is a date string (e.g. '2022-02-15') without time and time zone,
      // force timezone to UTC to fix issue with people in negative time zones
      // who may see a different date when calling toLocaleDateString().
      // Una fecha sin hora ni zona («2022-02-15») se interpreta en UTC a
      // propósito: convertirla a La Habana la correría al día anterior.
      const dateOptions =
        typeof value === "string" && value.length <= 10
          ? { timeZone: "UTC", ...options }
          : opcionesConZona;
      dateString = toLocaleStringSupportsLocales
        ? date.toLocaleDateString(idioma, dateOptions)
        : date.toLocaleDateString();
    } else if (showTime) {
      dateString = toLocaleStringSupportsLocales
        ? date.toLocaleTimeString(idioma, opcionesConZona)
        : date.toLocaleTimeString();
    }
  }

  return <span {...rest}>{dateString}</span>;
};
DateFieldImpl.displayName = "DateFieldImpl";

/**
 * Displays a date value with locale-specific formatting.
 *
 * This field automatically formats dates according to the user's locale using Intl.DateTimeFormat.
 * It supports showing date only, time only, or both, with custom locales and formatting options.
 * To be used with RecordField or DataTable.Col components, or anywhere a RecordContext is available.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datefield/ DateField documentation}
 *
 * @example
 * import {
 *   List,
 *   DataTable,
 *   DateField,
 * } from '@/components/admin';
 *
 * const PostList = () => (
 *   <List>
 *     <DataTable>
 *       <DataTable.Col source="title" />
 *       <DataTable.Col>
 *         <DateField source="published_at" />
 *       </DataTable.Col>
 *       <DataTable.Col>
 *         <DateField source="updated_at" showTime />
 *       </DataTable.Col>
 *     </DataTable>
 *   </List>
 * );
 */
export const DateField = genericMemo(DateFieldImpl);

export interface DateFieldProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
>
  extends FieldProps<RecordType>, HTMLAttributes<HTMLSpanElement> {
  locales?: Intl.LocalesArgument;
  options?: Intl.DateTimeFormatOptions;
  showTime?: boolean;
  showDate?: boolean;
  transform?: (value: unknown) => Date;
}

const defaultTransform = (value: unknown) =>
  value instanceof Date
    ? value
    : typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : undefined;

const toLocaleStringSupportsLocales = (() => {
  // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
  try {
    new Date().toLocaleString("i");
  } catch (error) {
    return error instanceof RangeError;
  }
  return false;
})();
