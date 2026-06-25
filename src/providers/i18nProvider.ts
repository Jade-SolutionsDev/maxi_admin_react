import defaultMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";
//@ts-expect-error Ignore
import es from "@blackbox-vision/ra-language-spanish";

const messages = {
  es,
  en: defaultMessages,
};

export const i18nProvider = polyglotI18nProvider(
    //@ts-expect-error Ignore
  (locale) => messages[locale],
  "es",
  [
    { name: "en", value: "English" },
    { name: "es", value: "Spanish" },
  ],
  { allowMissing: true },
);
