import defaultMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";
//@ts-expect-error Ignore
import es from "@blackbox-vision/ra-language-spanish";
import customMessages from "@/i18n";

const messages = {
  es: { ...es, ...customMessages.es },
  en: { ...defaultMessages, ...customMessages.en },
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
