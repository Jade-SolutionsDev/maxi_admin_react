import defaultMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";
//@ts-expect-error Ignore
import es from "@blackbox-vision/ra-language-spanish";
import customMessages from "@/i18n";

type Diccionario = Record<string, unknown>;

/**
 * Mezcla en profundidad, no por encima.
 *
 * Con un spread normal, añadir una sola clave `ra.action.algo` a `es.json`
 * reemplaza **todo** el objeto `ra` del paquete de idioma, y la interfaz pasa a
 * enseñar `ra.action.create` en crudo donde antes decía «Crear». Pasó: es un
 * accidente silencioso, porque ni TypeScript ni las pruebas lo ven, solo se ve
 * mirando la pantalla.
 */
const mezclar = (base: Diccionario, encima: Diccionario): Diccionario => {
  const salida: Diccionario = { ...base };

  for (const [clave, valor] of Object.entries(encima)) {
    const previo = salida[clave];
    salida[clave] =
      valor && typeof valor === "object" && !Array.isArray(valor) &&
      previo && typeof previo === "object" && !Array.isArray(previo)
        ? mezclar(previo as Diccionario, valor as Diccionario)
        : valor;
  }

  return salida;
};

const messages = {
  es: mezclar(es as Diccionario, customMessages.es as Diccionario),
  en: mezclar(defaultMessages as Diccionario, customMessages.en as Diccionario),
};

export const i18nProvider = polyglotI18nProvider(
  //@ts-expect-error Ignore
  (locale) => messages[locale],
  "es",
  [
    { locale: "en", name: "English" },
    { locale: "es", name: "Spanish" },
  ],
  { allowMissing: true },
);
